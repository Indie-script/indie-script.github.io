# Know Sure Thing (KST) - Built-in Indicator Guide

> Weighted sum of four smoothed rate-of-change (ROC) series forming the KST oscillator plus its SMA signal line.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#know-sure-thing) |
| **Source file** | [Know Sure Thing.indie5](Know%20Sure%20Thing.indie5) |

## Overview

Know Sure Thing (KST) is a momentum oscillator built from four rate-of-change (ROC) calculations, each smoothed by a simple moving average. The ROC lengths and smoothing lengths are exposed as user parameters, and the final KST value is a weighted sum of these four components with increasing weights (1, 2, 3, 4).

The indicator plots KST as a green line, its signal line (a short SMA of KST) as a red line, and a gray zero level. It is typically used to assess momentum strength and direction; crossings of the zero line or of the signal line are the usual reference points, although the script itself only draws lines and does not emit trading signals.

## How it works

1. A helper algorithm SmaRoc computes SMA(ROC(close, roc_len), sma_len) and returns a series.
2. In Main, four SmaRoc instances are created with the four ROC length parameters and four SMA length parameters.
3. Each instance contributes to the KST value with a fixed weight: 1, 2, 3, and 4 respectively.
4. Reading [0] from each series gets the value of the current bar, so the sum is evaluated bar by bar.
5. The signal line is computed as SMA(kst, sig_len) using MutSeriesF to feed the current KST value into the SMA algorithm.
6. Main returns the tuple (kst, sig), which is mapped by the @plot.line decorators to the green and red lines.

## Mathematical model

Let $R_i = \text{SMA}(\text{ROC}(\text{close}, r_i), s_i)$ for $i = 1\ldots4$.

$$
\text{KST} = R_1 + 2R_2 + 3R_3 + 4R_4
$$

$$
\text{Signal} = \text{SMA}(\text{KST}, \text{sig\_len})
$$

Default parameters: $r = (10, 15, 20, 30)$, $s = (10, 10, 10, 15)$, $\text{sig\_len} = 9$.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `roc_len1` | int | 10 | ≥ 1 | ROC Length #1 |
| `roc_len2` | int | 15 | ≥ 1 | ROC Length #2 |
| `roc_len3` | int | 20 | ≥ 1 | ROC Length #3 |
| `roc_len4` | int | 30 | ≥ 1 | ROC Length #4 |
| `sma_len1` | int | 10 | ≥ 1 | SMA Length #1 |
| `sma_len2` | int | 10 | ≥ 1 | SMA Length #2 |
| `sma_len3` | int | 10 | ≥ 1 | SMA Length #3 |
| `sma_len4` | int | 15 | ≥ 1 | SMA Length #4 |
| `sig_len` | int | 9 | ≥ 1 | Signal Line Length |

## Code walkthrough

### SmaRoc helper

Lines 6-8 of [Know Sure Thing.indie5](Know%20Sure%20Thing.indie5):

```python
@algorithm
def SmaRoc(self, roc_len: int, sma_len: int) -> SeriesF:
    return Sma.new(Roc.new(self.ctx.close, roc_len), sma_len)
```

This reusable algorithm combines a rate-of-change calculation with a smoothing moving average. Roc.new produces a series based on close price, and Sma.new returns a smoothed series of that ROC. This helper is called four times with different length parameters.

### Parameters and plotting setup

Lines 11-23 of [Know Sure Thing.indie5](Know%20Sure%20Thing.indie5):

```python
@indicator('KST', format=format.PRICE, precision=4)  # Know Sure Thing
@param.int('roc_len1', default=10, min=1, title='ROC Length #1')
@param.int('roc_len2', default=15, min=1, title='ROC Length #2')
@param.int('roc_len3', default=20, min=1, title='ROC Length #3')
@param.int('roc_len4', default=30, min=1, title='ROC Length #4')
@param.int('sma_len1', default=10, min=1, title='SMA Length #1')
@param.int('sma_len2', default=10, min=1, title='SMA Length #2')
@param.int('sma_len3', default=10, min=1, title='SMA Length #3')
@param.int('sma_len4', default=15, min=1, title='SMA Length #4')
@param.int('sig_len', default=9, min=1, title='Signal Line Length')
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.GREEN, title='KST')
@plot.line(color=color.RED, title='Signal')
```

The @indicator decorator sets the display name and format. @param.int adds user-configurable integer settings with default values and a minimum of 1. @level creates a zero reference line, and the two @plot.line decorators define the colors and titles for the KST and signal outputs.

### KST computation and return

Lines 24-29 of [Know Sure Thing.indie5](Know%20Sure%20Thing.indie5):

```python
def Main(self, roc_len1, roc_len2, roc_len3, roc_len4, sma_len1, sma_len2, sma_len3, sma_len4, sig_len):
    kst = 1 * SmaRoc.new(roc_len1, sma_len1)[0] + \
          2 * SmaRoc.new(roc_len2, sma_len2)[0] + \
          3 * SmaRoc.new(roc_len3, sma_len3)[0] + \
          4 * SmaRoc.new(roc_len4, sma_len4)[0]
    sig = Sma.new(MutSeriesF.new(kst), sig_len)[0]
```

Main instantiates four SmaRoc algorithms and multiplies each result by its fixed weight. The [0] accessor gives the current bar's value for each series. The signal line is a simple moving average of the KST series itself, computed by wrapping the current KST value in MutSeriesF. The returned tuple is drawn according to the plot decorators.

## Reading the chart

- The green line is the KST oscillator value; positive means upward momentum, negative means downward momentum.
- The red line is the signal line, a short SMA of the KST itself.
- The gray horizontal line is the zero level. When KST crosses above zero, momentum is considered positive; below zero, negative.
- KST crossing the signal line is often watched as a potential momentum change, but the code only plots lines and does not define trade actions.

## Implementation notes

- All component series are read only at the current bar via [0]; no future values are used in the calculation.
- MutSeriesF.new(kst) is used to feed the fluctuating KST value into the SMA algorithm for the signal line.
- Before enough history exists for the ROC and SMA windows, the series produce NaN values, so the plot is empty on the earliest bars; the script has no explicit NaN handling.
- The four weights are hard-coded as 1, 2, 3, 4; changing the ROC or SMA lengths does not change these weights.

## FAQ

**How do I make the KST more or less sensitive?**

Change roc_len1..4 and sma_len1..4. Shorter ROC lengths make the indicator react faster; longer lengths smooth it more. The signal length sig_len also affects how quickly the signal line responds.

**What does the signal line represent?**

The signal line is a simple moving average of the KST value itself, with the length set by sig_len (default 9). It is plotted as a red line.

**Does this script generate alerts or backtest trades?**

No. It only computes and plots the KST and signal lines. Any crossing logic must be added separately by the user.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import algorithm, MutSeriesF, SeriesF, indicator, format, param, level, color, plot
from indie.algorithms import Sma, Roc


@algorithm
def SmaRoc(self, roc_len: int, sma_len: int) -> SeriesF:
    return Sma.new(Roc.new(self.ctx.close, roc_len), sma_len)


@indicator('KST', format=format.PRICE, precision=4)  # Know Sure Thing
@param.int('roc_len1', default=10, min=1, title='ROC Length #1')
@param.int('roc_len2', default=15, min=1, title='ROC Length #2')
@param.int('roc_len3', default=20, min=1, title='ROC Length #3')
@param.int('roc_len4', default=30, min=1, title='ROC Length #4')
@param.int('sma_len1', default=10, min=1, title='SMA Length #1')
@param.int('sma_len2', default=10, min=1, title='SMA Length #2')
@param.int('sma_len3', default=10, min=1, title='SMA Length #3')
@param.int('sma_len4', default=15, min=1, title='SMA Length #4')
@param.int('sig_len', default=9, min=1, title='Signal Line Length')
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.GREEN, title='KST')
@plot.line(color=color.RED, title='Signal')
def Main(self, roc_len1, roc_len2, roc_len3, roc_len4, sma_len1, sma_len2, sma_len3, sma_len4, sig_len):
    kst = 1 * SmaRoc.new(roc_len1, sma_len1)[0] + \
          2 * SmaRoc.new(roc_len2, sma_len2)[0] + \
          3 * SmaRoc.new(roc_len3, sma_len3)[0] + \
          4 * SmaRoc.new(roc_len4, sma_len4)[0]
    sig = Sma.new(MutSeriesF.new(kst), sig_len)[0]
    return kst, sig
```
