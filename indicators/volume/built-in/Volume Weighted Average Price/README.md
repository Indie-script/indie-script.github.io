# Volume Weighted Average Price (VWAP) - Built-in Indicator Guide

> Computes Volume Weighted Average Price with standard deviation bands anchored to a period.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volume |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#volume-weighted-average-price) |
| **Source file** | [Volume Weighted Average Price.indie5](Volume%20Weighted%20Average%20Price.indie5) |

## Overview

This indicator calculates the Volume Weighted Average Price (VWAP) over a user-defined anchor period (Session, Week, Month, or Year). VWAP is a trading benchmark that reflects the average price weighted by volume, giving more significance to periods with higher trading activity. It is commonly used by institutional traders and intraday traders to assess the fair value of an asset relative to its trading volume.

The indicator plots three lines: the VWAP itself (blue), an upper band (green) at VWAP + one standard deviation, and a lower band (green) at VWAP - one standard deviation. A semi-transparent green fill between the bands highlights the standard deviation channel. An offset parameter allows shifting the lines forward or backward in time for visual alignment.

## How it works

1. The indicator is configured with a source price (default HLC3), an anchor period (Session, Week, Month, Year), and an offset.
2. On each bar, the built-in Vwap algorithm is called with the source series and the chosen anchor.
3. The Vwap algorithm internally accumulates cumulative price*volume and cumulative volume over the anchor period to compute the VWAP.
4. It also calculates the standard deviation of the price from the VWAP over the same period.
5. The main VWAP line, upper band (VWAP + 1 std dev), and lower band (VWAP - 1 std dev) are returned as series.
6. The current bar's values are taken with [0] and returned as plot lines, shifted by the user-specified offset.
7. A fill is drawn between the upper and lower bands to visually emphasize the standard deviation channel.

## Mathematical model

The VWAP is computed as:

$$
\text{VWAP} = \frac{\sum (\text{price} \times \text{volume})}{\sum \text{volume}}
$$

where the sums are taken over the current anchor period. The standard deviation is:

$$
\sigma = \sqrt{\frac{\sum (\text{price} - \text{VWAP})^2}{N}}
$$

with N being the number of bars in the period. The upper and lower bands are:

$$
\text{upper} = \text{VWAP} + k \cdot \sigma, \quad \text{lower} = \text{VWAP} - k \cdot \sigma
$$

where $k = 1.0$ (hardcoded in this script).

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `src` | source | source.HLC3 |  | Source |
| `anchor` | str | Session |  | Anchor |
| `offset` | int | 0 | -500 - 500 | Offset |

## Code walkthrough

### Indicator and parameter decorators

Lines 6-10 of [Volume Weighted Average Price.indie5](Volume%20Weighted%20Average%20Price.indie5):

```python
@indicator('VWAP', overlay_main_pane=True)  # Volume Weighted Average Price
@param.source('src', default=source.HLC3, title='Source')
# TODO: add Earnings, Dividends, Splits
@param.str('anchor', default='Session', options=['Session', 'Week', 'Month', 'Year'], title='Anchor')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
```

The @indicator decorator sets the display name 'VWAP' and places the indicator in the main chart pane (overlay). The @param.source decorator defines the price source (default HLC3) used for VWAP calculation. The @param.str decorator provides an anchor selection with four options: Session, Week, Month, Year. The @param.int decorator adds an offset parameter that shifts the plotted lines forward or backward.

### Plot decorators for lines and fill

Lines 11-14 of [Volume Weighted Average Price.indie5](Volume%20Weighted%20Average%20Price.indie5):

```python
@plot.line('vwap', title='VWAP', color=color.BLUE)
@plot.line('upper', title='Upper band', color=color.GREEN)
@plot.line('lower', title='Lower band', color=color.GREEN)
@plot.fill('upper', 'lower', color=color.GREEN(0.1), title='Background')
```

Three @plot.line decorators define the VWAP line (blue), upper band (green), and lower band (green). The @plot.fill decorator creates a semi-transparent green fill between the upper and lower bands. These decorators automatically generate the UI for color and visibility settings.

### Main function and Vwap call

Lines 15-17 of [Volume Weighted Average Price.indie5](Volume%20Weighted%20Average%20Price.indie5):

```python
def Main(self, src, anchor, offset):
    std_dev_mult = 1.0
    main_line, upper, lower = Vwap.new(src, anchor, std_dev_mult)
```

The Main function receives the source series, anchor string, and offset integer. A hardcoded standard deviation multiplier of 1.0 is used. The built-in Vwap.new function is called with the source, anchor, and multiplier, returning three series: main_line, upper, and lower.

### Returning plot objects with offset

Lines 18-23 of [Volume Weighted Average Price.indie5](Volume%20Weighted%20Average%20Price.indie5):

```python
    return (
        plot.Line(main_line[0], offset=offset),
        plot.Line(upper[0], offset=offset),
        plot.Line(lower[0], offset=offset),
        plot.Fill(offset=offset),
    )
```

The function returns a tuple of plot objects. Each Line takes the current bar's value (index [0]) from the respective series and applies the user-specified offset. The Fill object also receives the offset to align the shaded region with the lines.

## Reading the chart

- **Blue line (VWAP)**: The volume-weighted average price for the current anchor period. When price is above VWAP, it suggests bullish sentiment; below suggests bearish.
- **Green lines (Upper/Lower bands)**: One standard deviation from VWAP. Price reaching the upper band may indicate overextended buying; reaching the lower band may indicate oversold conditions.
- **Green fill**: Visualizes the standard deviation channel, helping to gauge the dispersion of price around VWAP.
- **Offset**: Shifts all lines and the fill horizontally by the specified number of bars, useful for comparing current price to historical VWAP levels.

## Implementation notes

- The standard deviation multiplier is hardcoded to 1.0; to change it, the source code must be edited.
- The anchor period resets at the start of each new session, week, month, or year, causing VWAP to recalculate from scratch.
- The offset parameter shifts the plotted values but does not affect the underlying calculation; it is purely visual.
- The indicator repaints because VWAP is recalculated on each bar using the entire anchor period up to the current bar.

## FAQ

**How do I change the standard deviation multiplier?**

The multiplier is hardcoded as `std_dev_mult = 1.0` on line 16. To use a different value, edit the script and replace 1.0 with your desired number (e.g., 2.0 for two standard deviations).

**What does the 'Anchor' parameter do?**

The anchor determines the period over which VWAP is calculated. 'Session' resets each trading session, 'Week' resets on the first bar of the week, 'Month' on the first bar of the month, and 'Year' on the first bar of the year. This affects the cumulative sums used in the VWAP formula.

**Can I use a different price source?**

Yes, the 'Source' parameter defaults to HLC3 but can be changed to any available price source (e.g., close, open, high, low, HL2, OHLC4) via the indicator settings panel.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Vwap


@indicator('VWAP', overlay_main_pane=True)  # Volume Weighted Average Price
@param.source('src', default=source.HLC3, title='Source')
# TODO: add Earnings, Dividends, Splits
@param.str('anchor', default='Session', options=['Session', 'Week', 'Month', 'Year'], title='Anchor')
@param.int('offset', default=0, min=-500, max=500, title='Offset')
@plot.line('vwap', title='VWAP', color=color.BLUE)
@plot.line('upper', title='Upper band', color=color.GREEN)
@plot.line('lower', title='Lower band', color=color.GREEN)
@plot.fill('upper', 'lower', color=color.GREEN(0.1), title='Background')
def Main(self, src, anchor, offset):
    std_dev_mult = 1.0
    main_line, upper, lower = Vwap.new(src, anchor, std_dev_mult)
    return (
        plot.Line(main_line[0], offset=offset),
        plot.Line(upper[0], offset=offset),
        plot.Line(lower[0], offset=offset),
        plot.Fill(offset=offset),
    )
```
