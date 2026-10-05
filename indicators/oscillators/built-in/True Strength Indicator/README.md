# True Strength Indicator (TSI) - Built-in Indicator Guide

> Computes the True Strength Index (TSI) momentum oscillator with signal line, scaled by 100.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#true-strength-indicator) |
| **Source file** | [True Strength Indicator.indie5](True%20Strength%20Indicator.indie5) |

## Overview

The True Strength Index (TSI) is a momentum oscillator that measures the direction and magnitude of price changes by applying double exponential smoothing. It oscillates around a zero line and is commonly used to identify overbought/oversold conditions, trend direction, and potential divergences with price.

The indicator plots two lines: the TSI line (blue) and a signal line (red), which is an EMA of the TSI. A zero level line is also drawn. Crossovers of the TSI above/below zero and crossovers between the TSI and its signal line are typical trading signals.

## How it works

1. Compute the price change (close minus previous close) for each bar.
2. Apply an EMA with the short length to both the signed price change and the absolute price change.
3. Apply a second EMA with the long length to both smoothed series.
4. Calculate the TSI as the ratio of the double-smoothed signed change to the double-smoothed absolute change, multiplied by 100.
5. Compute the signal line as an EMA of the TSI series using the signal length.
6. Plot the TSI (blue) and signal (red) lines, and draw a zero level line.

## Mathematical model

$$
\text{TSI} = 100 \times \frac{\text{EMA}_{\text{long}}(\text{EMA}_{\text{short}}(\Delta P))}{\text{EMA}_{\text{long}}(\text{EMA}_{\text{short}}(|\Delta P|))}
$$

$$
\text{Signal} = 100 \times \text{EMA}_{\text{signal}}(\text{TSI})
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `long_len` | int | 25 | ≥ 1 | Long Length |
| `short_len` | int | 13 | ≥ 1 | Short Length |
| `signal_len` | int | 13 | ≥ 1 | Signal Length |

## Code walkthrough

### Indicator declaration and parameters

Lines 6-12 of [True Strength Indicator.indie5](True%20Strength%20Indicator.indie5):

```python
@indicator('TSI', format=format.PRICE, precision=4)  # True Strength Indicator
@param.int('long_len', default=25, min=1, title='Long Length')
@param.int('short_len', default=13, min=1, title='Short Length')
@param.int('signal_len', default=13, min=1, title='Signal Length')
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.BLUE, title='TSI')
@plot.line(color=color.RED, title='Signal')
```

The `@indicator` decorator sets the short name 'TSI', price format, and 4 decimal precision. Three integer parameters control the long smoothing, short smoothing, and signal line lengths. A zero level line is drawn in gray, and two plot lines are defined: TSI in blue and Signal in red.

### Main function and algorithm instantiation

Lines 13-14 of [True Strength Indicator.indie5](True%20Strength%20Indicator.indie5):

```python
def Main(self, long_len, short_len, signal_len):
    tsi = Tsi.new(self.close, long_len, short_len)
```

The `Main` function receives the parameter values. `Tsi.new(self.close, long_len, short_len)` creates a TSI algorithm instance that internally computes the double-smoothed ratio using the close price series. The result is a series accessible via indexing.

### Returning scaled values and signal line

Lines 15-15 of [True Strength Indicator.indie5](True%20Strength%20Indicator.indie5):

```python
    return 100 * tsi[0], 100 * Ema.new(tsi, signal_len)[0]
```

The function returns a tuple of two values: the current TSI value multiplied by 100, and the current value of an EMA applied to the TSI series (also multiplied by 100). The multiplication scales the oscillator to a percentage-like range. The `[0]` index retrieves the value for the current bar.

## Reading the chart

- The **blue line** is the TSI oscillator, oscillating around zero.
- The **red line** is the signal line (EMA of TSI).
- Crossings of the TSI above zero suggest bullish momentum; below zero suggest bearish momentum.
- When the TSI crosses above its signal line, it may indicate a bullish signal; crossing below indicates a bearish signal.
- Divergences between TSI and price can signal potential reversals.

## Implementation notes

- The TSI is scaled by 100, so typical values range roughly from -100 to +100.
- The signal line is an EMA of the TSI series (the raw ratio), then scaled by 100.
- All length parameters must be at least 1; default values are 25, 13, and 13.
- The indicator uses the built-in `Tsi` algorithm, which handles the double smoothing internally.

## FAQ

**How can I adjust the sensitivity of the TSI?**

Decrease the short_len and long_len parameters to make the TSI more responsive, or increase them for smoother readings.

**What does a TSI value above zero indicate?**

A positive TSI indicates that the double-smoothed signed price change is positive, meaning upward momentum is dominant.

**Can I use this indicator on intraday charts?**

Yes, the TSI works on any timeframe. The default parameters may need adjustment for shorter timeframes to reduce noise.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, level, color, plot
from indie.algorithms import Tsi, Ema


@indicator('TSI', format=format.PRICE, precision=4)  # True Strength Indicator
@param.int('long_len', default=25, min=1, title='Long Length')
@param.int('short_len', default=13, min=1, title='Short Length')
@param.int('signal_len', default=13, min=1, title='Signal Length')
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.BLUE, title='TSI')
@plot.line(color=color.RED, title='Signal')
def Main(self, long_len, short_len, signal_len):
    tsi = Tsi.new(self.close, long_len, short_len)
    return 100 * tsi[0], 100 * Ema.new(tsi, signal_len)[0]
```
