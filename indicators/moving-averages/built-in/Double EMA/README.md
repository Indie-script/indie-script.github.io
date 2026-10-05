# Double EMA (DEMA) - Built-in Indicator Guide

> Computes the Double Exponential Moving Average (DEMA) of a given source over a specified length.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#double-ema) |
| **Source file** | [Double EMA.indie5](Double%20EMA.indie5) |

## Overview

The Double Exponential Moving Average (DEMA) is a smoothed moving average that reduces lag compared to a simple EMA. It applies an EMA twice and combines the results to produce a faster-reacting line. DEMA is commonly used to identify trend direction and potential reversals with less delay than standard moving averages.

On the chart, a single green line is plotted. It follows price closely but with reduced lag, making it useful for traders who want a responsive trend-following indicator without excessive noise.

## How it works

1. Calculate the first EMA of the source series with the given length.
2. Calculate a second EMA of the first EMA series using the same length.
3. Compute DEMA as 2 times the first EMA minus the second EMA.
4. Plot the resulting value as a green line on the main chart pane.

## Mathematical model

$$
\text{EMA}_1 = \text{EMA}(\text{src}, \text{length})
$$

$$
\text{EMA}_2 = \text{EMA}(\text{EMA}_1, \text{length})
$$

$$
\text{DEMA} = 2 \times \text{EMA}_1 - \text{EMA}_2
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 9 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |

## Code walkthrough

### Indicator decorators and parameters

Lines 6-8 of [Double EMA.indie5](Double%20EMA.indie5):

```python
@indicator('DEMA', overlay_main_pane=True)  # Double EMA
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
```

The @indicator decorator sets the display name to 'DEMA' and places the plot in the main chart pane (overlay). Two parameters are defined: an integer 'length' (default 9, minimum 1) and a source 'src' (defaults to CLOSE). The @plot.line decorator specifies the line color as green.

### Main function and DEMA computation

Lines 10-13 of [Double EMA.indie5](Double%20EMA.indie5):

```python
def Main(self, length, src):
    ema1 = Ema.new(src, length)
    ema2 = Ema.new(ema1, length)
    return 2 * ema1[0] - ema2[0]
```

Inside Main, two EMA series are created using Ema.new: first on the source, then on the first EMA. The current values are accessed with [0]. The DEMA value is computed as 2 * ema1[0] - ema2[0] and returned, which is automatically plotted as the green line.

## Reading the chart

- The green line represents the DEMA value.
- When price is above the DEMA, it suggests an uptrend; when below, a downtrend.
- Crossovers of price and DEMA can signal potential trend changes.
- The DEMA reacts faster than a standard EMA of the same length.

## Implementation notes

- The same length is used for both EMAs; this is inherent to the DEMA definition.
- The indicator is non-repainting because it only uses current bar values (no look-ahead).
- Only one series is plotted; no additional lines or markers are drawn.
- The result is a single numeric value per bar; NaN may be produced for bars where the EMA is not yet defined.

## FAQ

**How can I change the color of the DEMA line?**

Modify the color parameter in the @plot.line decorator, e.g., @plot.line(color=color.RED).

**Can I use a different source like open or high?**

Yes, set the 'src' parameter to any available source, such as source.OPEN, source.HIGH, or source.LOW.

**What is the difference between DEMA and a regular EMA?**

DEMA reduces lag by subtracting the second EMA from twice the first EMA, making it more responsive to price changes than a standard EMA of the same length.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Ema


@indicator('DEMA', overlay_main_pane=True)  # Double EMA
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@plot.line(color=color.GREEN)
def Main(self, length, src):
    ema1 = Ema.new(src, length)
    ema2 = Ema.new(ema1, length)
    return 2 * ema1[0] - ema2[0]
```
