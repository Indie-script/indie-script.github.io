# Bollinger Bands Width (BBW) - Built-in Indicator Guide

> Computes Bollinger Bands Width as (upper - lower) / middle from a configurable source and plots it as a teal line.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#bollinger-bands-width) |
| **Source file** | [Bollinger Bands Width.indie5](Bollinger%20Bands%20Width.indie5) |

## Overview

BBW measures the current width of Bollinger Bands relative to the middle band. It expresses how wide the bands are as a fraction of the middle-band value, making the reading comparable across different price levels.

The script plots one teal line. Lower line values correspond to narrower bands, and higher values correspond to wider bands. It is intended for observing volatility compression and expansion directly from the Bollinger Bands calculation.

## How it works

1. On every bar, Main receives the user-configured length, source and mult parameters.
2. Bb.new(src, length, mult) computes the lower, middle and upper Bollinger Band series.
3. Current-bar values are accessed with [0]: upper[0], lower[0] and middle[0].
4. The raw band spread is calculated as upper[0] - lower[0].
5. That spread is normalized by the middle band using divide(), producing the BBW value.
6. The returned value is the single plot output and is drawn as a teal line.

## Mathematical model

$$
\text{BBW} = \frac{U - L}{M}, \quad U = \text{upper}[0],\; L = \text{lower}[0],\; M = \text{middle}[0]
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 20 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `mult` | float | 2.0 | 0.001 - 50.0 | StdDev |

## Code walkthrough

### Indicator definition and settings

Lines 7-11 of [Bollinger Bands Width.indie5](Bollinger%20Bands%20Width.indie5):

```python
@indicator('BBW', format=format.PRICE)  # Bollinger Bands Width
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult', default=2.0, min=0.001, max=50.0, title='StdDev')
@plot.line(color=color.TEAL)
```

The @indicator decorator registers the short name BBW and applies price formatting. @param.int, @param.source and @param.float expose length, source and mult as editable settings, while @plot.line declares the single teal output line.

### Calling the Bollinger Bands algorithm

Lines 12-13 of [Bollinger Bands Width.indie5](Bollinger%20Bands%20Width.indie5):

```python
def Main(self, length, src, mult):
    (lower, middle, upper) = Bb.new(src, length, mult)
```

Main receives the configured parameters as arguments. Bb.new returns lower, middle and upper as series objects, and [0] selects the value for the current bar.

### Normalized width as the returned plot value

Lines 14-14 of [Bollinger Bands Width.indie5](Bollinger%20Bands%20Width.indie5):

```python
    return divide(upper[0] - lower[0], middle[0])
```

The upper-minus-lower spread is divided by the middle band. The divide() helper is used instead of a raw division, and the resulting value is the only value returned to the plot decorator.

## Reading the chart

The teal line represents (upper - lower) / middle for each bar.
Lower readings mean the Bollinger Bands are narrow relative to the middle band.
Higher readings mean the bands are wide relative to the middle band.
The value is a decimal ratio, not a percentage; for example, 0.1 means the band width is 10% of the middle-band value.
No thresholds, fills or markers are drawn; only the BBW line is plotted.

## Implementation notes

- The script accesses only [0] on the Bb series, so it uses current-bar values only.
- divide() handles the quotient safely instead of relying on the / operator directly.
- Parameter constraints are visible in the decorators: length has min 1, and mult has min 0.001 and max 50.0.
- Although the output is a ratio, the indicator uses format=format.PRICE for display formatting.

## FAQ

**What does the BBW line show?**

It shows the distance between the upper and lower Bollinger Bands divided by the middle band. A value of 0.2 means the bands are 20% of the middle-band value apart.

**Can I use a different price source?**

Yes. The Source parameter defaults to close and can be changed to any available source, such as open, high, low, or hl2.

**What does the StdDev parameter control?**

The mult parameter is the number of standard deviations used by the Bollinger Bands algorithm to build the upper and lower bands. The default is 2.0.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, source, plot, color
from indie.algorithms import Bb
from indie.math import divide


@indicator('BBW', format=format.PRICE)  # Bollinger Bands Width
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult', default=2.0, min=0.001, max=50.0, title='StdDev')
@plot.line(color=color.TEAL)
def Main(self, length, src, mult):
    (lower, middle, upper) = Bb.new(src, length, mult)
    return divide(upper[0] - lower[0], middle[0])
```
