# EMA Trend Bars - Technical Guide

> Colors bars based on whether HLC3 is above or below an EMA to show trend direction.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Indicator |
| **Author** | @insurgent on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/ema-trend-bars-5) |
| **Source file** | [EMA Trend Bars.indie5](EMA%20Trend%20Bars.indie5) |

## Overview

This indicator paints each price bar green or red depending on its position relative to an Exponential Moving Average (EMA). It uses the HLC3 price (High + Low + Close divided by 3) instead of the close alone to reduce noise from intra-bar spikes. On each bar, if HLC3 is at or above the EMA the bar is colored lime (bullish); otherwise it is red (bearish).

Traders can use the bar colors as a quick visual trend filter for intraday, swing or position trading. The EMA period is adjustable and the EMA line can be shown or hidden. The colored bars make it easy to stay on the right side of the trend and avoid counter-trend entries.

## How it works

1. Select bar data: compute HLC3 = (High + Low + Close) / 3 for the current bar.
2. Calculate EMA of the close with the user-specified length (default 34).
3. Compare the current HLC3 value to the current EMA value.
4. If HLC3 >= EMA, set the bar color to lime (bullish); otherwise set it to red (bearish).
5. When the EMA line is enabled, draw it with the same color as the bar for that bar.
6. Return the EMA line (or NaN to hide it) and a bar color instruction for the chart.

## Mathematical model

$$
\text{HLC3} = \frac{\text{High} + \text{Low} + \text{Close}}{3}
$$

$$
\text{Bar color} = \begin{cases}
\text{LIME}, & \text{if } \text{HLC3} \geq \text{EMA}_n \\
\text{RED}, & \text{otherwise}
\end{cases}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `ema_length` | int | 34 | 1 - 300 | EMA UpTrend |
| `show_ema` | bool | true |  | Show EMA Trend is Based On? |

## Code walkthrough

### Input parameters and decorators

Lines 7-11 of [EMA Trend Bars.indie5](EMA%20Trend%20Bars.indie5):

```python
@indicator('EMA Trend Bars', overlay_main_pane=True)
@param.int('ema_length', default=34, min=1, max=300, title='EMA UpTrend')
@param.bool('show_ema', default=True, title='Show EMA Trend is Based On?')
@plot.line(color=color.WHITE, line_width=3, title='EMA')
@plot.bar_color(title='Bar Color')
```

The @indicator decorator sets the script name and places it in the main chart pane. @param.int and @param.bool define user-adjustable settings: the EMA period and a toggle to show/hide the EMA line. @plot.line and @plot.bar_color register the two outputs with the chart engine.

### EMA calculation and HLC3 retrieval

Lines 13-15 of [EMA Trend Bars.indie5](EMA%20Trend%20Bars.indie5):

```python
    used_ema = Ema.new(self.close, length=ema_length)
    hlc3_val = self.hlc3[0]
    ema_val = used_ema[0]
```

Ema.new(...) creates a new EMA series from the close prices with the chosen length. The current bar's HLC3 is obtained via self.hlc3[0], and the current EMA value via used_ema[0]. Both values are used immediately for the bar's decision.

### Color logic and conditional EMA line

Lines 17-24 of [EMA Trend Bars.indie5](EMA%20Trend%20Bars.indie5):

```python
    is_up = hlc3_val >= ema_val

    # Bar coloring: lime when HLC3 >= EMA, red otherwise
    bar_col = color.LIME if is_up else color.RED

    # EMA line with conditional color (hidden via NaN when toggled off)
    ema_color = color.LIME if is_up else color.RED
    ema_line = plot.Line(ema_val, color=ema_color) if show_ema else plot.Line(nan)
```

The boolean is_up is true when HLC3 >= EMA. The bar color is lime or red accordingly. The EMA line, if enabled, receives the same color as the bar; if disabled, it is set to math.nan so nothing is drawn for that bar.

### Return statement

Lines 26-26 of [EMA Trend Bars.indie5](EMA%20Trend%20Bars.indie5):

```python
    return ema_line, plot.BarColor(bar_col)
```

The function returns a tuple of two plot objects: the EMA line (a plot.Line) and a bar color directive (plot.BarColor). The chart engine uses these to update the visual state of each bar.

## Reading the chart

* **Lime bars** (green): HLC3 is at or above the EMA, suggesting bullish momentum. Traders may favor long entries or avoid short setups.
* **Red bars**: HLC3 is below the EMA, indicating bearish momentum. Traders may favor short entries or avoid long setups.
* Optionally, an EMA line matching the bar color is drawn on the chart for reference. If hidden, only bar colors are visible.

## Implementation notes

- The indicator repaints only on the current bar since it compares HLC3[0] with EMA[0] of the same bar. Historical bars are not recalculated.
- When show_ema is false, the EMA line is hidden by returning math.nan. The bar colors still depend on the EMA value internally.
- The EMA is calculated over self.close (the closing price), not over HLC3. This is a design choice to keep the trend reference consistent with the close price series.
- The default period of 34 is commonly used in swing trading; periods as low as 1 can produce noisy colors.

## FAQ

**Can I use a different price source for the EMA?**

The code uses self.close for the EMA. To use HLC3 or another price, replace self.close in the Ema.new call with the desired series (e.g., self.hlc3).

**Why does the bar color sometimes flicker?**

Because the color decision is made bar by bar using current values, a single bar can change color as new ticks arrive. This is normal non-repainting behavior for real-time indicators.

**How do I change the EMA line to a dotted style?**

Modify the @plot.line decorator on line 10 to add extra styling parameters such as line_style='dashed'. You can also change the line_width or color presets there.

## Attribution

Inspired by the idea of ChrisMoody's EMA Trend Bars. Not affiliated with or endorsed by the original author.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/ema-trend-bars-5).

```python
# indie:lang_version = 5
from math import nan
from indie import indicator, param, plot, color
from indie.algorithms import Ema


@indicator('EMA Trend Bars', overlay_main_pane=True)
@param.int('ema_length', default=34, min=1, max=300, title='EMA UpTrend')
@param.bool('show_ema', default=True, title='Show EMA Trend is Based On?')
@plot.line(color=color.WHITE, line_width=3, title='EMA')
@plot.bar_color(title='Bar Color')
def Main(self, ema_length, show_ema):
    used_ema = Ema.new(self.close, length=ema_length)
    hlc3_val = self.hlc3[0]
    ema_val = used_ema[0]

    is_up = hlc3_val >= ema_val

    # Bar coloring: lime when HLC3 >= EMA, red otherwise
    bar_col = color.LIME if is_up else color.RED

    # EMA line with conditional color (hidden via NaN when toggled off)
    ema_color = color.LIME if is_up else color.RED
    ema_line = plot.Line(ema_val, color=ema_color) if show_ema else plot.Line(nan)

    return ema_line, plot.BarColor(bar_col)
```
