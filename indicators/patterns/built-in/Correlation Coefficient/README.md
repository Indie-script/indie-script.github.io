# Correlation Coefficient (CC) - Built-in Indicator Guide

> Computes the Pearson correlation coefficient between the current instrument's price and another instrument's price over a rolling window.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Candlestick patterns |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#correlation-coefficient) |
| **Source file** | [Correlation Coefficient.indie5](Correlation%20Coefficient.indie5) |

## Overview

The Correlation Coefficient indicator measures the linear relationship between two financial instruments over a specified number of bars. It computes the Pearson correlation coefficient between the source series (e.g., close price) of the current instrument and that of another instrument defined by exchange and ticker parameters.

This indicator is useful for pairs trading, hedging strategies, and diversification analysis. It helps identify when two assets move together (positive correlation) or in opposite directions (negative correlation). On the chart, it draws a blue line of the correlation value, with gray reference lines at +1 and -1, and a line at 0.

## How it works

1. Define a secondary context with a different exchange and ticker using `sec_context` and `calc_on`.
2. On each bar, retrieve the source series (e.g., close price) from both the primary and secondary contexts.
3. Pass both series and the window length to the built-in `Corr` algorithm.
4. The algorithm computes the Pearson correlation coefficient over the last `length` bars.
5. Return the current correlation value (`corr[0]`) for plotting.
6. The indicator plots the value as a blue line, with horizontal reference lines at 1, 0, and -1.

## Mathematical model

$$
r = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n} (x_i - \bar{x})^2 \sum_{i=1}^{n} (y_i - \bar{y})^2}}
$$

Where $x_i$ and $y_i$ are the source values from the two instruments over the window of length $n$.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `exchange` | str | NASDAQ |  |  |
| `ticker` | str | GOOG |  |  |
| `source` | source | source.CLOSE |  |  |
| `length` | int | 20 | ≥ 1 |  |

## Code walkthrough

### Decorators and class definition

Lines 12-20 of [Correlation Coefficient.indie5](Correlation%20Coefficient.indie5):

```python
@indicator('CC', format=format.PRICE)  # Correlation Coefficient
@param.str('exchange', default='NASDAQ')
@param.str('ticker', default='GOOG')
@param.source('source', default=source.CLOSE)
@param.int('length', default=20, min=1)
@level(1, line_color=color.GRAY)
@level(0)
@level(-1, line_color=color.GRAY)
@plot.line(color=color.BLUE, title='Correlation')
```

This fragment sets up the indicator with the short name 'CC', defines parameters (exchange, ticker, source, length) with defaults and constraints, and configures the plot appearance (blue line, gray reference levels at 1 and -1, and a level at 0). The `@level` decorators create horizontal lines at those values.

### Initializing the secondary context

Lines 22-23 of [Correlation Coefficient.indie5](Correlation%20Coefficient.indie5):

```python
    def __init__(self, exchange, ticker):
        self.ctx_other = self.calc_on(SecContext, exchange=exchange, ticker=ticker)
```

The `__init__` method creates a secondary calculation context using `calc_on` with the `SecContext` function. This allows the indicator to fetch data from a different instrument (exchange/ticker) specified by the user. The `SecContext` function (lines 8-9) returns the current value of the source series from that context.

### Computing the correlation on each bar

Lines 25-27 of [Correlation Coefficient.indie5](Correlation%20Coefficient.indie5):

```python
    def calc(self, source, length):
        corr = Corr.new(source, self.ctx_other, length)
        return corr[0]
```

The `calc` method is called on every bar. It creates a new `Corr` algorithm instance with the primary source, the secondary context, and the window length. The `Corr.new` method returns a series; `corr[0]` extracts the current value for plotting. The indicator then draws this value on the chart.

## Reading the chart

- The blue line represents the correlation coefficient between the two instruments over the rolling window.
- Values range from -1 to 1.
- The gray horizontal lines at 1 and -1, and the line at 0, serve as reference: perfect positive correlation, no correlation, and perfect negative correlation.
- When the blue line is near 1, the two instruments move together; near -1, they move inversely; near 0, no linear relationship.

## Implementation notes

- The `length` parameter must be at least 1; a small window may produce noisy results.
- The indicator uses `format.PRICE`, which formats the value as a price (though correlation is unitless).
- The `Corr` algorithm handles alignment of the two series; if one series has missing bars, the correlation may be `nan` and nothing is drawn.
- The secondary context is created once in `__init__` and reused across bars for efficiency.

## FAQ

**How do I change the second instrument to compare with?**

Modify the `exchange` and `ticker` parameters in the indicator settings. For example, set exchange to 'NYSE' and ticker to 'AAPL' to correlate with Apple stock.

**What does the `length` parameter control?**

It sets the number of bars (data points) used to compute the correlation coefficient. A longer window gives a smoother, more stable correlation estimate, while a shorter window reacts faster to recent changes.

**Why does the line sometimes disappear or show gaps?**

The correlation calculation requires valid data points from both instruments. If one series has missing values or the window contains insufficient data, the result is `nan` and no point is plotted.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, MainContext, sec_context, format, param, source, param_ref, level, color, plot
from indie.algorithms import Corr


@sec_context
@param_ref('source')
def SecContext(self, source):
    return source[0]


@indicator('CC', format=format.PRICE)  # Correlation Coefficient
@param.str('exchange', default='NASDAQ')
@param.str('ticker', default='GOOG')
@param.source('source', default=source.CLOSE)
@param.int('length', default=20, min=1)
@level(1, line_color=color.GRAY)
@level(0)
@level(-1, line_color=color.GRAY)
@plot.line(color=color.BLUE, title='Correlation')
class Main(MainContext):
    def __init__(self, exchange, ticker):
        self.ctx_other = self.calc_on(SecContext, exchange=exchange, ticker=ticker)

    def calc(self, source, length):
        corr = Corr.new(source, self.ctx_other, length)
        return corr[0]
```
