# Choppiness Index (CHOP) - Built-in Indicator Guide

> Computes the Choppiness Index (CHOP) to measure market trendiness vs. choppiness over a given period.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#choppiness-index) |
| **Source file** | [Choppiness Index.indie5](Choppiness%20Index.indie5) |

## Overview

The Choppiness Index quantifies whether a market is trending or ranging by comparing the sum of true ranges to the overall price range over a lookback period. High values indicate a choppy, sideways market; low values suggest a strong trend. It is commonly used to filter out trend-following signals during consolidation phases.

The indicator plots a single blue line oscillating between 0 and 100, with reference bands at 38.2 and 61.8 (aqua fill) and a centerline at 50. Values above 61.8 are considered choppy, below 38.2 trending. An offset parameter can shift the line forward or backward.

## How it works

1. Compute the true range for each bar using Atr.new(1) (period 1).
2. Sum the true ranges over the specified length using Sum.new.
3. Calculate the price range: highest high minus lowest low over the same length.
4. Divide the summed true range by the price range, take log10 of the quotient.
5. Divide that result by log10(length) and multiply by 100 to get the final value.
6. Apply the user-defined offset (shift the line horizontally).
7. Return the value as a plot.Line for drawing on the chart.

## Mathematical model

$$
\text{CHOP} = 100 \times \frac{\log_{10}\left(\frac{\sum_{i=1}^{\text{length}} \text{ATR}_i}{\text{highest}(\text{high}, \text{length}) - \text{lowest}(\text{low}, \text{length})}\right)}{\log_{10}(\text{length})}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 1 |  |
| `offset` | int | 0 | -500 - 500 |  |

## Code walkthrough

### Indicator declaration and UI parameters

Lines 8-13 of [Choppiness Index.indie5](Choppiness%20Index.indie5):

```python
@indicator('CHOP', format=format.PRICE)  # Choppiness Index
@param.int('length', default=14, min=1)
@param.int('offset', default=0, min=-500, max=500)
@band(38.2, 61.8, line_color=color.GRAY, fill_color=color.AQUA(0.1), title='Background')
@level(50, line_color=color.GRAY(0.5), title='Middle Band')
@plot.line(color=color.BLUE, title='CHOP')
```

The @indicator decorator sets the short name 'CHOP' and price format. @param.int defines two user-adjustable integers: length (lookback period, default 14) and offset (horizontal shift, default 0). @band and @level draw reference zones and a centerline on the chart. @plot.line specifies the output line style.

### Price range calculation

Lines 15-15 of [Choppiness Index.indie5](Choppiness%20Index.indie5):

```python
    hl = Highest.new(self.high, length)[0] - Lowest.new(self.low, length)[0]
```

Highest.new and Lowest.new compute the maximum high and minimum low over the given length. Their difference (hl) represents the total price excursion during the period. Both algorithms return series; [0] fetches the current bar's value.

### Choppiness formula and output

Lines 16-17 of [Choppiness Index.indie5](Choppiness%20Index.indie5):

```python
    res = 100 * divide(log10(divide(Sum.new(Atr.new(1), length)[0], hl)), log10(length))
    return plot.Line(res, offset=offset)
```

Atr.new(1) produces the true range for each bar; Sum.new sums these over the length. The ratio of summed true range to hl is passed through log10 twice (once on the ratio, once on length) and scaled by 100. The divide helper handles division-by-zero safely. The result is returned as a plot.Line with the user-specified offset.

## Reading the chart

- The blue line oscillates between 0 and 100.
- Values above 61.8 (upper band) indicate a choppy, sideways market.
- Values below 38.2 (lower band) indicate a strong trending market.
- The aqua fill between bands highlights the neutral zone.
- The gray line at 50 is the midline; values above it lean choppy, below lean trending.
- The offset parameter shifts the line left (negative) or right (positive) for visual alignment.

## Implementation notes

- Uses log10; the divide function prevents division by zero when hl is zero (e.g., all bars identical).
- Atr.new(1) is equivalent to true range (max of high-low, high-prevClose, prevClose-low).
- The offset parameter does not affect the computation, only the horizontal placement of the plotted line.
- The indicator repaints because it uses current bar's high, low, and close for ATR; historical values are fixed.

## FAQ

**What does the length parameter control?**

Length sets the lookback period for summing true ranges and computing the highest high/lowest low. A longer length smooths the indicator but makes it less responsive.

**How should I interpret values near 50?**

Values around 50 indicate a balanced market with no clear trend or chop. The midline at 50 is a reference; crossing above 61.8 suggests increasing choppiness, below 38.2 suggests a trend.

**Can I change the band levels?**

The bands at 38.2 and 61.8 are hardcoded in the @band decorator. To modify them, you would need to edit the source code and change the numbers in that line.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from math import log10
from indie import indicator, format, param, band, color, level, plot
from indie.algorithms import Highest, Lowest, Sum, Atr
from indie.math import divide


@indicator('CHOP', format=format.PRICE)  # Choppiness Index
@param.int('length', default=14, min=1)
@param.int('offset', default=0, min=-500, max=500)
@band(38.2, 61.8, line_color=color.GRAY, fill_color=color.AQUA(0.1), title='Background')
@level(50, line_color=color.GRAY(0.5), title='Middle Band')
@plot.line(color=color.BLUE, title='CHOP')
def Main(self, length, offset):
    hl = Highest.new(self.high, length)[0] - Lowest.new(self.low, length)[0]
    res = 100 * divide(log10(divide(Sum.new(Atr.new(1), length)[0], hl)), log10(length))
    return plot.Line(res, offset=offset)
```
