# Net Volume - Built-in Indicator Guide

> Computes net volume from close prices using the built-in NetVolume algorithm.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volume |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#net-volume) |
| **Source file** | [Net Volume.indie5](Net%20Volume.indie5) |

## Overview

The Net Volume indicator measures net volume flow based on the close price series. It is designed to help traders identify the balance between buying and selling pressure.

The indicator plots a blue line on the chart, where each point represents the net volume value for the corresponding bar.

## How it works

1. Retrieve the close price series for the current symbol.
2. Call the built-in NetVolume algorithm with the close series using `NetVolume.new(self.close)`.
3. The algorithm computes a net volume value for each bar and returns a series.
4. Extract the current bar's value with `[0]`.
5. Plot the value as a blue line on the chart via the `@plot.line` decorator.

## Code walkthrough

### Imports and version declaration

Lines 1-3 of [Net Volume.indie5](Net%20Volume.indie5):

```python
# indie:lang_version = 5
from indie import indicator, format, plot, color
from indie.algorithms import NetVolume
```

The script declares Indie Script version 5 and imports the necessary modules: indicator, format, plot, and color from the indie package, as well as the NetVolume algorithm from indie.algorithms.

### Indicator and plot decorators

Lines 6-7 of [Net Volume.indie5](Net%20Volume.indie5):

```python
@indicator('Net Volume', format=format.VOLUME)
@plot.line(color=color.BLUE)
```

The @indicator decorator registers the indicator with the name 'Net Volume' and sets its format to VOLUME, which may affect how the values are displayed. The @plot.line decorator configures the plot to be a blue line.

### Main function and return value

Lines 8-9 of [Net Volume.indie5](Net%20Volume.indie5):

```python
def Main(self):
    return NetVolume.new(self.close)[0]
```

The Main function is the entry point. It creates a new instance of the NetVolume algorithm using the close price series and returns the current bar's value by indexing the resulting series with [0]. This value is then plotted according to the decorators.

## Reading the chart

- The indicator draws a blue line.
- The line's value at each bar corresponds to the net volume computed by the algorithm.
- The line updates in real time as new bars are added.
- The format is set to VOLUME, so the values may be displayed with volume formatting (e.g., large numbers).

## Implementation notes

- The indicator relies on the built-in NetVolume algorithm, whose internal logic is not exposed in this script.
- Only the close price is used as input; other data like volume or open/high/low are not considered.
- The `[0]` indexing retrieves the current bar's value; `[1]` would give the previous bar's value.
- The indicator is recalculated on every bar, so the line is continuously updated.

## FAQ

**How is the net volume calculated?**

The calculation is performed by the built-in NetVolume algorithm, which takes the close price series as input. The exact formula is defined by the platform and is not visible in this script.

**Can I change the line color?**

Yes, modify the color parameter in the @plot.line decorator. For example, @plot.line(color=color.RED) will draw a red line.

**What does a positive value indicate?**

The interpretation depends on the algorithm. Generally, positive values may indicate net buying pressure and negative values net selling pressure, but this script does not define the meaning.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, plot, color
from indie.algorithms import NetVolume


@indicator('Net Volume', format=format.VOLUME)
@plot.line(color=color.BLUE)
def Main(self):
    return NetVolume.new(self.close)[0]
```
