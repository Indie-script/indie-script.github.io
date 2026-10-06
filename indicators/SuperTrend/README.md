---
category: trend
---
# SuperTrend - Indie Port Guide

> ATR-based trend line that flips between an up-trend support and a down-trend resistance, with Buy/Sell labels.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Indicator, port from Pine Script |
| **Original** | SuperTrend by KivancOzbilgic (Pine Script v4) |
| **License** | not stated in the script header (open-source script published on TradingView) |
| **Original source** | [SuperTrend.pinescript4](SuperTrend.pinescript4) |
| **Source file** | [SuperTrend.indie5](SuperTrend.indie5) |

## Overview

SuperTrend places a trailing line at a distance of ATR times a multiplier from the source price (HL2 by default). While price stays above the line the trend is up and the line follows below price; when the close crosses it, the trend flips and the line jumps to the other side.

The port keeps the original options: ATR by Wilder's smoothing or by a simple average of the true range, optional Buy/Sell signals and the trend highlighter.

## How it works

1. Compute ATR over the chosen period (RMA-based, or SMA of the true range when the option is switched).
2. `up = src - multiplier * atr`, `dn = src + multiplier * atr`.
3. Ratchet the levels: the up level can only rise while the previous close is above it; the down level can only fall while the previous close is below it.
4. Trend starts at +1; it flips to +1 when the close is above the previous down level and to -1 when it is below the previous up level.
5. Plot the up line in an up-trend and the down line in a down-trend; mark a flip with Buy / Sell.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `periods` | int | 10 | ≥ 1 | ATR Period |
| `src` | source | source.HL2 |  | Source |
| `multiplier` | float | 3.0 | ≥ 0.1 | ATR Multiplier |
| `change_atr` | bool | True |  | Change ATR Calculation Method |
| `show_signals` | bool | True |  | Show Buy/Sell Signals |
| `highlighting` | bool | True |  | Highlighting |

## Port notes

Differences and decisions in the Indie port (taken from the header of [SuperTrend.indie5](SuperTrend.indie5)):

- alertcondition() — no Indie equivalent; attach platform alerts to Buy/Sell markers instead
- changeATR toggle — ported: true = Atr (RMA-based), false = Sma(Tr)

## Verification

The plotted lines and the Buy/Sell signals were compared with the original script on the same candles (638 BTC 30-minute bars, 21 Sep - 5 Oct 2026, exported from TradingView). After a 300-bar warm-up both trend lines matched to 1.5e-11 of the price range (158 up-trend and 180 down-trend values) and the 9 Buy and 9 Sell labels fell on the same bars.

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [SuperTrend.pinescript4](SuperTrend.pinescript4).

```python
# indie:lang_version = 5
# SuperTrend — Indie port
# Original Pine Script by KivancOzbilgic (open-source script published on TradingView)
# Migration notes:
#   alertcondition() — no Indie equivalent; attach platform alerts to Buy/Sell markers instead
#   changeATR toggle — ported: true = Atr (RMA-based), false = Sma(Tr)

from math import nan, isnan
from indie import indicator, param, plot, MainContext, color, MutSeriesF, source, format
from indie.algorithms import Atr, Sma, Tr

@indicator('SuperTrend', overlay_main_pane=True, format=format.PRICE, precision=2)
@param.int('periods', default=10, min=1, title='ATR Period')
@param.source('src', default=source.HL2, title='Source')
@param.float('multiplier', default=3.0, min=0.1, step=0.1, title='ATR Multiplier')
@param.bool('change_atr', default=True, title='Change ATR Calculation Method')
@param.bool('show_signals', default=True, title='Show Buy/Sell Signals')
@param.bool('highlighting', default=True, title='Highlighting')
@plot.line('up_trend', color=color.GREEN, line_width=2, title='Up Trend')
@plot.line('dn_trend', color=color.RED, line_width=2, title='Down Trend')
@plot.line('mid', color=color.TRANSPARENT, line_width=1, title='OHLC4')
@plot.fill('up_trend', 'mid', id='up_fill')
@plot.fill('dn_trend', 'mid', id='dn_fill')
@plot.marker('buy_signal', color=color.GREEN, style=plot.marker_style.LABEL)
@plot.marker('sell_signal', color=color.RED, style=plot.marker_style.LABEL)
class Main(MainContext):
    def calc(self, periods, src, multiplier, change_atr, show_signals, highlighting):
        atr_rma: float = Atr.new(periods)[0]
        atr_sma: float = Sma.new(Tr.new(), periods)[0]
        atr_val: float = atr_rma if change_atr else atr_sma

        up_raw = src[0] - multiplier * atr_val
        up = MutSeriesF.new(nan)
        up_prev = up[1] if not isnan(up[1]) else up_raw
        up[0] = max(up_raw, up_prev) if self.close[1] > up_prev else up_raw

        dn_raw = src[0] + multiplier * atr_val
        dn = MutSeriesF.new(nan)
        dn_prev = dn[1] if not isnan(dn[1]) else dn_raw
        dn[0] = min(dn_raw, dn_prev) if self.close[1] < dn_prev else dn_raw

        trend = MutSeriesF.new(1.0)
        t_prev = trend[1] if not isnan(trend[1]) else 1.0
        if t_prev == -1.0 and self.close[0] > dn_prev:
            trend[0] = 1.0
        elif t_prev == 1.0 and self.close[0] < up_prev:
            trend[0] = -1.0
        else:
            trend[0] = t_prev

        t = trend[0]
        t1 = trend[1] if not isnan(trend[1]) else 1.0

        buy_signal = t == 1.0 and t1 == -1.0
        sell_signal = t == -1.0 and t1 == 1.0

        up_val = up[0] if t == 1.0 else nan
        dn_val = dn[0] if t == -1.0 else nan
        ohlc4 = (self.open[0] + self.high[0] + self.low[0] + self.close[0]) / 4.0

        up_fill_c = color.rgba(0, 200, 0, 0.25) if (highlighting and t == 1.0) else color.TRANSPARENT
        dn_fill_c = color.rgba(200, 0, 0, 0.25) if (highlighting and t == -1.0) else color.TRANSPARENT

        buy_val = up[0] if buy_signal and show_signals else nan
        sell_val = dn[0] if sell_signal and show_signals else nan

        return (
            plot.Line(up_val),
            plot.Line(dn_val),
            plot.Line(ohlc4),
            plot.Fill(up_fill_c),
            plot.Fill(dn_fill_c),
            plot.Marker(buy_val, text='Buy'),
            plot.Marker(sell_val, text='Sell'),
        )
```

