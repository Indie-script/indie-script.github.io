# Parabolic Stop And Reverse (SAR) - Built-in Indicator Guide

> Computes the Parabolic Stop and Reverse (SAR) with configurable acceleration factors.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#parabolic-stop-and-reverse) |
| **Source file** | [Parabolic Stop And Reverse.indie5](Parabolic%20Stop%20And%20Reverse.indie5) |

## Overview

The Parabolic SAR is a trend-following indicator that plots a series of dots (crosses) on the chart to identify potential reversal points. It is designed for trending markets, where it trails price and accelerates as the trend continues. When the SAR dot is below price, the trend is considered up; when above, the trend is down.

On the chart, the indicator draws blue cross markers at each bar's SAR value. The marker flips from below to above price (or vice versa) when the trend reverses, signaling a potential change in direction.

## How it works

1. The indicator accepts three float parameters: start (initial acceleration factor), increment (step increase per bar), and maximum (cap on acceleration).
2. On each bar, the built-in Sar algorithm is called with these parameters to compute the current SAR value.
3. The algorithm maintains internal state: the current acceleration factor, the extreme point (EP), and the trend direction (long/short).
4. The returned value is the SAR for the current bar, which is plotted as a blue cross marker on the chart.
5. The SAR calculation follows the standard Parabolic SAR logic: SAR = previous SAR + acceleration * (EP - previous SAR), with acceleration increasing up to the maximum.

## Mathematical model

The built-in Sar algorithm implements the standard Parabolic SAR:

$$
\text{SAR}_{t} = \text{SAR}_{t-1} + \text{AF} \times (\text{EP} - \text{SAR}_{t-1})
$$

where AF is the acceleration factor (starting at `start`, increased by `increment` each time a new EP is set, capped at `maximum`), and EP is the extreme point (highest high in uptrend, lowest low in downtrend).

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `start` | float | 0.02 |  |  |
| `increment` | float | 0.02 |  |  |
| `maximum` | float | 0.2 |  |  |

## Code walkthrough

### Decorators and parameters

Lines 6-10 of [Parabolic Stop And Reverse.indie5](Parabolic%20Stop%20And%20Reverse.indie5):

```python
@indicator('SAR', overlay_main_pane=True)  # Parabolic Stop And Reverse
@param.float('start', default=0.02)
@param.float('increment', default=0.02)
@param.float('maximum', default=0.2)
@plot.marker(style=plot.marker_style.CROSS, color=color.BLUE, title='ParabolicSAR')
```

The `@indicator` decorator registers the script as an overlay indicator on the main price pane. Three `@param.float` decorators define user-configurable settings: the initial acceleration factor (`start`), the step increase (`increment`), and the maximum acceleration (`maximum`). The `@plot.marker` decorator specifies that the output is drawn as a blue cross marker.

### Main function signature

Lines 11-11 of [Parabolic Stop And Reverse.indie5](Parabolic%20Stop%20And%20Reverse.indie5):

```python
def Main(self, start, increment, maximum):
```

The `Main` function receives the three parameters as float arguments. The function name is arbitrary but must match the decorator's target. The parameters are automatically exposed in the indicator settings panel.

### Returning the SAR value

Lines 12-12 of [Parabolic Stop And Reverse.indie5](Parabolic%20Stop%20And%20Reverse.indie5):

```python
    return Sar.new(start, increment, maximum)[0]
```

`Sar.new(start, increment, maximum)` creates a new instance of the Parabolic SAR algorithm with the given parameters. The `[0]` index retrieves the computed value for the current bar. This single value is returned and plotted as the marker.

## Reading the chart

- Blue cross markers appear on the chart at the SAR level for each bar.
- When the marker is **below** the price bar, the trend is considered **up** (long position).
- When the marker is **above** the price bar, the trend is considered **down** (short position).
- A flip of the marker from one side of price to the other signals a potential trend reversal.
- The distance between the marker and price tends to widen as the trend accelerates, then narrows near reversals.

## Implementation notes

- The `Sar.new` algorithm requires at least a few bars of data to initialize; early bars may return `NaN` until sufficient history is available.
- The acceleration factor is reset to `start` each time the SAR flips direction.
- The `maximum` parameter prevents the acceleration factor from growing indefinitely, keeping the SAR responsive but not overly sensitive.
- This indicator does not repaint because it uses only past and current bar data; the value for a given bar is fixed once the bar closes.

## FAQ

**What do the parameters start, increment, and maximum control?**

`start` is the initial acceleration factor (default 0.02). `increment` is added to the acceleration each time a new extreme point is reached (default 0.02). `maximum` caps the acceleration (default 0.2). Higher values make the SAR follow price more closely.

**How can I change the marker style or color?**

Modify the `@plot.marker` decorator: change `style` to another marker type (e.g., `plot.marker_style.DIAMOND`) and `color` to any supported color (e.g., `color.RED`).

**Does the SAR indicator repaint on historical bars?**

No. The Parabolic SAR is calculated using only data available up to the current bar. Once a bar closes, its SAR value is fixed and will not change.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sar


@indicator('SAR', overlay_main_pane=True)  # Parabolic Stop And Reverse
@param.float('start', default=0.02)
@param.float('increment', default=0.02)
@param.float('maximum', default=0.2)
@plot.marker(style=plot.marker_style.CROSS, color=color.BLUE, title='ParabolicSAR')
def Main(self, start, increment, maximum):
    return Sar.new(start, increment, maximum)[0]
```
