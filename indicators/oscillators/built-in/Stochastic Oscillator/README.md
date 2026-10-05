# Stochastic Oscillator (Stoch) - Built-in Indicator Guide

> Computes smoothed stochastic oscillator lines %K and %D from price data using Stoch and Sma algorithms.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#stochastic-oscillator) |
| **Source file** | [Stochastic Oscillator.indie5](Stochastic%20Oscillator.indie5) |

## Overview

The Stochastic Oscillator measures the relative position of the close price within the high-low range over a specified lookback period. It is commonly used to identify potential overbought or oversold conditions in a market. The indicator produces two smoothed lines: a fast line (%K) and a slower line (%D), which help traders gauge momentum and possible reversals.

On the chart, the %K line is drawn in blue and the %D line in red. A background band from 20 to 80 (aqua fill with gray border) highlights the typical oscillation range, and a gray horizontal line at 50 marks the midpoint. The band and level are purely visual references and do not affect the computation.

## How it works

1. User configures k_length, k_smoothing, and d_smoothing via the indicator settings.
2. For each bar, the Stoch algorithm computes a raw oscillator value using close, low, high, and the lookback length k_length.
3. The raw value is smoothed with a simple moving average of length k_smoothing to produce the %K line.
4. The %K series is smoothed again with a simple moving average of length d_smoothing to produce the %D line.
5. The current %K and %D values are returned and plotted as blue and red lines respectively.
6. The background band (20–80) and middle level (50) are drawn as reference.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `k_length` | int | 14 | ≥ 1 | Fast K stochastic length |
| `k_smoothing` | int | 1 | ≥ 1 | Fast K stochastic smoothing |
| `d_smoothing` | int | 3 | ≥ 1 | Slow D stochastic smoothing |

## Code walkthrough

### Decorators and Parameters

Lines 6-13 of [Stochastic Oscillator.indie5](Stochastic%20Oscillator.indie5):

```python
@indicator('Stoch', format=format.PRICE)  # Stochastic
@param.int('k_length', default=14, min=1, title='Fast K stochastic length')
@param.int('k_smoothing', default=1, min=1, title='Fast K stochastic smoothing')
@param.int('d_smoothing', default=3, min=1, title='Slow D stochastic smoothing')
@band(20, 80, fill_color=color.AQUA(0.1), line_color=color.GRAY, title='Background')
@level(50, line_color=color.GRAY(0.5), title='Middle Band')
@plot.line(color=color.BLUE, title='%K')
@plot.line(color=color.RED, title='%D')
```

The @indicator decorator sets the display name to 'Stoch' and the format to PRICE. @param.int decorators define three user-configurable integer parameters with defaults and titles. @band, @level, and @plot.line decorators specify the visual elements: a background band between 20 and 80, a middle line at 50, and two plot lines for %K (blue) and %D (red).

### Computing %K

Lines 14-15 of [Stochastic Oscillator.indie5](Stochastic%20Oscillator.indie5):

```python
def Main(self, k_length, k_smoothing, d_smoothing):
    k = Sma.new(Stoch.new(self.close, self.low, self.high, k_length), k_smoothing)
```

The Main function receives the parameters. It first computes a raw stochastic series using Stoch.new, which takes the current bar's close, low, high, and the k_length lookback. This series is then smoothed with a simple moving average (Sma.new) using k_smoothing to produce the %K line.

### Computing %D and Returning Values

Lines 16-17 of [Stochastic Oscillator.indie5](Stochastic%20Oscillator.indie5):

```python
    d = Sma.new(k, d_smoothing)
    return k[0], d[0]
```

The %D line is obtained by smoothing the %K series with another simple moving average of length d_smoothing. This makes %D a slower, more smoothed version of %K. The function returns the current values k[0] and d[0] for the two plot lines.

## Reading the chart

- The blue line (%K) represents the fast stochastic oscillator value.
- The red line (%D) represents the slow stochastic oscillator value, smoothed from %K.
- The background band (20 to 80) highlights the typical range; values above 80 may indicate overbought, below 20 oversold.
- The middle line at 50 serves as a reference center.
- When %K crosses above %D, it may signal upward momentum; when below, downward.

## Implementation notes

- The Stoch algorithm uses close, low, high, and a lookback length; its internal calculation is not exposed in this code.
- Smoothing is performed using simple moving averages (Sma), which average the last N values.
- The indicator returns only the current bar's values via [0]; previous values are used for smoothing internally.
- Parameters k_smoothing and d_smoothing must be at least 1.

## FAQ

**How do I adjust the sensitivity of the stochastic oscillator?**

Increase k_length to consider more bars for the raw stochastic, or increase k_smoothing to smooth %K more. d_smoothing controls the smoothness of %D relative to %K.

**What do the %K and %D lines represent?**

%K is the fast stochastic line computed from price data; %D is a further smoothed version of %K, acting as a slower moving average.

**Can I change the colors of the lines?**

Yes, modify the color parameters in the @plot.line decorators for %K and %D.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, band, color, level, plot
from indie.algorithms import Sma, Stoch


@indicator('Stoch', format=format.PRICE)  # Stochastic
@param.int('k_length', default=14, min=1, title='Fast K stochastic length')
@param.int('k_smoothing', default=1, min=1, title='Fast K stochastic smoothing')
@param.int('d_smoothing', default=3, min=1, title='Slow D stochastic smoothing')
@band(20, 80, fill_color=color.AQUA(0.1), line_color=color.GRAY, title='Background')
@level(50, line_color=color.GRAY(0.5), title='Middle Band')
@plot.line(color=color.BLUE, title='%K')
@plot.line(color=color.RED, title='%D')
def Main(self, k_length, k_smoothing, d_smoothing):
    k = Sma.new(Stoch.new(self.close, self.low, self.high, k_length), k_smoothing)
    d = Sma.new(k, d_smoothing)
    return k[0], d[0]
```
