# Momentum (Mom) - Built-in Indicator Guide

> Computes the price change over a specified lookback period, displayed as a blue line.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#momentum) |
| **Source file** | [Momentum.indie5](Momentum.indie5) |

## Overview

Momentum measures the difference between the current source value (typically the closing price) and the value from a user-defined number of bars ago. It is a classic oscillator that shows the speed of price movement without normalizing the result.

A rising momentum line indicates accelerating price movement, while a falling line suggests deceleration. The indicator oscillates around zero: positive values mean the current price is higher than it was N bars ago, negative values mean it is lower.

## How it works

1. The indicator accepts two parameters: an integer length (default 10, minimum 1) and a source price (default close).
2. On each bar, it calls Change.new(src, length) which computes src[0] - src[length].
3. The Change algorithm returns a series; the [0] index retrieves the value for the current bar.
4. The result is passed as a scalar to the @plot.line decorator, which draws a solid blue line on the chart.

## Mathematical model

$$
\text{Momentum} = \text{src}[0] - \text{src}[\text{length}]
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 10 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |

## Code walkthrough

### Parameter and source setup

Lines 7-8 of [Momentum.indie5](Momentum.indie5):

```python
@param.int('length', default=10, min=1)
@param.source('src', default=source.CLOSE, title='Source')
```

The length parameter controls the lookback period (default 10 bars). The source parameter lets the user choose which price (close, open, high, low, hl2, etc.) to use as input.

### Core computation

Lines 10-11 of [Momentum.indie5](Momentum.indie5):

```python
def Main(self, length, src):
    return Change.new(src, length)[0]
```

The Main function calls Change.new(src, length) which returns a series of differences. Indexing with [0] extracts the current bar's value. This value is returned as a scalar, which the @plot.line decorator renders as a blue line.

## Reading the chart

- A single blue line oscillates around the zero level.
- Positive values indicate the source price is higher than it was `length` bars ago.
- Negative values indicate the source price is lower than it was `length` bars ago.
- The magnitude of the line shows the price change over the period.

## Implementation notes

- The indicator does not normalize the result, so values depend on the instrument's price scale.
- On the first `length` bars, the Change algorithm returns `math.nan`, so the line starts plotting only after enough bars have elapsed.
- The indicator is stateless and does not repaint; each bar's value is final once the bar closes.

## FAQ

**How do I change the lookback period?**

Adjust the `length` parameter in the indicator settings. The default is 10 bars; the minimum is 1.

**Can I use a different price source?**

Yes. The `src` parameter accepts any price source, such as open, high, low, close, hl2, hlc3, ohlc4, or hlcc4.

**Why does the line start with a flat segment?**

The Change algorithm returns `math.nan` for the first `length` bars because there is not enough historical data to compute the difference. The line only begins plotting once enough bars have passed.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Change


@indicator('Mom')  # Momentum
@param.int('length', default=10, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@plot.line(color=color.BLUE)
def Main(self, length, src):
    return Change.new(src, length)[0]
```
