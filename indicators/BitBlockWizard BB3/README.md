# BitBlockWizard BB3 - Technical Guide

> Plots three sets of Bollinger Bands with different standard deviation multipliers to visualize multiple volatility levels.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Indicator |
| **Author** | @bitblocklabs on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/bitblockwizard-bb3-45) |
| **Source file** | [BitBlockWizard BB3.indie5](BitBlockWizard%20BB3.indie5) |

## Overview

The Triple Bollinger Bands indicator displays three distinct Bollinger Band sets on the price chart, each using the same moving average length and source but different standard deviation multipliers. This provides a layered view of price volatility and potential support/resistance zones at varying degrees of deviation from the mean.

On the chart, three bands are drawn: the first set (mult1) in blue with a red middle line, the second set (mult2) in yellow with a red middle line, and the third set (mult3) in green with a red middle line. A semi-transparent aqua fill is applied between the lower1 line and the upper3 line, highlighting the overall volatility envelope.

## How it works

1. Define user parameters: length, source price, three standard deviation multipliers (mult1, mult2, mult3), and an offset for horizontal shifting.
2. Compute the first Bollinger Band set using Bb.new(src, length, mult1), returning lower1, middle1, upper1 series.
3. Compute the second Bollinger Band set using Bb.new(src, length, mult2), returning lower2, middle2, upper2 series.
4. Compute the third Bollinger Band set using Bb.new(src, length, mult3), returning lower3, middle3, upper3 series.
5. Access the current bar value of each series with [0] and apply the offset to all lines.
6. Return plot.Line objects for all nine band lines and a plot.Fill between lower1 and upper3 to create the background envelope.

## Mathematical model

Each Bollinger Band set is computed as:

$$
\text{middle} = \text{SMA}(\text{src}, \text{length})
$$

$$
\text{upper} = \text{middle} + \text{mult} \times \text{stddev}(\text{src}, \text{length})
$$

$$
\text{lower} = \text{middle} - \text{mult} \times \text{stddev}(\text{src}, \text{length})
$$

where $\text{mult}$ is the respective multiplier (mult1, mult2, mult3) and $\text{stddev}$ is the population standard deviation over the same length.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 20 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `mult1` | float | 1.0 | 0.001 - 50.0 | StdDev 1 |
| `mult2` | float | 2.0 | 0.001 - 50.0 | StdDev 2 |
| `mult3` | float | 3.0 | 0.001 - 50.0 | StdDev 3 |
| `offset` | int | 0 | -500 - 500 |  |

## Code walkthrough

### Parameter and Plot Decorators

Lines 6-22 of [BitBlockWizard BB3.indie5](BitBlockWizard%20BB3.indie5):

```python
@indicator('Triple Bollinger Bands', overlay_main_pane=True)
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult1', default=1.0, min=0.001, max=50.0, title='StdDev 1')
@param.float('mult2', default=2.0, min=0.001, max=50.0, title='StdDev 2')
@param.float('mult3', default=3.0, min=0.001, max=50.0, title='StdDev 3')
@param.int('offset', default=0, min=-500, max=500)
@plot.line('lower1', color=color.BLUE, title='Lower 1')
@plot.line('middle1', color=color.RED, title='Basis 1')
@plot.line('upper1', color=color.BLUE, title='Upper 1')
@plot.line('lower2', color=color.YELLOW, title='Lower 2')
@plot.line('middle2', color=color.RED, title='Basis 2')
@plot.line('upper2', color=color.YELLOW, title='Upper 2')
@plot.line('lower3', color=color.GREEN, title='Lower 3')
@plot.line('middle3', color=color.RED, title='Basis 3')
@plot.line('upper3', color=color.GREEN, title='Upper 3')
@plot.fill('lower1', 'upper3', color=color.AQUA(0.05), title='Background', id='#fill_9')
```

Lines 6-22 define the indicator metadata and user-configurable parameters. The @indicator decorator sets the name and places the indicator in the main chart pane. @param decorators create UI inputs for length, source, three multipliers, and offset. @plot decorators assign colors and titles to each of the nine band lines and the fill area. The fill is defined between lower1 and upper3 with a low-opacity aqua color.

### Bollinger Band Calculations

Lines 24-26 of [BitBlockWizard BB3.indie5](BitBlockWizard%20BB3.indie5):

```python
    (lower1, middle1, upper1) = Bb.new(src, length, mult1)
    (lower2, middle2, upper2) = Bb.new(src, length, mult2)
    (lower3, middle3, upper3) = Bb.new(src, length, mult3)
```

Lines 24-26 call Bb.new three times with the same source and length but different multipliers. Each call returns a tuple of three series (lower, middle, upper). The Bb.new algorithm internally computes the simple moving average and standard deviation, then applies the multiplier to produce the bands. The series are used later with [0] to get the current bar's values.

### Return Tuple with Plot Objects

Lines 28-39 of [BitBlockWizard BB3.indie5](BitBlockWizard%20BB3.indie5):

```python
    return (
        plot.Line(lower1[0], offset=offset),
        plot.Line(middle1[0], offset=offset),
        plot.Line(upper1[0], offset=offset),
        plot.Line(lower2[0], offset=offset),
        plot.Line(middle2[0], offset=offset),
        plot.Line(upper2[0], offset=offset),
        plot.Line(lower3[0], offset=offset),
        plot.Line(middle3[0], offset=offset),
        plot.Line(upper3[0], offset=offset),
        plot.Fill(),
    )
```

Lines 28-39 construct the return value as a tuple of plot objects. Each plot.Line takes the current bar value (via [0]) and applies the user-specified offset. The final plot.Fill() uses the previously declared fill decorator (line 22) to draw the background between lower1 and upper3. The order of plot objects must match the order of @plot decorators.

## Reading the chart

- **First band (mult1):** Upper and lower lines in blue, middle line in red. Represents the volatility envelope for the first multiplier (mult1).
- **Second band (mult2):** Upper and lower lines in yellow, middle line in red. A volatility envelope for the second multiplier (mult2).
- **Third band (mult3):** Upper and lower lines in green, middle line in red. The volatility envelope for the third multiplier (mult3).
- **Background fill:** A light aqua (5% opacity) area between the lower1 and upper3 lines, highlighting the overall volatility range.
- **Offset:** Shifts all lines horizontally by the specified number of bars (positive = right, negative = left).
- **Price interaction:** When price touches or crosses the outer bands, it may indicate overbought/oversold conditions or potential reversals, but the indicator itself does not generate signals.

## Implementation notes

- All three band sets share the same length and source; only the standard deviation multiplier differs.
- The Bb.new algorithm returns NaN for bars where insufficient data is available (fewer than length bars). The plot will not draw on those bars.
- The offset parameter can be negative, shifting bands to the left (past bars), which may cause repainting if used in real-time.
- The fill area uses the first lower band (lower1) and the third upper band (upper3), not the outermost bands dynamically; this is fixed by the decorator definition.

## FAQ

**Can I change the colors of the bands?**

Yes, modify the color arguments in the @plot.line decorators (lines 13-21). For example, change color.BLUE to color.PURPLE for the first band lines.

**What does the offset parameter do?**

The offset shifts all plotted lines horizontally by a given number of bars. A positive value moves them to the right (future bars), a negative value to the left (past bars). This can be used to align bands with future price action, but note it may introduce repainting.

**Can I use different moving average lengths for each band set?**

No, the current implementation uses the same length parameter for all three Bb.new calls. To use different lengths, you would need to modify the code to add separate length parameters and call Bb.new with each.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/bitblockwizard-bb3-45).

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Bb

# Triple Bollinger Bands
@indicator('Triple Bollinger Bands', overlay_main_pane=True)
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult1', default=1.0, min=0.001, max=50.0, title='StdDev 1')
@param.float('mult2', default=2.0, min=0.001, max=50.0, title='StdDev 2')
@param.float('mult3', default=3.0, min=0.001, max=50.0, title='StdDev 3')
@param.int('offset', default=0, min=-500, max=500)
@plot.line('lower1', color=color.BLUE, title='Lower 1')
@plot.line('middle1', color=color.RED, title='Basis 1')
@plot.line('upper1', color=color.BLUE, title='Upper 1')
@plot.line('lower2', color=color.YELLOW, title='Lower 2')
@plot.line('middle2', color=color.RED, title='Basis 2')
@plot.line('upper2', color=color.YELLOW, title='Upper 2')
@plot.line('lower3', color=color.GREEN, title='Lower 3')
@plot.line('middle3', color=color.RED, title='Basis 3')
@plot.line('upper3', color=color.GREEN, title='Upper 3')
@plot.fill('lower1', 'upper3', color=color.AQUA(0.05), title='Background', id='#fill_9')
def Main(self, length, src, mult1, mult2, mult3, offset):
    (lower1, middle1, upper1) = Bb.new(src, length, mult1)
    (lower2, middle2, upper2) = Bb.new(src, length, mult2)
    (lower3, middle3, upper3) = Bb.new(src, length, mult3)

    return (
        plot.Line(lower1[0], offset=offset),
        plot.Line(middle1[0], offset=offset),
        plot.Line(upper1[0], offset=offset),
        plot.Line(lower2[0], offset=offset),
        plot.Line(middle2[0], offset=offset),
        plot.Line(upper2[0], offset=offset),
        plot.Line(lower3[0], offset=offset),
        plot.Line(middle3[0], offset=offset),
        plot.Line(upper3[0], offset=offset),
        plot.Fill(),
    )
```
