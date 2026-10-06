---
category: trend
---
# Zig Zag Channels - Indie Port Guide

> Zig zag between swing extremes with a channel that encloses the candle bodies of each leg.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Indicator, port from Pine Script |
| **Original** | Zig Zag Channels [LuxAlgo] (Pine Script v4) |
| **License** | CC BY-NC-SA 4.0 (see the header of the source files) |
| **Original source** | [Zig Zag Channels.pinescript4](Zig%20Zag%20Channels.pinescript4) |
| **Source file** | [Zig Zag Channels.indie5](Zig%20Zag%20Channels.indie5) |

## Overview

Builds a zig zag from swing highs and lows detected by comparing the close `length` bars ago with the highest and lowest close of the last `length` bars. For each leg a channel is drawn: two dotted lines parallel to the leg that touch the most extreme candle bodies above and below it.

Labels show the swing prices, and the last, unfinished leg can be extended to the current bar.

## How it works

1. Direction `os`: 0 (top) if `close[length]` is above the highest close of the window, 1 (bottom) if below the lowest, otherwise unchanged.
2. A change of direction marks a swing point at `high/low[length]`.
3. For the leg between two swing points, find the largest distance of candle bodies above and below the leg.
4. Draw the leg and the two channel lines shifted by those distances, and a label with the swing price.
5. On the last bar draw the unfinished leg and its channel to the current bar.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 100 | ≥ 1 | Length |
| `extend` | bool | True |  | Extend To Last Bar |
| `show_ext` | bool | True |  | Show Extremities |
| `show_labels` | bool | True |  | Show Labels |

## Port notes

Differences and decisions in the Indie port (taken from the header of [Zig Zag Channels.indie5](Zig%20Zag%20Channels.indie5)):

- Logic ported 1:1: swing direction from close vs highest/lowest(length) shifted by `length`, zig zag segments between the
- alternating swing points, channel extremities = max deviation of candle bodies from the segment, labels, the last segment
- Pine: line.new(..., extend=extend.right) on the last bar; here the last segment is drawn to the last bar and a
- few bars of time ahead (Indie lines are time-anchored); the zig zag circles are markers shifted by -length
- Colours: upper #ff1100, zig zag #ff5d00, lower #2157f3 (fixed; Indie has no colour inputs)

## Verification

The drawings and the plot were checked against an independent re-implementation of the Pine logic on the same candles (BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026)): all 54 leg and channel lines matched on both end points (54 of 54), the 18 labels were at the same bars and prices, and the 19 plotted swing circles matched in time and price. The unfinished last leg is extended a few bars past the last candle (Indie lines are time-anchored).

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [Zig Zag Channels.pinescript4](Zig%20Zag%20Channels.pinescript4).

```python
# indie:lang_version = 5
# Zig Zag Channels [LuxAlgo] — Indie port
# Original Pine Script v4 by LuxAlgo (CC BY-NC-SA 4.0)
# Migration notes:
#   Logic ported 1:1: swing direction from close vs highest/lowest(length) shifted by `length`, zig zag segments between the
#   alternating swing points, channel extremities = max deviation of candle bodies from the segment, labels, the last segment
#   Pine: line.new(..., extend=extend.right) on the last bar; here the last segment is drawn to the last bar and a
#   few bars of time ahead (Indie lines are time-anchored); the zig zag circles are markers shifted by -length
#   Colours: upper #ff1100, zig zag #ff5d00, lower #2157f3 (fixed; Indie has no colour inputs)

from math import isnan, nan

from indie import indicator, param, plot, MainContext, color, Color, Optional, MutSeriesF
from indie.algorithms import Highest, Lowest
from indie.drawings import LineSegment, LabelAbs, AbsolutePosition, line_segment_style, callout_position

UP_COL = color.rgba(255, 17, 0, 1.0)
MID_COL = color.rgba(255, 93, 0, 1.0)
DN_COL = color.rgba(33, 87, 243, 1.0)
INVIS = color.TRANSPARENT
HIST_CAP = 3000   # bars of own history (time, body top, body bottom): dynamic series offsets are limited by the engine


@indicator('Zig Zag Channels [LuxAlgo]', overlay_main_pane=True)
@plot.marker('circles', color=color.rgba(255, 93, 0, 1.0), style=plot.marker_style.CIRCLE)
@param.int('length', default=100, min=1, title='Length')
@param.bool('extend', default=True, title='Extend To Last Bar')
@param.bool('show_ext', default=True, title='Show Extremities')
@param.bool('show_labels', default=True, title='Show Labels')
class Main(MainContext):
    def __init__(self):
        empty_l: list[Optional[LineSegment]] = []
        self._last_lines = self.new_var(empty_l)
        empty_f: list[float] = []
        self._hist = self.new_var(empty_f)

    def _segment(self, t1: float, p1: float, t2: float, p2: float, col: Color, dotted: bool) -> LineSegment:
        seg: LineSegment = LineSegment(AbsolutePosition(t1, p1), AbsolutePosition(t2, p2), color=col,
                                       line_style=line_segment_style.DOTTED if dotted else line_segment_style.SOLID)
        self.chart.draw(seg)
        return seg

    def calc(self, length, extend, show_ext, show_labels):
        n: int = self.bar_index
        src: float = self.close[0]
        upper: float = Highest.new(self.close, length)[0]
        lower: float = Lowest.new(self.close, length)[0]

        os_s = MutSeriesF.new(nan)
        os_prev: float = os_s[1]
        c_len: float = self.close[length]
        os_cur: float = os_prev
        if c_len > upper:
            os_cur = 0.0
        elif c_len < lower:
            os_cur = 1.0
        os_s[0] = os_cur
        btm: bool = os_cur == 1.0 and os_prev != 1.0
        top: bool = os_cur == 0.0 and os_prev != 0.0

        hist: list[float] = []
        src_h = self._hist.get()
        kk = 0
        while kk < len(src_h):
            hist.append(src_h[kk])
            kk += 1
        hist.append(self.time[0])
        hist.append(max(self.open[0], self.close[0]))
        hist.append(min(self.open[0], self.close[0]))
        if len(hist) // 3 > HIST_CAP:
            hist.pop(0)
            hist.pop(0)
            hist.pop(0)
        self._hist.set(hist)
        nb: int = len(hist) // 3

        # valuewhen(cond, n, 0): the bar index of the latest event
        btm_n_s = MutSeriesF.new(nan)
        top_n_s = MutSeriesF.new(nan)
        btm_n_s[0] = float(n) if btm else btm_n_s[1]
        top_n_s[0] = float(n) if top else top_n_s[1]
        btm_n: float = btm_n_s[0]
        top_n: float = top_n_s[0]

        valtop_s = MutSeriesF.new(nan)
        valbtm_s = MutSeriesF.new(nan)
        valtop_prev: float = valtop_s[1]
        valbtm_prev: float = valbtm_s[1]
        valtop_s[0] = self.high[length] if top else valtop_prev
        valbtm_s[0] = self.low[length] if btm else valbtm_prev

        ln: int = int(abs(btm_n - top_n)) if (not isnan(btm_n) and not isnan(top_n)) else 0
        circle: float = nan
        if btm:
            circle = self.low[length]
        if top:
            circle = self.high[length]

        max_up: float = 0.0
        max_dn: float = 0.0
        p_end: float = self.high[length]
        p_start: float = valbtm_prev
        if btm:
            p_end = self.low[length]
            p_start = valtop_prev
        if (btm or top) and ln >= 2 and ln + length <= nb - 1:
            i = 0
            while i < ln:
                point: float = p_end + float(i) / float(ln - 1) * (p_start - p_end)
                hb: int = (nb - 1 - (length + i)) * 3
                body_hi: float = hist[hb + 1]
                body_lo: float = hist[hb + 2]
                max_up = max(body_hi - point, max_up)
                max_dn = max(point - body_lo, max_dn)
                i += 1
            t_a = hist[(nb - 1 - (ln + length)) * 3]
            t_b = hist[(nb - 1 - length) * 3]
            self._segment(t_a, p_start, t_b, p_end, MID_COL, False)
            if show_ext:
                self._segment(t_a, p_start + max_up, t_b, p_end + max_up, UP_COL, True)
                self._segment(t_a, p_start - max_dn, t_b, p_end - max_dn, DN_COL, True)
            if show_labels:
                lab_col: Color = DN_COL if btm else UP_COL
                lab: LabelAbs = LabelAbs(str(round(p_end, 4)), AbsolutePosition(t_b, p_end), text_color=lab_col,
                                         bg_color=INVIS,
                                         callout_position=callout_position.BOTTOM_LEFT if btm else callout_position.TOP_LEFT,
                                         font_size=11)
                self.chart.draw(lab)

        # --- the last segment: from the latest swing point to the current bar
        old = self._last_lines.get()
        k = 0
        while k < len(old):
            h = old[k]
            if h is not None:
                self.chart.erase(h.value())
            k += 1
        new_lines: list[Optional[LineSegment]] = []
        last_ok: bool = self.is_last_bar and extend and not isnan(btm_n) and not isnan(top_n)
        if last_ok:
            last_ok = (n - int((btm_n if os_cur == 1.0 else top_n)) + length) <= nb - 1
        if last_ok:
            x1_bar: float = 0.0
            y1: float = 0.0
            if os_cur == 1.0:
                x1_bar = btm_n - float(length)
                y1 = valbtm_s[0]
            else:
                x1_bar = top_n - float(length)
                y1 = valtop_s[0]
            span: int = int(float(n) - (btm_n if os_cur == 1.0 else top_n)) + length
            m_up: float = 0.0
            m_dn: float = 0.0
            j = 0
            while j < span:
                point2: float = src + float(j) / float(span - 1) * (y1 - src)
                hj: int = (nb - 1 - j) * 3
                m_up = max(hist[hj + 1] - point2, m_up)
                m_dn = max(point2 - hist[hj + 2], m_dn)
                j += 1
            t_x1 = hist[(nb - 1 - (n - int(x1_bar))) * 3]
            t_now = self.time[0]
            t_far = t_now + (t_now - self.time[1]) * 10
            slope_t: float = t_far - t_x1
            now_t: float = t_now - t_x1
            f: float = slope_t / now_t if now_t != 0.0 else 1.0
            new_lines.append(self._segment(t_x1, y1, t_far, y1 + (src - y1) * f, MID_COL, False))
            if show_ext:
                new_lines.append(self._segment(t_x1, y1 + m_up, t_far, y1 + m_up + (src + m_up - (y1 + m_up)) * f, UP_COL, True))
                new_lines.append(self._segment(t_x1, y1 - m_dn, t_far, y1 - m_dn + (src - m_dn - (y1 - m_dn)) * f, DN_COL, True))
        self._last_lines.set(new_lines)

        return circle
```

