# SMI Ergodic Indicator (SMII) - Built-in Indicator Guide

> Computes the True Strength Index (TSI) with an EMA signal line, plotted as the SMI Ergodic Indicator.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#smi-ergodic-indicator) |
| **Source file** | [SMI Ergodic Indicator.indie5](SMI%20Ergodic%20Indicator.indie5) |

## Overview

The SMI Ergodic Indicator (SMII) is a momentum oscillator that measures the strength of price changes relative to recent volatility. It is derived from the True Strength Index (TSI) by applying two smoothing periods, then smooths the TSI again with a signal-line EMA. The indicator is typically used to identify trend direction, potential reversals, and divergences with price.
On the chart it draws two lines: a blue SMI line and a maroon signal line. Crossovers between the two lines can be interpreted as changes in momentum, though the indicator itself does not plot any fixed overbought/oversold levels.

## How it works

1. The TSI series is computed from the close price using the given long and short smoothing lengths.
2. The signal line is an EMA of the TSI series using the specified signal length.
3. The indicator returns the current TSI value and the current EMA value for each bar.
4. Both values are plotted as separate lines with the given colors and precision.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `long_len` | int | 20 | ≥ 1 | Long Length |
| `short_len` | int | 5 | ≥ 1 | Short Length |
| `signal_len` | int | 5 | ≥ 1 | Signal Length |

## Code walkthrough

### Indicator and parameter decorators

Lines 6-9 of [SMI Ergodic Indicator.indie5](SMI%20Ergodic%20Indicator.indie5):

```python
@indicator('SMII', format=format.PRICE, precision=4)  # SMI Ergodic Indicator
@param.int('long_len', default=20, min=1, title='Long Length')
@param.int('short_len', default=5, min=1, title='Short Length')
@param.int('signal_len', default=5, min=1, title='Signal Length')
```

The @indicator decorator defines the script as an indicator named 'SMII' with price formatting and a precision of four decimals. The @param.int decorators expose three integer parameters (long_len, short_len, signal_len) with defaults and minimum value of 1, generating the settings UI.

### Plot decorators

Lines 10-11 of [SMI Ergodic Indicator.indie5](SMI%20Ergodic%20Indicator.indie5):

```python
@plot.line(color=color.BLUE, title='SMI')
@plot.line(color=color.MAROON, title='Signal')
```

Two lines are declared: the SMI line in blue and the Signal line in maroon. These decorators bind the values returned by Main to the chart, each with its own color and title.

### Main computation

Lines 13-14 of [SMI Ergodic Indicator.indie5](SMI%20Ergodic%20Indicator.indie5):

```python
    tsi = Tsi.new(self.close, long_len, short_len)
    return tsi[0], Ema.new(tsi, signal_len)[0]
```

Tsi.new builds the True Strength Index series from the close price using the long and short smoothing lengths. Ema.new then computes the exponentially smoothed signal of that TSI series. The function returns the current values of both series, read with [0] for the current bar.

## Reading the chart

- **Blue line (SMI)**: The TSI value, representing momentum after double smoothing.
- **Maroon line (Signal)**: The EMA of the SMI line, acting as a trigger.
- **Crossovers**: When the blue line crosses above the maroon line, momentum is considered to be strengthening; when it crosses below, momentum weakens.
- **No fixed levels**: The indicator does not plot overbought or oversold thresholds; use the relative position and slope of the lines for interpretation.

## Implementation notes

- The TSI and EMA algorithms are built into the platform's algorithms module; their exact internal formulas are not shown here.
- All parameters have a minimum of 1, so the indicator will not accept zero-length smoothing.
- Values are returned per bar with [0]; no historical values are directly accessed.
- The precision of 4 ensures a stable display for small price changes.

## FAQ

**How do I change the smoothing periods?**

Edit the long_len, short_len, and signal_len parameters in the settings panel. The defaults are 20, 5, and 5 respectively.

**What does the signal line represent?**

The signal line is an exponential moving average of the TSI itself. It smooths the SMI line to help identify reversals and crossovers for trading signals.

**Can I use this indicator for divergence analysis?**

Yes, you can manually observe divergences between the SMI line and price. The indicator does not draw any divergence markers, so you would need to track them yourself.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color
from indie.algorithms import Tsi, Ema


@indicator('SMII', format=format.PRICE, precision=4)  # SMI Ergodic Indicator
@param.int('long_len', default=20, min=1, title='Long Length')
@param.int('short_len', default=5, min=1, title='Short Length')
@param.int('signal_len', default=5, min=1, title='Signal Length')
@plot.line(color=color.BLUE, title='SMI')
@plot.line(color=color.MAROON, title='Signal')
def Main(self, long_len, short_len, signal_len):
    tsi = Tsi.new(self.close, long_len, short_len)
    return tsi[0], Ema.new(tsi, signal_len)[0]
```
