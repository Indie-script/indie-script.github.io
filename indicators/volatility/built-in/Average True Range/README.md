# Average True Range (ATR) - Built-in Indicator Guide

> Computes the Average True Range, a volatility measure based on the true range (the greatest of three price differences) averaged over a given period.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#average-true-range) |
| **Source file** | [Average True Range.indie5](Average%20True%20Range.indie5) |

## Overview

This indicator measures market volatility by calculating the average of true ranges over a specified period. True Range is the greatest of: current high minus current low, absolute value of current high minus previous close, or absolute value of current low minus previous close. The ATR is commonly used to gauge the degree of price movement, set stop-loss levels, or identify potential breakouts when volatility expands.

The script draws a single red line on the chart representing the ATR value at each bar. It offers four smoothing methods: RMA (Wilder's smoothed moving average), SMA, EMA, and WMA. The default length is 14 periods with RMA smoothing, matching the original Wilder implementation.

## How it works

1. Define a custom indicator named 'ATR' with parameters for length and smoothing type.
2. True Range is computed for each bar as max(high-low, abs(high-prevClose), abs(low-prevClose)).
3. The smoothing method (default RMA) is applied to the True Range series over the specified length.
4. The resulting smoothed value from the Atr algorithm is returned as a single series for plotting.
5. The indicator outputs one red line with the ATR value for the current bar.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 1 |  |
| `smoothing` | str | RMA |  | Smoothing |

## Code walkthrough

### ATR algorithm call

Lines 10-11 of [Average True Range.indie5](Average%20True%20Range.indie5):

```python
def Main(self, length, smoothing):
    return Atr.new(length, smoothing)[0]
```

The main function receives 'length' and 'smoothing' parameters. It calls Atr.new() which internally computes true ranges and applies the chosen smoothing method. The result is the ATR value for the current bar.

## Reading the chart

- A rising ATR indicates increasing volatility (wider price ranges).
- A falling ATR suggests decreasing volatility (narrower price ranges).
- The red line's vertical position shows the average true range in price units.
- The line can be used to set trailing stops or identify breakout levels.

## Implementation notes

- The ATR value is based exclusively on price data (high, low, close) from the current timeframe.
- The default smoothing (RMA) applies Wilder's method: first value is SMA, subsequent values use exponential smoothing with alpha = 1/length.
- The indicator repaints historically only if the smoothing algorithm updates past values with new data (depends on the Atr implementation).

## FAQ

**What does the 'length' parameter affect?**

Length determines the number of bars over which the true range values are averaged. A shorter length makes the ATR more sensitive to recent volatility, while a longer length provides a smoother reading.

**Which smoothing method should I use?**

RMA (Wilder's smoothing) is the traditional choice for ATR, offering a responsive yet smooth curve. SMA provides equal weighting to all periods, while EMA and WMA give more weight to recent data.

**How can I use ATR for stop-loss placement?**

Multiply the ATR value by a factor (e.g., 2 or 3) and set a stop-loss at that distance from entry. This adjusts the stop based on current market volatility.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Atr


@indicator('ATR')  # Average True Range
@param.int('length', default=14, min=1)
@param.str('smoothing', default='RMA', options=['RMA', 'SMA', 'EMA', 'WMA'], title='Smoothing')
@plot.line(color=color.RED)
def Main(self, length, smoothing):
    return Atr.new(length, smoothing)[0]
```
