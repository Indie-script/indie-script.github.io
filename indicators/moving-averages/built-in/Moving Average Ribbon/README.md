# Moving Average Ribbon (MA Ribbon) - Built-in Indicator Guide

> Plots up to four configurable moving averages (SMA, EMA, WMA, VWMA, SMMA) as separate lines on the chart.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#moving-average-ribbon) |
| **Source file** | [Moving Average Ribbon.indie5](Moving%20Average%20Ribbon.indie5) |

## Overview

The Moving Average Ribbon indicator smooths price data by computing moving averages of different lengths and types. It is commonly used to identify trend direction, gauge momentum, and spot potential support/resistance levels by comparing multiple averages simultaneously.

On the chart, four colored lines are drawn: MA1 (yellow, default length 20), MA2 (orange, 50), MA3 (dark orange, 100), and MA4 (red, 200). Each line can be individually enabled/disabled and configured with its own source, type, and length via the settings panel.

## How it works

1. For each of the four moving averages (MA1–MA4), check if the corresponding boolean parameter is enabled.
2. If enabled, call `Ma.new(source, length, type)` to compute the current bar's moving average value using the specified source (e.g., CLOSE) and algorithm type (SMA, EMA, SMMA, WMA, VWMA).
3. Take the first element `[0]` of the returned series, which holds the value for the current bar.
4. If disabled, assign `math.nan` so no point is plotted for that bar.
5. Return a tuple of four values (one per MA) in the order MA1, MA2, MA3, MA4.
6. The `@plot.line` decorators assign each output value a distinct color and title, rendering them as separate line plots on the main pane.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `ma1` | bool | true |  | Show MA №1 |
| `ma1_type` | str | SMA |  | MA №1 Type |
| `ma1_source` | source | source.CLOSE |  | MA №1 Source |
| `ma1_length` | int | 20 | ≥ 1 | MA №1 Length |
| `ma2` | bool | true |  | Show MA №2 |
| `ma2_type` | str | SMA |  | MA №2 Type |
| `ma2_source` | source | source.CLOSE |  | MA №2 Source |
| `ma2_length` | int | 50 | ≥ 1 | MA №2 Length |
| `ma3` | bool | true |  | Show MA №3 |
| `ma3_type` | str | SMA |  | MA №3 Type |
| `ma3_source` | source | source.CLOSE |  | MA №3 Source |
| `ma3_length` | int | 100 | ≥ 1 | MA №3 Length |
| `ma4` | bool | true |  | Show MA №4 |
| `ma4_type` | str | SMA |  | MA №4 Type |
| `ma4_source` | source | source.CLOSE |  | MA №4 Source |
| `ma4_length` | int | 200 | ≥ 1 | MA №4 Length |

## Code walkthrough

### Indicator declaration and parameters

Lines 7-23 of [Moving Average Ribbon.indie5](Moving%20Average%20Ribbon.indie5):

```python
@indicator('MA Ribbon', overlay_main_pane=True)  # Moving Average Ribbon
@param.bool('ma1', default=True, title='Show MA №1')
@param.str('ma1_type', default='SMA', title='MA №1 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma1_source', default=source.CLOSE, title='MA №1 Source')
@param.int('ma1_length', default=20, min=1, title='MA №1 Length')
@param.bool('ma2', default=True, title='Show MA №2')
@param.str('ma2_type', default='SMA', title='MA №2 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma2_source', default=source.CLOSE, title='MA №2 Source')
@param.int('ma2_length', default=50, min=1, title='MA №2 Length')
@param.bool('ma3', default=True, title='Show MA №3')
@param.str('ma3_type', default='SMA', title='MA №3 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma3_source', default=source.CLOSE, title='MA №3 Source')
@param.int('ma3_length', default=100, min=1, title='MA №3 Length')
@param.bool('ma4', default=True, title='Show MA №4')
@param.str('ma4_type', default='SMA', title='MA №4 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma4_source', default=source.CLOSE, title='MA №4 Source')
@param.int('ma4_length', default=200, min=1, title='MA №4 Length')
```

The `@indicator` decorator registers the script as 'MA Ribbon' and sets it to overlay the main pane. Four groups of parameters (ma1–ma4) control each moving average: a boolean to show/hide, a type selector (SMA, EMA, SMMA, WMA, VWMA), a price source (e.g., CLOSE), and an integer length with a minimum of 1. Default lengths are 20, 50, 100, and 200.

### Plot styling

Lines 24-27 of [Moving Average Ribbon.indie5](Moving%20Average%20Ribbon.indie5):

```python
@plot.line(color=color.rgba(246, 195, 9), title='MA №1')
@plot.line(color=color.rgba(251, 152, 0), title='MA №2')
@plot.line(color=color.rgba(251, 101, 0), title='MA №3')
@plot.line(color=color.rgba(246, 12, 12), title='MA №4')
```

Each of the four output lines is assigned a color and title via `@plot.line` decorators. The colors progress from yellow (MA1) through orange shades to red (MA4), making the shorter, faster averages visually distinct from the longer, smoother ones.

### Main computation and return

Lines 28-39 of [Moving Average Ribbon.indie5](Moving%20Average%20Ribbon.indie5):

```python
def Main(self, ma1, ma1_type, ma1_source, ma1_length, \
         ma2, ma2_type, ma2_source, ma2_length, \
         ma3, ma3_type, ma3_source, ma3_length, \
         ma4, ma4_type, ma4_source, ma4_length):
    ma1_val = Ma.new(ma1_source, ma1_length, ma1_type)[0]
    ma2_val = Ma.new(ma2_source, ma2_length, ma2_type)[0]
    ma3_val = Ma.new(ma3_source, ma3_length, ma3_type)[0]
    ma4_val = Ma.new(ma4_source, ma4_length, ma4_type)[0]
    return ma1_val if ma1 else nan, \
           ma2_val if ma2 else nan, \
           ma3_val if ma3 else nan, \
           ma4_val if ma4 else nan
```

The `Main` function receives all parameter values. For each MA, it calls `Ma.new()` with the chosen source, length, and type, then extracts the current bar's value with `[0]`. If the MA is disabled, `math.nan` is used instead. The four values are returned as a tuple, which the plotting engine renders as separate lines according to the decorators.

## Reading the chart

- **MA1 (yellow, length 20):** Fastest moving average; reacts quickly to recent price changes.
- **MA2 (orange, length 50):** Medium-short average; balances responsiveness and smoothness.
- **MA3 (dark orange, length 100):** Medium-long average; shows broader trend direction.
- **MA4 (red, length 200):** Slowest moving average; highlights long-term trend and acts as a baseline.
- When lines are close together, the market is trending steadily. Wide separation indicates strong momentum or volatility.
- Crossing of lines can signal potential trend reversals or changes in momentum.

## Implementation notes

- The `Ma.new()` function returns a series; only the current bar value `[0]` is used, so the indicator does not store state between bars.
- If an MA is disabled, its output is `math.nan`, which causes the plotting engine to skip drawing that bar, effectively hiding the line.
- All length parameters have a minimum of 1, but very short lengths (e.g., 1) will produce a moving average equal to the source value.
- The indicator overlays the main pane, so it shares the same price scale as the main chart.

## FAQ

**How do I change the color of a moving average line?**

Modify the `color.rgba(...)` values in the `@plot.line` decorators for the corresponding MA. For example, change `color.rgba(246, 195, 9)` to a different RGB triple.

**Can I add more than four moving averages?**

No, the indicator is hardcoded to support exactly four MAs. To add more, you would need to duplicate the parameter and plot decorators and extend the return tuple, which is not possible without editing the source.

**What is the difference between SMA and SMMA (RMA)?**

SMA (Simple Moving Average) gives equal weight to all bars in the window. SMMA (RMA) is a smoothed moving average variant; the exact calculation is handled by the platform's `Ma.new` function and is not defined in this script.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from math import nan
from indie import indicator, param, source, plot, color
from indie.algorithms import Ma


@indicator('MA Ribbon', overlay_main_pane=True)  # Moving Average Ribbon
@param.bool('ma1', default=True, title='Show MA №1')
@param.str('ma1_type', default='SMA', title='MA №1 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma1_source', default=source.CLOSE, title='MA №1 Source')
@param.int('ma1_length', default=20, min=1, title='MA №1 Length')
@param.bool('ma2', default=True, title='Show MA №2')
@param.str('ma2_type', default='SMA', title='MA №2 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma2_source', default=source.CLOSE, title='MA №2 Source')
@param.int('ma2_length', default=50, min=1, title='MA №2 Length')
@param.bool('ma3', default=True, title='Show MA №3')
@param.str('ma3_type', default='SMA', title='MA №3 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma3_source', default=source.CLOSE, title='MA №3 Source')
@param.int('ma3_length', default=100, min=1, title='MA №3 Length')
@param.bool('ma4', default=True, title='Show MA №4')
@param.str('ma4_type', default='SMA', title='MA №4 Type', options=['SMA', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.source('ma4_source', default=source.CLOSE, title='MA №4 Source')
@param.int('ma4_length', default=200, min=1, title='MA №4 Length')
@plot.line(color=color.rgba(246, 195, 9), title='MA №1')
@plot.line(color=color.rgba(251, 152, 0), title='MA №2')
@plot.line(color=color.rgba(251, 101, 0), title='MA №3')
@plot.line(color=color.rgba(246, 12, 12), title='MA №4')
def Main(self, ma1, ma1_type, ma1_source, ma1_length, \
         ma2, ma2_type, ma2_source, ma2_length, \
         ma3, ma3_type, ma3_source, ma3_length, \
         ma4, ma4_type, ma4_source, ma4_length):
    ma1_val = Ma.new(ma1_source, ma1_length, ma1_type)[0]
    ma2_val = Ma.new(ma2_source, ma2_length, ma2_type)[0]
    ma3_val = Ma.new(ma3_source, ma3_length, ma3_type)[0]
    ma4_val = Ma.new(ma4_source, ma4_length, ma4_type)[0]
    return ma1_val if ma1 else nan, \
           ma2_val if ma2 else nan, \
           ma3_val if ma3 else nan, \
           ma4_val if ma4 else nan
```
