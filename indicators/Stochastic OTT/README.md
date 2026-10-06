---
category: oscillators
---
# Stochastic OTT - Indie Port Guide

> A smoothed Stochastic %K with an Optimized Trend Tracker (OTT) line built on it.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Indicator, port from Pine Script |
| **Original** | Stochastic Optimized Trend Tracker by KivancOzbilgic (Pine Script v4) |
| **License** | MPL-2.0 (see the header of the source files) |
| **Original source** | [Stochastic OTT.pinescript4](Stochastic%20OTT.pinescript4) |
| **Source file** | [Stochastic OTT.indie5](Stochastic%20OTT.indie5) |

## Overview

Stochastic OTT takes a very long Stochastic (500 bars) and smooths it with the VAR adaptive average (200 bars). The result, shifted up by 1000 to keep it positive, is then run through the Optimized Trend Tracker: a percentage band around a fast VAR of the oscillator that turns into a trailing line.

Crossings of the oscillator with the OTT line are the optional Buy/Sell signals.

## How it works

1. `%K = stoch(close, high, low, 500)` smoothed with VAR(200), plus 1000.
2. MAvg = VAR of that series with the OTT period (2 by default).
3. Percentage band: `fark = MAvg * percent * 0.01`; long/short stops ratchet like in OTT.
4. Direction flips when MAvg crosses the opposite stop; OTT is the stop scaled by `(200 +/- percent) / 200` and plotted two bars late.
5. Optional signals: the series crossing the OTT line.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `period_k` | int | 500 | ≥ 1 | %K Length |
| `smooth_k` | int | 200 | ≥ 1 | %K Smoothing |
| `length` | int | 2 | ≥ 1 | OTT Period |
| `percent` | float | 0.5 | ≥ 0.0 | OTT Percent |
| `showsupport` | bool | False |  | Show Support Line? |
| `showsignalsc` | bool | False |  | Show Stochastic/OTT Crossing Signals? |

## Port notes

Differences and decisions in the Indie port (taken from the header of [Stochastic OTT.indie5](Stochastic%20OTT.indie5)):

- Logic ported 1:1: %K = stoch(close, high, low, periodK) smoothed by VAR, then OTT on (%K + 1000)
- The Pine input "Source" (src1) only feeds an unused VAR1 series in the original, so it is not ported
- hline(1080/1020) -> constant lines; the band fill is not ported
- alertcondition() — no Indie equivalent

## Verification

Compared with the original script on the same candles: BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026). The %K and OTT lines converge to the TradingView values (the error falls from 1.7 to 0.003 of the range over the window, as expected for a 500-bar Stochastic smoothed over 200 bars: TradingView starts from earlier history). An independent re-implementation of the Pine formulas on the same candles matched the Indie engine output to 2e-13, so the remaining difference is the start-up state, not the logic.

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [Stochastic OTT.pinescript4](Stochastic%20OTT.pinescript4).

```python
# indie:lang_version = 5
# Stochastic Optimized Trend Tracker (SOTT) — Indie port
# Original Pine Script v4 by KivancOzbilgic / Anil Ozeksi (Mozilla Public License 2.0)
# Migration notes:
#   Logic ported 1:1: %K = stoch(close, high, low, periodK) smoothed by VAR, then OTT on (%K + 1000)
#   The Pine input "Source" (src1) only feeds an unused VAR1 series in the original, so it is not ported
#   hline(1080/1020) -> constant lines; the band fill is not ported
#   alertcondition() — no Indie equivalent

from math import nan, isnan
from indie import indicator, param, plot, MainContext, color, format, MutSeriesF
from indie.algorithms import Sma, Highest, Lowest

@indicator('Stochastic Optimized Trend Tracker', format=format.PRICE, precision=2)
@param.int('period_k', default=500, min=1, title='%K Length')
@param.int('smooth_k', default=200, min=1, title='%K Smoothing')
@param.int('length', default=2, min=1, title='OTT Period')
@param.float('percent', default=0.5, min=0.0, step=0.1, title='OTT Percent')
@param.bool('showsupport', default=False, title='Show Support Line?')
@param.bool('showsignalsc', default=False, title='Show Stochastic/OTT Crossing Signals?')
@plot.line('upper_band', color=color.rgba(96, 96, 96, 1.0), line_width=1, title='Upper Band')
@plot.line('lower_band', color=color.rgba(96, 96, 96, 1.0), line_width=1, title='Lower Band')
@plot.line('k_line', color=color.rgba(0, 148, 255, 1.0), line_width=1, title='%K')
@plot.line('support', color=color.rgba(5, 133, 225, 1.0), line_width=2, title='Support Line')
@plot.line('ott', color=color.rgba(184, 0, 217, 1.0), line_width=2, title='OTT')
@plot.marker('buy_c', color=color.GREEN, style=plot.marker_style.LABEL)
@plot.marker('sell_c', color=color.RED, style=plot.marker_style.LABEL)
class Main(MainContext):
    def calc(self, period_k, smooth_k, length, percent, showsupport, showsignalsc):
        # stoch(close, high, low, periodK)
        hh: float = Highest.new(self.high, period_k)[0]
        ll: float = Lowest.new(self.low, period_k)[0]
        den: float = hh - ll
        st: float = 100.0 * (self.close[0] - ll) / den if (not isnan(den) and den != 0.0) else nan
        st_s = MutSeriesF.new(st)
        st_p: float = st_s[1]

        # Var_Func1(stoch, smoothK)
        a1: float = 2.0 / (smooth_k + 1)
        ud1: float = (st - st_p) if st > st_p else 0.0
        dd1: float = (st_p - st) if st < st_p else 0.0
        ud1_s = MutSeriesF.new(ud1)
        dd1_s = MutSeriesF.new(dd1)
        sud1: float = Sma.new(ud1_s, 9)[0] * 9.0
        sdd1: float = Sma.new(dd1_s, 9)[0] * 9.0
        den1: float = sud1 + sdd1
        cmo1: float = (sud1 - sdd1) / den1 if (not isnan(den1) and den1 != 0.0) else 0.0
        t1: float = a1 * abs(cmo1) * st
        t1 = 0.0 if isnan(t1) else t1
        var1_s = MutSeriesF.new(0.0)
        var1_p: float = var1_s[1] if not isnan(var1_s[1]) else 0.0
        var1_s[0] = t1 + (1.0 - a1 * abs(cmo1)) * var1_p
        k: float = var1_s[0]

        src: float = k + 1000.0
        src_s = MutSeriesF.new(src)
        src_p: float = src_s[1]

        # Var_Func(src, length) -> MAvg
        a2: float = 2.0 / (length + 1)
        ud2: float = (src - src_p) if src > src_p else 0.0
        dd2: float = (src_p - src) if src < src_p else 0.0
        ud2_s = MutSeriesF.new(ud2)
        dd2_s = MutSeriesF.new(dd2)
        sud2: float = Sma.new(ud2_s, 9)[0] * 9.0
        sdd2: float = Sma.new(dd2_s, 9)[0] * 9.0
        den2: float = sud2 + sdd2
        cmo2: float = (sud2 - sdd2) / den2 if (not isnan(den2) and den2 != 0.0) else 0.0
        t2: float = a2 * abs(cmo2) * src
        t2 = 0.0 if isnan(t2) else t2
        var2_s = MutSeriesF.new(0.0)
        var2_p: float = var2_s[1] if not isnan(var2_s[1]) else 0.0
        var2_s[0] = t2 + (1.0 - a2 * abs(cmo2)) * var2_p
        mavg: float = var2_s[0]

        # OTT
        fark: float = mavg * percent * 0.01
        long0: float = mavg - fark
        short0: float = mavg + fark
        ls_s = MutSeriesF.new(long0)
        ss_s = MutSeriesF.new(short0)
        long_prev: float = ls_s[1] if not isnan(ls_s[1]) else long0
        short_prev: float = ss_s[1] if not isnan(ss_s[1]) else short0
        ls_s[0] = max(long0, long_prev) if mavg > long_prev else long0
        ss_s[0] = min(short0, short_prev) if mavg < short_prev else short0

        dir_s = MutSeriesF.new(1.0)
        dir_prev: float = dir_s[1] if not isnan(dir_s[1]) else 1.0
        if dir_prev == -1.0 and mavg > short_prev:
            dir_s[0] = 1.0
        elif dir_prev == 1.0 and mavg < long_prev:
            dir_s[0] = -1.0
        else:
            dir_s[0] = dir_prev

        mt: float = ls_s[0] if dir_s[0] == 1.0 else ss_s[0]
        ott: float = (mt * (200.0 + percent) / 200.0) if mavg > mt else (mt * (200.0 - percent) / 200.0)
        ott_s = MutSeriesF.new(ott)
        o2: float = ott_s[2]
        o3: float = ott_s[3]

        buy_c: bool = src > o2 and src_p <= o3
        sell_c: bool = src < o2 and src_p >= o3
        ott_plot: float = 0.0 if isnan(o2) else o2

        return (
            plot.Line(1080.0),
            plot.Line(1020.0),
            plot.Line(k + 1000.0),
            plot.Line(mavg if showsupport else nan),
            plot.Line(ott_plot),
            plot.Marker(ott * 0.995 if (buy_c and showsignalsc) else nan, text='Buy'),
            plot.Marker(ott * 1.005 if (sell_c and showsignalsc) else nan, text='Sell'),
        )
```

