# Bollinger Bands %B (BB %B) - Built-in Indicator Guide

> Measures the relative position of the source within Bollinger Bands as a normalized oscillator between 0 and 1.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#bollinger-bands-%25b) |
| **Source file** | [Bollinger Bands %B.indie5](Bollinger%20Bands%20%B.indie5) |

## Overview

Bollinger Bands %B (BB %B) quantifies where the current source value lies relative to the lower and upper Bollinger Bands. A value of 0 means the source equals the lower band, 1 means it equals the upper band, below 0 lies below the lower band, and above 1 lies above the upper band.

The indicator is drawn as a single oscillating line, with a shaded background region from 0 to 1 and a horizontal reference line at 0.5. It is commonly used for mean-reversion setups or to identify overextended price moves.

## How it works

1. User configures source, Bollinger Bands length (default 20), and standard deviation multiplier (default 2.0).
2. On each bar, the Bollinger Bands algorithm (Bb.new) computes the lower, middle, and upper bands from the given source series.
3. The current bar values of the source, lower band, and upper band are extracted using [0] indexing.
4. The lower band value is subtracted from the source to obtain the numerator.
5. The lower band is subtracted from the upper band to obtain the denominator (bandwidth).
6. The numerator is divided by the denominator to yield the %B oscillator value, which is returned for plotting.

## Mathematical model

$$
%B = \frac{\text{src}[0] - \text{lower}[0]}{\text{upper}[0] - \text{lower}[0]}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 20 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |
| `mult` | float | 2.0 | 0.001 - 50.0 | StdDev |

## Code walkthrough

### Parameter decorators

Lines 8-10 of [Bollinger Bands %B.indie5](Bollinger%20Bands%20%B.indie5):

```python
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult', default=2.0, min=0.001, max=50.0, title='StdDev')
```

Lines 8-10 declare the user-configurable parameters: the Bollinger Bands length (integer, minimum 1), the source series (default close), and the standard deviation multiplier (float, clamped between 0.001 and 50). These decorators automatically generate the settings panel in the UI.

### Visual decorators – band, level, and line

Lines 11-13 of [Bollinger Bands %B.indie5](Bollinger%20Bands%20%B.indie5):

```python
@band(0, 1, line_color=color.GRAY, fill_color=color.AQUA(0.1), title='Background')
@level(0.5, line_color=color.GRAY, title='Middle Band')
@plot.line(color=color.AQUA, title='Bollinger Bands %B')
```

Line 11 adds a background band from 0 to 1 with light aqua fill, helping the user see the normal oscillation range. Line 12 adds a horizontal level at 0.5 as a center reference. Line 13 plots the %B line itself in aqua. All colors and styling are defined by the decorators.

### Bollinger Bands calculation

Lines 15-15 of [Bollinger Bands %B.indie5](Bollinger%20Bands%20%B.indie5):

```python
    (lower, _, upper) = Bb.new(src, length, mult)
```

Bb.new is the platform's built‑in Bollinger Bands algorithm. It returns a tuple (lower, middle, upper). Only lower and upper are used here; the middle band is discarded via the underscore. The current bar values are accessed with index [0].

### Returning the %B value

Lines 16-16 of [Bollinger Bands %B.indie5](Bollinger%20Bands%20%B.indie5):

```python
    return divide(src[0] - lower[0], upper[0] - lower[0])
```

The final line computes the %B formula using the platform's divide function (which safely handles division by zero, returning NaN). The result is the oscillator value plotted on the chart. Using divide instead of / is a defensive practice to avoid runtime errors when the bandwidth is zero.

## Reading the chart

- The main plot (aqua line) oscillates with no explicit bounds, but typically stays between 0 and 1 when price is within the bands.
- Values below 0 indicate price is below the lower Bollinger Band; values above 1 indicate price is above the upper band.
- The shaded region (0 to 1) and the horizontal line at 0.5 provide visual reference for normal oscillation ranges.
- Extreme readings (e.g., below 0 or above 1) are interpreted as momentum or breakout signals, depending on strategy.

## Implementation notes

- The indicator uses the current bar’s values only (src[0], lower[0], upper[0]); it does not reference past bars for its own plot, so it does not repaint.
- If the upper and lower bands are equal (bandwidth = 0), the divide function returns NaN, causing a gap in the plotted line.
- The 'format=format.PRICE' decorator on the indicator is a misnomer here since the output is not a price, but it still works; the plot format is determined by the plot decorator (default line).

## FAQ

**What does a %B value above 1 mean?**

It means the source (e.g., close price) is trading above the upper Bollinger Band, indicating a strong upward move relative to recent volatility.

**Can I change the source from close to open or high?**

Yes, the 'Source' parameter in the settings allows selecting any price or custom series. The indicator will compute %B based on that source.

**What is the default length and multiplier for the Bollinger Bands?**

The default length is 20 periods and the multiplier for standard deviations is 2.0, which are standard for Bollinger Bands.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, source, band, color, level, plot
from indie.algorithms import Bb
from indie.math import divide


@indicator('BB %B', format=format.PRICE)  # Bollinger Bands %B
@param.int('length', default=20, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.float('mult', default=2.0, min=0.001, max=50.0, title='StdDev')
@band(0, 1, line_color=color.GRAY, fill_color=color.AQUA(0.1), title='Background')
@level(0.5, line_color=color.GRAY, title='Middle Band')
@plot.line(color=color.AQUA, title='Bollinger Bands %B')
def Main(self, length, src, mult):
    (lower, _, upper) = Bb.new(src, length, mult)
    return divide(src[0] - lower[0], upper[0] - lower[0])
```
