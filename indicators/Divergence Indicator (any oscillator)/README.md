---
category: oscillators
---
# Divergence Indicator (any oscillator) - Indie Port Guide

> Regular and hidden divergences between price pivots and pivots of any chosen source.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Indicator, port from Pine Script |
| **Original** | Divergence Indicator (any oscillator) by yatrader2 (Pine Script v4) |
| **License** | not stated in the script header (open-source script published on TradingView) |
| **Original source** | [Divergence Indicator (any oscillator).pinescript4](Divergence%20Indicator%20(any%20oscillator).pinescript4) |
| **Source file** | [Divergence Indicator (any oscillator).indie5](Divergence%20Indicator%20(any%20oscillator).indie5) |

## Overview

Detects bullish and bearish divergences by comparing the last two pivots of a chosen source (any oscillator, OHLC4 by default) with the price at the same pivots. Regular and hidden variants are available, and the lines can be drawn on the price pane or on the oscillator.

Pivots are confirmed after the right-hand lookback, and the plots are shifted back by that many bars, exactly like the original.

## How it works

1. Pivot low / pivot high of the source with the chosen left and right lookback.
2. At each pivot compare it with the previous pivot of the same kind (`valuewhen(..., 1)`).
3. Regular bullish: price lower low, source higher low. Regular bearish: price higher high, source lower high. Hidden variants are the opposite.
4. A divergence counts only if the previous pivot was between the minimum and maximum number of bars ago (5 to 60 by default).
5. Plot the pivot line (coloured only where a divergence is found) and a label.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `overlay_main` | bool | False |  | Plot on price (rather than on indicator) |
| `osc` | source | source.OHLC4 |  | Indicator |
| `lb_r` | int | 5 | ≥ 1 | Pivot Lookback Right |
| `lb_l` | int | 5 | ≥ 1 | Pivot Lookback Left |
| `range_upper` | int | 60 | ≥ 1 | Max of Lookback Range |
| `range_lower` | int | 5 | ≥ 0 | Min of Lookback Range |
| `plot_bull` | bool | True |  | Plot Bullish |
| `plot_hidden_bull` | bool | False |  | Plot Hidden Bullish |
| `plot_bear` | bool | True |  | Plot Bearish |
| `plot_hidden_bear` | bool | False |  | Plot Hidden Bearish |

## Port notes

Differences and decisions in the Indie port (taken from the header of [Divergence Indicator (any oscillator).indie5](Divergence%20Indicator%20(any%20oscillator).indie5)):

- Logic ported 1:1: pivots on the chosen source, comparison with the previous pivot (valuewhen ... 1),
- range window (barssince), regular and hidden bullish/bearish divergences, plots shifted by -lookback-right
- "Delay plot until candle is closed" is not ported (it only matters on the live bar)
- Line colour is the divergence colour only where a divergence is found, otherwise transparent (as in the original)

## Verification

Compared with the original script on the same candles: BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026). All four pivot lines matched TradingView bar by bar (148 pivot lows and 150 pivot highs) and the 7 bullish and 4 bearish divergence labels fell on the same bars.

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [Divergence Indicator (any oscillator).pinescript4](Divergence%20Indicator%20(any%20oscillator).pinescript4).

```python
# indie:lang_version = 5
# Divergence Indicator (any oscillator) — Indie port
# Original Pine Script v4 by yatrader2 (modification of the TradingView built-in "Divergence Indicator")
# Migration notes:
#   Logic ported 1:1: pivots on the chosen source, comparison with the previous pivot (valuewhen ... 1),
#   range window (barssince), regular and hidden bullish/bearish divergences, plots shifted by -lookback-right
#   "Delay plot until candle is closed" is not ported (it only matters on the live bar)
#   Line colour is the divergence colour only where a divergence is found, otherwise transparent (as in the original)

from math import nan, isnan
from indie import indicator, param, plot, MainContext, color, source, MutSeriesF
from indie.algorithms import PivotHighLow

@indicator('Divergence Indicator (any oscillator)', overlay_main_pane=True)
@param.bool('overlay_main', default=False, title='Plot on price (rather than on indicator)')
@param.source('osc', default=source.OHLC4, title='Indicator')
@param.int('lb_r', default=5, min=1, title='Pivot Lookback Right')
@param.int('lb_l', default=5, min=1, title='Pivot Lookback Left')
@param.int('range_upper', default=60, min=1, title='Max of Lookback Range')
@param.int('range_lower', default=5, min=0, title='Min of Lookback Range')
@param.bool('plot_bull', default=True, title='Plot Bullish')
@param.bool('plot_hidden_bull', default=False, title='Plot Hidden Bullish')
@param.bool('plot_bear', default=True, title='Plot Bearish')
@param.bool('plot_hidden_bear', default=False, title='Plot Hidden Bearish')
@plot.line('reg_bull', color=color.rgba(76, 175, 80, 1.0), line_width=2, title='Regular Bullish')
@plot.marker('reg_bull_lbl', color=color.rgba(76, 175, 80, 1.0), style=plot.marker_style.LABEL)
@plot.line('hid_bull', color=color.rgba(76, 175, 80, 0.2), line_width=2, title='Hidden Bullish')
@plot.marker('hid_bull_lbl', color=color.rgba(76, 175, 80, 1.0), style=plot.marker_style.LABEL)
@plot.line('reg_bear', color=color.rgba(255, 82, 82, 1.0), line_width=2, title='Regular Bearish')
@plot.marker('reg_bear_lbl', color=color.rgba(255, 82, 82, 1.0), style=plot.marker_style.LABEL)
@plot.line('hid_bear', color=color.rgba(255, 82, 82, 0.2), line_width=2, title='Hidden Bearish')
@plot.marker('hid_bear_lbl', color=color.rgba(255, 82, 82, 1.0), style=plot.marker_style.LABEL)
class Main(MainContext):
    def calc(self, overlay_main, osc, lb_r, lb_l, range_upper, range_lower, plot_bull,
             plot_hidden_bull, plot_bear, plot_hidden_bear):
        ph, pl = PivotHighLow.new(osc, left_bars=lb_l, right_bars=lb_r)
        pl_found: bool = not isnan(pl[0])
        ph_found: bool = not isnan(ph[0])

        osc_r: float = osc[lb_r]
        low_r: float = self.low[lb_r]
        high_r: float = self.high[lb_r]

        # valuewhen(found, x, 1) = value at the previous pivot: the state before this bar's update
        pl_osc_s = MutSeriesF.new(nan)
        pl_low_s = MutSeriesF.new(nan)
        ph_osc_s = MutSeriesF.new(nan)
        ph_high_s = MutSeriesF.new(nan)
        prev_pl_osc: float = pl_osc_s[1]
        prev_pl_low: float = pl_low_s[1]
        prev_ph_osc: float = ph_osc_s[1]
        prev_ph_high: float = ph_high_s[1]
        pl_osc_s[0] = osc_r if pl_found else prev_pl_osc
        pl_low_s[0] = low_r if pl_found else prev_pl_low
        ph_osc_s[0] = osc_r if ph_found else prev_ph_osc
        ph_high_s[0] = high_r if ph_found else prev_ph_high

        # _inRange(found[1]): barssince(found[1]) within [range_lower, range_upper]
        pf_s = MutSeriesF.new(1.0 if pl_found else 0.0)
        hf_s = MutSeriesF.new(1.0 if ph_found else 0.0)
        bs_pl_s = MutSeriesF.new(nan)
        bs_ph_s = MutSeriesF.new(nan)
        bs_pl_s[0] = 0.0 if pf_s[1] == 1.0 else bs_pl_s[1] + 1.0
        bs_ph_s[0] = 0.0 if hf_s[1] == 1.0 else bs_ph_s[1] + 1.0
        in_range_pl: bool = range_lower <= bs_pl_s[0] and bs_pl_s[0] <= range_upper
        in_range_ph: bool = range_lower <= bs_ph_s[0] and bs_ph_s[0] <= range_upper

        bull: bool = plot_bull and low_r < prev_pl_low and (osc_r > prev_pl_osc and in_range_pl) and pl_found
        hid_bull: bool = plot_hidden_bull and low_r > prev_pl_low and (osc_r < prev_pl_osc and in_range_pl) and pl_found
        bear: bool = plot_bear and high_r > prev_ph_high and (osc_r < prev_ph_osc and in_range_ph) and ph_found
        hid_bear: bool = plot_hidden_bear and high_r < prev_ph_high and (osc_r > prev_ph_osc and in_range_ph) and ph_found

        low_v: float = low_r if overlay_main else osc_r
        high_v: float = high_r if overlay_main else osc_r
        none_c = color.TRANSPARENT

        return (
            plot.Line(low_v if pl_found else nan, offset=-lb_r, color=color.rgba(76, 175, 80, 1.0) if bull else none_c),
            plot.Marker(low_v if bull else nan, text=' Bull ', offset=-lb_r),
            plot.Line(low_v if pl_found else nan, offset=-lb_r, color=color.rgba(76, 175, 80, 0.2) if hid_bull else none_c),
            plot.Marker(low_v if hid_bull else nan, text=' H Bull ', offset=-lb_r),
            plot.Line(high_v if ph_found else nan, offset=-lb_r, color=color.rgba(255, 82, 82, 1.0) if bear else none_c),
            plot.Marker(high_v if bear else nan, text=' Bear ', offset=-lb_r),
            plot.Line(high_v if ph_found else nan, offset=-lb_r, color=color.rgba(255, 82, 82, 0.2) if hid_bear else none_c),
            plot.Marker(high_v if hid_bear else nan, text=' H Bear ', offset=-lb_r),
        )
```

