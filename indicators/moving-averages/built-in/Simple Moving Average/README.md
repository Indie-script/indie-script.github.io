# Simple Moving Average (SMA) - Built-in Indicator Guide

> Computes the Simple Moving Average (SMA) of a chosen source over a specified length, with an optional offset.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#simple-moving-average) |
| **Source file** | [Simple Moving Average.indie5](Simple%20Moving%20Average.indie5) |

## Overview

The Simple Moving Average (SMA) is a classic trend-following indicator that calculates the arithmetic mean of a selected price source (e.g., close) over a defined number of bars. It smooths out short-term fluctuations to highlight the underlying direction of the market. The SMA is commonly used to identify trend direction, support/resistance levels, and generate crossover signals when combined with other moving averages.

On the chart, the SMA is drawn as a single blue line overlaid on the price pane. The line can be shifted forward or backward using the offset parameter, which is useful for aligning the average with price action or creating leading/lagging effects.

## How it works

1. Define the indicator with parameters: length (number of bars), src (price source), and offset (horizontal shift).
2. Create an instance of the Sma algorithm using `Sma.new(src, length)`, which returns a series of SMA values.
3. Access the current bar's SMA value via `sma[0]` (index 0).
4. Return a `plot.Line` object with the SMA value and the specified offset, which shifts the line horizontally on the chart.
5. The Sma algorithm computes the moving average.

## Mathematical model

$$
\text{SMA} = \frac{1}{n} \sum_{i=0}^{n-1} \text{src}[i]
$$

where $n$ is the `length` parameter and $\text{src}[i]$ is the source value $i$ bars ago.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 9 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `offset` | int | 0 | -500 - 500 | Offset |

## Code walkthrough

### Indicator and parameter decorators

Lines 6-9 of [Simple Moving Average.indie5](Simple%20Moving%20Average.indie5):

```python
@indicator('SMA', overlay_main_pane=True)  # Simple Moving Average
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
```

The `@indicator` decorator registers the script as an overlay indicator named 'SMA'. The `@param.int` and `@param.source` decorators define user-configurable inputs: length (default 9, min 1), source (default close), and offset (range -500 to 500). These automatically generate the settings UI in the platform.

### Plot style decorator

Lines 10-10 of [Simple Moving Average.indie5](Simple%20Moving%20Average.indie5):

```python
@plot.line(color=color.BLUE)
```

The `@plot.line` decorator sets the visual style of the output line to a blue line. This color is applied to the `plot.Line` object returned from the main function.

### Creating the SMA algorithm

Lines 12-12 of [Simple Moving Average.indie5](Simple%20Moving%20Average.indie5):

```python
    sma = Sma.new(src, length)
```

`Sma.new(src, length)` instantiates a rolling SMA calculator. It returns a series-like object that can be indexed with `[0]` for the current bar's value, `[1]` for the previous bar, etc. The algorithm handles the warm-up period automatically.

### Returning the plot line

Lines 13-13 of [Simple Moving Average.indie5](Simple%20Moving%20Average.indie5):

```python
    return plot.Line(sma[0], offset=offset)
```

The function returns a `plot.Line` object containing the current SMA value and the offset. The offset shifts the plotted line horizontally: positive values move it to the right (future), negative to the left (past). This allows the SMA to be used as a leading or lagging indicator.

## Reading the chart

- The SMA line is drawn in blue (default color) on the main price chart.
- When the price is above the SMA, the market is generally considered in an uptrend; below indicates a downtrend.
- The offset parameter shifts the entire line horizontally: a positive offset moves the line to the right (future bars), a negative offset moves it left (past bars).
- During the initial bars (less than `length` bars processed), the SMA line is not drawn (NaN values).

## Implementation notes

- The `Sma.new` algorithm returns a series; accessing `sma[0]` gives the current bar's value, `sma[1]` the previous bar's value, etc.
- The offset parameter can shift the line beyond the visible chart area if set to extreme values (max ±500 bars).
- No line is drawn until at least `length` bars have been processed.
- The source parameter accepts any series (close, high, low, open, volume, or custom calculations).

## FAQ

**How do I change the source from close to high?**

In the indicator settings, change the 'Source' parameter from 'close' to 'high'. The SMA will then be computed using the high price of each bar.

**What does the offset parameter do?**

Offset shifts the plotted SMA line horizontally. A positive value moves the line to the right (future bars), a negative value moves it to the left (past bars). This can be used to create leading or lagging versions of the average.

**Can I use this SMA in a strategy for crossover signals?**

Yes. You can access the SMA series from the indicator and compare it with price or another moving average. For example, a buy signal when price crosses above the SMA. The `sma[0]` and `sma[1]` values allow detecting crossovers.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Sma


@indicator('SMA', overlay_main_pane=True)  # Simple Moving Average
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line(color=color.BLUE)
def Main(self, length, src, offset):
    sma = Sma.new(src, length)
    return plot.Line(sma[0], offset=offset)
    # TODO: implement smoothing when display.none is supported
```
