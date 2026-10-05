# TRIX - Built-in Indicator Guide

> Computes the TRIX oscillator as 10000 times the rate of change of a triple exponential moving average of log(close).

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#trix) |
| **Source file** | [TRIX.indie5](TRIX.indie5) |

## Overview

The TRIX indicator measures momentum by applying a triple exponential smoothing to the logarithm of the closing price, then taking the one-period rate of change. This triple smoothing removes short-term noise and highlights the underlying trend direction and strength.

It is typically used to identify overbought or oversold conditions, divergences with price, and zero-line crossovers as potential trend change signals. The indicator plots a single line oscillating around a zero level, with positive values indicating upward momentum and negative values indicating downward momentum.

## How it works

1. Take the natural logarithm of the current closing price.
2. Apply an exponential moving average (EMA) of the specified length to the log(close) series.
3. Apply a second EMA of the same length to the result of the first EMA.
4. Apply a third EMA of the same length to the result of the second EMA.
5. Compute the one-period rate of change (difference) of the triple EMA series.
6. Multiply the difference by 10000 to scale the output for typical chart display.

## Mathematical model

$$
\text{TRIX} = 10000 \times \left( \text{EMA}^3(\log(\text{close}))_t - \text{EMA}^3(\log(\text{close}))_{t-1} \right)
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 18 | ≥ 1 |  |

## Code walkthrough

### Indicator Decorators and Parameters

Lines 7-10 of [TRIX.indie5](TRIX.indie5):

```python
@indicator('TRIX', format=format.PRICE)
@param.int('length', default=18, min=1)
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.RED, title='TRIX')
```

The @indicator decorator registers the script with the name 'TRIX' and a price format. @param.int defines the length parameter with a default of 18 and a minimum of 1. @level adds a horizontal zero line in gray. @plot.line configures the TRIX line to be drawn in red.

### Main Function Signature

Lines 11-11 of [TRIX.indie5](TRIX.indie5):

```python
def Main(self, length):
```

The Main function receives the self context and the length parameter. It is the entry point called on every bar to compute the indicator value.

### Core Computation

Lines 12-12 of [TRIX.indie5](TRIX.indie5):

```python
    return 10000 * Change.new(Ema.new(Ema.new(Ema.new(MutSeriesF.new(log(self.close[0])), length), length), length))[0]
```

The return statement builds the TRIX value in a single expression: log(close) is fed into three nested Ema.new calls, each with the same length. The result is passed to Change.new which returns the difference between the current and previous triple EMA. Multiplying by 10000 scales the output. The [0] index retrieves the current bar's value from the series.

## Reading the chart

- The TRIX line oscillates around the zero level.
- Positive values indicate upward momentum; negative values indicate downward momentum.
- A crossover of the zero line from below to above suggests a potential bullish trend change.
- A crossover from above to below suggests a potential bearish trend change.
- The magnitude of the line (distance from zero) reflects the strength of the momentum.
- Divergences between TRIX and price may signal trend exhaustion.

## Implementation notes

- The use of log(close) makes the indicator responsive to percentage changes rather than absolute price moves.
- Triple EMA smoothing introduces significant lag; longer length values increase smoothing but delay signals.
- The Change.new function computes the difference between the current and previous value of the series, so the first bar may produce NaN.
- The multiplier 10000 is arbitrary and chosen for typical chart scaling; it does not affect the relative shape of the indicator.

## FAQ

**What does the 'length' parameter control?**

The length parameter is the smoothing period used for each of the three exponential moving averages. A larger length produces a smoother TRIX line with more lag, while a smaller length makes it more responsive to price changes.

**How should I interpret zero-line crossovers?**

When the TRIX line crosses above zero, it indicates that the triple EMA of log(close) is rising, suggesting upward momentum. A cross below zero signals downward momentum. These crossovers are often used as trade entry or exit signals.

**Can I change the multiplier (10000) in the code?**

Yes, you can modify the multiplier in the return statement. Changing it scales the indicator values but does not alter the shape or timing of the signals. Some traders prefer 100 or 1000 for different display ranges.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from math import log
from indie import indicator, format, param, level, color, plot, MutSeriesF
from indie.algorithms import Change, Ema


@indicator('TRIX', format=format.PRICE)
@param.int('length', default=18, min=1)
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.RED, title='TRIX')
def Main(self, length):
    return 10000 * Change.new(Ema.new(Ema.new(Ema.new(MutSeriesF.new(log(self.close[0])), length), length), length))[0]
```
