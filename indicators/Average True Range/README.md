# Average True Range (ATR) - Built-in Indicator Guide

> Computes the Average True Range (ATR) with configurable smoothing (RMA, SMA, EMA, WMA) and lookback length.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#average-true-range) |
| **Source file** | [Average True Range.indie5](Average%20True%20Range.indie5) |

## Overview

The Average True Range (ATR) indicator measures market volatility by calculating the average of the true range over a specified period. It is commonly used to set stop-loss levels, position sizing, and to identify periods of high or low volatility.

On the chart, the indicator plots a single red line representing the current ATR value. The line rises during volatile periods and falls during calmer periods.

## How it works

1. The indicator is configured with two parameters: `length` (integer, default 14) and `smoothing` (string, default 'RMA').
2. The `Main` function is called on each bar with the current parameter values.
3. Inside `Main`, `Atr.new(length, smoothing)` creates an instance of the built-in ATR algorithm with the specified settings.
4. The `.new()` method returns a series-like object; indexing with `[0]` retrieves the computed ATR value for the current bar.
5. This value is returned and plotted as a red line on the chart.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 1 |  |
| `smoothing` | str | RMA |  | Smoothing |

## Code walkthrough

### Imports and Decorators

Lines 1-9 of [Average True Range.indie5](Average%20True%20Range.indie5):

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Atr


@indicator('ATR')  # Average True Range
@param.int('length', default=14, min=1)
@param.str('smoothing', default='RMA', options=['RMA', 'SMA', 'EMA', 'WMA'], title='Smoothing')
@plot.line(color=color.RED)
```

The script imports the necessary modules and uses decorators to define the indicator's metadata and parameters. The `@indicator('ATR')` sets the display name, `@param.int` and `@param.str` create user-configurable settings for length and smoothing type, and `@plot.line` specifies the line color.

### Main Function

Lines 10-11 of [Average True Range.indie5](Average%20True%20Range.indie5):

```python
def Main(self, length, smoothing):
    return Atr.new(length, smoothing)[0]
```

The `Main` function is the entry point called on each bar. It receives the parameter values and returns the ATR value. The call to `Atr.new(length, smoothing)[0]` creates the algorithm instance and retrieves the current value.

### Return Value

Lines 11-11 of [Average True Range.indie5](Average%20True%20Range.indie5):

```python
    return Atr.new(length, smoothing)[0]
```

The expression `Atr.new(length, smoothing)[0]` is the core of the indicator. The `[0]` indexing is an Indie Script convention to get the current bar's value from a series returned by `.new()` methods.

## Reading the chart

- The indicator draws a single red line.
- The line's height at each bar represents the Average True Range value.
- Higher values indicate greater volatility; lower values indicate calmer markets.
- The line is continuous; gaps may appear if the ATR value is NaN (e.g., insufficient bars).

## Implementation notes

- The ATR algorithm is provided by the platform; this script does not implement the calculation itself.
- The `length` parameter must be at least 1; the `min=1` constraint ensures the parameter cannot be set below 1.
- The `smoothing` parameter accepts only the four specified options; any other value will cause an error.
- The indicator only plots the current ATR value; it does not plot any additional lines or markers.

## FAQ

**How do I change the color of the ATR line?**

Modify the `color` argument in the `@plot.line` decorator on line 9, e.g., `color=color.BLUE`.

**What parameters does this indicator accept?**

It accepts an integer `length` (default 14, minimum 1) and a string `smoothing` (default 'RMA', options: 'RMA', 'SMA', 'EMA', 'WMA').

**Can I plot the previous bar's ATR value?**

No, this script only returns the current value via `[0]`. To access previous values, you would need to modify the script to use `[1]` or store state.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Atr


@indicator('ATR')  # Average True Range
@param.int('length', default=14, min=1)
@param.str('smoothing', default='RMA', options=['RMA', 'SMA', 'EMA', 'WMA'], title='Smoothing')
@plot.line(color=color.RED)
def Main(self, length, smoothing):
    return Atr.new(length, smoothing)[0]
```
