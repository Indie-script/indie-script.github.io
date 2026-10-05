# Bull Bear Power (BBP) - Built-in Indicator Guide

> Computes the sum of bull and bear power relative to an EMA, showing buying vs selling pressure.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#bull-bear-power) |
| **Source file** | [Bull Bear Power.indie5](Bull%20Bear%20Power.indie5) |

## Overview

Bull Bear Power (BBP) measures the differences between the current high and low prices and an exponential moving average (EMA) of the close, then sums them. It is designed to gauge the relative strength of bulls (buyers) and bears (sellers) over a given period. The indicator plots a single line that oscillates around zero, with positive values suggesting bullish dominance and negative values suggesting bearish dominance. It is often used to identify trend strength, momentum shifts, and potential divergences with price.

## How it works

1. Compute the EMA of the closing price over the specified length.
2. Calculate bear power as the current low minus the EMA value.
3. Calculate bull power as the current high minus the EMA value.
4. Sum bull power and bear power to obtain the BBP value.
5. Plot the resulting BBP value as a blue line on the chart.

## Mathematical model

$$
\text{bear\_power} = \text{low} - \text{EMA}(\text{close}, \text{length})
$$

$$
\text{bull\_power} = \text{high} - \text{EMA}(\text{close}, \text{length})
$$

$$
\text{BBP} = \text{bull\_power} + \text{bear\_power}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 13 | ≥ 1 |  |

## Code walkthrough

### Indicator declaration and parameters

Lines 6-9 of [Bull Bear Power.indie5](Bull%20Bear%20Power.indie5):

```python
@indicator('BBP')  # Bull Bear Power
@param.int('length', default=13, min=1)
@plot.line(color=color.BLUE)
def Main(self, length):
```

The @indicator decorator sets the short name 'BBP'. @param.int defines a single integer parameter 'length' with default 13 and minimum 1. @plot.line specifies the output line color as blue. The Main function receives the length parameter.

### Computing bear and bull power

Lines 10-11 of [Bull Bear Power.indie5](Bull%20Bear%20Power.indie5):

```python
    bear_power = self.low[0] - Ema.new(self.close, length)[0]
    bull_power = self.high[0] - Ema.new(self.close, length)[0]
```

Bear power is the difference between the current bar's low and the EMA of the close. Bull power is the difference between the current bar's high and the same EMA. Both use the current bar's values (index [0]) and the EMA series returned by Ema.new, also accessed at index [0].

### Returning the indicator value

Lines 12-12 of [Bull Bear Power.indie5](Bull%20Bear%20Power.indie5):

```python
    return bull_power + bear_power
```

The function returns the sum of bull power and bear power. This single value is plotted as the BBP line. The sum combines both forces into one oscillator-like reading.

## Reading the chart

- The BBP line oscillates around zero.
- Positive values indicate that the high is further above the EMA than the low is below it, suggesting bullish pressure.
- Negative values indicate bearish pressure.
- Crosses above zero may signal increasing bullish momentum; crosses below zero may signal increasing bearish momentum.
- Divergences between BBP and price can indicate potential reversals (e.g., price making higher highs while BBP makes lower highs).

## Implementation notes

- The indicator uses the current bar's high and low, so it repaints on each new bar until the bar closes.
- The EMA is computed on the closing price, which introduces lag; shorter lengths reduce lag but increase noise.
- No special handling for NaN values; the indicator will produce NaN on the first bar until the EMA has enough data.
- The length parameter must be at least 1; very small values may produce erratic readings.

## FAQ

**What does a positive BBP value indicate?**

A positive BBP means the high is farther above the EMA than the low is below it, suggesting that bulls are stronger than bears on that bar.

**How should I interpret a cross of the zero line?**

A cross above zero can signal a shift toward bullish momentum, while a cross below zero signals bearish momentum. However, like all oscillators, it should be used in conjunction with other analysis.

**Can I change the moving average type from EMA to SMA?**

No, the indicator is hardcoded to use an exponential moving average (Ema). To use a different type, you would need to modify the source code.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Ema


@indicator('BBP')  # Bull Bear Power
@param.int('length', default=13, min=1)
@plot.line(color=color.BLUE)
def Main(self, length):
    bear_power = self.low[0] - Ema.new(self.close, length)[0]
    bull_power = self.high[0] - Ema.new(self.close, length)[0]
    return bull_power + bear_power
```
