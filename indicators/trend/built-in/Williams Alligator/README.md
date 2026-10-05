# Williams Alligator (Alligator) - Built-in Indicator Guide

> Williams Alligator indicator plotting three smoothed moving averages (Jaw, Teeth, Lips) of the median price with forward offsets to identify trends.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#williams-alligator) |
| **Source file** | [Williams Alligator.indie5](Williams%20Alligator.indie5) |

## Overview

The Williams Alligator is a trend-following indicator that uses three smoothed moving averages of the median price (hl2) with different periods and forward offsets. It is designed to identify the start of a trend and its direction by the alignment of the three lines. When the lines are intertwined, the market is said to be in a sleeping or ranging phase; when they separate and align in order (Jaw below Teeth below Lips for uptrend, or reverse for downtrend), the alligator is awake and a trend is underway.

On the chart, three lines are plotted: the Jaw (blue, period 13, offset 8), the Teeth (red, period 8, offset 5), and the Lips (green, period 5, offset 3). The offsets shift each line forward in time, so the lines are drawn ahead of the current bar, creating a visual delay that helps confirm trend direction.

## How it works

1. Compute the median price (hl2) as (high + low) / 2 for each bar.
2. Calculate a Running Moving Average (RMA) of hl2 for each period: jaw_period (13), teeth_period (8), lips_period (5). RMA is an exponential moving average with alpha = 1/period.
3. Retrieve the current value of each RMA series using the [0] index.
4. Apply the respective forward offset (jaw_offset=8, teeth_offset=5, lips_offset=3) to each line when plotting, shifting the line to the right.
5. Plot the three lines on the main chart pane in blue (Jaw), red (Teeth), and green (Lips).

## Mathematical model

The RMA (Running Moving Average) is an exponential moving average defined recursively:

$$
\text{RMA}_t = \frac{1}{n} \cdot \text{price}_t + \left(1 - \frac{1}{n}\right) \cdot \text{RMA}_{t-1}
$$

where \(n\) is the period and \(\text{price}_t\) is the median price \(\frac{\text{high}_t + \text{low}_t}{2}\).

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `jaw_period` | int | 13 | ≥ 1 | Jaw Period |
| `teeth_period` | int | 8 | ≥ 1 | Teeth Period |
| `lips_period` | int | 5 | ≥ 1 | Lips Period |
| `jaw_offset` | int | 8 | ≥ 1 | Jaw Offset |
| `teeth_offset` | int | 5 | ≥ 1 | Teeth Offset |
| `lips_offset` | int | 3 | ≥ 1 | Lips Offset |

## Code walkthrough

### Parameter and plot decorators

Lines 7-15 of [Williams Alligator.indie5](Williams%20Alligator.indie5):

```python
@param.int('jaw_period', default=13, min=1, title='Jaw Period')
@param.int('teeth_period', default=8, min=1, title='Teeth Period')
@param.int('lips_period', default=5, min=1, title='Lips Period')
@param.int('jaw_offset', default=8, min=1, title='Jaw Offset')
@param.int('teeth_offset', default=5, min=1, title='Teeth Offset')
@param.int('lips_offset', default=3, min=1, title='Lips Offset')
@plot.line(color=color.BLUE, title='Jaw')
@plot.line(color=color.RED, title='Teeth')
@plot.line(color=color.GREEN, title='Lips')
```

These decorators define the indicator's user-configurable parameters (periods and offsets for Jaw, Teeth, Lips) and the three plot lines with their colors. The `@indicator` decorator just before this range sets the name and overlay mode. The `@param.int` decorators create integer input fields in the settings UI, and `@plot.line` decorators assign colors and titles to the three output lines.

### Computing the three RMAs

Lines 17-19 of [Williams Alligator.indie5](Williams%20Alligator.indie5):

```python
    jaw = Rma.new(self.hl2, jaw_period)
    teeth = Rma.new(self.hl2, teeth_period)
    lips = Rma.new(self.hl2, lips_period)
```

Inside the `Main` function, three RMA series are created using `Rma.new(self.hl2, period)`. `self.hl2` is the built-in median price series. Each RMA is an exponential moving average with smoothing factor 1/period. The series are computed bar by bar and stored; the current value is accessed later with `[0]`.

### Returning plotted lines with offsets

Lines 21-25 of [Williams Alligator.indie5](Williams%20Alligator.indie5):

```python
    return (
        plot.Line(jaw[0], offset=jaw_offset),
        plot.Line(teeth[0], offset=teeth_offset),
        plot.Line(lips[0], offset=lips_offset),
    )
```

The function returns a tuple of three `plot.Line` objects. Each line takes the current RMA value (`jaw[0]`, etc.) and applies a forward offset (`offset=jaw_offset`, etc.). The offset shifts the line to the right on the chart, so the plotted value appears ahead of the bar that generated it. This visual delay is a signature of the Williams Alligator.

## Reading the chart

- **Jaw (blue line)**: longest period (13) and largest offset (8). It is the slowest to react and represents the alligator's jaw.
- **Teeth (red line)**: medium period (8) and offset (5). It reacts faster than the Jaw.
- **Lips (green line)**: shortest period (5) and smallest offset (3). It is the most sensitive.
- When the three lines are intertwined or crisscrossing, the market is considered to be in a consolidation or sleeping phase.
- When the lines separate and align in order (Lips above Teeth above Jaw for an uptrend, or Lips below Teeth below Jaw for a downtrend), the alligator is awake and a trend is in progress.
- The forward offsets cause the lines to be plotted ahead of the current price, so the alignment should be interpreted relative to the price action at the offset positions.

## Implementation notes

- The RMA is an exponential moving average; its initial values are NaN until enough bars have been processed (at least `period` bars).
- The offsets shift the plotted lines forward in time, not the underlying data; this means the lines may appear to extend beyond the latest bar.
- The indicator uses `self.hl2` which is the median price (high+low)/2, not the closing price.
- All three lines are plotted on the main chart pane (overlay), so they share the price scale.

## FAQ

**What are the default periods and offsets?**

Default periods: Jaw=13, Teeth=8, Lips=5. Default offsets: Jaw=8, Teeth=5, Lips=3. These are the classic Williams Alligator settings.

**What does the offset do?**

The offset shifts the plotted line to the right by the specified number of bars. This creates a visual delay that helps confirm trend direction: the lines appear ahead of the current price, so alignment can be seen before price moves.

**How do I interpret line crossings?**

When the Lips cross above the Teeth and Jaw, it signals a potential uptrend. When Lips cross below, a downtrend may start. However, the offsets mean the crossing occurs visually ahead of the actual bar; consider the alignment of all three lines rather than isolated crosses.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Rma


@indicator('Alligator', overlay_main_pane=True)  # Williams Alligator
@param.int('jaw_period', default=13, min=1, title='Jaw Period')
@param.int('teeth_period', default=8, min=1, title='Teeth Period')
@param.int('lips_period', default=5, min=1, title='Lips Period')
@param.int('jaw_offset', default=8, min=1, title='Jaw Offset')
@param.int('teeth_offset', default=5, min=1, title='Teeth Offset')
@param.int('lips_offset', default=3, min=1, title='Lips Offset')
@plot.line(color=color.BLUE, title='Jaw')
@plot.line(color=color.RED, title='Teeth')
@plot.line(color=color.GREEN, title='Lips')
def Main(self, jaw_period, teeth_period, lips_period, jaw_offset, teeth_offset, lips_offset):
    jaw = Rma.new(self.hl2, jaw_period)
    teeth = Rma.new(self.hl2, teeth_period)
    lips = Rma.new(self.hl2, lips_period)

    return (
        plot.Line(jaw[0], offset=jaw_offset),
        plot.Line(teeth[0], offset=teeth_offset),
        plot.Line(lips[0], offset=lips_offset),
    )
```
