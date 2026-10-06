---
category: support-resistance
---
# Liquidity Sweeps - Indie Port Guide

> Swing highs and lows that are swept by a wick, broken or retested, drawn as boxes.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Support & resistance |
| **Type** | Indicator, port from Pine Script |
| **Original** | Liquidity Sweeps [LuxAlgo] (Pine Script v5) |
| **License** | CC BY-NC-SA 4.0 (see the header of the source files) |
| **Original source** | [Liquidity Sweeps.pinescript5](Liquidity%20Sweeps.pinescript5) |
| **Source file** | [Liquidity Sweeps.indie5](Liquidity%20Sweeps.indie5) |

## Overview

Tracks swing highs and lows and reports when price sweeps them: a wick pierces the level and the candle closes back, a close breaks the level (outbreak), or price retests a broken level. Each event is drawn as a box with a marker line and a dotted line back to the swing; boxes extend to the right until they are broken or reach the maximum number of bars.

The `Options` input chooses between wick sweeps only, outbreaks and retests only, or all of them.

## How it works

1. Swing pivots from `pivothigh(len, len)` and `pivotlow(len, len)`.
2. A pivot high is swept when `high > level` and `close < level`; it is mitigated when the close goes above it.
3. After an outbreak a retest is a wick back through the level with a close on the other side.
4. Each event draws a box between the level and the candle extreme, a thick vertical line at the bar and dotted lines.
5. Open boxes are extended to the current bar; a box stops when the close leaves it or after the maximum number of bars.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `swings` | int | 5 | ≥ 1 | Swings |
| `extend` | bool | True |  | Extend |
| `max_b` | int | 300 | ≥ 1, ≤ 5000 | Max bars |

## Port notes

Differences and decisions in the Indie port (taken from the header of [Liquidity Sweeps.indie5](Liquidity%20Sweeps.indie5)):

- Logic ported 1:1: swing pivots, wick sweeps, outbreaks and retests, sweep boxes that extend until broken or max bars
- Pine UDT arrays (piv/boxBr) -> flat lists in rollbackable Vars (the engine recalculates the live bar several times);
- box.set_right() -> erase and redraw the box each bar while it is active
- Short dotted marks (lnDot) end a few bars ahead of the current bar (time arithmetic); Pine draws them to bar_index + 3
- Drawing budget: only the newest MAX_EVENTS sweeps (4 drawings each) are kept, older ones are erased
- (Pine keeps the newest 500 lines/boxes); colours: bull #089981, bear #f23645 (fixed; Indie has no colour inputs)

## Verification

The drawings were checked against an independent re-implementation of the Pine logic on the same candles (BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026), default option `Only Wicks`): the 55 newest sweeps matched on bar, direction and both price levels (55 of 55), and the right edge of all 55 boxes (break bar or the 300-bar limit) matched. The other two options use the same code paths but were not separately checked.

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [Liquidity Sweeps.pinescript5](Liquidity%20Sweeps.pinescript5).

```python
# indie:lang_version = 5
# Liquidity Sweeps [LuxAlgo] — Indie port
# Original Pine Script v5 by LuxAlgo (CC BY-NC-SA 4.0)
# Migration notes:
#   Logic ported 1:1: swing pivots, wick sweeps, outbreaks and retests, sweep boxes that extend until broken or max bars
#   Pine UDT arrays (piv/boxBr) -> flat lists in rollbackable Vars (the engine recalculates the live bar several times);
#   box.set_right() -> erase and redraw the box each bar while it is active
#   Short dotted marks (lnDot) end a few bars ahead of the current bar (time arithmetic); Pine draws them to bar_index + 3
#   Drawing budget: only the newest MAX_EVENTS sweeps (4 drawings each) are kept, older ones are erased
#   (Pine keeps the newest 500 lines/boxes); colours: bull #089981, bear #f23645 (fixed; Indie has no colour inputs)

from math import isnan, nan
from indie import indicator, param, MainContext, color, Color, Optional
from indie.algorithms import PivotHighLow
from indie.drawings import LineSegment, Rectangle, AbsolutePosition, line_segment_style

BULL = color.rgba(8, 153, 129, 1.0)
BEAR = color.rgba(242, 54, 69, 1.0)
BULL_LINE = color.rgba(8, 153, 129, 0.5)
BEAR_LINE = color.rgba(242, 54, 69, 0.5)
BULL_BOX = color.rgba(8, 153, 129, 0.255)
BEAR_BOX = color.rgba(242, 54, 69, 0.255)
NO_COLOR = color.TRANSPARENT
MAX_EVENTS = 55
PS = 8   # pivot record: prc, bar index, time, is_high, broken, mitigated, taken, wick
ES = 6   # event record: left bar, left time, top, bottom, direction, active


@indicator('Liquidity Sweeps [LuxAlgo]', overlay_main_pane=True)
@param.int('swings', default=5, min=1, title='Swings')
@param.str('opt', default='Only Wicks',
           options=['Only Wicks', 'Only Outbreaks & Retest', 'Wicks + Outbreaks & Retest'], title='Options')
@param.bool('extend', default=True, title='Extend')
@param.int('max_b', default=300, min=1, max=5000, title='Max bars')
class Main(MainContext):
    def __init__(self):
        empty_f: list[float] = []
        empty_rects: list[Optional[Rectangle]] = []
        empty_lines: list[Optional[LineSegment]] = []
        self._piv = self.new_var(empty_f)
        self._ev = self.new_var(empty_f)
        self._h_rect = self.new_var(empty_rects)
        self._h_line = self.new_var(empty_lines)

    def _add_event(self, d: int, prc: float, t_piv: float, t_ahead: float, ev: list[float],
                   rects: list[Optional[Rectangle]], lines: list[Optional[LineSegment]],
                   dashed: bool, wick_y: float) -> bool:
        # Pine: box(n-1 .. n+1, y1..y2) + vertical line at n + line from the pivot + short dotted mark.
        # d == 1: bear (high -> prc), d == -1: bull (prc -> low)
        t0 = self.time[0]
        t1 = self.time[1]
        top: float = self.high[0] if d == 1 else prc
        bot: float = prc if d == 1 else self.low[0]
        c_box: Color = BEAR_BOX if d == 1 else BULL_BOX
        c_main: Color = BEAR if d == 1 else BULL
        c_line: Color = BEAR_LINE if d == 1 else BULL_LINE
        rect: Rectangle = Rectangle(AbsolutePosition(t1, top), AbsolutePosition(t0, bot),
                                    line_color=NO_COLOR, line_width=1, bg_color=c_box)
        self.chart.draw(rect)
        vline: LineSegment = LineSegment(AbsolutePosition(t0, top), AbsolutePosition(t0, bot), color=c_main, line_width=3)
        self.chart.draw(vline)
        lines.append(vline)
        if dashed:
            pline: LineSegment = LineSegment(AbsolutePosition(t_piv, prc), AbsolutePosition(t0, prc), color=c_line,
                                             line_style=line_segment_style.DASHED)
            self.chart.draw(pline)
            lines.append(pline)
        else:
            pline2: LineSegment = LineSegment(AbsolutePosition(t_piv, prc), AbsolutePosition(t0, prc), color=c_line,
                                              line_style=line_segment_style.DOTTED)
            self.chart.draw(pline2)
            lines.append(pline2)
        dot: LineSegment = LineSegment(AbsolutePosition(t0, wick_y), AbsolutePosition(t_ahead, wick_y), color=c_main,
                                       line_style=line_segment_style.DOTTED)
        self.chart.draw(dot)
        lines.append(dot)
        rects.append(rect)
        ev.append(float(self.bar_index - 1))
        ev.append(t1)
        ev.append(top)
        ev.append(bot)
        ev.append(float(d))
        ev.append(1.0)
        return True

    def calc(self, swings, opt, extend, max_b):
        n: int = self.bar_index
        only_wicks: bool = opt == 'Only Wicks'
        only_out: bool = opt == 'Only Outbreaks & Retest'
        cl: float = self.close[0]
        hi: float = self.high[0]
        lo: float = self.low[0]
        t0 = self.time[0]
        t_ahead = t0 + (t0 - self.time[1]) * 3

        ph, _ = PivotHighLow.new(self.high, swings, swings)
        _, pl = PivotHighLow.new(self.low, swings, swings)

        # copy the committed state of the previous bar (every recalculation of this bar starts from it)
        piv: list[float] = []
        src_p = self._piv.get()
        k = 0
        while k < len(src_p):
            piv.append(src_p[k])
            k += 1
        ev: list[float] = []
        src_e = self._ev.get()
        k = 0
        while k < len(src_e):
            ev.append(src_e[k])
            k += 1
        rects: list[Optional[Rectangle]] = []
        src_r = self._h_rect.get()
        k = 0
        while k < len(src_r):
            rects.append(src_r[k])
            k += 1
        lines: list[Optional[LineSegment]] = []
        src_l = self._h_line.get()
        k = 0
        while k < len(src_l):
            lines.append(src_l[k])
            k += 1

        t_pivot = self.time[swings]
        if not isnan(ph[0]):
            piv.append(ph[0])
            piv.append(float(n - swings))
            piv.append(t_pivot)
            piv.append(1.0)
            piv.append(0.0)
            piv.append(0.0)
            piv.append(0.0)
            piv.append(0.0)
        if not isnan(pl[0]):
            piv.append(pl[0])
            piv.append(float(n - swings))
            piv.append(t_pivot)
            piv.append(0.0)
            piv.append(0.0)
            piv.append(0.0)
            piv.append(0.0)
            piv.append(0.0)

        old_events: int = len(ev) // ES

        # --- pivots: outbreak / wick sweep / retest
        keep: list[float] = []
        i = 0
        while i < len(piv) // PS:
            b = i * PS
            prc = piv[b]
            pb = int(piv[b + 1])
            t_piv = piv[b + 2]
            is_h: bool = piv[b + 3] == 1.0
            brk: bool = piv[b + 4] == 1.0
            mit: bool = piv[b + 5] == 1.0
            tak: bool = piv[b + 6] == 1.0
            wic: bool = piv[b + 7] == 1.0
            if not mit:
                if not brk:
                    out_cond: bool = (cl > prc) if is_h else (cl < prc)
                    if out_cond:
                        if not only_wicks:
                            brk = True
                        else:
                            mit = True
                    if (not only_out) and (not wic):
                        wick_cond: bool = (hi > prc and cl < prc) if is_h else (lo < prc and cl > prc)
                        if wick_cond:
                            if is_h:
                                self._add_event(1, prc, t_piv, t_ahead, ev, rects, lines, False, lo)
                            else:
                                self._add_event(-1, prc, t_piv, t_ahead, ev, rects, lines, False, hi)
                            wic = True
                else:
                    back_cond: bool = (cl < prc) if is_h else (cl > prc)
                    if back_cond:
                        mit = True
                    retest_cond: bool = (lo < prc and cl > prc) if is_h else (hi > prc and cl < prc)
                    if (not only_wicks) and retest_cond:
                        if is_h:
                            self._add_event(-1, prc, t_piv, t_ahead, ev, rects, lines, True, hi)
                        else:
                            self._add_event(1, prc, t_piv, t_ahead, ev, rects, lines, True, lo)
                        tak = True
            if not (n - pb > 2000 or mit or tak):
                keep.append(prc)
                keep.append(float(pb))
                keep.append(t_piv)
                keep.append(1.0 if is_h else 0.0)
                keep.append(1.0 if brk else 0.0)
                keep.append(1.0 if mit else 0.0)
                keep.append(1.0 if tak else 0.0)
                keep.append(1.0 if wic else 0.0)
            i += 1

        # --- extend boxes created on previous bars while they are active (the new ones are skipped)
        if extend:
            j = 0
            while j < old_events:
                e = j * ES
                if ev[e + 5] == 1.0:
                    if n - int(ev[e]) - 1 <= max_b:
                        old_rect = rects[j]
                        if old_rect is not None:
                            self.chart.erase(old_rect.value())
                        top = ev[e + 2]
                        bot = ev[e + 3]
                        new_rect: Rectangle = Rectangle(
                            AbsolutePosition(ev[e + 1], top), AbsolutePosition(t0, bot),
                            line_color=NO_COLOR, line_width=1,
                            bg_color=BEAR_BOX if ev[e + 4] == 1.0 else BULL_BOX)
                        self.chart.draw(new_rect)
                        rects[j] = new_rect
                        if ev[e + 4] == -1.0 and cl < bot:
                            ev[e + 5] = 0.0
                        if ev[e + 4] == 1.0 and cl > top:
                            ev[e + 5] = 0.0
                    else:
                        ev[e + 5] = 0.0
                j += 1

        # --- drawing budget: erase the oldest events (box + 3 lines each)
        while len(ev) // ES > MAX_EVENTS:
            r0 = rects[0]
            if r0 is not None:
                self.chart.erase(r0.value())
            q = 0
            while q < 3:
                l0 = lines[q]
                if l0 is not None:
                    self.chart.erase(l0.value())
                q += 1
            rects.pop(0)
            lines.pop(0)
            lines.pop(0)
            lines.pop(0)
            q = 0
            while q < ES:
                ev.pop(0)
                q += 1

        self._piv.set(keep)
        self._ev.set(ev)
        self._h_rect.set(rects)
        self._h_line.set(lines)
```

