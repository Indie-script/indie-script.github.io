# MTC Trippel Keltner / Hust Channel - Technical Guide

> Plots three Keltner Channels (short, medium, long) based on EMA and ATR with adjustable lengths and multipliers.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Indicator |
| **Author** | @mustermann84 on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/mtc-trippel-keltner-hust-channel-93) |
| **Source file** | [MTC Trippel Keltner - Hust Channel.indie5](MTC%20Trippel%20Keltner%20-%20Hust%20Channel.indie5) |

## Overview

The MTC Triple Keltner Channels indicator displays three distinct Keltner Channels on the same chart, each using a different Exponential Moving Average (EMA) as the middle line and an Average True Range (ATR) to set the band width. Short, medium, and long channels are drawn simultaneously, allowing traders to compare volatility and potential support/resistance levels across multiple timeframes.

This indicator is useful for identifying volatility contraction or expansion, potential breakout zones, and multi-timeframe trend structure. The colored bands and fills make it easy to spot when price interacts with different channel levels.

## How it works

1. Compute three exponential moving averages (EMA) of the close price using the configured lengths (short, medium, long).
2. Compute three Average True Range (ATR) values using the same lengths as the corresponding EMA.
3. For each channel, calculate the upper band as EMA + (multiplier × ATR) and the lower band as EMA − (multiplier × ATR).
4. Plot the nine lines (three middle EMAs as dashed lines, three upper and three lower bands as solid lines) and three semi-transparent fills between the bands.
5. All calculations use the current bar’s latest values via [0] indexing.

## Mathematical model

$$
\text{EMA}_{len} = \text{EMA}(\text{close}, len)
$$

$$
\text{ATR}_{len} = \text{ATR}(len)
$$

$$
\text{Upper Band} = \text{EMA}_{len} + \text{multiplier} \times \text{ATR}_{len}
$$

$$
\text{Lower Band} = \text{EMA}_{len} - \text{multiplier} \times \text{ATR}_{len}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `short_ema_length` | int | 10 | ≥ 1 | Short EMA Length |
| `short_ema_multiplier` | float | 1.5 | ≥ 0.1 | Short EMA Multiplier |
| `medium_ema_length` | int | 30 | ≥ 1 | Medium EMA Length |
| `medium_ema_multiplier` | float | 3.0 | ≥ 0.1 | Medium EMA Multiplier |
| `long_ema_length` | int | 60 | ≥ 1 | Long EMA Length |
| `long_ema_multiplier` | float | 6.0 | ≥ 0.1 | Long EMA Multiplier |

## Code walkthrough

### Parameter and plot decoration definitions

Lines 5-23 of [MTC Trippel Keltner - Hust Channel.indie5](MTC%20Trippel%20Keltner%20-%20Hust%20Channel.indie5):

```python
@indicator('MTC Triple Keltner Channels', overlay_main_pane=True)
@param.int('short_ema_length', default=10, min=1, title='Short EMA Length')
@param.float('short_ema_multiplier', default=1.5, min=0.1, title='Short EMA Multiplier')
@param.int('medium_ema_length', default=30, min=1, title='Medium EMA Length')
@param.float('medium_ema_multiplier', default=3.0, min=0.1, title='Medium EMA Multiplier')
@param.int('long_ema_length', default=60, min=1, title='Long EMA Length')
@param.float('long_ema_multiplier', default=6.0, min=0.1, title='Long EMA Multiplier')
@plot.line('short_lower', color=color.rgba(139, 0, 0, 1), title='Short Lower Band')
@plot.line('short_middle', color=color.rgba(139, 0, 0, 1), title='Short Middle Band', line_style=line_style.DASHED)
@plot.line('short_upper', color=color.rgba(139, 0, 0, 1), title='Short Upper Band')
@plot.line('medium_lower', color=color.GREEN, title='Medium Lower Band')
@plot.line('medium_middle', color=color.GREEN, title='Medium Middle Band', line_style=line_style.DASHED)
@plot.line('medium_upper', color=color.GREEN, title='Medium Upper Band')
@plot.line('long_lower', color=color.BLUE, title='Long Lower Band')
@plot.line('long_middle', color=color.BLUE, title='Long Middle Band', line_style=line_style.DASHED)
@plot.line('long_upper', color=color.BLUE, title='Long Upper Band')
@plot.fill('short_lower', 'short_upper', color=color.rgba(139, 0, 0, 0.025), title='Short Channel Fill', id='#fill_9')
@plot.fill('medium_lower', 'medium_upper', color=color.GREEN(0.025), title='Medium Channel Fill', id='#fill_10')
@plot.fill('long_lower', 'long_upper', color=color.BLUE(0.025), title='Long Channel Fill', id='#fill_11')
```

The indicator is set to overlay on the main chart pane. Six parameters control the EMA lengths and ATR multipliers for the three channels. Nine plot lines are declared: three per channel (lower, middle, upper), with the middle lines styled as dashed. Three fill objects cover the area between lower and upper bands for each channel, using highly transparent colors.

### Core calculation of EMAs and ATRs

Lines 25-31 of [MTC Trippel Keltner - Hust Channel.indie5](MTC%20Trippel%20Keltner%20-%20Hust%20Channel.indie5):

```python
    # Calculate EMAs and ATRs
    short_ema = Ema.new(self.close, short_ema_length)[0]
    medium_ema = Ema.new(self.close, medium_ema_length)[0]
    long_ema = Ema.new(self.close, long_ema_length)[0]
    short_atr = Atr.new(short_ema_length)[0]
    medium_atr = Atr.new(medium_ema_length)[0]
    long_atr = Atr.new(long_ema_length)[0]
```

Inside the Main function, three EMA series are created from close prices with the given lengths, and three ATR series are computed using the same lengths. Each call returns a series object; the [0] index extracts the current bar's value. This ensures the bands use up-to-date data.

### Band computation and return

Lines 33-55 of [MTC Trippel Keltner - Hust Channel.indie5](MTC%20Trippel%20Keltner%20-%20Hust%20Channel.indie5):

```python
    # Calculate bands
    short_upper_band = short_ema + short_ema_multiplier * short_atr
    short_lower_band = short_ema - short_ema_multiplier * short_atr
    medium_upper_band = medium_ema + medium_ema_multiplier * medium_atr
    medium_lower_band = medium_ema - medium_ema_multiplier * medium_atr
    long_upper_band = long_ema + long_ema_multiplier * long_atr
    long_lower_band = long_ema - long_ema_multiplier * long_atr

    # Return bands and fills including dashed middle lines
    return (
        plot.Line(short_lower_band),
        plot.Line(short_ema),
        plot.Line(short_upper_band),
        plot.Line(medium_lower_band),
        plot.Line(medium_ema),
        plot.Line(medium_upper_band),
        plot.Line(long_lower_band),
        plot.Line(long_ema),
        plot.Line(long_upper_band),
        plot.Fill(),
        plot.Fill(),
        plot.Fill()
    )
```

For each channel, the upper band is the EMA plus the ATR multiplied by its multiplier, and the lower band is the EMA minus the same product. The return statement packs nine plot.Line objects (one for each band/middle line) and three plot.Fill objects (one per channel), matching the order defined by the plot decorators.

## Reading the chart

- **Short channel (dark red)**: EMA(10) ± 1.5×ATR(10). Fast-moving, sensitive to recent price action.
- **Medium channel (green)**: EMA(30) ± 3.0×ATR(30). Intermediate volatility envelope.
- **Long channel (blue)**: EMA(60) ± 6.0×ATR(60). Wide envelope capturing longer-term volatility.
- Dashed middle lines are the EMAs; solid outer lines are the bands.
- Fills are semitransparent (alpha 0.025) to highlight the channel areas without obscuring price.
- When price crosses or touches band boundaries, it may signal volatility changes or potential support/resistance.

## Implementation notes

- All computations use the same ATR length as the EMA length for each channel; lengths are independent between channels.
- The indicator does not repaint; it uses only current bar values and no future data.
- ATR and EMA are computed from the indicator's default price input (close), no user price source selection available.
- The three fills are defined with unique id values (#fill_9, #fill_10, #fill_11) to avoid rendering conflicts.

## FAQ

**How can I adjust the sensitivity of the short channel?**

Change the Short EMA Length (default 10) and Short EMA Multiplier (default 1.5). Lower length makes the EMA react faster; lower multiplier narrows the bands.

**What does it mean when price breaks through the long upper band?**

A breakout above the long upper band indicates that price has moved beyond the widest volatility envelope (EMA(60) + 6×ATR(60)), often suggesting strong directional momentum or an extreme move.

**Can I use these channels to identify trend direction?**

Yes. When all three middle EMAs are aligned (e.g., short > medium > long), it suggests an uptrend. The bands can then act as dynamic support/resistance levels within that trend.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/mtc-trippel-keltner-hust-channel-93).

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color, line_style
from indie.algorithms import Ema, Atr

@indicator('MTC Triple Keltner Channels', overlay_main_pane=True)
@param.int('short_ema_length', default=10, min=1, title='Short EMA Length')
@param.float('short_ema_multiplier', default=1.5, min=0.1, title='Short EMA Multiplier')
@param.int('medium_ema_length', default=30, min=1, title='Medium EMA Length')
@param.float('medium_ema_multiplier', default=3.0, min=0.1, title='Medium EMA Multiplier')
@param.int('long_ema_length', default=60, min=1, title='Long EMA Length')
@param.float('long_ema_multiplier', default=6.0, min=0.1, title='Long EMA Multiplier')
@plot.line('short_lower', color=color.rgba(139, 0, 0, 1), title='Short Lower Band')
@plot.line('short_middle', color=color.rgba(139, 0, 0, 1), title='Short Middle Band', line_style=line_style.DASHED)
@plot.line('short_upper', color=color.rgba(139, 0, 0, 1), title='Short Upper Band')
@plot.line('medium_lower', color=color.GREEN, title='Medium Lower Band')
@plot.line('medium_middle', color=color.GREEN, title='Medium Middle Band', line_style=line_style.DASHED)
@plot.line('medium_upper', color=color.GREEN, title='Medium Upper Band')
@plot.line('long_lower', color=color.BLUE, title='Long Lower Band')
@plot.line('long_middle', color=color.BLUE, title='Long Middle Band', line_style=line_style.DASHED)
@plot.line('long_upper', color=color.BLUE, title='Long Upper Band')
@plot.fill('short_lower', 'short_upper', color=color.rgba(139, 0, 0, 0.025), title='Short Channel Fill', id='#fill_9')
@plot.fill('medium_lower', 'medium_upper', color=color.GREEN(0.025), title='Medium Channel Fill', id='#fill_10')
@plot.fill('long_lower', 'long_upper', color=color.BLUE(0.025), title='Long Channel Fill', id='#fill_11')
def Main(self, short_ema_length, short_ema_multiplier, medium_ema_length, medium_ema_multiplier, long_ema_length, long_ema_multiplier):
    # Calculate EMAs and ATRs
    short_ema = Ema.new(self.close, short_ema_length)[0]
    medium_ema = Ema.new(self.close, medium_ema_length)[0]
    long_ema = Ema.new(self.close, long_ema_length)[0]
    short_atr = Atr.new(short_ema_length)[0]
    medium_atr = Atr.new(medium_ema_length)[0]
    long_atr = Atr.new(long_ema_length)[0]

    # Calculate bands
    short_upper_band = short_ema + short_ema_multiplier * short_atr
    short_lower_band = short_ema - short_ema_multiplier * short_atr
    medium_upper_band = medium_ema + medium_ema_multiplier * medium_atr
    medium_lower_band = medium_ema - medium_ema_multiplier * medium_atr
    long_upper_band = long_ema + long_ema_multiplier * long_atr
    long_lower_band = long_ema - long_ema_multiplier * long_atr

    # Return bands and fills including dashed middle lines
    return (
        plot.Line(short_lower_band),
        plot.Line(short_ema),
        plot.Line(short_upper_band),
        plot.Line(medium_lower_band),
        plot.Line(medium_ema),
        plot.Line(medium_upper_band),
        plot.Line(long_lower_band),
        plot.Line(long_ema),
        plot.Line(long_upper_band),
        plot.Fill(),
        plot.Fill(),
        plot.Fill()
    )
```
