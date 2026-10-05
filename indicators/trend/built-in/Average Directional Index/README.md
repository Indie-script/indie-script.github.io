# Average Directional Index (ADX) - Built-in Indicator Guide

> Computes the Average Directional Index (ADX) to measure trend strength using ADX smoothing and DI lengths.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#average-directional-index) |
| **Source file** | [Average Directional Index.indie5](Average%20Directional%20Index.indie5) |

## Overview

The Average Directional Index (ADX) is a trend strength indicator that quantifies the strength of a trend regardless of direction. It is derived from the Directional Movement (DM) system and is commonly used to identify whether a market is trending or range-bound. The indicator outputs a single line plotted in red on a separate subchart. 

The ADX line oscillates between 0 and 100. Values below 20 typically suggest a weak or non-trending market, while values above 25 indicate a strong trend. Traders often combine ADX with the positive and negative directionl indicators (+DI and –DI) for additional context, though this implementation only plots the ADX line itself.

## How it works

1. The indicator is defined with two integer parameters: adx_len (ADX smoothing period, default 14) and di_len (DI length, default 14), both have a minimum of 1.
2. Inside the Main function, the built-in Adx algorithm is instantiated via Adx.new(adx_len, di_len).
3. Adx.new returns a tuple; the second element (index 1) is the ADX series. The first and third elements correspond to +DI and –DI respectively (not used here).
4. The current bar value of the ADX series is retreived with [0] and returned as the single output.
5. The output is plotted as a line colored red on the chart, updated on every bar.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `adx_len` | int | 14 | ≥ 1 | ADX Smoothing |
| `di_len` | int | 14 | ≥ 1 | DI Length |

## Code walkthrough

### Imports and Decorator Setup

Lines 1-9 of [Average Directional Index.indie5](Average%20Directional%20Index.indie5):

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color
from indie.algorithms import Adx


@indicator('ADX', format=format.PRICE)  # Average Directional Index
@param.int('adx_len', default=14, min=1, title='ADX Smoothing')
@param.int('di_len', default=14, min=1, title='DI Length')
@plot.line(color=color.RED)
```

Line 3 imports the Adx algorithm from indie.algorithms, which encapsulates the full ADX calculation. Lines 6-9 set the indicator name to 'ADX', define two integer parameters with defaults and ranges, and specify the output line color as red.

### Main Function and ADX Computation

Lines 10-12 of [Average Directional Index.indie5](Average%20Directional%20Index.indie5):

```python
def Main(self, adx_len, di_len):
    _, adx, _ = Adx.new(adx_len, di_len)
    return adx[0]
```

The Main function recieves the two parameters (adx_len and di_len). It calls Adx.new(adx_len, di_len) to create an ADX series. The underscore discards the first (+DI) and third (–DI) return values. The ADX value for the current bar is obtained via [0] and returned as the single plot value.

## Reading the chart

• The red line represents the ADX value, ranging from 0 to 100 as computed by Wilder's original method.
• Typically, values below 20 indicate a weak or sideways market, values above 25 suggest a developing or strong trend, and values above 40–50 may signal an extremely strong trend. However, no thresholds are hardcoded in this code.
• The ADX is non-directional; it only measures trend strength, not direction.

## Implementation notes

- The +DI and –DI are computed internally by Adx but are not exposed in this implementation. To display both, modify the return tuple to include them.
- Parameters adx_len and di_len have a minimum of 1; using 1 disables meaningful smoothing and may produce erratic values.
- The indicator repaints? No, Adx.new returns a series that is updated on each new bar; there is no look-ahead bias as long as the algorithm is standard.

## FAQ

**Can I display the +DI and –DI lines alongside the ADX?**

Yes. Modify the Main function to return a tuple containing the first and third elements of the Adx.new result (e.g., `return (adx[0], di_plus[0], di_minus[0])` and add appropriate plot decorators with desired colors.

**What is the difference between adx_len and di_len?**

di_len sets the lookback period for calculating the directional movment (DM) and the true range, while adx_len sets the smoothing period for the resulting ADX line. Standard Wilder settings use 14 for both.

**How do I change the line color or style?**

Modify the @plot line decorator, e.g., `@plot.line(color=color.BLUE, style=plot.style.DASHED)` to change appearance.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color
from indie.algorithms import Adx


@indicator('ADX', format=format.PRICE)  # Average Directional Index
@param.int('adx_len', default=14, min=1, title='ADX Smoothing')
@param.int('di_len', default=14, min=1, title='DI Length')
@plot.line(color=color.RED)
def Main(self, adx_len, di_len):
    _, adx, _ = Adx.new(adx_len, di_len)
    return adx[0]
```
