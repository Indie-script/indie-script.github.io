# Elders Force Index (EFI) - Built-in Indicator Guide

> Oscillator combining price change and volume to measure buying or selling pressure.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#elders-force-index) |
| **Source file** | [Elders Force Index.indie5](Elders%20Force%20Index.indie5) |

## Overview

Elder's Force Index measures the power behind price moves by multiplying the price change by volume. It helps traders confirm trends and spot divergences. The indicator is typically used with a moving average (here a 13-period EMA) to smooth erratic readings.

On the chart, the indicator is plotted as a line oscillating around a zero level. Positive values indicate strong buying pressure, negative values indicate selling pressure.

## How it works

1. Each bar computes the price change as close[0] - close[1] using Change.new.
2. The raw Force Index is price change multiplied by volume of the current bar.
3. A user-defined length defaults to 13, which is the period of the EMA smoothing applied next.
4. The raw series is fed into an Exponential Moving Average (Ema) of the chosen length.
5. The final EMA value is returned and plotted as a single line on the chart.

## Mathematical model

$$
\text{ForceIndex}_t = (\text{close}_t - \text{close}_{t-1}) \times \text{volume}_t
$$

$$
\text{EFI}_t = \text{EMA}(\text{ForceIndex}, \, n)_t
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 13 | ≥ 1 |  |

## Code walkthrough

### Parameter and indicator definition

Lines 6-9 of [Elders Force Index.indie5](Elders%20Force%20Index.indie5):

```python
@indicator('EFI', format=format.VOLUME)  # Elders Force Index
@param.int('length', default=13, min=1)
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.RED, title='Elders Force Index')
```

Line 6 declares the indicator with short name 'EFI' and a VOLUME format (used for scaling). Line 7 defines an integer parameter 'length' with default 13 and minimum 1. Line 8 adds a zero line in gray for reference. Line 9 sets the plot style to a red line.

### Core calculation and smoothing

Lines 10-12 of [Elders Force Index.indie5](Elders%20Force%20Index.indie5):

```python
def Main(self, length):
    efi = Change.new(self.close)[0] * self.volume[0]
    return Ema.new(MutSeriesF.new(efi), length)[0]
```

Inside Main, line 11 computes the raw Force Index: Change.new(self.close)[0] gives the price change between the current and previous bar, multiplied by self.volume[0]. Line 12 packages this raw value into a MutSeriesF (mutable series) and feeds it into an EMA of the given length. The EMA result is returned for plotting.

## Reading the chart

- The indicator is plotted as a **red line** oscillating above and below a **gray zero line**.
- Values **above zero** indicate that price moved up with volume (buying pressure).
- Values **below zero** indicate that price moved down with volume (selling pressure).
- Crossings of the zero line can signal changes in momentum.
- Divergences between price and the Force Index may warn of trend weakness.

## Implementation notes

- The indicator repaints on every bar because it uses [0] for the current bar's close and volume.
- Volume format is used only for display scaling; the actual values are price×volume.
- The EMA smoothing reduces noise; shorter lengths produce more sensitive readings.
- If price does not change (close[0] == close[1]), the raw Force Index is zero.

## FAQ

**What does the length parameter control?**

Length is the period of the Exponential Moving Average applied to the raw Force Index. A default of 13 balances sensitivity and smoothness.

**Can I use a different smoothing method?**

The code currently uses EMA. You can modify line 12 to replace Ema with another moving average algorithm from indie.algorithms.

**Why does the indicator show negative values?**

Negative values occur when the current close is lower than the previous close, multiplied by volume. They indicate selling pressure.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, level, color, plot, MutSeriesF
from indie.algorithms import Change, Ema


@indicator('EFI', format=format.VOLUME)  # Elders Force Index
@param.int('length', default=13, min=1)
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.RED, title='Elders Force Index')
def Main(self, length):
    efi = Change.new(self.close)[0] * self.volume[0]
    return Ema.new(MutSeriesF.new(efi), length)[0]
```
