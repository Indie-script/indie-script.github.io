# Average Day Range (ADR) - Built-in Indicator Guide

> Computes the difference between the simple moving averages of high and low prices over a specified period.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#average-day-range) |
| **Source file** | [Average Day Range.indie5](Average%20Day%20Range.indie5) |

## Overview

The Average Day Range (ADR) indicator measures the average distance between the high and low prices over a given lookback period. It is used to gauge the typical price range of an asset, helping traders identify periods of expanding or contracting volatility. On the chart, a single blue line is plotted representing the ADR value at each bar.

## How it works

1. The user specifies a 'length' parameter (default 14) that determines the number of bars used in the moving average calculation.
2. For each bar, the indicator computes a simple moving average (SMA) of the high prices over the last 'length' bars using `Sma.new(self.high, length)`.
3. Similarly, it computes an SMA of the low prices over the same period using `Sma.new(self.low, length)`.
4. The ADR value for the current bar is obtained by subtracting the low SMA from the high SMA: `sma_high[0] - sma_low[0]`.
5. The result is plotted as a continuous blue line on the chart.

## Mathematical model

$$
\text{ADR} = \text{SMA}(\text{high}, n) - \text{SMA}(\text{low}, n)
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 1 |  |

## Code walkthrough

### Indicator declaration and parameters

Lines 6-8 of [Average Day Range.indie5](Average%20Day%20Range.indie5):

```python
@indicator('ADR')  # Average Day Range
@param.int('length', default=14, min=1)
@plot.line(color=color.BLUE)
```

The `@indicator('ADR')` decorator sets the display name. `@param.int('length', default=14, min=1)` creates a user-configurable integer parameter with a minimum value of 1. `@plot.line(color=color.BLUE)` defines the output as a blue line on the chart.

### Computing moving averages

Lines 10-11 of [Average Day Range.indie5](Average%20Day%20Range.indie5):

```python
    sma_high = Sma.new(self.high, length)
    sma_low = Sma.new(self.low, length)
```

`Sma.new(self.high, length)` returns a series of simple moving averages of the high prices. The same is done for low prices. These series are accessed with `[0]` to get the current bar's value. The `Sma.new` function handles the rolling calculation internally.

### Returning the plot value

Lines 12-12 of [Average Day Range.indie5](Average%20Day%20Range.indie5):

```python
    return sma_high[0] - sma_low[0]
```

The function returns the difference between the two SMA values. This single numeric value is automatically plotted by the `@plot.line` decorator. If the series have not yet accumulated enough bars, the value may be `NaN`, resulting in no plot on those initial bars.

## Reading the chart

* The ADR line is plotted in blue.
* Higher values indicate that the average range between high and low has expanded over the lookback period, suggesting increased volatility.
* Lower values indicate a narrower average range, suggesting decreased volatility or consolidation.
* The line can be used to identify periods of expanding or contracting volatility relative to recent history.

## Implementation notes

- The indicator returns `NaN` for the first `length - 1` bars because the SMA requires that many bars to compute a value.
- This is not the same as the Average True Range (ATR); ADR uses only the high and low of each bar, ignoring gaps and overnight moves.
- The calculation uses a simple moving average, not an exponential or weighted average.

## FAQ

**What does the 'length' parameter control?**

It sets the number of bars used in the simple moving average calculation for both the high and low prices. A larger length produces a smoother line that reacts more slowly to recent price changes.

**How is ADR different from ATR?**

ADR uses only the high and low of each bar, while ATR also considers the previous close and gaps between bars. ADR is a simpler measure of intra-bar range, whereas ATR captures total volatility including overnight moves.

**Can I change the color of the ADR line?**

Yes, modify the `color` parameter in the `@plot.line` decorator. For example, `@plot.line(color=color.RED)` will plot the line in red.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma


@indicator('ADR')  # Average Day Range
@param.int('length', default=14, min=1)
@plot.line(color=color.BLUE)
def Main(self, length):
    sma_high = Sma.new(self.high, length)
    sma_low = Sma.new(self.low, length)
    return sma_high[0] - sma_low[0]
```
