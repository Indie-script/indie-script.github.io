# Balance of Power (BoP) - Built-in Indicator Guide

> Computes the Balance of Power as (close - open) / (high - low) for each bar, indicating buying vs selling pressure.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#balance-of-power) |
| **Source file** | [Balance of Power.indie5](Balance%20of%20Power.indie5) |

## Overview

The Balance of Power (BoP) measures the relative strength of buyers versus sellers within a single price bar. It is calculated as the ratio of the close-to-open difference to the bar's total range. Positive values indicate that buyers dominated (close above open), while negative values indicate seller dominance (close below open). The indicator is typically used to identify shifts in momentum or to confirm price action. On the chart, it is drawn as a red line oscillating around a zero centerline.

## How it works

1. For each bar, retrieve the open, high, low, and close prices.
2. Compute the numerator: close minus open (the directional move).
3. Compute the denominator: high minus low (the total range).
4. Divide the numerator by the denominator using the built-in `divide` function, which safely handles division by zero.
5. Return the result, which is plotted as a red line on a separate scale.

## Mathematical model

$$
\text{BoP} = \frac{\text{close} - \text{open}}{\text{high} - \text{low}}
$$

## Code walkthrough

### Indicator Decorators

Lines 6-7 of [Balance of Power.indie5](Balance%20of%20Power.indie5):

```python
@indicator('BoP', format=format.PRICE)  # Balance of Power
@plot.line(color=color.RED)
```

The `@indicator` decorator registers the script as an indicator named 'BoP' with a price-like format (values are not percentages). The `@plot.line` decorator specifies that the output should be drawn as a red line on the chart.

### Main Function Signature

Lines 8-8 of [Balance of Power.indie5](Balance%20of%20Power.indie5):

```python
def Main(self):
```

The `Main` function takes a `self` parameter (standard for Indie Script indicators). It is called once per bar and must return the value to be plotted.

### Return Statement with Division

Lines 9-9 of [Balance of Power.indie5](Balance%20of%20Power.indie5):

```python
    return divide(self.close[0] - self.open[0], self.high[0] - self.low[0])
```

The core calculation: `self.close[0] - self.open[0]` gives the net price change within the bar, and `self.high[0] - self.low[0]` gives the total range. The `divide` function from `indie.math` is used to safely handle cases where the denominator is zero (e.g., a doji bar), returning `NaN` in that case.

## Reading the chart

- The line oscillates around zero. Positive values (above zero) indicate buying pressure (close above open). Negative values indicate selling pressure (close below open).
- Values near +1 or -1 represent strong directional imbalance; values near zero represent a balanced bar.
- Crossings of the zero line can be interpreted as shifts in intra-bar momentum.
- The indicator is unbounded in theory but practically stays between -1 and 1 because the range is always at least as large as the close-open difference.

## Implementation notes

- Uses `divide` to return `NaN` when high equals low (e.g., doji or flat bar), preventing division by zero errors.
- No parameters or user settings; the calculation is fixed.
- Does not repaint because it only uses current bar data (`[0]` index).
- The indicator is plotted on a separate scale, not overlaid on price.

## FAQ

**What does the Balance of Power indicator measure?**

It measures the relative strength of buyers versus sellers within a single bar by comparing the close-to-open change to the total bar range.

**How should I interpret a zero value?**

A zero value indicates that the close equals the open, meaning no net directional pressure during the bar. It can also occur when the bar range is zero (doji), in which case the value is NaN and not plotted.

**What happens when high equals low (e.g., a flat bar)?**

The `divide` function returns `NaN` (not a number), so no value is plotted for that bar. This avoids division by zero errors.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, plot, color
from indie.math import divide


@indicator('BoP', format=format.PRICE)  # Balance of Power
@plot.line(color=color.RED)
def Main(self):
    return divide(self.close[0] - self.open[0], self.high[0] - self.low[0])
```
