# Triple EMA (TEMA) - Built-in Indicator Guide

> Computes Triple Exponential Moving Average (TEMA) for the specified source and length.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#triple-ema) |
| **Source file** | [Triple EMA.indie5](Triple%20EMA.indie5) |

## Overview

The Triple Exponential Moving Average (TEMA) is a smoothed moving average that reduces lag compared to a standard EMA. It applies three consecutive EMA calculations and combines them in a weighted formula to yield a response that follows price changes more quickly while still filtering out noise. 

This indicator is plotted on the main chart as a single blue line, making it suitable for trend identification and as a dynamic support/resistance level when the price is above or below the TEMA. It is most commonly used in trending markets where lag reduction is beneficial.

## How it works

1. The indicator accepts a `length` parameter (default 9) and a `src` source (default close).
2. It computes a first EMA (`ema1`) of the source series with the given length.
3. A second EMA (`ema2`) is computed on `ema1` with the same length.
4. A third EMA (`ema3`) is computed on `ema2` with the same length.
5. The final TEMA value is: 3 * (ema1[0] - ema2[0]) + ema3[0] for the current bar.
6. The result is plotted as a blue line on the main chart pane.

## Mathematical model

$$
\text{TEMA} = 3 \cdot (\text{EMA}_1 - \text{EMA}_2) + \text{EMA}_3
$$

where:
- \(\text{EMA}_1 = \text{EMA}(\text{src}, \text{length})\)
- \(\text{EMA}_2 = \text{EMA}(\text{EMA}_1, \text{length})\)
- \(\text{EMA}_3 = \text{EMA}(\text{EMA}_2, \text{length})\)

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 9 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |

## Code walkthrough

### Parameter and plot decorators

Lines 6-9 of [Triple EMA.indie5](Triple%20EMA.indie5):

```python
@indicator('TEMA', overlay_main_pane=True)  # Triple EMA
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@plot.line(color=color.BLUE)
```

Line 6 sets the indicator name to 'TEMA' and overlays it on the main chart pane. Lines 7-8 define user-adjustable parameters: an integer `length` with default 9 and minimum 1, and a source `src` defaulting to close. Line 9 configures the plot output as a blue line.

### Main logic and formula

Lines 10-14 of [Triple EMA.indie5](Triple%20EMA.indie5):

```python
def Main(self, length, src):
    ema1 = Ema.new(src, length)
    ema2 = Ema.new(ema1, length)
    ema3 = Ema.new(ema2, length)
    return 3 * (ema1[0] - ema2[0]) + ema3[0]
```

Lines 11-13 three EMA computations: the first on the source series, the second on the first EMA, the third on the second EMA. Line 14 returns the TEMA formula combining the three EMAs. The result is a series that is plotted because of the @plot decorator.

## Reading the chart

* The single blue line represents the TEMA value on each bar. When the line is rising, the trend is up; when falling, the trend is down. Price crossing above or below the line may signal trend changes.
* The indicator reaction to price moves faster than a standard EMA, producing earlier signals but potentialy more whipsaws.

## Implementation notes

- The `Ema.new` returns an Ema algorithm series; access current bar value with `[0]`.
- All three EMAs use the same `length` parameter; this is by design of the TEMA formula.
- The indicator uses `overlay_main_pane=True`, so it is drawn directly on the price chart.
- If `length` is set to 1, the TEMA degenerates to a triple application of the raw price? Not exactly: EMA length 1 becomes an exponential average with alpha=2/(1+1)=1, so it properties? In practice, minimum length of 1 is allowed but likely produces trivial results.

## FAQ

**How does TEMA differ from a regular EMA?**

TEMA applies three EMAs and combines them with a triple-weighting formula that virtually eliminates lag. It responds to price changes quiker than an EMA of the same length.

**What is the best length setting?**

There is no single best length; it depends on the market and timeframe. The default 9 is often used for short-to-medium term trends. Traders may adjust based on volatility.

**Can I change the color or style of the plot?**

Yes, you can modify the `@plot.line` decorator parameters, e.g., `color=color.RED` or `width=2`, to customize the appearance.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Ema


@indicator('TEMA', overlay_main_pane=True)  # Triple EMA
@param.int('length', default=9, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@plot.line(color=color.BLUE)
def Main(self, length, src):
    ema1 = Ema.new(src, length)
    ema2 = Ema.new(ema1, length)
    ema3 = Ema.new(ema2, length)
    return 3 * (ema1[0] - ema2[0]) + ema3[0]
```
