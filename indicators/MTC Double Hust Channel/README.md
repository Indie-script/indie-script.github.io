# MTC Double Hust Channel - Technical Guide

> Plots two Keltner Channels using EMA and ATR for short-term and long-term volatility analysis.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Volatility |
| **Type** | Indicator |
| **Author** | @mustermann84 on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/mtc-double-hust-channel-59) |
| **Source file** | [MTC Double Hust Channel.indie5](MTC%20Double%20Hust%20Channel.indie5) |

## Overview

The Combined Hust Channel Corrected measures market volatility by drawing two Keltner-style bands around price: a short-term channel (EMA 10, ATR multiplier 1) and a long-term channel (EMA 30, ATR multiplier 3). The indicator helps identify potential support and resistance zones, as well as trend strength and volatility expansion or contraction.

It is intended for broad market phases or high volatility conditions. On the chart, six lines are drawn: the short-term channel (middle in red, upper/lower in blue) reacts quickly to price changes, while the long-term channel (middle in yellow, upper/lower in green) provides a wider view of the trend. When both channels move in the same direction, it may indicate a stronger trend.

## How it works

1. Compute short-term EMA of close price with user-defined length_short.
2. Compute short-term ATR with same length_short.
3. Calculate upper short band = short EMA + short ATR * multiplier_short.
4. Calculate lower short band = short EMA - short ATR * multiplier_short.
5. Repeat steps for long-term using length_long and multiplier_long.
6. Return all six band values as plot lines on the chart.

## Mathematical model

$$
\text{Middle}_\text{short} = \text{EMA}(\text{close}, \text{length}_\text{short})
$$

$$
\text{Upper}_\text{short} = \text{Middle}_\text{short} + \text{multiplier}_\text{short} \times \text{ATR}(\text{length}_\text{short})
$$

$$
\text{Lower}_\text{short} = \text{Middle}_\text{short} - \text{multiplier}_\text{short} \times \text{ATR}(\text{length}_\text{short})
$$

Same formulas apply for the long-term channel using `length_long` and `multiplier_long`.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length_short` | int | 10 | ≥ 1 | Short EMA Length |
| `multiplier_short` | float | 1.0 | 0.1 - 10.0 | Short Multiplier for ATR |
| `length_long` | int | 30 | ≥ 1 | Long EMA Length |
| `multiplier_long` | float | 3.0 | 0.1 - 10.0 | Long Multiplier for ATR |

## Code walkthrough

### Indicator setup and parameters

Lines 5-9 of [MTC Double Hust Channel.indie5](MTC%20Double%20Hust%20Channel.indie5):

```python
@indicator('Combined Hust Channel Corrected', overlay_main_pane=True)
@param.int('length_short', default=10, min=1, title='Short EMA Length')
@param.float('multiplier_short', default=1.0, min=0.1, max=10.0, title='Short Multiplier for ATR')
@param.int('length_long', default=30, min=1, title='Long EMA Length')
@param.float('multiplier_long', default=3.0, min=0.1, max=10.0, title='Long Multiplier for ATR')
```

The indicator is declared with `@indicator` and set to overlay on the main price pane. Four user-adjustable parameters control the two channels: `length_short` (default 10), `multiplier_short` (default 1.0), `length_long` (default 30), and `multiplier_long` (default 3.0). These generate the settings UI in the platform.

### Computing short-term channel

Lines 17-20 of [MTC Double Hust Channel.indie5](MTC%20Double%20Hust%20Channel.indie5):

```python
    middle_band_short = Ema.new(self.close, length_short)[0]  # Accessing the current EMA value
    atr_value_short = Atr.new(length_short)[0]  # Accessing the current ATR value
    upper_band_short = middle_band_short + multiplier_short * atr_value_short
    lower_band_short = middle_band_short - multiplier_short * atr_value_short
```

The short EMA of close is computed via `Ema.new(self.close, length_short)`. The result is a series; `[0]` gets the current bar’s value. Similarly, `Atr.new(length_short)[0]` gives the current ATR. The upper and lower bands are then calculated by adding or subtracting the ATR scaled by the multiplier.

### Computing long-term channel

Lines 22-25 of [MTC Double Hust Channel.indie5](MTC%20Double%20Hust%20Channel.indie5):

```python
    middle_band_long = Ema.new(self.close, length_long)[0]  # Accessing the current EMA value
    atr_value_long = Atr.new(length_long)[0]  # Accessing the current ATR value
    upper_band_long = middle_band_long + multiplier_long * atr_value_long
    lower_band_long = middle_band_long - multiplier_long * atr_value_long
```

The same logic is repeated with the long-term parameters. Note that the ATR is recomputed independently with its own lookback period, so both channels use their own volatility context.

### Returning plot lines

Lines 27-34 of [MTC Double Hust Channel.indie5](MTC%20Double%20Hust%20Channel.indie5):

```python
    return (
        plot.Line(lower_band_short),
        plot.Line(middle_band_short),
        plot.Line(upper_band_short),
        plot.Line(lower_band_long),
        plot.Line(middle_band_long),
        plot.Line(upper_band_long)
    )
```

All six bands are returned as `plot.Line` objects in a fixed order: lower_short, middle_short, upper_short, lower_long, middle_long, upper_long. The decorators `@plot.line` above tie each return position to a color and name visible in the platform’s plot settings.

## Reading the chart

- **Short-term channel**: middle line is **red**, upper and lower boundaries are **blue**. This channel reacts quickly to recent price moves.
- **Long-term channel**: middle line is **yellow**, upper and lower boundaries are **green**. This channel provides a broader view of volatility and trend.
- Price touching or breaking the short-term bands may signal quick entries or exits, while the long-term bands indicate major support/resistance zones.
- When both channels point in the same direction (e.g., both middle lines rising), the trend is considered stronger.
- The distance between upper and lower bands expands with increasing volatility and contracts in low volatility.

## Implementation notes

- All values are computed from the current bar only; there is no repainting because the indicator uses `[0]` to access the current series value.
- The ATR length is automatically reused for the EMA length in each channel, but ATR and EMA are independent per channel.
- Parameter constraints: `length_short` and `length_long` minimum 1, `multiplier_short` and `multiplier_long` minimum 0.1, maximum 10.0.
- Plot colors are fixed: blue for short bands, red for short middle, green for long bands, yellow for long middle (as noted in the source comment).

## FAQ

**How do I make the short-term channel more or less sensitive?**

Decrease `length_short` for faster EMA and ATR (more sensitivity) or increase it for smoother channels. Adjust `multiplier_short` to widen or narrow the channel bands.

**What do the different line colors mean?**

Blue lines are short-term upper/lower bands; red is the short-term middle. Green lines are long-term upper/lower; yellow is the long-term middle. This color scheme helps quickly distinguish timeframes.

**Can I use this indicator on different timeframes?**

Yes, the indicator works on any chart timeframe. The EMA and ATR calculations automatically adapt to the selected period. You can also use `sec_context` in the platform to apply it to a higher timeframe if needed, but the code does not include that explicitly.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/mtc-double-hust-channel-59).

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Ema, Atr

@indicator('Combined Hust Channel Corrected', overlay_main_pane=True)
@param.int('length_short', default=10, min=1, title='Short EMA Length')
@param.float('multiplier_short', default=1.0, min=0.1, max=10.0, title='Short Multiplier for ATR')
@param.int('length_long', default=30, min=1, title='Long EMA Length')
@param.float('multiplier_long', default=3.0, min=0.1, max=10.0, title='Long Multiplier for ATR')
@plot.line('lower_short', color=color.BLUE)
@plot.line('middle_short', color=color.RED)
@plot.line('upper_short', color=color.BLUE)
@plot.line('lower_long', color=color.GREEN)
@plot.line('middle_long', color=color.YELLOW)  # Gelb statt Orange
@plot.line('upper_long', color=color.GREEN)
def Main(self, length_short, multiplier_short, length_long, multiplier_long):
    middle_band_short = Ema.new(self.close, length_short)[0]  # Accessing the current EMA value
    atr_value_short = Atr.new(length_short)[0]  # Accessing the current ATR value
    upper_band_short = middle_band_short + multiplier_short * atr_value_short
    lower_band_short = middle_band_short - multiplier_short * atr_value_short

    middle_band_long = Ema.new(self.close, length_long)[0]  # Accessing the current EMA value
    atr_value_long = Atr.new(length_long)[0]  # Accessing the current ATR value
    upper_band_long = middle_band_long + multiplier_long * atr_value_long
    lower_band_long = middle_band_long - multiplier_long * atr_value_long

    return (
        plot.Line(lower_band_short),
        plot.Line(middle_band_short),
        plot.Line(upper_band_short),
        plot.Line(lower_band_long),
        plot.Line(middle_band_long),
        plot.Line(upper_band_long)
    )
```
