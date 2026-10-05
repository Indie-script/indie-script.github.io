# Moving Average Weighted (WMA) - Built-in Indicator Guide

> Computes a Weighted Moving Average (WMA) of the selected source with configurable length and offset.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#moving-average-weighted) |
| **Source file** | [Moving Average Weighted.indie5](Moving%20Average%20Weighted.indie5) |

## Overview

The Weighted Moving Average (WMA) assigns linearly decreasing weights to older data points, giving more importance to recent prices. It is commonly used to identify trend direction and potential reversals with less lag than a simple moving average but more than an exponential moving average.

The indicator draws a single blue line on the main chart pane. The offset parameter shifts the line horizontally, which can be useful for aligning with future price action or creating leading/lagging signals.

## How it works

1. The indicator is defined with the @indicator decorator, setting it to overlay on the main chart pane.
2. Three parameters are exposed: length (integer, default 9), src (price source, default close), and offset (integer, default 0).
3. Inside Main, the Wma.new() algorithm is called with the source series and length, returning a series of WMA values.
4. The current bar's WMA value is obtained via result[0] and returned as a plot.Line with the specified offset.
5. The line is drawn in blue as defined by the @plot.line decorator.

## Mathematical model

$$
\text{WMA} = \frac{\sum_{i=0}^{n-1} (n-i) \cdot \text{price}_{i}}{\frac{n(n+1)}{2}}
$$

where \(n\) is the length, and \(\text{price}_i\) is the source value \(i\) bars ago (0 = current bar).

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 9 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `offset` | int | 0 | -500 - 500 | Offset |

## Code walkthrough

### Indicator declaration and parameters

Lines 6-10 of [Moving Average Weighted.indie5](Moving%20Average%20Weighted.indie5):

```python
@indicator('WMA', overlay_main_pane=True)  # Weighted Moving Average
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line(color=color.BLUE)
```

The @indicator decorator registers 'WMA' as an overlay indicator. Three @param decorators define user-configurable inputs: length (integer, min 1), src (price source, default close), and offset (integer, range -500 to 500). The @plot.line decorator sets the default line color to blue.

### Computing the weighted moving average

Lines 12-12 of [Moving Average Weighted.indie5](Moving%20Average%20Weighted.indie5):

```python
    result = Wma.new(src, length)
```

Wma.new(src, length) creates a new WMA algorithm instance and returns a series of computed values. The algorithm internally applies linearly decreasing weights to the last 'length' bars of the source series.

### Returning the plot value

Lines 13-13 of [Moving Average Weighted.indie5](Moving%20Average%20Weighted.indie5):

```python
    return plot.Line(result[0], offset=offset)
```

The function returns a plot.Line object with the current bar's WMA value (result[0]) and the user-specified offset. The offset shifts the line horizontally by the given number of bars (positive shifts right, negative shifts left).

## Reading the chart

- The blue line represents the weighted moving average of the selected source.
- When the price is above the line, the trend is considered up; below the line, down.
- The offset parameter moves the line forward (positive) or backward (negative) in time, which can be used to create leading or lagging signals.
- Crossovers of price and the WMA line may indicate potential trend changes.

## Implementation notes

- Wma.new() returns a series; result[0] gives the value for the current bar, result[1] for the previous bar, etc.
- The offset parameter does not affect the computation, only the horizontal placement of the plotted line.
- If the source series contains NaN values, the WMA will also produce NaN until enough valid data points are available.
- The indicator does not repaint because it uses only current and past data (no future lookahead).

## FAQ

**What is the difference between WMA and SMA?**

WMA assigns higher weights to more recent prices, making it more responsive to price changes than a simple moving average (SMA) which weights all periods equally.

**How does the offset parameter affect the plot?**

A positive offset shifts the WMA line to the right (into the future), while a negative offset shifts it to the left (into the past). This can be used to align the line with future price action or to create a lagging indicator.

**Can I change the line color?**

Yes, modify the color parameter in the @plot.line decorator (e.g., color=color.RED) or change it through the indicator's settings panel in the UI.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Wma


@indicator('WMA', overlay_main_pane=True)  # Weighted Moving Average
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line(color=color.BLUE)
def Main(self, length, src, offset):
    result = Wma.new(src, length)
    return plot.Line(result[0], offset=offset)
```
