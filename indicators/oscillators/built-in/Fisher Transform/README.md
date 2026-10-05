# Fisher Transform (Fisher) - Built-in Indicator Guide

> Computes the Fisher Transform to identify potential price reversals by normalizing price into a Gaussian distribution.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#fisher-transform) |
| **Source file** | [Fisher Transform.indie5](Fisher%20Transform.indie5) |

## Overview

The Fisher Transform indicator attempts to normalize price data so that extreme price movements become rare events, making reversals easier to spot. It is typically used in range-bound or trending markets to detect overbought and oversold conditions that may precede a turn.

The indicator plots two lines: a blue Fisher line and a maroon Trigger line (the previous bar's Fisher value). Horizontal reference levels are drawn at -1.5, -0.75, 0, 0.75, and 1.5. Crossings of the Fisher and Trigger lines, as well as moves beyond the ±1.5 levels, are common signals.

## How it works

1. Compute the highest high and lowest low of the midpoint price (hl2) over the specified length period.
2. Normalize the current hl2 relative to that range: (hl2 - low) / (high - low), then subtract 0.5.
3. Apply a recursive smoothing formula: value = 0.66 * normalized + 0.67 * previous value, then clamp the result to ±0.999.
4. Compute the Fisher Transform: fish = 0.5 * ln((1 + value) / (1 - value)) + 0.5 * previous fish.
5. Output the current Fisher value (blue line) and the previous bar's Fisher value (maroon trigger line).

## Mathematical model

$$
\text{value}_t = \text{round}\left(0.66 \cdot \left(\frac{\text{hl2}_t - \text{low}}{\text{high} - \text{low}} - 0.5\right) + 0.67 \cdot \text{value}_{t-1}\right)
$$

$$
\text{fish}_t = 0.5 \cdot \ln\left(\frac{1 + \text{value}_t}{1 - \text{value}_t}\right) + 0.5 \cdot \text{fish}_{t-1}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 9 | ≥ 1 |  |

## Code walkthrough

### Price range calculation

Lines 30-31 of [Fisher Transform.indie5](Fisher%20Transform.indie5):

```python
    high = Highest.new(self.hl2, length)[0]
    low = Lowest.new(self.hl2, length)[0]
```

The indicator uses the midpoint price (hl2) and computes its highest and lowest values over the lookback period using built-in Highest and Lowest algorithms. These define the range for normalization.

### Recursive value with clamping

Lines 33-35 of [Fisher Transform.indie5](Fisher%20Transform.indie5):

```python
    value = MutSeriesF.new(init=0)
    value[0] = round(0.66 * (divide(self.hl2[0] - low, high - low) - 0.5) + \
                     0.67 * nan_to_zero(value[1]))
```

A MutSeriesF holds the previous value. The current value is a weighted combination of the normalized price and the prior value. The `round` function clamps the result to ±0.999 to avoid singularities in the logarithm. `nan_to_zero` ensures the recursion starts cleanly.

### Fisher Transform computation

Lines 36-37 of [Fisher Transform.indie5](Fisher%20Transform.indie5):

```python
    fish = MutSeriesF.new(init=nan)
    fish[0] = 0.5 * log(divide(1 + value[0], 1 - value[0])) + 0.5 * nan_to_zero(fish[1])
```

The Fisher Transform is applied to the smoothed value using the natural logarithm. The result is also smoothed recursively with the previous fish value. This double smoothing reduces noise and produces a more stable oscillator.

### Output as two series

Lines 38-38 of [Fisher Transform.indie5](Fisher%20Transform.indie5):

```python
    return fish[0], fish[1]
```

The function returns a tuple of the current Fisher value (fish[0]) and the previous bar's Fisher value (fish[1]). These are plotted as the Fisher line and Trigger line respectively, enabling crossover signals.

## Reading the chart

- **Blue line (Fisher)**: The current Fisher Transform value. Moves above +1.5 suggest overbought conditions; below -1.5 suggest oversold.
- **Maroon line (Trigger)**: The previous bar's Fisher value. A crossover of the blue line above the maroon line is a bullish signal; a cross below is bearish.
- **Horizontal levels**: Red lines at -1.5, 0, 1.5 and gray lines at -0.75, 0.75. These help gauge extreme zones and the center line.

## Implementation notes

- The indicator uses hl2 (high+low)/2 as the input price, not close.
- The `round` function clamps values to ±0.999 to avoid division by zero in the logarithm.
- Both the value and fish series are recursively smoothed, making the indicator lag but reducing false signals.
- NaN handling via `nan_to_zero` ensures the recursion starts properly on the first bar.

## FAQ

**What does the length parameter control?**

Length determines the lookback period for the highest and lowest price calculation. A shorter length makes the indicator more responsive, while a longer length smooths it further.

**How do I interpret a Fisher/Trigger crossover?**

When the blue Fisher line crosses above the maroon Trigger line, it suggests upward momentum. A cross below indicates downward momentum. These signals are strongest when near the ±1.5 levels.

**Can I change the input price from hl2 to something else?**

The code uses self.hl2 directly. To use a different price (e.g., close), you would need to modify the source to replace hl2 with the desired series.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from math import isnan, nan, log
from indie import indicator, format, param, level, color, plot, MutSeriesF
from indie.algorithms import Highest, Lowest
from indie.math import divide


def nan_to_zero(val: float) -> float:
    return 0 if isnan(val) else val


def round(val: float) -> float:
    if val > 0.99:
        val = 0.999
    elif val < -0.99:
        val = -0.999
    return val


@indicator('Fisher', format=format.PRICE)  # Fisher Transform
@param.int('length', default=9, min=1)
@level(-1.5, line_color=color.RED, title='-1.5')
@level(-0.75, line_color=color.GRAY, title='-0.75')
@level(0, line_color=color.RED, title='0')
@level(0.75, line_color=color.GRAY, title='0.75')
@level(1.5, line_color=color.RED, title='1.5')
@plot.line(color=color.BLUE, title='Fisher')
@plot.line(color=color.MAROON, title='Trigger')
def Main(self, length):
    high = Highest.new(self.hl2, length)[0]
    low = Lowest.new(self.hl2, length)[0]

    value = MutSeriesF.new(init=0)
    value[0] = round(0.66 * (divide(self.hl2[0] - low, high - low) - 0.5) + \
                     0.67 * nan_to_zero(value[1]))
    fish = MutSeriesF.new(init=nan)
    fish[0] = 0.5 * log(divide(1 + value[0], 1 - value[0])) + 0.5 * nan_to_zero(fish[1])
    return fish[0], fish[1]
```
