# VWAP - Technical Guide

> Plots VWAP with two customizable standard deviation bands and fills.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volume |
| **Type** | Indicator |
| **Author** | @blackopsomw3 on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/vwap-87) |
| **Source file** | [VWAP.indie5](VWAP.indie5) |

## Overview

This indicator displays the Volume-Weighted Average Price (VWAP) along with two sets of standard deviation bands (1σ and 2σ) that expand and contract based on price dispersion. It is commonly used by traders to identify intraday trends, potential support/resistance levels, and overextended price moves relative to the volume-weighted mean.

The VWAP line is drawn in blue, the 1σ bands in green with a light fill, and the 2σ bands in red with a lighter fill. The 1σ fill is green at 10% opacity, and the 2σ fill is red at 5% opacity. The anchor parameter controls the period over which VWAP resets (Session, Week, Month, or Year), and the source input (default HLC3) determines the price used in the calculation.

## How it works

1. The indicator calls the built-in Vwap algorithm twice with the same source and anchor but different standard deviation multipliers.
2. The first call returns the VWAP line and the 1σ upper/lower bands (using std_dev_1).
3. The second call returns the VWAP line and the 2σ upper/lower bands (using std_dev_2). The VWAP line is identical to the first call's result and is ignored.
4. All five series are indexed with [0] to get the current bar's values and returned in a tuple.
5. Two plot.Fill() objects are returned to create the shaded regions between the 1σ bands and between the 2σ bands.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `src` | source | source.HLC3 |  | Source |
| `anchor` | str | Session |  | Anchor |
| `std_dev_1` | float | 1.0 | 0.1 - 5.0 | Standard Deviation 1 |
| `std_dev_2` | float | 2.0 | 0.1 - 5.0 | Standard Deviation 2 |

## Code walkthrough

### Indicator Definition and Parameters

Lines 5-16 of [VWAP.indie5](VWAP.indie5):

```python
@indicator('VWAP with Standard Deviation Bands', overlay_main_pane=True)
@param.source('src', default=source.HLC3, title='Source')
@param.str('anchor', default='Session', options=['Session', 'Week', 'Month', 'Year'], title='Anchor')
@param.float('std_dev_1', default=1.0, min=0.1, max=5.0, step=0.1, title='Standard Deviation 1')
@param.float('std_dev_2', default=2.0, min=0.1, max=5.0, step=0.1, title='Standard Deviation 2')
@plot.line('vwap', title='VWAP', color=color.BLUE, line_width=2)
@plot.line('upper_1', title='Upper Band 1σ', color=color.GREEN)
@plot.line('lower_1', title='Lower Band 1σ', color=color.GREEN)
@plot.line('upper_2', title='Upper Band 2σ', color=color.RED)
@plot.line('lower_2', title='Lower Band 2σ', color=color.RED)
@plot.fill('upper_1', 'lower_1', color=color.GREEN(0.1), title='1σ Band')
@plot.fill('upper_2', 'lower_2', color=color.RED(0.05), title='2σ Band')
```

The indicator is named 'VWAP with Standard Deviation Bands' and set to overlay on the main chart pane. Parameters include the price source (default HLC3), anchor period (Session/Week/Month/Year), and two standard deviation multipliers (default 1.0 and 2.0). The @plot decorators define five lines and two fills with specific colors and transparency.

### Main Function and Vwap Calls

Lines 17-22 of [VWAP.indie5](VWAP.indie5):

```python
def Main(self, src, anchor, std_dev_1, std_dev_2):
    # Get VWAP with 1 standard deviation bands
    vwap_1, upper_1, lower_1 = Vwap.new(src, anchor, std_dev_1)
    
    # Get VWAP with 2 standard deviation bands (we only need the bands, VWAP line is the same)
    vwap_2, upper_2, lower_2 = Vwap.new(src, anchor, std_dev_2)
```

The Main function receives the parameters and calls Vwap.new twice. The first call uses std_dev_1 to get the VWAP line and the 1σ bands. The second call uses std_dev_2 to get the 2σ bands. Both calls use the same source and anchor, so the VWAP line is identical; only the bands differ.

### Return Tuple with Series and Fills

Lines 24-32 of [VWAP.indie5](VWAP.indie5):

```python
    return (
        vwap_1[0],      # VWAP line
        upper_1[0],     # Upper 1σ band
        lower_1[0],     # Lower 1σ band  
        upper_2[0],     # Upper 2σ band
        lower_2[0],     # Lower 2σ band
        plot.Fill(),    # Fill for 1σ band
        plot.Fill()     # Fill for 2σ band
    )
```

The function returns a tuple containing the current bar values of the five series (vwap, upper_1, lower_1, upper_2, lower_2) and two plot.Fill() objects. The fills are automatically linked to the corresponding band lines via the @plot.fill decorators (lines 15-16), creating the shaded regions between the 1σ and 2σ bands.

## Reading the chart

- **Blue line**: VWAP – the volume-weighted average price over the anchor period. Acts as a dynamic support/resistance and trend gauge.
- **Green bands (1σ)**: Upper and lower bands at one standard deviation from VWAP. Price often oscillates within this range; a break outside may signal a strong move.
- **Red bands (2σ)**: Upper and lower bands at two standard deviations. Price reaching these levels is statistically extreme and may indicate overbought/oversold conditions.
- **Fills**: Semi-transparent green fill between the 1σ bands and red fill between the 2σ bands, making the bands visually distinct.

## Implementation notes

- The VWAP line is computed twice internally (lines 19 and 22) but only the first result is used; this is redundant but harmless.
- The anchor parameter resets the VWAP calculation at the start of each new session, week, month, or year, affecting the cumulative sums.
- The source parameter allows using any price (close, HLC3, OHLC4, etc.) instead of the typical typical price.
- The indicator does not repaint because VWAP is a cumulative calculation that only uses past and current bar data.

## FAQ

**How do I change the anchor period?**

Modify the 'Anchor' parameter in the indicator settings. Options are Session, Week, Month, and Year. The VWAP calculation will reset at the beginning of each new period.

**What do the standard deviation bands represent?**

The bands are VWAP ± k * σ, where σ is the standard deviation of price from VWAP (weighted by volume). They show how far price has deviated from the volume-weighted average. The 1σ bands contain about 68% of price action, and the 2σ bands about 95% under a normal distribution.

**Can I customize the colors or line widths?**

Yes. The @plot decorators define the colors and line widths. You can edit the source code to change the color constants (e.g., color.BLUE) or line_width values. The fill transparency is set via the alpha parameter in color.GREEN(0.1) and color.RED(0.05).

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/vwap-87).

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Vwap

@indicator('VWAP with Standard Deviation Bands', overlay_main_pane=True)
@param.source('src', default=source.HLC3, title='Source')
@param.str('anchor', default='Session', options=['Session', 'Week', 'Month', 'Year'], title='Anchor')
@param.float('std_dev_1', default=1.0, min=0.1, max=5.0, step=0.1, title='Standard Deviation 1')
@param.float('std_dev_2', default=2.0, min=0.1, max=5.0, step=0.1, title='Standard Deviation 2')
@plot.line('vwap', title='VWAP', color=color.BLUE, line_width=2)
@plot.line('upper_1', title='Upper Band 1σ', color=color.GREEN)
@plot.line('lower_1', title='Lower Band 1σ', color=color.GREEN)
@plot.line('upper_2', title='Upper Band 2σ', color=color.RED)
@plot.line('lower_2', title='Lower Band 2σ', color=color.RED)
@plot.fill('upper_1', 'lower_1', color=color.GREEN(0.1), title='1σ Band')
@plot.fill('upper_2', 'lower_2', color=color.RED(0.05), title='2σ Band')
def Main(self, src, anchor, std_dev_1, std_dev_2):
    # Get VWAP with 1 standard deviation bands
    vwap_1, upper_1, lower_1 = Vwap.new(src, anchor, std_dev_1)
    
    # Get VWAP with 2 standard deviation bands (we only need the bands, VWAP line is the same)
    vwap_2, upper_2, lower_2 = Vwap.new(src, anchor, std_dev_2)
    
    return (
        vwap_1[0],      # VWAP line
        upper_1[0],     # Upper 1σ band
        lower_1[0],     # Lower 1σ band  
        upper_2[0],     # Upper 2σ band
        lower_2[0],     # Lower 2σ band
        plot.Fill(),    # Fill for 1σ band
        plot.Fill()     # Fill for 2σ band
    )
```
