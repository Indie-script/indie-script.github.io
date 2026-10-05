# Volume Moving Average Weighted (VWMA) - Built-in Indicator Guide

> Computes the volume-weighted moving average (VWMA) of a chosen source, typically close, and plots it as a blue line.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#volume-moving-average-weighted) |
| **Source file** | [Volume Moving Average Weighted.indie5](Volume%20Moving%20Average%20Weighted.indie5) |

## Overview

The VWMA indicator measures the average value of a source series where each bar's price is weighted by that bar's volume. It is meant for market situations where volume confirms price levels: high-volume bars influence the average more than low-volume bars, so the line reflects the volume-dominant price.

The script is minimal: it calls `Vwma.new(src, length)` and returns `plot.Line(result[0], offset=offset)`. The line is overlaid on the main price pane, and the period, input source, and horizontal offset are configurable.

## How it works

1. The indicator is declared with `@indicator('VWMA', overlay_main_pane=True)` so the line appears in the main chart pane.
2. Parameters are defined with decorators: `length` has min 1, `src` defaults to `source.CLOSE`, and `offset` is clamped between -500 and 500.
3. `Vwma.new(src, length)` updates the volume-weighted moving average series on each bar.
4. The expression `result[0]` reads the VWMA value computed for the current bar.
5. The returned `plot.Line(result[0], offset=offset)` draws one point of the blue line, shifted by `offset` if set.
6. The `@plot.line` decorator sets the line color to blue.

## Mathematical model

$$
\text{VWMA}_t = \frac{\sum_{i=0}^{\text{length}-1} \text{src}_{t-i} \cdot \text{volume}_{t-i}}{\sum_{i=0}^{\text{length}-1} \text{volume}_{t-i}}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 20 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `offset` | int | 0 | -500 - 500 | Offset |

## Code walkthrough

### Indicator declaration and settings

Lines 6-10 of [Volume Moving Average Weighted.indie5](Volume%20Moving%20Average%20Weighted.indie5):

```python
@indicator('VWMA', overlay_main_pane=True)  # Volume Weighted Moving Average
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line(color=color.BLUE)
```

This block declares the indicator name and places it on the main price pane. The `@param.*` decorators generate the settings UI for `length`, `src`, and `offset`, while `@plot.line` sets the output style to a blue line.

### Algorithm call

Lines 11-12 of [Volume Moving Average Weighted.indie5](Volume%20Moving%20Average%20Weighted.indie5):

```python
def Main(self, length, src, offset):
    result = Vwma.new(src, length)
```

`Main` receives the user-configured parameters. `Vwma.new(src, length)` creates and updates a series object.

### Returning the plot

Lines 13-13 of [Volume Moving Average Weighted.indie5](Volume%20Moving%20Average%20Weighted.indie5):

```python
    return plot.Line(result[0], offset=offset)
```

The script returns a `plot.Line` object for the current bar's value. The `offset` argument is passed directly to the plot, shifting its horizontal placement without changing the VWMA calculation.

## Reading the chart

- A single blue line is added directly onto the price chart because `overlay_main_pane=True`.
- The line value on the current bar is the volume-weighted average of `src` over the last `length` bars.
- The `offset` setting moves the line along the time axis for visual comparison; at 0 the line is aligned with the bars where it was computed.
- No markers, fill areas, or separate oscillators are produced by this script.

## Implementation notes

- `Vwma.new` returns a series; this script reads only `[0]` for the current bar, while `[1]` would give the previous bar's value.
- The `offset` parameter is passed directly to `plot.Line`, so it affects only the drawing step, not `Vwma.new`.
- Parameter constraints are enforced by the decorators: `length` must be at least 1, and `offset` is limited to the range -500 to 500.
- Because `src` is configurable, the same VWMA calculation can be applied to open, high, low, close, or other available source series.

## FAQ

**How do I change the VWMA period?**

Use the `length` parameter in the indicator settings. It defaults to 20 and has a minimum value of 1.

**Can I apply VWMA to something other than close?**

Yes, change the `src` parameter in the settings. It defaults to `source.CLOSE`.

**What does `offset` do?**

It shifts the plotted line horizontally by the given number of bars without changing the VWMA values. The default is 0.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Vwma


@indicator('VWMA', overlay_main_pane=True)  # Volume Weighted Moving Average
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line(color=color.BLUE)
def Main(self, length, src, offset):
    result = Vwma.new(src, length)
    return plot.Line(result[0], offset=offset)
```
