# Bollinger Bands (BB) - Built-in Indicator Guide

> Bollinger Bands plot a moving average with upper/lower bands at k standard deviations.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#bollinger-bands) |
| **Source file** | [Bollinger Bands.indie5](Bollinger%20Bands.indie5) |

## Overview

Bollinger Bands consist of a middle band (an n-period simple moving average) and two outer bands placed at a user-specified number of standard deviations above and below the middle band. They measure volatility and are commonly used to identify overbought or oversold conditions, as well as periods of contraction (squeeze).

The indicator draws three lines: the middle (basis), upper, and lower bands. A translucent fill between the upper and lower bands provides a visual envelope around price action.

## How it works

1. The user configures the period (20), source (close), multiplier (2.0), and horizontal offset.
2. Each bar computes the simple moving average of the chosen source over the last `length` bars as the basis.
3. It calculates the population standard deviation of the source over the same window.
4. The upper band equals the basis plus `mult` times the standard deviation.
5. The lower band equals the basis minus `mult` times the standard deviation.
6. All three values plus the fill are returned with an optional horizontal offset (shifted left/right on the chart).
7. The bands are drawn on the main price pane, overlaid with the price series.

## Mathematical model

$$
\text{Basis}_{t} = \frac{1}{n} \sum_{i=0}^{n-1} \text{src}_{t-i}
$$

$$
\sigma_t = \sqrt{\frac{1}{n} \sum_{i=0}^{n-1} (\text{src}_{t-i} - \text{Basis}_t)^2}
$$

$$
\text{Upper}_{t} = \text{Basis}_t + k \cdot \sigma_t
$$

$$
\text{Lower}_{t} = \text{Basis}_t - k \cdot \sigma_t
$$

where $n$ is `length`, $k$ is `mult`, and $\text{src}$ is the price source.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 20 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `mult` | float | 2.0 | 0.001 - 50.0 | StdDev |
| `offset` | int | 0 | -500 - 500 |  |

## Code walkthrough

### Indicator and parameter decorators

Lines 6-10 of [Bollinger Bands.indie5](Bollinger%20Bands.indie5):

```python
@indicator('BB', overlay_main_pane=True)  # Bollinger Bands
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult', default=2.0, min=0.001, max=50.0, title='StdDev')
@param.int('offset', default=0, min=-500, max=500)
```

The `@indicator` decorator sets the name to 'BB' and draws in the main price pane. The next four decorators define user-configurable parameters: `length` (period), `src` (price source, default close), `mult` (standard deviation multiplier), and `offset` (bars to shift the bands). The `min`/`max` constraints prevent invalid inputs.

### Plot configuration for lines and fill

Lines 11-14 of [Bollinger Bands.indie5](Bollinger%20Bands.indie5):

```python
@plot.line('lower', color=color.BLUE, title='Lower')
@plot.line(color=color.RED, title='Basis')
@plot.line('upper', color=color.BLUE, title='Upper')
@plot.fill('lower', 'upper', color=color.AQUA(0.05), title='Background')
```

Three `@plot.line` decorators define the coloring and IDs for the lower band (blue), basis (red), and upper band (blue). The `@plot.fill` decorator connects the lower and upper band IDs and uses a semi-transparent aqua color (alpha 0.05) to shade the area between them.

### Call to the built-in Bb algorithm

Lines 15-16 of [Bollinger Bands.indie5](Bollinger%20Bands.indie5):

```python
def Main(self, length, src, mult, offset):
    (lower, middle, upper) = Bb.new(src, length, mult)
```

The `Main` function receives the user parameters. It calls `Bb.new(src, length, mult)`, a built-in algorithm that computes the three band series (lower, middle, upper) as series objects. This hides the manual SMA and standard deviation calculations.

### Returning plot values with offset

Lines 17-22 of [Bollinger Bands.indie5](Bollinger%20Bands.indie5):

```python
    return (
        plot.Line(lower[0], offset=offset),
        plot.Line(middle[0], offset=offset),
        plot.Line(upper[0], offset=offset),
        plot.Fill(offset=offset),
    )
```

Each band is accessed with `[0]` to get the current bar's value and wrapped in `plot.Line()`. The optional `offset` parameter shifts all bands horizontally (positive numbers shift left, negative shift right). The `plot.Fill` is also returned with the same offset to keep it aligned.

## Reading the chart

- **Upper band (blue)** – basis + `mult` standard deviations. Price touching or crossing above may indicate overbought conditions.
- **Basis (red)** – simple moving average of the chosen source.
- **Lower band (blue)** – basis − `mult` standard deviations. Price touching or crossing below may indicate oversold conditions.
- **Fill (aqua tint)** – shaded region between the upper and lower bands, making the envelope visually distinct.
- **Offset** – all three lines and the fill shift identically; a positive offset shifts bands to the left (looking back).

## Implementation notes

- The `Bb.new` algorithm uses population standard deviation (divided by `n`, not `n-1`).
- Accessing `lower[0]`, `middle[0]`, `upper[0]` fetches the current bar's values; `[1]` would give the previous bar.
- An offset shifts the drawn bands horizontally without recalculating them; values for bars before the offset exist are drawn from available data.

## FAQ

**What does the `offset` parameter do?**

It shifts the plotted lines horizontally by a given number of bars. A positive offset moves the bands to the left (they appear earlier than the current bar), while a negative offset shifts them to the right.

**Can I use a source other than close?**

Yes. The `src` parameter accepts any price series (open, high, low, close, hl2, hlc3, ohlc4, etc.). The bands will be computed on that source's values.

**Does this indicator repaint?**

No. Bollinger Bands are calculated using only past data (the SMA and standard deviation over the last `length` bars). They do not change retrospectively on subsequent bars.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Bb


@indicator('BB', overlay_main_pane=True)  # Bollinger Bands
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult', default=2.0, min=0.001, max=50.0, title='StdDev')
@param.int('offset', default=0, min=-500, max=500)
@plot.line('lower', color=color.BLUE, title='Lower')
@plot.line(color=color.RED, title='Basis')
@plot.line('upper', color=color.BLUE, title='Upper')
@plot.fill('lower', 'upper', color=color.AQUA(0.05), title='Background')
def Main(self, length, src, mult, offset):
    (lower, middle, upper) = Bb.new(src, length, mult)
    return (
        plot.Line(lower[0], offset=offset),
        plot.Line(middle[0], offset=offset),
        plot.Line(upper[0], offset=offset),
        plot.Fill(offset=offset),
    )
```
