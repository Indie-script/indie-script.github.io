# MTC - Rainbow 30er - Technical Guide

> Computes 20 simple moving averages (periods 5 to 62) with gradient-colored fills to visualize trend direction and strength.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Indicator |
| **Author** | @mustermann84 on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/mtc-rainbow-30er-7) |
| **Source file** | [MTC - Rainbow 30er.indie5](MTC%20-%20Rainbow%2030er.indie5) |

## Overview

The MTC Rainbow Indicator plots 20 simple moving averages (SMAs) with periods ranging from 5 to 62, each assigned a distinct color from red to magenta. The area between consecutive MAs is filled with semi-transparent colors, creating a rainbow-like band. This visual tool helps traders quickly assess trend alignment: when shorter MAs are above longer ones and all slope upward, it indicates an uptrend; the opposite indicates a downtrend. The MAs also act as dynamic support and resistance levels.

The indicator is designed for trend identification, spotting potential reversals when the order of MAs changes, and providing entry/exit signals when price crosses the shorter MAs. The gradient fills make it easy to see the spread between MAs, which can indicate trend strength (narrow spread = consolidation, wide spread = strong trend).

## How it works

1. For each bar, compute 20 simple moving averages of the close price with periods 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62.
2. Each SMA is plotted as a line with a specific color from red (period 5) to magenta (period 62).
3. The area between each pair of consecutive MAs is filled with a semi-transparent color, creating a continuous rainbow band.
4. The indicator overlays on the main price pane.
5. No user parameters are exposed; the periods and colors are hardcoded.

## Mathematical model

$$
\text{SMA}_n = \frac{1}{n} \sum_{i=0}^{n-1} \text{close}_{t-i}
$$

## Code walkthrough

### Indicator and plot decorators

Lines 5-26 of [MTC - Rainbow 30er.indie5](MTC%20-%20Rainbow%2030er.indie5):

```python
# Rainbow Indicator mit 30 Linien. UPDATE: Changed to 20 lines
@indicator('MTC-Rainbow Indicator', overlay_main_pane=True)
@plot.line('gma_5', color=color.rgba(255, 0, 0, 1))   # Rot
@plot.line('gma_8', color=color.rgba(255, 64, 0, 1))  # Helles Orange
@plot.line('gma_11', color=color.rgba(255, 128, 0, 1)) # Orange
@plot.line('gma_14', color=color.rgba(255, 192, 0, 1)) # Hellorange
@plot.line('gma_17', color=color.rgba(224, 255, 0, 1)) # Übergang zu Grün
@plot.line('gma_20', color=color.rgba(160, 255, 0, 1)) # Gelbgrün
@plot.line('gma_23', color=color.rgba(96, 255, 0, 1))  # Hellgrün
@plot.line('gma_26', color=color.rgba(0, 255, 64, 1))  # Grasgrün
@plot.line('gma_29', color=color.rgba(0, 255, 128, 1)) # Übergang zu Blau
@plot.line('gma_32', color=color.rgba(0, 255, 192, 1)) # Türkis
@plot.line('gma_35', color=color.rgba(0, 224, 255, 1)) # Hellblau
@plot.line('gma_38', color=color.rgba(0, 160, 255, 1)) # Himmelblau
@plot.line('gma_41', color=color.rgba(0, 96, 255, 1))  # Königsblau
@plot.line('gma_44', color=color.rgba(37, 0, 224, 1))  # Indigo
@plot.line('gma_47', color=color.rgba(75, 0, 192, 1))  # Dunkelviolett
@plot.line('gma_50', color=color.rgba(112, 0, 160, 1)) # Übergang zu Violett
@plot.line('gma_53', color=color.rgba(150, 0, 128, 1)) # Violett
@plot.line('gma_56', color=color.rgba(188, 0, 96, 1))  # Magentaviolett
@plot.line('gma_59', color=color.rgba(225, 0, 64, 1))  # Dunkelrosa
@plot.line('gma_62', color=color.rgba(238, 130, 238, 1)) # Magenta
```

The @indicator decorator sets the indicator name and places it in the main chart pane. The @plot.line decorators define 20 line plots with hardcoded colors ranging from red to magenta. Each line is given a unique name (e.g., 'gma_5') that is used later for fills and return values.

### Fill decorators

Lines 27-45 of [MTC - Rainbow 30er.indie5](MTC%20-%20Rainbow%2030er.indie5):

```python
@plot.fill('gma_5', 'gma_8', color=color.rgba(255, 32, 0, 0.3), id='#fill_20')    # Helles Rot-Orange
@plot.fill('gma_8', 'gma_11', color=color.rgba(255, 96, 0, 0.3), id='#fill_21')   # Helles Orange
@plot.fill('gma_11', 'gma_14', color=color.rgba(255, 160, 0, 0.3), id='#fill_22') # Hellorange
@plot.fill('gma_14', 'gma_17', color=color.rgba(240, 240, 0, 0.3), id='#fill_23') # Hellgelb
@plot.fill('gma_17', 'gma_20', color=color.rgba(192, 240, 0, 0.3), id='#fill_24') # Gelbgrün
@plot.fill('gma_20', 'gma_23', color=color.rgba(128, 240, 0, 0.3), id='#fill_25') # Apfelgrün
@plot.fill('gma_23', 'gma_26', color=color.rgba(64, 240, 0, 0.3), id='#fill_26')  # Hellgrün
@plot.fill('gma_26', 'gma_29', color=color.rgba(0, 240, 64, 0.3), id='#fill_27')  # Grasgrün
@plot.fill('gma_29', 'gma_32', color=color.rgba(0, 240, 128, 0.3), id='#fill_28') # Türkisgrün
@plot.fill('gma_32', 'gma_35', color=color.rgba(0, 208, 192, 0.3), id='#fill_29') # Türkisblau
@plot.fill('gma_35', 'gma_38', color=color.rgba(0, 160, 224, 0.3), id='#fill_30') # Himmelblau
@plot.fill('gma_38', 'gma_41', color=color.rgba(0, 112, 240, 0.3), id='#fill_31') # Königsblau
@plot.fill('gma_41', 'gma_44', color=color.rgba(0, 64, 240, 0.3), id='#fill_32')  # Tiefblau
@plot.fill('gma_44', 'gma_47', color=color.rgba(28, 0, 208, 0.3), id='#fill_33')  # Indigo
@plot.fill('gma_47', 'gma_50', color=color.rgba(56, 0, 176, 0.3), id='#fill_34')  # Dunkelindigo
@plot.fill('gma_50', 'gma_53', color=color.rgba(84, 0, 144, 0.3), id='#fill_35')  # Violett
@plot.fill('gma_53', 'gma_56', color=color.rgba(112, 0, 112, 0.3), id='#fill_36') # Purpur
@plot.fill('gma_56', 'gma_59', color=color.rgba(140, 0, 80, 0.3), id='#fill_37')  # Dunkelrosa
@plot.fill('gma_59', 'gma_62', color=color.rgba(204, 0, 96, 0.3), id='#fill_38')  # Helles Magenta
```

Each @plot.fill decorator creates a semi-transparent fill between two consecutive line plots. The colors transition smoothly from red-orange to magenta, matching the line colors. The fills are assigned unique IDs (e.g., '#fill_20') to avoid conflicts.

### Main function – SMA computation

Lines 46-66 of [MTC - Rainbow 30er.indie5](MTC%20-%20Rainbow%2030er.indie5):

```python
def Main(self):
    gma_5 = Sma.new(self.close, 5)
    gma_8 = Sma.new(self.close, 8)
    gma_11 = Sma.new(self.close, 11)
    gma_14 = Sma.new(self.close, 14)
    gma_17 = Sma.new(self.close, 17)
    gma_20 = Sma.new(self.close, 20)
    gma_23 = Sma.new(self.close, 23)
    gma_26 = Sma.new(self.close, 26)
    gma_29 = Sma.new(self.close, 29)
    gma_32 = Sma.new(self.close, 32)
    gma_35 = Sma.new(self.close, 35)
    gma_38 = Sma.new(self.close, 38)
    gma_41 = Sma.new(self.close, 41)
    gma_44 = Sma.new(self.close, 44)
    gma_47 = Sma.new(self.close, 47)
    gma_50 = Sma.new(self.close, 50)
    gma_53 = Sma.new(self.close, 53)
    gma_56 = Sma.new(self.close, 56)
    gma_59 = Sma.new(self.close, 59)
    gma_62 = Sma.new(self.close, 62)
```

Inside Main, 20 Sma.new calls compute simple moving averages of the close price for periods 5 through 62. Each call returns a series object; the current bar's value is accessed with [0]. The series are stored in local variables matching the plot names.

### Return statement

Lines 68-69 of [MTC - Rainbow 30er.indie5](MTC%20-%20Rainbow%2030er.indie5):

```python
    # Rückgabe der MAs und Füllungen
    return plot.Line(gma_5[0]), plot.Line(gma_8[0]), plot.Line(gma_11[0]), plot.Line(gma_14[0]), plot.Line(gma_17[0]), plot.Line(gma_20[0]), plot.Line(gma_23[0]), plot.Line(gma_26[0]), plot.Line(gma_29[0]), plot.Line(gma_32[0]), plot.Line(gma_35[0]), plot.Line(gma_38[0]), plot.Line(gma_41[0]), plot.Line(gma_44[0]), plot.Line(gma_47[0]), plot.Line(gma_50[0]), plot.Line(gma_53[0]), plot.Line(gma_56[0]), plot.Line(gma_59[0]), plot.Line(gma_62[0]), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill()
```

The function returns a tuple of plot.Line objects (one per SMA) followed by 19 plot.Fill objects. The order must match the decorators: first the 20 lines in ascending period order, then the fills in the same order as the @plot.fill decorators. This tuple is what actually draws the indicator on the chart.

## Reading the chart

- The rainbow band shows the relative ordering of the 20 SMAs. When the shortest MA (red) is above the longest (magenta), the trend is up. When reversed, the trend is down.
- Crossings between MAs indicate potential trend changes or loss of momentum.
- The width of the band (spread between shortest and longest MA) reflects volatility or trend strength: wide band = strong trend, narrow band = consolidation.
- The fills help visually separate the MAs and make the overall direction easier to see at a glance.
- In a ranging market, the MAs may tangle and the rainbow becomes messy, indicating no clear trend.

## Implementation notes

- All moving averages are simple (SMA) and use the close price of the current bar; they do not repaint after the bar closes.
- The indicator has no user-configurable parameters – periods and colors are hardcoded.
- Fills are drawn between consecutive MAs regardless of their order; if MAs cross, the fill still appears but may invert visually.
- The indicator requires at least 62 bars of data to compute all SMAs; earlier bars will show NaN for longer periods.

## FAQ

**Can I change the periods or colors?**

The periods and colors are hardcoded in the source code. You would need to edit the script to modify them.

**How do I interpret the rainbow when lines are tangled?**

When MAs cross frequently, the rainbow may appear messy. This often indicates a ranging market with no clear trend.

**Does this indicator repaint?**

No, the SMAs are computed on the current bar's close and do not change after the bar closes. However, the indicator updates each new bar.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/mtc-rainbow-30er-7).

```python
# indie:lang_version = 5
from indie import indicator, plot, color
from indie.algorithms import Sma

# Rainbow Indicator mit 30 Linien. UPDATE: Changed to 20 lines
@indicator('MTC-Rainbow Indicator', overlay_main_pane=True)
@plot.line('gma_5', color=color.rgba(255, 0, 0, 1))   # Rot
@plot.line('gma_8', color=color.rgba(255, 64, 0, 1))  # Helles Orange
@plot.line('gma_11', color=color.rgba(255, 128, 0, 1)) # Orange
@plot.line('gma_14', color=color.rgba(255, 192, 0, 1)) # Hellorange
@plot.line('gma_17', color=color.rgba(224, 255, 0, 1)) # Übergang zu Grün
@plot.line('gma_20', color=color.rgba(160, 255, 0, 1)) # Gelbgrün
@plot.line('gma_23', color=color.rgba(96, 255, 0, 1))  # Hellgrün
@plot.line('gma_26', color=color.rgba(0, 255, 64, 1))  # Grasgrün
@plot.line('gma_29', color=color.rgba(0, 255, 128, 1)) # Übergang zu Blau
@plot.line('gma_32', color=color.rgba(0, 255, 192, 1)) # Türkis
@plot.line('gma_35', color=color.rgba(0, 224, 255, 1)) # Hellblau
@plot.line('gma_38', color=color.rgba(0, 160, 255, 1)) # Himmelblau
@plot.line('gma_41', color=color.rgba(0, 96, 255, 1))  # Königsblau
@plot.line('gma_44', color=color.rgba(37, 0, 224, 1))  # Indigo
@plot.line('gma_47', color=color.rgba(75, 0, 192, 1))  # Dunkelviolett
@plot.line('gma_50', color=color.rgba(112, 0, 160, 1)) # Übergang zu Violett
@plot.line('gma_53', color=color.rgba(150, 0, 128, 1)) # Violett
@plot.line('gma_56', color=color.rgba(188, 0, 96, 1))  # Magentaviolett
@plot.line('gma_59', color=color.rgba(225, 0, 64, 1))  # Dunkelrosa
@plot.line('gma_62', color=color.rgba(238, 130, 238, 1)) # Magenta
@plot.fill('gma_5', 'gma_8', color=color.rgba(255, 32, 0, 0.3), id='#fill_20')    # Helles Rot-Orange
@plot.fill('gma_8', 'gma_11', color=color.rgba(255, 96, 0, 0.3), id='#fill_21')   # Helles Orange
@plot.fill('gma_11', 'gma_14', color=color.rgba(255, 160, 0, 0.3), id='#fill_22') # Hellorange
@plot.fill('gma_14', 'gma_17', color=color.rgba(240, 240, 0, 0.3), id='#fill_23') # Hellgelb
@plot.fill('gma_17', 'gma_20', color=color.rgba(192, 240, 0, 0.3), id='#fill_24') # Gelbgrün
@plot.fill('gma_20', 'gma_23', color=color.rgba(128, 240, 0, 0.3), id='#fill_25') # Apfelgrün
@plot.fill('gma_23', 'gma_26', color=color.rgba(64, 240, 0, 0.3), id='#fill_26')  # Hellgrün
@plot.fill('gma_26', 'gma_29', color=color.rgba(0, 240, 64, 0.3), id='#fill_27')  # Grasgrün
@plot.fill('gma_29', 'gma_32', color=color.rgba(0, 240, 128, 0.3), id='#fill_28') # Türkisgrün
@plot.fill('gma_32', 'gma_35', color=color.rgba(0, 208, 192, 0.3), id='#fill_29') # Türkisblau
@plot.fill('gma_35', 'gma_38', color=color.rgba(0, 160, 224, 0.3), id='#fill_30') # Himmelblau
@plot.fill('gma_38', 'gma_41', color=color.rgba(0, 112, 240, 0.3), id='#fill_31') # Königsblau
@plot.fill('gma_41', 'gma_44', color=color.rgba(0, 64, 240, 0.3), id='#fill_32')  # Tiefblau
@plot.fill('gma_44', 'gma_47', color=color.rgba(28, 0, 208, 0.3), id='#fill_33')  # Indigo
@plot.fill('gma_47', 'gma_50', color=color.rgba(56, 0, 176, 0.3), id='#fill_34')  # Dunkelindigo
@plot.fill('gma_50', 'gma_53', color=color.rgba(84, 0, 144, 0.3), id='#fill_35')  # Violett
@plot.fill('gma_53', 'gma_56', color=color.rgba(112, 0, 112, 0.3), id='#fill_36') # Purpur
@plot.fill('gma_56', 'gma_59', color=color.rgba(140, 0, 80, 0.3), id='#fill_37')  # Dunkelrosa
@plot.fill('gma_59', 'gma_62', color=color.rgba(204, 0, 96, 0.3), id='#fill_38')  # Helles Magenta
def Main(self):
    gma_5 = Sma.new(self.close, 5)
    gma_8 = Sma.new(self.close, 8)
    gma_11 = Sma.new(self.close, 11)
    gma_14 = Sma.new(self.close, 14)
    gma_17 = Sma.new(self.close, 17)
    gma_20 = Sma.new(self.close, 20)
    gma_23 = Sma.new(self.close, 23)
    gma_26 = Sma.new(self.close, 26)
    gma_29 = Sma.new(self.close, 29)
    gma_32 = Sma.new(self.close, 32)
    gma_35 = Sma.new(self.close, 35)
    gma_38 = Sma.new(self.close, 38)
    gma_41 = Sma.new(self.close, 41)
    gma_44 = Sma.new(self.close, 44)
    gma_47 = Sma.new(self.close, 47)
    gma_50 = Sma.new(self.close, 50)
    gma_53 = Sma.new(self.close, 53)
    gma_56 = Sma.new(self.close, 56)
    gma_59 = Sma.new(self.close, 59)
    gma_62 = Sma.new(self.close, 62)

    # Rückgabe der MAs und Füllungen
    return plot.Line(gma_5[0]), plot.Line(gma_8[0]), plot.Line(gma_11[0]), plot.Line(gma_14[0]), plot.Line(gma_17[0]), plot.Line(gma_20[0]), plot.Line(gma_23[0]), plot.Line(gma_26[0]), plot.Line(gma_29[0]), plot.Line(gma_32[0]), plot.Line(gma_35[0]), plot.Line(gma_38[0]), plot.Line(gma_41[0]), plot.Line(gma_44[0]), plot.Line(gma_47[0]), plot.Line(gma_50[0]), plot.Line(gma_53[0]), plot.Line(gma_56[0]), plot.Line(gma_59[0]), plot.Line(gma_62[0]), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill(), plot.Fill()
```
