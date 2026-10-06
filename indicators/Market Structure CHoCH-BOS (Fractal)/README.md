---
category: support-resistance
---
# Market Structure CHoCH-BOS (Fractal) - Indie Port Guide

> Break of structure (BOS) and change of character (CHoCH) from fractal highs and lows.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Support & resistance |
| **Type** | Indicator, port from Pine Script |
| **Original** | Market Structure CHoCH/BOS (Fractal) [LuxAlgo] (Pine Script v5) |
| **License** | CC BY-NC-SA 4.0 (see the header of the source files) |
| **Original source** | [Market Structure CHoCH-BOS (Fractal).pinescript5](Market%20Structure%20CHoCH-BOS%20(Fractal).pinescript5) |
| **Source file** | [Market Structure CHoCH-BOS (Fractal).indie5](Market%20Structure%20CHoCH-BOS%20(Fractal).indie5) |

## Overview

Finds fractal highs and lows and draws a line when the close breaks the latest fractal. The label says BOS when the break continues the previous structure and ChoCH when it reverses it. Optionally the support (after a bullish break) or resistance (after a bearish break) of the move is tracked and its breakout is marked.

The dashboard of the original (structure-to-fractal percentage) is not ported.

## How it works

1. Fractal high: the high `p = length/2` bars ago is the highest of the last `length` bars and the sums of price changes before and after it are `+p` and `-p`; fractal low is the mirror.
2. Bullish structure: the close crosses over the latest fractal high that has not been crossed yet; draw a line from the fractal to the current bar.
3. Label at the middle of the line: ChoCH if the previous structure was bearish, otherwise BOS.
4. Bearish structure is the mirror with the latest fractal low.
5. Optionally draw and extend the support/resistance of the move until it is broken.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 5 | ≥ 3 | Length |
| `show_bull` | bool | True |  | Bullish Structures |
| `show_bear` | bool | True |  | Bearish Structures |
| `show_support` | bool | False |  | Support |
| `show_resistance` | bool | False |  | Resistance |

## Port notes

Differences and decisions in the Indie port (taken from the header of [Market Structure CHoCH-BOS (Fractal).indie5](Market%20Structure%20CHoCH-BOS%20(Fractal).indie5)):

- Logic ported 1:1: fractals (sum of sign changes + highest/lowest), crossover of the latest fractal, ChoCH/BOS label by the
- previous structure direction, optional support/resistance of the move and their breakout markers
- Pine UDT (fractal) -> series of value / location / crossed flag; the dashboard table is not ported
- Support/resistance lines are erased and redrawn while they extend (line.set_x2 in Pine)
- History needed for the label position and the support/resistance search is kept in an own Var list (dynamic series
- offsets are limited by the engine)
- Colours: bull #089981, bear #f23645 (fixed; Indie has no colour inputs)

## Verification

The drawings were checked against an independent re-implementation of the Pine logic on the same candles (BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026)): 145 of 146 structure breaks matched, both the line (fractal bar, level, break bar) and the label (position and ChoCH/BOS text). The one difference is the very first break, 17 bars after the start, where the start-up state of the indicator differs.

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [Market Structure CHoCH-BOS (Fractal).pinescript5](Market%20Structure%20CHoCH-BOS%20(Fractal).pinescript5).

```python
# indie:lang_version = 5
# Market Structure CHoCH/BOS (Fractal) [LuxAlgo] — Indie port
# Original Pine Script v5 by LuxAlgo (CC BY-NC-SA 4.0)
# Migration notes:
#   Logic ported 1:1: fractals (sum of sign changes + highest/lowest), crossover of the latest fractal, ChoCH/BOS label by the
#   previous structure direction, optional support/resistance of the move and their breakout markers
#   Pine UDT (fractal) -> series of value / location / crossed flag; the dashboard table is not ported
#   Support/resistance lines are erased and redrawn while they extend (line.set_x2 in Pine)
#   History needed for the label position and the support/resistance search is kept in an own Var list (dynamic series
#   offsets are limited by the engine)
#   Colours: bull #089981, bear #f23645 (fixed; Indie has no colour inputs)

from math import isnan, nan
from indie import indicator, param, plot, MainContext, color, Color, Optional, MutSeriesF
from indie.algorithms import Highest, Lowest, Sma
from indie.drawings import LineSegment, LabelAbs, AbsolutePosition, line_segment_style, callout_position

BULL = color.rgba(8, 153, 129, 1.0)
BEAR = color.rgba(242, 54, 69, 1.0)
INVIS = color.TRANSPARENT
HIST_CAP = 3000   # bars of own history: time, high, low


@indicator('Market Structure CHoCH/BOS (Fractal) [LuxAlgo]', overlay_main_pane=True)
@plot.marker('res_breakout', color=color.rgba(8, 153, 129, 1.0), style=plot.marker_style.CIRCLE)
@plot.marker('sup_breakout', color=color.rgba(242, 54, 69, 1.0), style=plot.marker_style.CIRCLE)
@param.int('length', default=5, min=3, title='Length')
@param.bool('show_bull', default=True, title='Bullish Structures')
@param.bool('show_bear', default=True, title='Bearish Structures')
@param.bool('show_support', default=False, title='Support')
@param.bool('show_resistance', default=False, title='Resistance')
class Main(MainContext):
    def __init__(self):
        empty_f: list[float] = []
        empty_l: list[Optional[LineSegment]] = []
        self._hist = self.new_var(empty_f)
        self._sup_h = self.new_var(empty_l)
        self._res_h = self.new_var(empty_l)

    def _hidx(self, nb: int, k: int) -> int:
        # index of the record k bars ago (0 = current bar); each record: time, high, low
        return (nb - 1 - k) * 3

    def _redraw(self, old: list[Optional[LineSegment]], t_left: float, y: float, t_right: float, col: Color,
                keep: bool) -> list[Optional[LineSegment]]:
        # erase the previous version of an extending line and draw the new one; `keep` = False when the line is final
        k = 0
        while k < len(old):
            h = old[k]
            if h is not None:
                self.chart.erase(h.value())
            k += 1
        seg: LineSegment = LineSegment(AbsolutePosition(t_left, y), AbsolutePosition(t_right, y), color=col,
                                       line_style=line_segment_style.DASHED)
        self.chart.draw(seg)
        out: list[Optional[LineSegment]] = []
        if keep:
            out.append(seg)
        return out

    def calc(self, length, show_bull, show_bear, show_support, show_resistance):
        n: int = self.bar_index
        p: int = length // 2
        hi: float = self.high[0]
        lo: float = self.low[0]
        cl: float = self.close[0]
        t0 = self.time[0]

        hist: list[float] = []
        src_h = self._hist.get()
        kk = 0
        while kk < len(src_h):
            hist.append(src_h[kk])
            kk += 1
        hist.append(t0)
        hist.append(hi)
        hist.append(lo)
        if len(hist) // 3 > HIST_CAP:
            hist.pop(0)
            hist.pop(0)
            hist.pop(0)
        self._hist.set(hist)
        nb: int = len(hist) // 3

        # --- fractals: sum of the last p sign changes of high / low
        prev_h: float = self.high[1]
        prev_l: float = self.low[1]
        sgn_h = MutSeriesF.new(nan)
        sgn_l = MutSeriesF.new(nan)
        if not isnan(prev_h):
            sgn_h[0] = 1.0 if hi > prev_h else (-1.0 if hi < prev_h else 0.0)
            sgn_l[0] = 1.0 if lo > prev_l else (-1.0 if lo < prev_l else 0.0)
        dh_s = MutSeriesF.new(Sma.new(sgn_h, p)[0] * p)
        dl_s = MutSeriesF.new(Sma.new(sgn_l, p)[0] * p)
        highest_len: float = Highest.new(self.high, length)[0]
        lowest_len: float = Lowest.new(self.low, length)[0]
        bullf: bool = dh_s[0] == -float(p) and dh_s[p] == float(p) and self.high[p] == highest_len
        bearf: bool = dl_s[0] == float(p) and dl_s[p] == -float(p) and self.low[p] == lowest_len

        # --- state as series: every recalculation of the bar starts from the committed state
        up_v_s = MutSeriesF.new(nan)
        up_loc_s = MutSeriesF.new(nan)
        up_t_s = MutSeriesF.new(nan)
        up_x_s = MutSeriesF.new(0.0)
        lo_v_s = MutSeriesF.new(nan)
        lo_loc_s = MutSeriesF.new(nan)
        lo_t_s = MutSeriesF.new(nan)
        lo_x_s = MutSeriesF.new(0.0)
        os_s = MutSeriesF.new(0.0)
        sup_y_s = MutSeriesF.new(nan)
        sup_t_s = MutSeriesF.new(nan)
        sup_on_s = MutSeriesF.new(0.0)
        bsup_s = MutSeriesF.new(0.0)
        res_y_s = MutSeriesF.new(nan)
        res_t_s = MutSeriesF.new(nan)
        res_on_s = MutSeriesF.new(0.0)
        bres_s = MutSeriesF.new(0.0)

        up_v_prev: float = up_v_s[1]
        up_v: float = up_v_prev
        up_loc: float = up_loc_s[1]
        up_t: float = up_t_s[1]
        up_x: float = 0.0 if isnan(up_x_s[1]) else up_x_s[1]
        lo_v_prev: float = lo_v_s[1]
        lo_v: float = lo_v_prev
        lo_loc: float = lo_loc_s[1]
        lo_t: float = lo_t_s[1]
        lo_x: float = 0.0 if isnan(lo_x_s[1]) else lo_x_s[1]
        os_v: float = 0.0 if isnan(os_s[1]) else os_s[1]
        sup_y: float = sup_y_s[1]
        sup_t: float = sup_t_s[1]
        sup_on: float = 0.0 if isnan(sup_on_s[1]) else sup_on_s[1]
        bsup: float = 0.0 if isnan(bsup_s[1]) else bsup_s[1]
        res_y: float = res_y_s[1]
        res_t: float = res_t_s[1]
        res_on: float = 0.0 if isnan(res_on_s[1]) else res_on_s[1]
        bres: float = 0.0 if isnan(bres_s[1]) else bres_s[1]
        bsup_prev: float = bsup
        bres_prev: float = bres

        if bullf:
            up_v = self.high[p]
            up_loc = float(n - p)
            up_t = self.time[p]
            up_x = 0.0
        if bearf:
            lo_v = self.low[p]
            lo_loc = float(n - p)
            lo_t = self.time[p]
            lo_x = 0.0

        sup_h = self._sup_h.get()
        res_h = self._res_h.get()
        sup_keep: list[Optional[LineSegment]] = []
        res_keep: list[Optional[LineSegment]] = []
        k0 = 0
        while k0 < len(sup_h):
            sup_keep.append(sup_h[k0])
            k0 += 1
        k0 = 0
        while k0 < len(res_h):
            res_keep.append(res_h[k0])
            k0 += 1

        # --- bullish structure: close crosses over the latest top fractal
        bull_cross: bool = cl > up_v and self.close[1] <= up_v_prev and up_x == 0.0
        if bull_cross:
            if show_bull:
                self.chart.draw(LineSegment(AbsolutePosition(up_t, up_v), AbsolutePosition(t0, up_v), color=BULL))
                mid_off: int = n - int((float(n) + up_loc) / 2.0)
                if mid_off < nb:
                    txt: str = 'ChoCH' if os_v == -1.0 else 'BOS'
                    self.chart.draw(LabelAbs(txt, AbsolutePosition(hist[self._hidx(nb, mid_off)], up_v), text_color=BULL,
                                             bg_color=INVIS, callout_position=callout_position.BOTTOM_LEFT, font_size=9))
            if show_support:
                # lowest low between the fractal and now; k = bar offset of that low
                k: int = 2
                mn: float = self.low[1]
                i = 2
                while i <= (n - int(up_loc)) - 1 and i < nb:
                    v = hist[self._hidx(nb, i) + 2]
                    mn = min(v, mn)
                    if v == mn:
                        k = i
                    i += 1
                sup_y = mn
                sup_t = hist[self._hidx(nb, k)] if k < nb else t0
                sup_on = 1.0
                bsup = 0.0
                sup_keep = self._redraw(sup_keep, sup_t, sup_y, t0, BULL, True)
            up_x = 1.0
            os_v = 1.0
        elif show_support and bsup == 0.0 and sup_on == 1.0:
            broke: bool = cl < sup_y
            sup_keep = self._redraw(sup_keep, sup_t, sup_y, t0, BULL, not broke)
            if broke:
                bsup = 1.0
                sup_on = 0.0

        # --- bearish structure: close crosses under the latest bottom fractal
        bear_cross: bool = cl < lo_v and self.close[1] >= lo_v_prev and lo_x == 0.0
        if bear_cross:
            if show_bear:
                self.chart.draw(LineSegment(AbsolutePosition(lo_t, lo_v), AbsolutePosition(t0, lo_v), color=BEAR))
                mid_off2: int = n - int((float(n) + lo_loc) / 2.0)
                if mid_off2 < nb:
                    txt2: str = 'ChoCH' if os_v == 1.0 else 'BOS'
                    self.chart.draw(LabelAbs(txt2, AbsolutePosition(hist[self._hidx(nb, mid_off2)], lo_v), text_color=BEAR,
                                             bg_color=INVIS, callout_position=callout_position.TOP_LEFT, font_size=9))
            if show_resistance:
                k2: int = 2
                mx: float = self.high[1]
                j = 2
                while j <= (n - int(lo_loc)) - 1 and j < nb:
                    v2 = hist[self._hidx(nb, j) + 1]
                    mx = max(v2, mx)
                    if v2 == mx:
                        k2 = j
                    j += 1
                res_y = mx
                res_t = hist[self._hidx(nb, k2)] if k2 < nb else t0
                res_on = 1.0
                bres = 0.0
                res_keep = self._redraw(res_keep, res_t, res_y, t0, BEAR, True)
            lo_x = 1.0
            os_v = -1.0
        elif show_resistance and bres == 0.0 and res_on == 1.0:
            broke2: bool = cl > res_y
            res_keep = self._redraw(res_keep, res_t, res_y, t0, BEAR, not broke2)
            if broke2:
                bres = 1.0
                res_on = 0.0

        up_v_s[0] = up_v
        up_loc_s[0] = up_loc
        up_t_s[0] = up_t
        up_x_s[0] = up_x
        lo_v_s[0] = lo_v
        lo_loc_s[0] = lo_loc
        lo_t_s[0] = lo_t
        lo_x_s[0] = lo_x
        os_s[0] = os_v
        sup_y_s[0] = sup_y
        sup_t_s[0] = sup_t
        sup_on_s[0] = sup_on
        bsup_s[0] = bsup
        res_y_s[0] = res_y
        res_t_s[0] = res_t
        res_on_s[0] = res_on
        bres_s[0] = bres
        self._sup_h.set(sup_keep)
        self._res_h.set(res_keep)

        res_break: float = lo if (bres == 1.0 and bres_prev != 1.0) else nan
        sup_break: float = hi if (bsup == 1.0 and bsup_prev != 1.0) else nan
        return (res_break, sup_break)
```

