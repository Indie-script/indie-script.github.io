---
category: support-resistance
---
# Inversion Fair Value Gaps (IFVG) - Indie Port Guide

> Fair value gaps that price has closed through, turned into inverted support/resistance zones.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Support & resistance |
| **Type** | Indicator, port from Pine Script |
| **Original** | Inversion Fair Value Gaps (IFVG) [LuxAlgo] (Pine Script v5) |
| **License** | CC BY-NC-SA 4.0 (see the header of the source files) |
| **Original source** | [Inversion Fair Value Gaps (IFVG).pinescript5](Inversion%20Fair%20Value%20Gaps%20(IFVG).pinescript5) |
| **Source file** | [Inversion Fair Value Gaps (IFVG).indie5](Inversion%20Fair%20Value%20Gaps%20(IFVG).indie5) |

## Overview

Finds fair value gaps (three-candle imbalances) wider than a fraction of ATR. When a candle body closes through a gap, the gap is inverted: a bullish gap turns into a bearish zone and vice versa. The zone is tracked and the retest of the inverted zone is marked with an arrow.

The most recent inversions on each side are drawn on the last bar with their original gap, the inversion area and a dashed mid-line extended to the right.

## How it works

1. Bullish gap: `low > high[2]` and `close[1] > high[2]`; bearish: the mirror. Keep gaps wider than `ATR(200) * multiplier`.
2. A gap whose candle body closes through it becomes an inversion and is stored with the inversion time.
3. An inverted zone is removed when the body closes back through it; a retest (close or wick, by the preference input) adds an arrow.
4. Draw the newest inversions per side: the original gap, the area from the inversion to now, and the mid-line.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `disp_num` | int | 5 | ≥ 1, ≤ 100 | Show Last |
| `signal_pref` | str | 'Close' |  | Signal Preference |
| `atr_multi` | float | 0.25 | ≥ 0.0 | ATR Multiplier |

## Port notes

Differences and decisions in the Indie port (taken from the header of [Inversion Fair Value Gaps (IFVG).indie5](Inversion%20Fair%20Value%20Gaps%20(IFVG).indie5)):

- Logic ported 1:1: FVG detection filtered by ATR, inversion when the candle body closes through the gap,
- inverted gap tracking (signals on the retest), the last `disp_num` inversions per side drawn on the last bar
- Pine UDT arrays (fvg/lab) -> flat lists in rollbackable Vars; Pine redraws everything on barstate.islast — so does the port
- Pine draws the continuation 50 bars to the right; here it is 50 bars of time ahead of the last bar
- Engine limit: 100 drawing changes per bar, and every recalculation of a bar first rolls back the previous one
- (counted too), so at most MAX_SHOWN inversions and MAX_LABELS (newest) retest labels per side are drawn and the two
- same-coloured boxes / collinear dashed lines of each inversion are merged
- Labels use LabelAbs with the arrow glyphs; colours: bull #089981, bear #f23645 (fixed), alpha 0.2

## Verification

The drawn inversions were checked against an independent re-implementation of the Pine state machine on the same candles (BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026)): the three inversions shown on the last bar matched on gap start, both price levels and the inversion time (3 of 3). Platform limit: at most 100 drawing changes per bar are allowed, so the port shows up to 3 inversions per side (the original `Show Last` allows up to 100) and up to 2 retest arrows per side.

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [Inversion Fair Value Gaps (IFVG).pinescript5](Inversion%20Fair%20Value%20Gaps%20(IFVG).pinescript5).

```python
# indie:lang_version = 5
# Inversion Fair Value Gaps (IFVG) [LuxAlgo] — Indie port
# Original Pine Script v5 by LuxAlgo (CC BY-NC-SA 4.0)
# Migration notes:
#   Logic ported 1:1: FVG detection filtered by ATR, inversion when the candle body closes through the gap,
#   inverted gap tracking (signals on the retest), the last `disp_num` inversions per side drawn on the last bar
#   Pine UDT arrays (fvg/lab) -> flat lists in rollbackable Vars; Pine redraws everything on barstate.islast — so does the port
#   Pine draws the continuation 50 bars to the right; here it is 50 bars of time ahead of the last bar
#   Engine limit: 100 drawing changes per bar, and every recalculation of a bar first rolls back the previous one
#   (counted too), so at most MAX_SHOWN inversions and MAX_LABELS (newest) retest labels per side are drawn and the two
#   same-coloured boxes / collinear dashed lines of each inversion are merged
#   Labels use LabelAbs with the arrow glyphs; colours: bull #089981, bear #f23645 (fixed), alpha 0.2

from math import isnan, nan
from indie import indicator, param, MainContext, color, Color, Optional, MutSeriesF
from indie.algorithms import Atr
from indie.drawings import Rectangle, LineSegment, LabelAbs, AbsolutePosition, callout_position, line_segment_style

GREEN = color.rgba(8, 153, 129, 0.2)
RED = color.rgba(242, 54, 69, 0.2)
GREEN_TXT = color.rgba(8, 153, 129, 1.0)
RED_TXT = color.rgba(242, 54, 69, 1.0)
MID_COL = color.rgba(120, 123, 134, 1.0)
INVIS = color.TRANSPARENT
BUFFER = 100
FS = 9    # fvg record: id, left time, top, right time, bottom, mid, direction, state, inversion time
LS = 4    # label record: fvg id, time, price, direction
MAX_LABELS = 2
MAX_SHOWN = 3


@indicator('Inversion Fair Value Gaps (IFVG) [LuxAlgo]', overlay_main_pane=True)
@param.int('disp_num', default=5, min=1, max=100, title='Show Last')
@param.str('signal_pref', default='Close', options=['Close', 'Wick'], title='Signal Preference')
@param.float('atr_multi', default=0.25, min=0.0, step=0.25, title='ATR Multiplier')
class Main(MainContext):
    def __init__(self):
        empty_f: list[float] = []
        self._bull_fvg = self.new_var(empty_f)
        self._bear_fvg = self.new_var(empty_f)
        self._bull_inv = self.new_var(empty_f)
        self._bear_inv = self.new_var(empty_f)
        self._labs = self.new_var(empty_f)
        self._next_id = self.new_var(1.0)
        empty_r: list[Optional[Rectangle]] = []
        empty_l: list[Optional[LineSegment]] = []
        empty_b: list[Optional[LabelAbs]] = []
        self._h_r = self.new_var(empty_r)
        self._h_l = self.new_var(empty_l)
        self._h_b = self.new_var(empty_b)

    def _copy(self, src: list[float]) -> list[float]:
        out: list[float] = []
        k = 0
        while k < len(src):
            out.append(src[k])
            k += 1
        return out

    def _manage_fvg(self, fvg: list[float], inv: list[float], c_top: float, c_bot: float, t0: float) -> list[float]:
        # first stage: a gap whose candle body closed through it becomes an inversion
        if len(fvg) // FS >= BUFFER:
            q = 0
            while q < FS:
                fvg.pop(0)
                q += 1
        n_rec: int = len(fvg) // FS
        moved: list[bool] = []
        i = 0
        while i < n_rec:
            moved.append(False)
            i += 1
        i = n_rec - 1
        while i >= 0:
            b = i * FS
            d = fvg[b + 6]
            hit: bool = False
            if d == 1.0 and c_bot < fvg[b + 4]:
                hit = True
            if d == -1.0 and c_top > fvg[b + 2]:
                hit = True
            if hit:
                fvg[b + 8] = t0
                q = 0
                while q < FS:
                    inv.append(fvg[b + q])
                    q += 1
                moved[i] = True
            i -= 1
        keep: list[float] = []
        i = 0
        while i < n_rec:
            if not moved[i]:
                q = 0
                while q < FS:
                    keep.append(fvg[i * FS + q])
                    q += 1
            i += 1
        return keep

    def _manage_inv(self, inv: list[float], labs: list[float], t0: float, wick: bool, c_top: float, c_bot: float) -> bool:
        # second stage: inverted gaps are tracked until the body closes back through them; signals on the retest
        fire: bool = False
        if len(inv) // FS >= BUFFER:
            q = 0
            while q < FS:
                inv.pop(0)
                q += 1
        n_rec: int = len(inv) // FS
        removed: list[bool] = []
        i = 0
        while i < n_rec:
            removed.append(False)
            i += 1
        cl: float = self.close[0]
        cl_prev: float = self.close[1]
        i = n_rec - 1
        while i >= 0:
            b = i * FS
            bx_top = inv[b + 2]
            bx_bot = inv[b + 4]
            d = inv[b + 6]
            st = inv[b + 7]
            if st == 0.0 and d == 1.0:
                inv[b + 7] = 1.0
                inv[b + 6] = -1.0
            if d == -1.0 and st == 0.0:
                inv[b + 7] = 1.0
                inv[b + 6] = 1.0
            if st >= 1.0:
                inv[b + 3] = t0
            ref_hi: float = self.high[0] if wick else cl_prev
            ref_lo: float = self.low[0] if wick else cl_prev
            if d == -1.0 and st == 1.0 and cl < bx_bot and ref_hi >= bx_bot and ref_hi < bx_top:
                labs.append(inv[b])
                labs.append(t0)
                labs.append(bx_top)
                labs.append(-1.0)
                fire = True
            if d == 1.0 and st == 1.0 and cl > bx_top and ref_lo <= bx_top and ref_lo > bx_bot:
                labs.append(inv[b])
                labs.append(t0)
                labs.append(bx_bot)
                labs.append(1.0)
                fire = True
            if st >= 1.0 and ((d == -1.0 and c_top > bx_top) or (d == 1.0 and c_bot < bx_bot)):
                removed[i] = True
            i -= 1
        keep: list[float] = []
        i = 0
        while i < n_rec:
            if not removed[i]:
                q = 0
                while q < FS:
                    keep.append(inv[i * FS + q])
                    q += 1
            i += 1
        # the caller replaces the list content with `keep`
        inv.clear()
        q = 0
        while q < len(keep):
            inv.append(keep[q])
            q += 1
        return fire

    def _draw_side(self, inv: list[float], labs: list[float], t0: float, t_ext: float, disp_num: int,
                   rs: list[Optional[Rectangle]], ls: list[Optional[LineSegment]], lbs: list[Optional[LabelAbs]]) -> bool:
        n_rec: int = len(inv) // FS
        last_index: int = n_rec - 1
        labels_drawn: int = 0
        i = 0
        while i < n_rec:
            if i > last_index - disp_num:
                b = i * FS
                bx_top = inv[b + 2]
                bx_bot = inv[b + 4]
                left = inv[b + 1]
                xval = inv[b + 8]
                mid = inv[b + 5]
                col: Color = GREEN if inv[b + 6] == -1.0 else RED
                o_col: Color = RED if inv[b + 6] == -1.0 else GREEN
                r1: Rectangle = Rectangle(AbsolutePosition(left, bx_top), AbsolutePosition(xval, bx_bot),
                                          line_color=INVIS, line_width=1, bg_color=col)
                self.chart.draw(r1)
                rs.append(r1)
                # Pine draws xval..now and now..+50 bars as two boxes of the same colour and two collinear dashed
                # lines; one box and one line cover the same area with fewer drawings (engine budget per bar)
                r2: Rectangle = Rectangle(AbsolutePosition(xval, bx_top), AbsolutePosition(t_ext, bx_bot),
                                          line_color=INVIS, line_width=1, bg_color=o_col)
                self.chart.draw(r2)
                rs.append(r2)
                l1: LineSegment = LineSegment(AbsolutePosition(left, mid), AbsolutePosition(t_ext, mid), color=MID_COL,
                                              line_style=line_segment_style.DASHED)
                self.chart.draw(l1)
                ls.append(l1)
                j = len(labs) // LS - 1
                while j >= 0:
                    if labs[j * LS] == inv[b] and labels_drawn < MAX_LABELS:
                        labels_drawn += 1
                        if labs[j * LS + 3] == 1.0:
                            lb: LabelAbs = LabelAbs('▲', AbsolutePosition(labs[j * LS + 1], labs[j * LS + 2]),
                                                    text_color=GREEN_TXT, bg_color=INVIS,
                                                    callout_position=callout_position.BOTTOM_LEFT, font_size=11)
                            self.chart.draw(lb)
                            lbs.append(lb)
                        else:
                            lb2: LabelAbs = LabelAbs('▼', AbsolutePosition(labs[j * LS + 1], labs[j * LS + 2]),
                                                     text_color=RED_TXT, bg_color=INVIS,
                                                     callout_position=callout_position.TOP_LEFT, font_size=11)
                            self.chart.draw(lb2)
                            lbs.append(lb2)
                    j -= 1
            i += 1
        return True

    def calc(self, disp_num, signal_pref, atr_multi):
        wick: bool = signal_pref == 'Wick'
        t0 = self.time[0]
        t1 = self.time[1]
        c_top: float = max(self.open[0], self.close[0])
        c_bot: float = min(self.open[0], self.close[0])
        hi: float = self.high[0]
        lo: float = self.low[0]

        atr_raw: float = Atr.new(200)[0] * atr_multi
        cum_s = MutSeriesF.new(0.0)
        cum_prev: float = cum_s[1] if not isnan(cum_s[1]) else 0.0
        cum_s[0] = cum_prev + (hi - lo)
        atr: float = atr_raw if not isnan(atr_raw) else cum_s[0] / (self.bar_index + 1)

        bull_fvg = self._copy(self._bull_fvg.get())
        bear_fvg = self._copy(self._bear_fvg.get())
        bull_inv = self._copy(self._bull_inv.get())
        bear_inv = self._copy(self._bear_inv.get())
        labs = self._copy(self._labs.get())
        next_id: float = self._next_id.get()

        fvg_up: bool = lo > self.high[2] and self.close[1] > self.high[2]
        fvg_down: bool = hi < self.low[2] and self.close[1] < self.low[2]
        if fvg_up and abs(lo - self.high[2]) > atr:
            bull_fvg.append(next_id)
            bull_fvg.append(t1)
            bull_fvg.append(lo)
            bull_fvg.append(t0)
            bull_fvg.append(self.high[2])
            bull_fvg.append((lo + self.high[2]) / 2.0)
            bull_fvg.append(1.0)
            bull_fvg.append(0.0)
            bull_fvg.append(nan)
            next_id += 1.0
        if fvg_down and abs(self.low[2] - hi) > atr:
            bear_fvg.append(next_id)
            bear_fvg.append(t1)
            bear_fvg.append(self.low[2])
            bear_fvg.append(t0)
            bear_fvg.append(hi)
            bear_fvg.append((hi + self.low[2]) / 2.0)
            bear_fvg.append(-1.0)
            bear_fvg.append(0.0)
            bear_fvg.append(nan)
            next_id += 1.0

        bull_fvg = self._manage_fvg(bull_fvg, bull_inv, c_top, c_bot, t0)
        bear_fvg = self._manage_fvg(bear_fvg, bear_inv, c_top, c_bot, t0)
        bear_signal: bool = self._manage_inv(bull_inv, labs, t0, wick, c_top, c_bot)
        bull_signal: bool = self._manage_inv(bear_inv, labs, t0, wick, c_top, c_bot)

        # drop labels of inversions that no longer exist
        alive: list[float] = []
        q = 0
        while q < len(bull_inv) // FS:
            alive.append(bull_inv[q * FS])
            q += 1
        q = 0
        while q < len(bear_inv) // FS:
            alive.append(bear_inv[q * FS])
            q += 1
        labs_keep: list[float] = []
        q = 0
        while q < len(labs) // LS:
            found: bool = False
            z = 0
            while z < len(alive):
                if alive[z] == labs[q * LS]:
                    found = True
                z += 1
            if found:
                labs_keep.append(labs[q * LS])
                labs_keep.append(labs[q * LS + 1])
                labs_keep.append(labs[q * LS + 2])
                labs_keep.append(labs[q * LS + 3])
            q += 1

        self._bull_fvg.set(bull_fvg)
        self._bear_fvg.set(bear_fvg)
        self._bull_inv.set(bull_inv)
        self._bear_inv.set(bear_inv)
        self._labs.set(labs_keep)
        self._next_id.set(next_id)

        # Pine deletes all drawings on every bar and redraws on the last one: erase the previous set first
        old_r = self._h_r.get()
        k = 0
        while k < len(old_r):
            ho = old_r[k]
            if ho is not None:
                self.chart.erase(ho.value())
            k += 1
        old_l = self._h_l.get()
        k = 0
        while k < len(old_l):
            hl = old_l[k]
            if hl is not None:
                self.chart.erase(hl.value())
            k += 1
        old_b = self._h_b.get()
        k = 0
        while k < len(old_b):
            hb = old_b[k]
            if hb is not None:
                self.chart.erase(hb.value())
            k += 1
        new_r: list[Optional[Rectangle]] = []
        new_l: list[Optional[LineSegment]] = []
        new_b: list[Optional[LabelAbs]] = []
        if self.is_last_bar:
            t_ext = t0 + (t0 - t1) * 50
            self._draw_side(bull_inv, labs_keep, t0, t_ext, min(disp_num, MAX_SHOWN), new_r, new_l, new_b)
            self._draw_side(bear_inv, labs_keep, t0, t_ext, min(disp_num, MAX_SHOWN), new_r, new_l, new_b)
        self._h_r.set(new_r)
        self._h_l.set(new_l)
        self._h_b.set(new_b)
```

