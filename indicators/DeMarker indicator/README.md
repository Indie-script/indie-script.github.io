## DeMarker (DeM) Indicator — Indie v5

**Educational Version for GitHub & TradingView**
**Language:** Indie Script v5 — Designed for the TakeProfit trading platform
**Category:** Momentum Oscillator / Trend Exhaustion Detection

***

### What Is the DeMarker Indicator?

The **DeMarker (DeM)** is a classic **momentum oscillator** that compares recent highs and lows to identify potential market exhaustion and trend reversal zones. It works well in both ranging and trending conditions when used with confirmation tools.

***

### Algorithm & Logic

The DeMarker measures buying and selling pressure as follows:

* **Upward movement (`DeMax`)**: Difference between the current high and previous high (if positive).
* **Downward movement (`DeMin`)**: Difference between previous low and current low (if positive).
* These values are **accumulated over a period** (default: 14) using a **sliding sum**.
* The DeMarker value is then calculated with the formula:

```
textCopyEditDeMarker = Sum(DeMax, period) / [Sum(DeMax, period) + Sum(DeMin, period)]
```

This normalizes the result between `0` and `1`.

***

### Interpretation Guide

* 📈 **Above 0.7** → Overbought: possible **trend exhaustion**, look for reversal
* 📉 **Below 0.3** → Oversold: market may **bounce** or reverse upward
* ⚖️ **Between 0.3–0.7** → Neutral: trend likely to continue

Combine with RSI, MACD, or price action (support/resistance zones) for best results.

## Indie V5 source code

```
# indie:lang_version = 5
# education purpose
# © 2025 Pavel Medd (@pavelmedd)
# Licensed under the MIT License. You may use, copy, modify, merge, publish, 
# distribute, sublicense, and/or sell copies of the Software, subject to the 
# conditions of the MIT license. Full license text: https://opensource.org/licenses/MIT

from indie import indicator, plot, color, MutSeriesF
from indie.algorithms import Sum

@indicator('DeMarker')
@plot.line(color=color.BLUE, id='#plot_0')
def Main(self):
    period = 14  # DeMarker's standard period

    # Create a series to store the differences
    high_diff = MutSeriesF.new(0)
    low_diff = MutSeriesF.new(0)

    # Fill the series with values
    if self.high[0] > self.high[1]:
        high_diff[0] = self.high[0] - self.high[1]
    if self.low[0] < self.low[1]:
        low_diff[0] = self.low[1] - self.low[0]

    # Use Sum to sum over the period
    sum_high = Sum.new(high_diff, period)[0]
    sum_low = Sum.new(low_diff, period)[0]

    # Calculate DeMarker
    dem = sum_high / (sum_high + sum_low) if (sum_high + sum_low) != 0 else 0

    return plot.Line(dem)

```

<br>
## Pine Script 6 source code

```
//education purpose
//© 2025 Pavel Medd (@pavelmedd)
//Licensed under the MIT License. You may use, copy, modify, merge, publish, 
//distribute, sublicense, and/or sell copies of the Software, subject to the 
//conditions of the MIT license. Full license text: https://opensource.org/licenses/MIT
//@version=6
indicator("DeMarker", overlay=false)

// Input for the period
period = 14

// Compute differences
high_diff = high > high[1] ? high - high[1] : 0
low_diff = low < low[1] ? low[1] - low : 0

// Compute the sum over the period using manual summation (since `ta.sum()` doesn't exist)
sum_high = math.sum(high_diff, period)
sum_low = math.sum(low_diff, period)

// Calculate DeMarker
dem = (sum_high + sum_low != 0) ? sum_high / (sum_high + sum_low) : 0

// Plot the DeMarker indicator
plot(dem, color=color.blue, title="DeMarker")

```