# Rate Of Change (ROC) - Built-in Indicator Guide

> Calculates the Rate of Change (momentum) of a selected price source over a given period.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#rate-of-change) |
| **Source file** | [Rate Of Change.indie5](Rate%20Of%20Change.indie5) |

## Overview

The Rate of Change (ROC) indicator measures the speed of price movement by comparing the current price to a price from a specified number of bars ago. It is a momentum oscillator that helps identify the strength of a trend and potential reversals when it crosses the zero line.

On the chart, a blue ROC line is plotted against a gray zero level. Readings above zero indicate upward momentum, while readings below zero indicate downward momentum. The steepness of the line reflects the acceleration of the move.

## How it works

1. The indicator imports the `Roc` algorithm from `indie.algorithms`, which encapsulates the ROC calculation.
2. Two parameters are exposed via decorators: `length` (default 9, minimum 1) and `src` (default `source.CLOSE`).
3. A horizontal zero level is drawn with a gray line using the `@level` decorator.
4. The `Main` function calls `Roc.new(src, length)[0]` to compute the ROC value for the current bar.
5. The computed value is returned as a single value, and the `@plot.line` decorator draws it as a blue line on the chart.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 9 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |

## Code walkthrough

### Imports and algorithm

Lines 1-3 of [Rate Of Change.indie5](Rate%20Of%20Change.indie5):

```python
# indie:lang_version = 5
from indie import indicator, format, param, source, level, color, plot
from indie.algorithms import Roc
```

Imports the required decorators and types, along with the `Roc` algorithm from the standard library. Using a built‑in algorithm keeps the code concise and reliable.

### Indicator definition and parameters

Lines 6-9 of [Rate Of Change.indie5](Rate%20Of%20Change.indie5):

```python
@indicator('ROC', format=format.PRICE)  # Rate Of Change
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@level(0, line_color=color.GRAY, title='Zero')
```

`@indicator` sets the short name 'ROC' and the display format to `PRICE`, which shows values in the same unit as the source. `@param.int` and `@param.source` create user‑adjustable inputs for period length and price source. `@level(0)` adds a fixed gray zero line for reference.

### Plot and main function

Lines 10-12 of [Rate Of Change.indie5](Rate%20Of%20Change.indie5):

```python
@plot.line(color=color.BLUE, title='ROC')
def Main(self, length, src):
    return Roc.new(src, length)[0]
```

`@plot.line` defines a blue line to represent the ROC values. The `Main` function calls `Roc.new(src, length)`, which returns a series; `[0]` picks the value for the current bar. The function returns this single value, which is automatically plotted.

## Reading the chart

- The **blue line** represents the ROC value. When it is above the **gray zero line**, the price source has increased relative to `length` bars ago; when below, it has decreased.
- The magnitude of the line indicates the strength of the price change. Higher absolute values suggest stronger momentum.
- Crossings of the zero line can be used to identify potential trend changes (bullish when crossing from negative to positive, bearish when crossing from positive to negative).

## Implementation notes

- The implementation relies entirely on the built‑in `Roc` algorithm; no custom math is exposed.
- The indicator does not use any state (`MutSeriesF`) – the calculation is stateless per bar.
- The `format=PRICE` means the output is in the same unit as the input price (e.g., dollars, points), not a percentage.
- The indicator does not repaint because `Roc.new` returns a series and `[0]` only looks at the current finished bar.

## FAQ

**What is the default length and can I change it?**

The default length is 9. You can change it to any positive integer via the indicator settings in the platform UI.

**Does the indicator use the closing price by default?**

Yes, the default source is `CLOSE`. You can change it to other price sources like HIGH, LOW, OPEN, or HL2 via the 'Source' parameter.

**How do I interpret a negative ROC value?**

A negative ROC value means the current price is lower than the price `length` bars ago, indicating downward momentum. The magnitude gives an idea of the speed of the decline.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, source, level, color, plot
from indie.algorithms import Roc


@indicator('ROC', format=format.PRICE)  # Rate Of Change
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@level(0, line_color=color.GRAY, title='Zero')
@plot.line(color=color.BLUE, title='ROC')
def Main(self, length, src):
    return Roc.new(src, length)[0]
```
