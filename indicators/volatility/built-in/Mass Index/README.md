# Mass Index - Built-in Indicator Guide

> Computes the sum of the ratio of two EMAs of the high-low range over a given period, used to identify trend reversals.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#mass-index) |
| **Source file** | [Mass Index.indie5](Mass%20Index.indie5) |

## Overview

The Mass Index measures volatility expansion and contraction by taking the ratio of two exponential moving averages of the high-low range. A high ratio indicates expanding volatility, while a low ratio indicates contracting volatility. The indicator sums this ratio over a user-defined lookback period to smooth the readings.

This indicator is typically used to detect potential trend reversals. When the Mass Index rises above a certain threshold (commonly 27) and then falls back below it, it may signal an impending reversal. However, the built-in implementation only plots the raw index line without any threshold markers, leaving interpretation to the trader.

## How it works

1. Compute the high-low range for each bar: high[0] - low[0].
2. Calculate a 9-period EMA of the range (ema1).
3. Calculate a second 9-period EMA of ema1 (ema2).
4. Divide ema1 by ema2 to obtain the ratio for the current bar.
5. Sum the ratio over the user-defined length (default 10) using a rolling sum.
6. Plot the resulting sum as a single blue line on the chart.

## Mathematical model

$$
MI_t = \sum_{i=0}^{\text{length}-1} \frac{\text{EMA}_9(\text{HL}_{t-i})}{\text{EMA}_9(\text{EMA}_9(\text{HL}_{t-i}))}
$$

where $\text{HL}_t = \text{high}_t - \text{low}_t$.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 10 | ≥ 1 |  |

## Code walkthrough

### Creating the range series

Lines 11-11 of [Mass Index.indie5](Mass%20Index.indie5):

```python
    span = MutSeriesF.new(self.high[0] - self.low[0])
```

A new mutable series `span` is created from the current bar's high-low range. `MutSeriesF.new` converts a scalar value into a series that can be fed into subsequent EMA calculations.

### Double EMA computation

Lines 12-13 of [Mass Index.indie5](Mass%20Index.indie5):

```python
    ema1 = Ema.new(span, 9)
    ema2 = Ema.new(ema1, 9)
```

Two 9-period EMAs are computed in sequence: `ema1` from the range series, and `ema2` from `ema1`. Both use the same period, which is a fixed parameter in this implementation.

### Ratio and summation

Lines 14-14 of [Mass Index.indie5](Mass%20Index.indie5):

```python
    return Sum.new(MutSeriesF.new(divide(ema1[0], ema2[0])), length)[0]
```

The ratio `ema1[0] / ema2[0]` is computed using the `divide` function. This ratio is then summed over the user-defined `length` using `Sum.new`. The final value is returned for plotting.

## Reading the chart

- The indicator plots a single blue line representing the Mass Index value.
- Higher values indicate expanding volatility; lower values indicate contracting volatility.
- The code does not draw any threshold lines (e.g., 27), so traders must manually add reference levels or use the raw line for analysis.
- A common interpretation is that a rise above 27 followed by a drop below 27 may signal a trend reversal, but this is not enforced by the indicator itself.

## Implementation notes

- The EMA periods are hardcoded to 9; only the summation length is user-configurable.
- The `divide` function is used for division.
- The indicator uses `MutSeriesF` to create a series from a scalar, which is necessary for the EMA and Sum algorithms to work correctly.
- The result is a single value per bar; no multi-line or histogram plots are used.

## FAQ

**What does the Mass Index measure?**

It measures the expansion and contraction of price volatility by comparing two EMAs of the high-low range. The ratio is summed over a user-defined period to smooth the readings.

**How do I interpret the plotted line?**

The line shows the current Mass Index value. Traders often look for readings above 27 followed by a drop below 27 as a potential trend reversal signal, but this indicator does not include any built-in threshold lines.

**Can I change the EMA periods?**

No, the EMA periods are fixed at 9 in the code. Only the summation length (default 10) can be adjusted via the `length` parameter.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color, MutSeriesF
from indie.algorithms import Ema, Sum
from indie.math import divide


@indicator('Mass Index', format=format.PRICE)
@param.int('length', default=10, min=1)
@plot.line(color=color.BLUE)
def Main(self, length):
    span = MutSeriesF.new(self.high[0] - self.low[0])
    ema1 = Ema.new(span, 9)
    ema2 = Ema.new(ema1, 9)
    return Sum.new(MutSeriesF.new(divide(ema1[0], ema2[0])), length)[0]
```
