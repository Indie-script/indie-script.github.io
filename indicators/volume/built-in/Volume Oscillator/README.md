# Volume Oscillator (Volume Osc) - Built-in Indicator Guide

> Computes the percentage difference between short and long exponential moving averages of volume.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volume |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#volume-oscillator) |
| **Source file** | [Volume Oscillator.indie5](Volume%20Oscillator.indie5) |

## Overview

The Volume Oscillator measures the difference between two exponential moving averages (EMAs) of volume, expressed as a percentage of the longer EMA. It is designed to highlight changes in volume momentum, helping traders identify periods where short-term volume is accelerating or decelerating relative to the longer-term average.

On the chart, the indicator is drawn as a blue line that oscillates around a zero level (gray line). When the line is above zero, short-term volume is higher than the long-term average; when below zero, short-term volume is lower. This can signal shifts in market participation or interest.

## How it works

1. Compute the short-term EMA of volume using the `short_len` period.
2. Compute the long-term EMA of volume using the `long_len` period.
3. Subtract the long EMA from the short EMA.
4. Divide the difference by the long EMA to normalize the value.
5. Multiply the result by 100 to express it as a percentage.
6. Return the computed value for the current bar; the platform plots it as a line.

## Mathematical model

$$
\text{VO} = 100 \times \frac{\text{EMA}_{\text{short}}(\text{volume}) - \text{EMA}_{\text{long}}(\text{volume})}{\text{EMA}_{\text{long}}(\text{volume})}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `short_len` | int | 5 | ≥ 1 | Short Length |
| `long_len` | int | 10 | ≥ 1 | Long Length |

## Code walkthrough

### Indicator Decorators and Settings

Lines 7-11 of [Volume Oscillator.indie5](Volume%20Oscillator.indie5):

```python
@indicator('Volume Osc', format=format.PRICE)  # Volume Oscillator  # TODO: format=format.PERCENT
@param.int('short_len', default=5, min=1, title='Short Length')
@param.int('long_len', default=10, min=1, title='Long Length')
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.BLUE, title='VO')
```

The `@indicator` decorator sets the display name to 'Volume Osc' and the format to PRICE (though a comment suggests PERCENT may be more appropriate). Two integer parameters `short_len` and `long_len` are defined with defaults 5 and 10, each with a minimum of 1. A zero level is added with a gray line, and the plot is configured as a blue line labeled 'VO'.

### Main Function and Computation

Lines 12-15 of [Volume Oscillator.indie5](Volume%20Oscillator.indie5):

```python
def Main(self, short_len, long_len):
    short = Ema.new(self.volume, short_len)[0]
    long = Ema.new(self.volume, long_len)[0]
    return 100 * divide(short - long, long)
```

The `Main` function receives the two parameters. It computes the short and long EMAs of `self.volume` using `Ema.new`, which returns a series; indexing with `[0]` retrieves the current bar's value. The final return value is `100 * divide(short - long, long)`. The `divide` function from `indie.math` safely handles division by zero (returns NaN).

## Reading the chart

- **Blue line**: The Volume Oscillator value for each bar.
- **Zero line (gray)**: Reference level; values above zero indicate short-term volume above the long-term average, values below indicate short-term volume below the long-term average.
- **Positive values**: Suggest increasing volume momentum (short-term volume is accelerating).
- **Negative values**: Suggest decreasing volume momentum (short-term volume is decelerating).

## Implementation notes

- Uses `Ema.new` which returns a series; `[0]` accesses the current bar's EMA value.
- The `divide` function from `indie.math` returns NaN when the denominator is zero, preventing division errors.
- The indicator does not repaint because it only uses current bar data (no lookahead).
- The `format=format.PRICE` is used, but a comment suggests `format.PERCENT` might be more appropriate since the output is a percentage.

## FAQ

**How should I interpret the Volume Oscillator?**

Positive values indicate that short-term volume is higher than the long-term average, suggesting increasing volume momentum. Negative values indicate the opposite. Crossings of the zero line can signal shifts in market participation.

**What are typical settings for short_len and long_len?**

The defaults are 5 and 10, but you can adjust them based on your trading style. Shorter periods make the oscillator more sensitive, longer periods smooth out noise.

**Does the Volume Oscillator repaint?**

No, it does not repaint. The computation uses only the current bar's volume and the EMAs are updated in real time without referencing future data.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, level, color, plot
from indie.algorithms import Ema
from indie.math import divide


@indicator('Volume Osc', format=format.PRICE)  # Volume Oscillator  # TODO: format=format.PERCENT
@param.int('short_len', default=5, min=1, title='Short Length')
@param.int('long_len', default=10, min=1, title='Long Length')
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.BLUE, title='VO')
def Main(self, short_len, long_len):
    short = Ema.new(self.volume, short_len)[0]
    long = Ema.new(self.volume, long_len)[0]
    return 100 * divide(short - long, long)
```
