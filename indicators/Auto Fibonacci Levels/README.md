---
category: support-resistance
description: "Automatically calculates and plots Fibonacci retracement levels based on highest and lowest closing prices over a user-defined period."
---
# Auto Fibonacci Levels - Technical Guide

> Automatically calculates and plots Fibonacci retracement levels based on highest and lowest closing prices over a user-defined period.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Support & resistance |
| **Type** | Indicator |
| **Author** | @insurgent on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/auto-fibonacci-levels-73) |
| **Source file** | [Auto Fibonacci Levels.indie5](Auto%20Fibonacci%20Levels.indie5) |

## Overview

Auto Fibonacci Levels is a technical indicator that dynamically identifies the highest and lowest closing prices over a specified lookback period and draws seven standard Fibonacci retracement levels (0%, 23.6%, 38.2%, 50%, 61.8%, 76.4%, 100%) directly on the price chart. The levels are computed from the range between the maximum and minimum close, providing a structured view of potential support and resistance zones.

The indicator is designed for both trending and ranging markets, helping traders visualize where price may react relative to recent closing price extremes. Colored fills between consecutive levels highlight the zones, making it easy to assess the current price position within the Fibonacci grid. All levels update bar by bar as new closing prices enter the calculation window.

## How it works

1. Tracks the highest closing price over the last `fiblength` bars using `Highest.new(self.close, fiblength)[0]`.
2. Tracks the lowest closing price over the same period using `Lowest.new(self.close, fiblength)[0]`.
3. Computes the range as the difference between the highest and lowest close.
4. Calculates seven Fibonacci levels by subtracting or adding fixed percentages (0.236, 0.382, 0.5) of the range from the high or low.
5. Plots each level as a colored line with a distinct color and title.
6. Fills the areas between consecutive levels with semi-transparent colors to create visual zones.

## Mathematical model

$$
\begin{aligned}
&\text{maxr} = \max(\text{close}[t - \text{fiblength} + 1 \,..\, t]) \\
&\text{minr} = \min(\text{close}[t - \text{fiblength} + 1 \,..\, t]) \\
&\text{ranr} = \text{maxr} - \text{minr} \\
&\text{level\_one} = \text{maxr} \\
&\text{level\_764} = \text{maxr} - 0.236 \cdot \text{ranr} \\
&\text{level\_618} = \text{maxr} - 0.382 \cdot \text{ranr} \\
&\text{level\_50} = \text{maxr} - 0.5 \cdot \text{ranr} \\
&\text{level\_382} = \text{minr} + 0.382 \cdot \text{ranr} \\
&\text{level\_236} = \text{minr} + 0.236 \cdot \text{ranr} \\
&\text{level\_zero} = \text{minr}
\end{aligned}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `fiblength` | int | 265 | ≥ 1 | Fib Length |

## Code walkthrough

### Parameter and plot setup

Lines 6-22 of [Auto Fibonacci Levels.indie5](Auto%20Fibonacci%20Levels.indie5):

```python
@indicator('AutoFib', overlay_main_pane=True)
@param.int('fiblength', default=265, min=1, title='Fib Length')
# Plot lines (7 lines for Fibonacci levels)
@plot.line('p_one', title='1', color=color.BLACK)
@plot.line('p_764', title='0.764', color=rgba(51, 153, 255))
@plot.line('p_618', title='0.618', color=color.BLUE)
@plot.line('p_50', title='0.5', color=color.LIME)
@plot.line('p_382', title='0.382', color=color.GREEN)
@plot.line('p_236', title='0.236', color=color.RED)
@plot.line('p_zero', title='0', color=color.BLACK)
# Fills between plots (6 fills)
@plot.fill('p_one', 'p_764', color=color.RED(0.3))
@plot.fill('p_764', 'p_618', color=rgba(51, 153, 255, 0.3))
@plot.fill('p_618', 'p_50', color=color.LIME(0.3))
@plot.fill('p_50', 'p_382', color=color.LIME(0.3))
@plot.fill('p_382', 'p_236', color=rgba(51, 153, 255, 0.3))
@plot.fill('p_236', 'p_zero', color=color.RED(0.3))
```

The indicator is declared with `overlay_main_pane=True` so it draws on the price chart. A single integer parameter `fiblength` (default 265, minimum 1) controls the lookback period. Seven plot lines are defined with distinct colors and titles, and six fills between consecutive levels use semi-transparent colors to create visual zones.

### Core calculation of extremes and range

Lines 24-27 of [Auto Fibonacci Levels.indie5](Auto%20Fibonacci%20Levels.indie5):

```python
    # Calculate highest and lowest close over the period
    maxr = Highest.new(self.close, fiblength)[0]
    minr = Lowest.new(self.close, fiblength)[0]
    ranr = maxr - minr
```

`Highest.new` and `Lowest.new` compute the maximum and minimum closing prices over the last `fiblength` bars. The `[0]` index retrieves the current bar's value. The range `ranr` is the difference between these extremes, used as the base for all Fibonacci levels.

### Fibonacci level computation

Lines 29-36 of [Auto Fibonacci Levels.indie5](Auto%20Fibonacci%20Levels.indie5):

```python
    # Calculate Fibonacci levels
    level_one = maxr                      # 1.0 (100%)
    level_764 = maxr - 0.236 * ranr       # 0.764 (76.4%)
    level_618 = maxr - 0.382 * ranr       # 0.618 (61.8%)
    level_50 = maxr - 0.50 * ranr         # 0.5 (50%)
    level_382 = minr + 0.382 * ranr       # 0.382 (38.2%)
    level_236 = minr + 0.236 * ranr       # 0.236 (23.6%)
    level_zero = minr                     # 0 (0%)
```

Seven levels are derived from the high (`maxr`) and low (`minr`) by subtracting or adding fixed fractions of the range. The 0% level equals the low, the 100% level equals the high, and intermediate levels are placed at 23.6%, 38.2%, 50%, 61.8%, and 76.4% retracements from the low.

### Return tuple with lines and fills

Lines 38-53 of [Auto Fibonacci Levels.indie5](Auto%20Fibonacci%20Levels.indie5):

```python
    # Return all levels and fills
    return (
        level_one,
        level_764,
        level_618,
        level_50,
        level_382,
        level_236,
        level_zero,
        plot.Fill(),
        plot.Fill(),
        plot.Fill(),
        plot.Fill(),
        plot.Fill(),
        plot.Fill()
    )
```

The `Main` function returns a tuple of seven level values followed by six `plot.Fill()` objects. Each `plot.Fill()` corresponds to the fill defined in the decorators (lines 17-22), connecting the adjacent plot lines. The order must match the decorator order exactly.

## Reading the chart

- The topmost line (black) represents the highest close over the period (100% retracement level).
- The bottommost line (black) represents the lowest close over the period (0% retracement level).
- Intermediate lines are colored: 0.764 (light blue), 0.618 (blue), 0.5 (lime), 0.382 (green), 0.236 (red).
- Fills between consecutive levels use semi-transparent colors: red between 1.0 and 0.764, light blue between 0.764 and 0.618, lime between 0.618 and 0.5, lime between 0.5 and 0.382, light blue between 0.382 and 0.236, red between 0.236 and 0.0.
- Price crossing or hovering near a level may indicate potential support or resistance; the fills help visualize the current price zone.
- All levels shift dynamically as new bars close, updating the extremes and the entire Fibonacci grid.

## Implementation notes

- The indicator uses only closing prices, not high/low prices, so levels may differ from traditional Fibonacci drawn from price extremes.
- The lookback period `fiblength` defaults to 265 bars, which is roughly one trading year; adjust for shorter or longer analysis windows.
- Levels are recalculated every bar and may change significantly when a new extreme close enters or leaves the window.
- The fills are purely visual and do not affect calculations; they are drawn between the plot lines using the `plot.fill` decorators.

## FAQ

**How do I change the lookback period for the Fibonacci levels?**

Modify the `fiblength` parameter in the indicator settings. The default is 265 bars; you can set any positive integer.

**Can I use this indicator with high/low prices instead of close?**

The current code uses `self.close` for both highest and lowest calculations. To use high/low, replace `self.close` with `self.high` and `self.low` in lines 25-26.

**Why are the levels based only on closing prices?**

The author chose closing prices to reduce noise from intra-bar extremes and to focus on the settled price range. This makes the levels smoother and less reactive to temporary spikes.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/auto-fibonacci-levels-73).

```python
# indie:lang_version = 5
from indie import indicator, param, color, plot
from indie.color import rgba
from indie.algorithms import Highest, Lowest

@indicator('AutoFib', overlay_main_pane=True)
@param.int('fiblength', default=265, min=1, title='Fib Length')
# Plot lines (7 lines for Fibonacci levels)
@plot.line('p_one', title='1', color=color.BLACK)
@plot.line('p_764', title='0.764', color=rgba(51, 153, 255))
@plot.line('p_618', title='0.618', color=color.BLUE)
@plot.line('p_50', title='0.5', color=color.LIME)
@plot.line('p_382', title='0.382', color=color.GREEN)
@plot.line('p_236', title='0.236', color=color.RED)
@plot.line('p_zero', title='0', color=color.BLACK)
# Fills between plots (6 fills)
@plot.fill('p_one', 'p_764', color=color.RED(0.3))
@plot.fill('p_764', 'p_618', color=rgba(51, 153, 255, 0.3))
@plot.fill('p_618', 'p_50', color=color.LIME(0.3))
@plot.fill('p_50', 'p_382', color=color.LIME(0.3))
@plot.fill('p_382', 'p_236', color=rgba(51, 153, 255, 0.3))
@plot.fill('p_236', 'p_zero', color=color.RED(0.3))
def Main(self, fiblength):
    # Calculate highest and lowest close over the period
    maxr = Highest.new(self.close, fiblength)[0]
    minr = Lowest.new(self.close, fiblength)[0]
    ranr = maxr - minr
    
    # Calculate Fibonacci levels
    level_one = maxr                      # 1.0 (100%)
    level_764 = maxr - 0.236 * ranr       # 0.764 (76.4%)
    level_618 = maxr - 0.382 * ranr       # 0.618 (61.8%)
    level_50 = maxr - 0.50 * ranr         # 0.5 (50%)
    level_382 = minr + 0.382 * ranr       # 0.382 (38.2%)
    level_236 = minr + 0.236 * ranr       # 0.236 (23.6%)
    level_zero = minr                     # 0 (0%)
    
    # Return all levels and fills
    return (
        level_one,
        level_764,
        level_618,
        level_50,
        level_382,
        level_236,
        level_zero,
        plot.Fill(),
        plot.Fill(),
        plot.Fill(),
        plot.Fill(),
        plot.Fill(),
        plot.Fill()
    )
```
