# 6EMA - Technical Guide

> Plots up to 6 user-configurable exponential moving averages with independent toggles.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Indicator |
| **Author** | @bnn1 on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/6ema-65) |
| **Source file** | [6EMA.indie5](6EMA.indie5) |

## Overview

This indicator displays multiple Exponential Moving Averages (EMAs) on the price chart. Each of the six EMAs has its own configurable length, visibility toggle, and fixed line color, and they all share a single configurable source. The default periods (9, 21, 50, 100, 200, 365) cover common short-term to long-term trends.

The indicator is designed for traders who want a single overlay to observe multiple trend speeds simultaneously. Each EMA can be independently hidden, making it easy to declutter the chart while keeping only the relevant periods visible. It does not perform any cross-detection or signal generation – it only plots the raw moving averages.

## How it works

1. Define six integer parameters (ema1_length through ema6_length) each with a default and a minimum of 1.
2. Define one source parameter (src) defaulting to the close price.
3. Define six boolean toggle parameters (show_ema1 through show_ema6) defaulting to True.
4. On each bar, for each EMA that is enabled, compute Ema.new(src, length)[0] which returns the current value of the exponential moving average.
5. For disabled EMAs, assign math.nan so nothing is plotted on that bar.
6. Return a tuple of six values, one per EMA, which are rendered as separate plot lines with distinct colors.

## Mathematical model

$$
\text{EMA}_t = \alpha \cdot \text{src}_t + (1-\alpha) \cdot \text{EMA}_{t-1}, \quad \alpha = \frac{2}{\text{length}+1}
$$

The `Ema.new` algorithm applies this recurrence internally, using the `src` series and the chosen `length`.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `ema1_length` | int | 9 | ≥ 1 | EMA 1 Length |
| `ema2_length` | int | 21 | ≥ 1 | EMA 2 Length |
| `ema3_length` | int | 50 | ≥ 1 | EMA 3 Length |
| `ema4_length` | int | 100 | ≥ 1 | EMA 4 Length |
| `ema5_length` | int | 200 | ≥ 1 | EMA 5 Length |
| `ema6_length` | int | 365 | ≥ 1 | EMA 6 Length |
| `src` | source | source.CLOSE |  | Source |
| `show_ema1` | bool | true |  | Show EMA 1 |
| `show_ema2` | bool | true |  | Show EMA 2 |
| `show_ema3` | bool | true |  | Show EMA 3 |
| `show_ema4` | bool | true |  | Show EMA 4 |
| `show_ema5` | bool | true |  | Show EMA 5 |
| `show_ema6` | bool | true |  | Show EMA 6 |

## Code walkthrough

### Parameter definitions

Lines 7-19 of [6EMA.indie5](6EMA.indie5):

```python
@param.int('ema1_length', default=9, min=1, title='EMA 1 Length')
@param.int('ema2_length', default=21, min=1, title='EMA 2 Length')
@param.int('ema3_length', default=50, min=1, title='EMA 3 Length')
@param.int('ema4_length', default=100, min=1, title='EMA 4 Length')
@param.int('ema5_length', default=200, min=1, title='EMA 5 Length')
@param.int('ema6_length', default=365, min=1, title='EMA 6 Length')
@param.source('src', default=source.CLOSE, title='Source')
@param.bool('show_ema1', default=True, title='Show EMA 1')
@param.bool('show_ema2', default=True, title='Show EMA 2')
@param.bool('show_ema3', default=True, title='Show EMA 3')
@param.bool('show_ema4', default=True, title='Show EMA 4')
@param.bool('show_ema5', default=True, title='Show EMA 5')
@param.bool('show_ema6', default=True, title='Show EMA 6')
```

Each EMA gets an integer length parameter with a default and a minimum of 1, plus a boolean toggle to show/hide it. The source for all EMAs is a single configurable parameter (default close). This design gives the user full control over which EMAs appear and from which price they are calculated.

### Plot decorators and colors

Lines 20-25 of [6EMA.indie5](6EMA.indie5):

```python
@plot.line(color=color.BLUE, title='EMA 1')
@plot.line(color=color.GREEN, title='EMA 2')
@plot.line(color=color.WHITE, title='EMA 3')
@plot.line(color=color.RED, title='EMA 4')
@plot.line(color=color.PURPLE, title='EMA 5')
@plot.line(color=color.YELLOW, title='EMA 6')
```

Six @plot.line decorators assign a fixed color and title to each EMA output. The order of decorators matches the order of values returned in Main – the first decorator corresponds to the first returned value (ema1), and so on.

### Conditional computation and NaN handling

Lines 29-37 of [6EMA.indie5](6EMA.indie5):

```python
    # Calculate EMAs
    ema1 = Ema.new(src, ema1_length)[0] if show_ema1 else nan
    ema2 = Ema.new(src, ema2_length)[0] if show_ema2 else nan
    ema3 = Ema.new(src, ema3_length)[0] if show_ema3 else nan
    ema4 = Ema.new(src, ema4_length)[0] if show_ema4 else nan
    ema5 = Ema.new(src, ema5_length)[0] if show_ema5 else nan
    ema6 = Ema.new(src, ema6_length)[0] if show_ema6 else nan
    
    return ema1, ema2, ema3, ema4, ema5, ema6
```

Each EMA is computed only if its show flag is True; otherwise nan is assigned. The `Ema.new(src, length)[0]` call returns the current bar’s EMA value. Using nan for hidden EMAs ensures they produce no visible line on the chart. The six values are returned as a tuple, which the platform renders as separate plot lines.

## Reading the chart

- **Line colors** are fixed: Blue (EMA 1), Green (EMA 2), White (EMA 3), Red (EMA 4), Purple (EMA 5), Yellow (EMA 6). These colors cannot be changed via the settings UI.
- Each line represents the exponential moving average of the selected source over its period.
- A line that is not visible on the chart means its corresponding `Show EMA N` toggle is unchecked.
- The typical interpretation of EMAs applies: shorter periods react faster to price changes, longer periods indicate the dominant trend direction.
- No cross signals or alerts are generated – this indicator only draws the lines.

## Implementation notes

- The EMA calculation uses `Ema.new()` which is a standard exponential moving average; it does not repaint because it only uses current and past data.
- When a toggle is off, `math.nan` is returned for that plot – the platform skips drawing NaN values, effectively hiding the line.
- All six EMAs share the same source series. To use different sources for different EMAs, the code would need to be modified.
- The minimum length is 1; a length of 1 will produce an EMA equal to the source value itself (instant response).

## FAQ

**Can I change the colors of the EMAs?**

The colors are hardcoded in the @plot.line decorators (lines 20-25). To change them, edit those decorators with a different color constant (e.g., color.ORANGE).

**How do I add a seventh EMA?**

You would need to add a new @param.int for the length, a new @param.bool for the toggle, a new @plot.line decorator with a color, and extend the Main function signature and return tuple accordingly.

**Does this indicator repaint or give false signals?**

No. The EMA is a standard non-repainting moving average. Each bar’s value is final once the bar closes. The indicator only plots lines; it does not generate any signals.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/6ema-65).

```python
# indie:lang_version = 5
from math import nan
from indie import indicator, param, source, plot, color
from indie.algorithms import Ema

@indicator('6EMA', overlay_main_pane=True)
@param.int('ema1_length', default=9, min=1, title='EMA 1 Length')
@param.int('ema2_length', default=21, min=1, title='EMA 2 Length')
@param.int('ema3_length', default=50, min=1, title='EMA 3 Length')
@param.int('ema4_length', default=100, min=1, title='EMA 4 Length')
@param.int('ema5_length', default=200, min=1, title='EMA 5 Length')
@param.int('ema6_length', default=365, min=1, title='EMA 6 Length')
@param.source('src', default=source.CLOSE, title='Source')
@param.bool('show_ema1', default=True, title='Show EMA 1')
@param.bool('show_ema2', default=True, title='Show EMA 2')
@param.bool('show_ema3', default=True, title='Show EMA 3')
@param.bool('show_ema4', default=True, title='Show EMA 4')
@param.bool('show_ema5', default=True, title='Show EMA 5')
@param.bool('show_ema6', default=True, title='Show EMA 6')
@plot.line(color=color.BLUE, title='EMA 1')
@plot.line(color=color.GREEN, title='EMA 2')
@plot.line(color=color.WHITE, title='EMA 3')
@plot.line(color=color.RED, title='EMA 4')
@plot.line(color=color.PURPLE, title='EMA 5')
@plot.line(color=color.YELLOW, title='EMA 6')
def Main(self, ema1_length, ema2_length, ema3_length, ema4_length, ema5_length, ema6_length, 
         src, show_ema1, show_ema2, show_ema3, show_ema4, show_ema5, show_ema6):
    
    # Calculate EMAs
    ema1 = Ema.new(src, ema1_length)[0] if show_ema1 else nan
    ema2 = Ema.new(src, ema2_length)[0] if show_ema2 else nan
    ema3 = Ema.new(src, ema3_length)[0] if show_ema3 else nan
    ema4 = Ema.new(src, ema4_length)[0] if show_ema4 else nan
    ema5 = Ema.new(src, ema5_length)[0] if show_ema5 else nan
    ema6 = Ema.new(src, ema6_length)[0] if show_ema6 else nan
    
    return ema1, ema2, ema3, ema4, ema5, ema6
```
