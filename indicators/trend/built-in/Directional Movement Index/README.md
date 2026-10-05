# Directional Movement Index (DMI) - Built-in Indicator Guide

> Computes the Directional Movement Index (DMI) with +DI, -DI, and ADX lines to measure directional price movement strength.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#directional-movement-index) |
| **Source file** | [Directional Movement Index.indie5](Directional%20Movement%20Index.indie5) |

## Overview

The Directional Movement Index (DMI) is a momentum indicator that quantifies the strength and direction of price movements. It is commonly used to identify trending conditions and potential shifts in market momentum.

The indicator plots three lines: +DI (blue) for positive directional movement, -DI (maroon) for negative directional movement, and ADX (red) for the overall strength of the directional movement. The relative positions of +DI and -DI indicate the prevailing direction, while ADX shows how pronounced the movement is.

## How it works

1. The indicator is declared with the name 'DMI' and a price format with 4 decimal places.
2. Two integer parameters are exposed: `adx_len` (default 14, min 1) for ADX smoothing, and `di_len` (default 14, min 1) for DI length.
3. Three plot lines are configured with specific colors and titles: -DI (maroon), ADX (red), +DI (blue).
4. In the `Main` function, `Adx.new(adx_len, di_len)` is called, which returns a tuple of three series: `minus`, `adx`, `plus`.
5. The current values of these series are obtained via `[0]` indexing and returned as a tuple for plotting.
6. The indicator updates on each bar, with the Adx algorithm maintaining internal state to compute the directional movements.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `adx_len` | int | 14 | ≥ 1 | ADX Smoothing |
| `di_len` | int | 14 | ≥ 1 | DI Length |

## Code walkthrough

### Indicator and Parameter Configuration

Lines 6-8 of [Directional Movement Index.indie5](Directional%20Movement%20Index.indie5):

```python
@indicator('DMI', format=format.PRICE, precision=4)  # Directional Movement Index
@param.int('adx_len', default=14, min=1, title='ADX Smoothing')
@param.int('di_len', default=14, min=1, title='DI Length')
```

The `@indicator` decorator registers the script as 'DMI' with a price format and 4 decimal places. Two `@param.int` decorators expose user-configurable smoothing lengths: `adx_len` for the ADX line and `di_len` for the directional movement lookback, both defaulting to 14.

### Plot Line Definitions

Lines 9-11 of [Directional Movement Index.indie5](Directional%20Movement%20Index.indie5):

```python
@plot.line(color=color.MAROON, title='-DI')
@plot.line(color=color.RED, title='ADX')
@plot.line(color=color.BLUE, title='+DI')
```

Three `@plot.line` decorators define the visual output: -DI in maroon, ADX in red, and +DI in blue. These colors and titles are used directly on the chart legend.

### Main Function and Algorithm Call

Lines 12-14 of [Directional Movement Index.indie5](Directional%20Movement%20Index.indie5):

```python
def Main(self, adx_len, di_len):
    minus, adx, plus = Adx.new(adx_len, di_len)
    return minus[0], adx[0], plus[0]
```

The `Main` function receives the two parameters and calls `Adx.new(adx_len, di_len)`, which returns three series objects. The `[0]` indexing extracts the current bar's value from each series, and the tuple is returned for plotting.

## Reading the chart

- The **+DI line (blue)** represents the positive directional movement over the `di_len` period.
- The **-DI line (maroon)** represents the negative directional movement over the same period.
- The **ADX line (red)** shows the smoothed absolute difference between +DI and -DI, indicating the overall strength of the directional movement.
- When +DI is above -DI, upward momentum is dominant; when -DI is above +DI, downward momentum is dominant. A rising ADX suggests strengthening momentum, while a falling ADX indicates weakening.

## Implementation notes

- The Adx algorithm is a built-in algorithm from `indie.algorithms`; its internal computation is not shown in this script.
- The indicator uses `[0]` indexing to get the current bar's value from each series returned by `Adx.new`.
- Both parameters have a minimum value of 1, ensuring at least one period is used for calculations.
- The plot lines are defined with specific colors: maroon for -DI, red for ADX, blue for +DI.

## FAQ

**How do I adjust the sensitivity of the DMI?**

Lower the `di_len` parameter to make the directional movement more responsive to recent price changes, or increase it for smoother, longer-term readings. The `adx_len` parameter controls the smoothing of the ADX line.

**What do the different lines represent?**

+DI (blue) shows positive directional movement, -DI (maroon) shows negative directional movement, and ADX (red) shows the overall strength of the directional movement.

**Can I use this indicator on lower timeframes?**

Yes, the indicator works on any timeframe. Adjust the `di_len` and `adx_len` parameters to suit the timeframe's volatility and your analysis needs.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color
from indie.algorithms import Adx


@indicator('DMI', format=format.PRICE, precision=4)  # Directional Movement Index
@param.int('adx_len', default=14, min=1, title='ADX Smoothing')
@param.int('di_len', default=14, min=1, title='DI Length')
@plot.line(color=color.MAROON, title='-DI')
@plot.line(color=color.RED, title='ADX')
@plot.line(color=color.BLUE, title='+DI')
def Main(self, adx_len, di_len):
    minus, adx, plus = Adx.new(adx_len, di_len)
    return minus[0], adx[0], plus[0]
```
