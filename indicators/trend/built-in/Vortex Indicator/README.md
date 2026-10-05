# Vortex Indicator (VI) - Built-in Indicator Guide

> Computes two lines (VI+ and VI-) measuring positive and negative trend movements.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#vortex-indicator) |
| **Source file** | [Vortex Indicator.indie5](Vortex%20Indicator.indie5) |

## Overview

The Vortex Indicator assesses trend strength and direction by comparing the range of price movement over a defined period. It produces two oscillating lines: VI+ (blue) that captures upward trend momentum and VI- (red) that captures downward trend momentum. When VI+ crosses above VI-, an uptrend is indicated; the reverse signals a downtrend. Values near 1 denote a strong trend in the respective direction.

The indicator is typically used to identify trend reversals and confirm price action. It works best in trending markets and can generate false signals in choppy, range-bound conditions.

## How it works

1. Compute VM- as the sum of the absolute difference between the current low and the previous high over `length` bars.
2. Compute VM+ as the sum of the absolute difference between the current high and the previous low over `length` bars.
3. Compute the sum of the True Range (ATR with period 1) over the same `length` bars.
4. Divide VM- by the ATR sum to obtain VI- (negative direction indicator).
5. Divide VM+ by the ATR sum to obtain VI+ (positive direction indicator).
6. Return the two values as separate series, drawn as red and blue lines respectively.

## Mathematical model

$$
VM_{-} = \sum_{i=0}^{length-1} |low_{i} - high_{i+1}|
$$

$$
VM_{+} = \sum_{i=0}^{length-1} |high_{i} - low_{i+1}|
$$

$$
ATR = \sum_{i=0}^{length-1} TR_{i}, \quad TR_{i} = \max(high_{i}-low_{i},\; |high_{i}-close_{i+1}|,\; |low_{i}-close_{i+1}|)
$$

$$
VI_{-} = \frac{VM_{-}}{ATR},\quad VI_{+} = \frac{VM_{+}}{ATR}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 2 |  |

## Code walkthrough

### Indicator Decorators and Parameters

Lines 7-11 of [Vortex Indicator.indie5](Vortex%20Indicator.indie5):

```python
@indicator('VI', format=format.PRICE, precision=4)  # Vortex Indicator
@param.int('length', default=14, min=2)
@plot.line(color=color.RED, title='VI -')
@plot.line(color=color.BLUE, title='VI +')
def Main(self, length):
```

The `@indicator` decorator names the script 'VI' and sets display precision to 4 decimal places. The `@param.int` defines a user‑adjustable `length` (default 14, minimum 2). Two `@plot.line` decorators assign colors (red for VI–, blue for VI+) and titles for the chart legend.

### Computing VM+ and VM− Using Rolling Sums

Lines 12-13 of [Vortex Indicator.indie5](Vortex%20Indicator.indie5):

```python
    vmm = Sum.new(MutSeriesF.new(abs(self.low[0] - self.high[1])), length)[0]
    vmp = Sum.new(MutSeriesF.new(abs(self.high[0] - self.low[1])), length)[0]
```

Each line creates a `MutSeriesF` to hold the per‑bar absolute difference (`abs(self.low[0] - self.high[1])` for VM−, `abs(self.high[0] - self.low[1])` for VM+). This series is fed into `Sum.new(…, length)[0]`, which returns a trailing sum over the last `length` bars. The `[0]` index fetches the current bar's sum value.

### Normalizing with ATR

Lines 14-17 of [Vortex Indicator.indie5](Vortex%20Indicator.indie5):

```python
    satr = Sum.new(Atr.new(1), length)[0]
    vim = divide(vmm, satr)
    vip = divide(vmp, satr)
    return vim, vip
```

A separate sum of the True Range (`Atr.new(1)`) over the same window provides the denominator. The `divide` function safely calculates VI− = VM− / ATR and VI+ = VM+ / ATR, handling division‑by‑zero. The `return` statement packs both values into a tuple as required by the `@plot.line` decorators.

## Reading the chart

- **Red line (VI−)**: measures downward trend strength. Values above the blue line suggest a bearish trend.
- **Blue line (VI+)**: measures upward trend strength. Values above the red line suggest a bullish trend.
- **Crossovers**: when VI+ crosses above VI− it may signal the start of an uptrend; when VI− crosses above VI+ it may signal a downtrend.
- **Magnitude**: values near 1.0 indicate a strong trend in the corresponding direction; values near 0.3–0.5 suggest weak or absent trend.

## Implementation notes

- The indicator uses one bar of look‑back for the high/low differences because it references `high[1]` and `low[1]` (previous bar), so the first bar of data will produce NaN.
- `Sum.new` implements a rolling sum (not an exponential average), matching the classic Vortex definition.
- The `divide` function returns `math.nan` when the denominator is zero, preventing division‑by‑zero errors.
- `Atr.new(1)` computes the True Range (TR) without the usual Wilder smoothing—smoothing is achieved by the subsequent sum over `length` bars.

## FAQ

**What is the recommended `length` for daily charts?**

The default of 14 is widely used and matches the original Vortex publication. Shorter lengths (e.g., 7) make the indicator more sensitive to price movements, while longer lengths (e.g., 21) smooth out noise.

**Can I change the colors of the VI lines?**

Yes. Modify the `color` parameters in the `@plot.line` decorators (lines 9 and 10). Replace `color.RED` or `color.BLUE` with any available color constant or hex string.

**Why does the indicator show NaN on the first few bars?**

The rolling sum requires `length` values before it can produce a valid result. Additionally, the indicator references the previous bar's high/low, so the very first bar cannot compute a difference. Both factors lead to initial NaN values.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color, MutSeriesF
from indie.algorithms import Sum, Atr
from indie.math import divide


@indicator('VI', format=format.PRICE, precision=4)  # Vortex Indicator
@param.int('length', default=14, min=2)
@plot.line(color=color.RED, title='VI -')
@plot.line(color=color.BLUE, title='VI +')
def Main(self, length):
    vmm = Sum.new(MutSeriesF.new(abs(self.low[0] - self.high[1])), length)[0]
    vmp = Sum.new(MutSeriesF.new(abs(self.high[0] - self.low[1])), length)[0]
    satr = Sum.new(Atr.new(1), length)[0]
    vim = divide(vmm, satr)
    vip = divide(vmp, satr)
    return vim, vip
```
