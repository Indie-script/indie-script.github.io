# Coppock Curve (Coppock) - Built-in Indicator Guide

> Computes the Coppock Curve as a weighted moving average of the sum of two Rate of Change values.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#coppock-curve) |
| **Source file** | [Coppock Curve.indie5](Coppock%20Curve.indie5) |

## Overview

The Coppock Curve is a long-term momentum oscillator that combines two Rate of Change (ROC) periods and smooths the result with a Weighted Moving Average (WMA). It is designed to identify major bottoms in price trends by capturing the acceleration of price changes. The indicator plots a single blue line on the chart, oscillating around zero.

## How it works

1. Compute the long-term Rate of Change (ROC) over the user-defined long_roc_length period.
2. Compute the short-term ROC over the user-defined short_roc_length period.
3. Sum the two ROC values to create a combined momentum series.
4. Apply a Weighted Moving Average (WMA) of length wma_length to the summed series.
5. Plot the resulting smoothed curve as a blue line on the chart.

## Mathematical model

$$
\text{Coppock} = \text{WMA}\left( \text{ROC}(\text{close}, L) + \text{ROC}(\text{close}, S), W \right)
$$

where $L$ = long_roc_length, $S$ = short_roc_length, $W$ = wma_length.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `wma_length` | int | 10 | ≥ 1 | WMA Length |
| `long_roc_length` | int | 14 | ≥ 1 | Long RoC Length |
| `short_roc_length` | int | 11 | ≥ 1 | Short RoC Length |

## Code walkthrough

### Parameter decorators

Lines 6-9 of [Coppock Curve.indie5](Coppock%20Curve.indie5):

```python
@indicator('Coppock')  # Coppock Curve
@param.int('wma_length', default=10, min=1, title='WMA Length')
@param.int('long_roc_length', default=14, min=1, title='Long RoC Length')
@param.int('short_roc_length', default=11, min=1, title='Short RoC Length')
```

The @indicator decorator sets the display name. Three integer parameters control the WMA length, long ROC length, and short ROC length, each with a default and minimum of 1. The @plot.line decorator specifies the output line color as blue.

### ROC computation

Lines 12-13 of [Coppock Curve.indie5](Coppock%20Curve.indie5):

```python
    l_roc = Roc.new(self.close, long_roc_length)[0]
    s_roc = Roc.new(self.close, short_roc_length)[0]
```

Two independent ROC series are created using the built-in Roc algorithm applied to the close price. The [0] index retrieves the current bar's value. The long and short lengths are user-defined, allowing flexibility in the momentum measurement windows.

### WMA smoothing and return

Lines 14-15 of [Coppock Curve.indie5](Coppock%20Curve.indie5):

```python
    curve = Wma.new(MutSeriesF.new(l_roc + s_roc), wma_length)[0]
    return curve
```

The two ROC values are summed via MutSeriesF, which creates a mutable series from the computed sum. A WMA of that series is then calculated with the user-specified length. The final curve value is returned as a single float for plotting.

## Reading the chart

- The blue line oscillates above and below zero.
- A crossing above zero may indicate bullish momentum acceleration.
- A crossing below zero may indicate bearish momentum acceleration.
- The smoothed nature of the WMA means the curve reacts slowly to price changes, making it suitable for identifying long-term trend reversals.

## Implementation notes

- The Roc and Wma algorithms handle NaN internally; the indicator will only produce valid values after enough bars have passed for all calculations.
- MutSeriesF is used to create a series from the sum of the two ROC values for the WMA input.
- The indicator does not repaint because it uses only current bar values (index [0]) from the algorithms.
- All three parameters must be at least 1; using very small values may produce noisy output.

## FAQ

**What are the default parameter values and what do they mean?**

Default WMA Length is 10, Long RoC Length is 14, Short RoC Length is 11. These are typical settings for a medium-term momentum oscillator.

**How should I interpret the zero line crossings?**

Crossing above zero suggests that the combined short and long-term momentum is turning positive, potentially indicating a bullish trend. Crossing below zero suggests the opposite.

**Can I use this indicator as a standalone entry signal?**

The Coppock Curve is a lagging, smoothed oscillator. It is best used in conjunction with other analysis (e.g., trend confirmation, volume) rather than as a sole entry signal.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color, MutSeriesF
from indie.algorithms import Roc, Wma


@indicator('Coppock')  # Coppock Curve
@param.int('wma_length', default=10, min=1, title='WMA Length')
@param.int('long_roc_length', default=14, min=1, title='Long RoC Length')
@param.int('short_roc_length', default=11, min=1, title='Short RoC Length')
@plot.line(color=color.BLUE)
def Main(self, wma_length, long_roc_length, short_roc_length):
    l_roc = Roc.new(self.close, long_roc_length)[0]
    s_roc = Roc.new(self.close, short_roc_length)[0]
    curve = Wma.new(MutSeriesF.new(l_roc + s_roc), wma_length)[0]
    return curve
```
