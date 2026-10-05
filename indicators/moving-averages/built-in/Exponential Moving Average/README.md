# Exponential Moving Average (EMA) - Built-in Indicator Guide

> Plots an exponential moving average of the selected price source with configurable length and offset.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#exponential-moving-average) |
| **Source file** | [Exponential Moving Average.indie5](Exponential%20Moving%20Average.indie5) |

## Overview

The Exponential Moving Average (EMA) indicator calculates a weighted average of price data, giving more importance to recent observations. It is commonly used to identify trends and smooth out short-term fluctuations.

This indicator overlays a blue line on the main price chart. The length parameter controls the smoothing factor, and the offset allows vertical shifting of the line. The source parameter selects which price series (e.g., close, open) to use as input.

## How it works

1. The indicator is defined with parameters for length, source, and offset using decorators.
2. In the Main function, the Ema.new method is called with the selected source and length to create an exponential moving average series.
3. The current value of the EMA series is accessed via ema[0].
4. The offset parameter is passed to plot.Line to shift the line vertically.
5. A plot.Line object is returned, which draws the EMA line on the chart.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 9 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `offset` | int | 0 | -500 - 500 | Offset |

## Code walkthrough

### Indicator and parameter definitions

Lines 6-10 of [Exponential Moving Average.indie5](Exponential%20Moving%20Average.indie5):

```python
@indicator('EMA', overlay_main_pane=True)  # Moving Average Exponential
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line(color=color.BLUE)
```

The @indicator decorator registers the function as an overlay indicator named 'EMA'. The @param.int and @param.source decorators define user-configurable settings: length (smoothing factor), source (price series to average), and offset (vertical shift). @plot.line sets the line color to blue.

### Main function and EMA calculation

Lines 11-13 of [Exponential Moving Average.indie5](Exponential%20Moving%20Average.indie5):

```python
def Main(self, length, src, offset):
    ema = Ema.new(src, length)
    return plot.Line(ema[0], offset=offset)
```

The Main function receives the parameters. It calls Ema.new to compute the exponential moving average series from the source and length. The current bar's EMA value is ema[0]. The offset is applied, and a plot.Line is returned to render the line on the chart.

### Creating the EMA series

Lines 12-12 of [Exponential Moving Average.indie5](Exponential%20Moving%20Average.indie5):

```python
    ema = Ema.new(src, length)
```

Ema.new creates a series object that calculates the exponential moving average recursively. The series can be indexed with [0] for the current value and [1] for the previous value, though only the current is used here.

## Reading the chart

- The blue line represents the exponential moving average of the selected source.
- The line is drawn on the main price pane as an overlay.
- If offset is non-zero, the entire line is shifted vertically by that amount.
- The line updates bar by bar as new prices come in.

## Implementation notes

- The length parameter must be at least 1; larger values produce a smoother, more lagging average.
- The offset can be negative or positive, allowing the EMA line to be positioned relative to price.
- The indicator uses the platform's Ema algorithm, which handles missing data and series alignment internally.
- Only the current bar value is used; previous values are not directly accessible in this script.

## FAQ

**How do I adjust the smoothness of the EMA?**

Increase the length parameter for a smoother average that reacts slower to price changes, or decrease it for a more responsive line.

**What source price should I use?**

The default is close price, but you can select open, high, low, or other available sources from the settings.

**Can I shift the EMA line up or down?**

Yes, use the offset parameter to add a constant vertical shift to the entire line.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Ema


@indicator('EMA', overlay_main_pane=True)  # Moving Average Exponential
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line(color=color.BLUE)
def Main(self, length, src, offset):
    ema = Ema.new(src, length)
    return plot.Line(ema[0], offset=offset)
    # TODO: implement smoothing when display.none is supported
```
