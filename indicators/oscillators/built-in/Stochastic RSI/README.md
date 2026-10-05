# Stochastic RSI (Stoch RSI) - Built-in Indicator Guide

> Computes Stochastic RSI: RSI of the source, converted to a stochastic oscillator, with smoothed K and D lines.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#stochastic-rsi) |
| **Source file** | [Stochastic RSI.indie5](Stochastic%20RSI.indie5) |

## Overview

Stochastic RSI applies the stochastic formula to RSI values instead of price. It measures where the current RSI level sits inside its own recent high-low range over the chosen stochastic length, then smooths the result to produce K and D lines.

The chart shows a blue K line and a red D line. A light background band marks the 20 and 80 levels, and a gray line marks the 50 level. These visual guides help read the oscillator in the context of its extremes.

## How it works

1. Compute the RSI series from the selected source with `rsi_length`.
2. Pass the same RSI series as high, low, and close inputs to `Stoch.new` to build the stochastic of RSI over `k_length` bars.
3. Apply a simple moving average with period `k_smoothing` to the stochastic value to produce the fast K line.
4. Apply a simple moving average with period `d_smoothing` to the K series to produce the slow D line.
5. Return `k[0]` and `d[0]` so the current bar values are plotted by the two `@plot.line` decorators.
6. The 20/80 band and 50 middle level are drawn from the `@band` and `@level` decorators.

## Mathematical model

$$
\text{RSI}_t = \text{Rsi}(\text{src}, \text{rsi\_length})_t
$$

$$
S_t = 100 \cdot \frac{\text{RSI}_t - \min_{i=0}^{k\_length-1} \text{RSI}_{t-i}}{\max_{i=0}^{k\_length-1} \text{RSI}_{t-i} - \min_{i=0}^{k\_length-1} \text{RSI}_{t-i}}
$$

$$
K_t = \text{SMA}(S, k\_smoothing)_t
$$

$$
D_t = \text{SMA}(K, d\_smoothing)_t
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `k_smoothing` | int | 3 | ≥ 1 | Fast K stochastic smoothing |
| `d_smoothing` | int | 3 | ≥ 1 | Slow D stochastic smoothing |
| `rsi_length` | int | 14 | ≥ 1 | RSI length |
| `k_length` | int | 14 | ≥ 1 | Stochastic Length |
| `src` | source | source.CLOSE |  | Source |

## Code walkthrough

### Indicator metadata and UI inputs

Lines 6-11 of [Stochastic RSI.indie5](Stochastic%20RSI.indie5):

```python
@indicator('Stoch RSI', format=format.PRICE)  # Stochastic RSI
@param.int('k_smoothing', default=3, min=1, title='Fast K stochastic smoothing')
@param.int('d_smoothing', default=3, min=1, title='Slow D stochastic smoothing')
@param.int('rsi_length', default=14, min=1, title='RSI length')
@param.int('k_length', default=14, min=1, title='Stochastic Length')
@param.source('src', default=source.CLOSE, title='Source')
```

The decorators define everything the chart needs to render the indicator and expose settings. `@param.int` and `@param.source` create configuration controls.

### Computing RSI and the stochastic value

Lines 16-18 of [Stochastic RSI.indie5](Stochastic%20RSI.indie5):

```python
def Main(self, k_smoothing, d_smoothing, rsi_length, k_length, src):
    rsi = Rsi.new(src, rsi_length)
    k = Sma.new(Stoch.new(rsi, rsi, rsi, k_length), k_smoothing)
```

Inside `Main`, `Rsi.new` returns a series based on the selected source. That series is then passed to `Stoch.new` as high, low, and close, so the stochastic is calculated entirely from RSI values. The result is smoothed with `Sma.new` to form the fast K series.

### Smoothing D and returning plotted values

Lines 19-20 of [Stochastic RSI.indie5](Stochastic%20RSI.indie5):

```python
    d = Sma.new(k, d_smoothing)
    return k[0], d[0]
```

The D line is a second simple moving average applied to the K series. The return tuple `(k[0], d[0])` supplies the current bar values for the two plot lines, in the same order as the `@plot.line` decorators: K is blue and D is red.

## Reading the chart

- The blue K line is the smoothed stochastic of RSI; the red D line is the smoothed version of K.
- Values above 80 or below 20 are plotted outside the shaded band region, indicating oscillator extremes relative to the configured band.
- The 50 gray line separates the upper and lower halves of the oscillator range.
- Because K is smoothed once and D is smoothed twice, D generally reacts more slowly than K.

## Implementation notes

- The `Stoch.new` call receives the same `rsi` series for its high, low, and close parameters, so the stochastic range is based on RSI levels, not on price.
- All computed objects are stateful series. `k[0]` and `d[0]` are the current bar values; previous-bar values would be accessed with `k[1]` and `d[1]`.
- Every `@param.int` field has a minimum of 1, so the generated settings UI will not accept zero or negative periods.
- The return tuple order matches the two `@plot.line` decorators: first value is blue K, second is red D.

## FAQ

**What do `k_smoothing` and `d_smoothing` control?**

`k_smoothing` is the period of the SMA applied to the stochastic of RSI to produce the K line. `d_smoothing` is the period of the SMA applied to K to produce the D line.

**Can I change the input source?**

Yes, the `src` parameter defaults to `source.CLOSE` and is exposed through `@param.source`, so you can select another supported source in the indicator settings.

**What do the horizontal levels on the chart mean?**

The 20 and 80 values draw the background band defined by `@band`, and the 50 line is a middle level defined by `@level`. They are guides for reading the oscillator's position and extremes.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, source, band, color, level, plot
from indie.algorithms import Rsi, Stoch, Sma


@indicator('Stoch RSI', format=format.PRICE)  # Stochastic RSI
@param.int('k_smoothing', default=3, min=1, title='Fast K stochastic smoothing')
@param.int('d_smoothing', default=3, min=1, title='Slow D stochastic smoothing')
@param.int('rsi_length', default=14, min=1, title='RSI length')
@param.int('k_length', default=14, min=1, title='Stochastic Length')
@param.source('src', default=source.CLOSE, title='Source')
@band(20, 80, fill_color=color.AQUA(0.1), line_color=color.GRAY, title='Background')
@level(50, line_color=color.GRAY(0.5), title='Middle Band')
@plot.line(color=color.BLUE, title='K')
@plot.line(color=color.RED, title='D')
def Main(self, k_smoothing, d_smoothing, rsi_length, k_length, src):
    rsi = Rsi.new(src, rsi_length)
    k = Sma.new(Stoch.new(rsi, rsi, rsi, k_length), k_smoothing)
    d = Sma.new(k, d_smoothing)
    return k[0], d[0]
```
