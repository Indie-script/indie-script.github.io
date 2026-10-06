---
category: trend
---
# UT Bot Alerts - Indie Port Guide

> ATR trailing stop on the close with Buy/Sell labels when price crosses it.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Indicator, port from Pine Script |
| **Original** | UT Bot Alerts by QuantNomad (Pine Script v4) |
| **License** | not stated in the script header (open-source script published on TradingView) |
| **Original source** | [UT Bot Alerts.pinescript4](UT%20Bot%20Alerts.pinescript4) |
| **Source file** | [UT Bot Alerts.indie5](UT%20Bot%20Alerts.indie5) |

## Overview

UT Bot Alerts keeps a trailing stop at ATR times a key value away from the close. The stop only moves in the direction of the trade; a crossing of the price over it flips the position and prints a Buy or Sell label.

The key value sets sensitivity: a small value reacts quickly and flips often, a large value gives fewer, later signals.

## How it works

1. ATR over the chosen period; `nLoss = key_value * ATR`.
2. If the close and the previous close are above the previous stop, the stop is the larger of the previous stop and `close - nLoss`.
3. If both are below it, the stop is the smaller of the previous stop and `close + nLoss`; otherwise it restarts at `close -/+ nLoss`.
4. Position flips to long/short when the close crosses the previous stop.
5. Buy when the close is above the stop and the stop crosses the (1-bar) EMA; Sell is the mirror.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `key_value` | float | 1.0 | ≥ 0.0 |  |
| `atr_period` | int | 10 | ≥ 1 | ATR Period |

## Port notes

Differences and decisions in the Indie port (taken from the header of [UT Bot Alerts.indie5](UT%20Bot%20Alerts.indie5)):

- Logic ported 1:1: ATR trailing stop on close, position flip, Buy/Sell on EMA(1)/stop crossover
- "Signals from Heikin Ashi Candles" (security(heikinashi(...))) is not ported — signals are always on the chart candles
- barcolor() (green/red bars) is not ported; alertcondition() — no Indie equivalent, use platform alerts on the markers
- Buy label sits below the bar, Sell label above (location.belowbar / abovebar)

## Verification

Compared with the original script on the same candles: BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026). The Buy and Sell labels fell on the same bars as in TradingView over the whole compared window (2,172 bars after a 300-bar warm-up).

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [UT Bot Alerts.pinescript4](UT%20Bot%20Alerts.pinescript4).

```python
# indie:lang_version = 5
# UT Bot Alerts — Indie port
# Original Pine Script v4 by QuantNomad (open source)
# Migration notes:
#   Logic ported 1:1: ATR trailing stop on close, position flip, Buy/Sell on EMA(1)/stop crossover
#   "Signals from Heikin Ashi Candles" (security(heikinashi(...))) is not ported — signals are always on the chart candles
#   barcolor() (green/red bars) is not ported; alertcondition() — no Indie equivalent, use platform alerts on the markers
#   Buy label sits below the bar, Sell label above (location.belowbar / abovebar)

from math import nan, isnan
from indie import indicator, param, plot, MainContext, color, MutSeriesF
from indie.algorithms import Atr, Ema

@indicator('UT Bot Alerts', overlay_main_pane=True)
@param.float('key_value', default=1.0, min=0.0, step=0.1, title="Key Vaule. 'This changes the sensitivity'")
@param.int('atr_period', default=10, min=1, title='ATR Period')
@plot.marker('buy', color=color.GREEN, style=plot.marker_style.LABEL)
@plot.marker('sell', color=color.RED, style=plot.marker_style.LABEL)
class Main(MainContext):
    def calc(self, key_value, atr_period):
        src: float = self.close[0]
        src_prev: float = self.close[1]
        nloss: float = key_value * Atr.new(atr_period)[0]

        stop_s = MutSeriesF.new(0.0)
        stop_raw_prev: float = stop_s[1]
        prev: float = 0.0 if isnan(stop_raw_prev) else stop_raw_prev
        stop: float = 0.0
        if src > prev and src_prev > prev:
            stop = max(prev, src - nloss)
        elif src < prev and src_prev < prev:
            stop = min(prev, src + nloss)
        elif src > prev:
            stop = src - nloss
        else:
            stop = src + nloss
        stop_s[0] = stop

        ema: float = Ema.new(self.close, 1)[0]
        ema_prev: float = Ema.new(self.close, 1)[1]
        above: bool = ema > stop and ema_prev <= stop_raw_prev
        below: bool = stop > ema and stop_raw_prev <= ema_prev
        buy: bool = src > stop and above
        sell: bool = src < stop and below

        return (
            plot.Marker(self.low[0] if buy else nan, text='Buy'),
            plot.Marker(self.high[0] if sell else nan, text='Sell'),
        )
```

