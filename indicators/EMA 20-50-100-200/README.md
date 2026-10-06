---
category: moving-averages
---
# EMA 20-50-100-200 - Indie Port Guide

> Four exponential moving averages of the close with fixed lengths 20, 50, 100 and 200.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Indicator, port from Pine Script |
| **Original** | EMA 20/50/100/200 by drsweets (Pine Script) |
| **License** | not stated in the script header (open-source script published on TradingView) |
| **Original source** | [EMA 20-50-100-200.pinescript](EMA%2020-50-100-200.pinescript) |
| **Source file** | [EMA 20-50-100-200.indie5](EMA%2020-50-100-200.indie5) |

## Overview

Plots four EMAs of the closing price on the chart: 20, 50, 100 and 200 bars. The lengths are fixed in the original script, so there are no inputs.

Typical use is reading trend and pullbacks against several time horizons at once: price above the whole stack is a strong uptrend, the order of the lines shows how mature the trend is.

## How it works

1. For each length n in (20, 50, 100, 200) compute `ema(close, n)`.
2. Plot the four lines (red, orange, aqua, blue in the original).

## Port notes

Differences and decisions in the Indie port (taken from the header of [EMA 20-50-100-200.indie5](EMA%2020-50-100-200.indie5)):

- Four EMAs of close, lengths fixed as in the original (no inputs)

## Verification

The four lines were compared with the original script on the same candles: BTC 30-minute candles exported from TradingView (2,473 bars, 15 Aug - 5 Oct 2026). EMA 20 and EMA 50 matched to about 1e-14 of the price range, EMA 100 to 3e-10, EMA 200 to 2e-5. The EMA 200 residual is the unavoidable start-up difference: an EMA of that length does not fully forget its first value within about a thousand bars, and TradingView starts from an earlier bar.

## Full source code

Indie Script v5. Copy it into the platform's script editor. The original Pine Script is published next to it as [EMA 20-50-100-200.pinescript](EMA%2020-50-100-200.pinescript).

```python
# indie:lang_version = 5
# EMA 20/50/100/200 — Indie port
# Original Pine Script by drsweets (open_no_auth)
# Migration notes:
#   Four EMAs of close, lengths fixed as in the original (no inputs)

from indie import indicator, plot, MainContext, color
from indie.algorithms import Ema

@indicator('EMA 20/50/100/200', overlay_main_pane=True)
@plot.line('ema20',  color=color.rgba(255, 0, 0,   1.0), line_width=1, title='EMA 20')
@plot.line('ema50',  color=color.rgba(255, 152, 0, 1.0), line_width=1, title='EMA 50')
@plot.line('ema100', color=color.rgba(0, 188, 212, 1.0), line_width=1, title='EMA 100')
@plot.line('ema200', color=color.rgba(33, 150, 243, 1.0), line_width=1, title='EMA 200')
class Main(MainContext):
    def calc(self):
        return (
            plot.Line(Ema.new(self.close, 20)[0]),
            plot.Line(Ema.new(self.close, 50)[0]),
            plot.Line(Ema.new(self.close, 100)[0]),
            plot.Line(Ema.new(self.close, 200)[0]),
        )
```

