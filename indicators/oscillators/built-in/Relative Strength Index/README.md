# Relative Strength Index (RSI) - Built-in Indicator Guide

> Computes the Relative Strength Index (RSI) with optional smoothing and Bollinger Bands.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#relative-strength-index) |
| **Source file** | [Relative Strength Index.indie5](Relative%20Strength%20Index.indie5) |

## Overview

The Relative Strength Index (RSI) is a classic momentum oscillator that measures the speed and magnitude of recent price changes to identify overbought or oversold conditions. This implementation allows the user to apply a secondary moving average (SMA, EMA, SMMA, WMA, VWMA, or Bollinger Bands) directly to the RSI line for additional smoothing or volatility context.

On the chart, the indicator draws the RSI line (purple), an optional RSI-based MA line (yellow), and when Bollinger Bands are selected, upper and lower bands (green) with a semi-transparent fill. Horizontal reference lines are drawn at 30, 50, and 70 levels.

## How it works

1. The RSI is computed over `rsi_length` bars using the standard Wilder's RSI algorithm on the chosen source (default: close).
2. If `ma_type` is 'Bollinger Bands', the internal moving average type is forced to SMA regardless of the `ma_type` selection.
3. A moving average of the RSI series is computed using the resolved algorithm (SMA when 'Bollinger Bands' is selected, otherwise the chosen `ma_type`) and `ma_length`; this becomes the RSI-based MA line.
4. The standard deviation of the RSI series over `ma_length` bars is computed via `StdDev.new()`.
5. When Bollinger Bands are enabled, the upper and lower band values are calculated as `rsi_ma ± std_dev * bb_mult`; otherwise they are set to `nan` (not plotted).
6. On each bar, the function returns a tuple with the RSI-based MA, the raw RSI, the lower band, the upper band, and a fill object for the band background.

## Mathematical model

$$
RSI = 100 - \frac{100}{1 + \frac{\text{Average Gain}}{\text{Average Loss}}}
$$

$$
\text{Upper Band} = \text{MA(RSI)} + \text{StdDev(RSI)} \times \text{bb\_mult}
$$

$$
\text{Lower Band} = \text{MA(RSI)} - \text{StdDev(RSI)} \times \text{bb\_mult}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `rsi_length` | int | 14 | ≥ 1 | RSI Length |
| `src` | source | source.CLOSE |  | Source |
| `ma_length` | int | 14 | ≥ 1 | MA Length |
| `bb_mult` | float | 2.0 | 0.001 - 50 | BB StdDev |

## Code walkthrough

### Parameter declaration and UI generation

Lines 7-20 of [Relative Strength Index.indie5](Relative%20Strength%20Index.indie5):

```python
@indicator('RSI', format=format.PRICE)  # Relative Strength Index
@param.int('rsi_length', default=14, title='RSI Length', min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.str('ma_type', default='SMA', title='MA Type',
           options=['SMA', 'Bollinger Bands', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.int('ma_length', default=14, title='MA Length', min=1)
@param.float('bb_mult', default=2.0, title='BB StdDev', min=0.001, max=50)
@band(30, 70, line_color=color.GRAY, fill_color=color.PURPLE(0.1))
@level(50, line_color=color.GRAY(0.5))
@plot.line(color=color.YELLOW, title='RSI-based MA')
@plot.line(color=color.PURPLE, title='RSI')
@plot.line('bb_lower', color=color.GREEN, title='RSI Lower Band')
@plot.line('bb_upper', color=color.GREEN, title='RSI Upper Band')
@plot.fill('bb_lower', 'bb_upper', color=color.GREEN(0.1), title='Bollinger Bands Background Fill')
```

The `@indicator`, `@param.*`, `@band`, `@level`, and `@plot` decorators define the indicator's name, input parameters (RSI length, source, MA type, MA length, BB multiplier), reference levels at 30, 50, and 70, and the plot lines with their colors. This fully describes the user interface and chart display without any manual configuration code.

### Core computation initialization

Lines 21-22 of [Relative Strength Index.indie5](Relative%20Strength%20Index.indie5):

```python
def Main(self, rsi_length, src, ma_type, ma_length, bb_mult):
    rsi = Rsi.new(src, rsi_length)
```

The `Main` function receives all parameters. `Rsi.new()` creates a new RSI algorithm instance that processes the source series (`src`) over `rsi_length` bars. The resulting `rsi` variable is a series object from which the current bar value is read with `[0]`.

### MA type resolution for Bollinger Bands

Lines 24-26 of [Relative Strength Index.indie5](Relative%20Strength%20Index.indie5):

```python
    is_bb = ma_type == 'Bollinger Bands'

    ma_algorithm = 'SMA' if is_bb else ma_type
```

When the user selects 'Bollinger Bands' as the MA type, the actual algorithm used for `Ma.new()` is forced to 'SMA'. This is necessary because Bollinger Bands are a volatility overlay rather than a standalone moving average type; the bands are computed from the SMA and standard deviation of the RSI.

### Moving average and standard deviation computation

Lines 27-29 of [Relative Strength Index.indie5](Relative%20Strength%20Index.indie5):

```python
    rsi_ma = Ma.new(rsi, ma_length, ma_algorithm)

    std_dev = StdDev.new(rsi, ma_length)
```

`Ma.new()` computes a moving average of the RSI series using the resolved `ma_algorithm` and `ma_length`. `StdDev.new()` computes the standard deviation of the RSI over the same length. Both return series objects; the current values are accessed with `[0]`.

### Band calculation and return tuple

Lines 30-32 of [Relative Strength Index.indie5](Relative%20Strength%20Index.indie5):

```python
    bb_lower = rsi_ma[0] - std_dev[0] * bb_mult if is_bb else nan
    bb_upper = rsi_ma[0] + std_dev[0] * bb_mult if is_bb else nan
    return rsi_ma[0], rsi[0], bb_lower, bb_upper, plot.Fill()
```

If Bollinger Bands are selected, the lower and upper bands are calculated as the moving average ± the product of standard deviation and multiplier. Otherwise they are `nan` (meaning no line is drawn). The function returns a 5-element tuple: RSI-based MA, raw RSI, lower band, upper band, and a fill object that paints the area between the bands.

## Reading the chart

- The **purple line** is the raw RSI value (0–100). Values above 70 are considered overbought, below 30 oversold.
- The **yellow line** is a smoothed version of the RSI (any selected MA type). Crosses of the purple line above/below the yellow line may indicate trend changes.
- The **green lines** (only when Bollinger Bands are selected) show volatility bands around the RSI-based MA. When the RSI moves outside the bands, it suggests an extreme move.
- The **gray horizontal lines** at 30 and 70 serve as conventional overbought/oversold thresholds; the line at 50 is the centerline.
- The **semi-transparent green fill** between the Bollinger Bands helps visualize the band width and volatility.

## Implementation notes

- When Bollinger Bands are not selected, `bb_lower` and `bb_upper` are `math.nan`, causing those plot lines to not appear on the chart.
- The RSI algorithm used (`Rsi.new`) follows the classic Wilder's smoothed method, not a simple SMA of gains/losses.
- The `StdDev.new` computation calculates the standard deviation; the exact formula (population or sample) depends on the platform's implementation.
- Changing `ma_type` only affects the smoothing of the RSI line, not the underlying RSI calculation itself.

## FAQ

**Why do my Bollinger Bands look different from standard RSI Bollinger Bands?**

The bands are computed on the RSI values themselves, not on price. The center line is the RSI-based moving average, and the width depends on the volatility of the RSI, not the underlying asset's price.

**Can I use this indicator to generate trading signals?**

Yes, common signals include RSI crossing above/below 30/70, or the raw RSI crossing the RSI-based MA line. However, this indicator only plots the lines; you would need to add a strategy or alert to automate signals.

**What does the 'SMMA (RMA)' option mean?**

SMMA (Smoothed Moving Average) is also known as RMA (Running Moving Average) in other platforms. It applies an exponentially smoothed average with a smoothing factor of 1/length, equivalent to the smoothing used in the RSI itself.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from math import nan
from indie import indicator, format, param, source, band, color, level, plot
from indie.algorithms import Rsi, Ma, StdDev


@indicator('RSI', format=format.PRICE)  # Relative Strength Index
@param.int('rsi_length', default=14, title='RSI Length', min=1)
@param.source('src', default=source.CLOSE, title='Source')
@param.str('ma_type', default='SMA', title='MA Type',
           options=['SMA', 'Bollinger Bands', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'])
@param.int('ma_length', default=14, title='MA Length', min=1)
@param.float('bb_mult', default=2.0, title='BB StdDev', min=0.001, max=50)
@band(30, 70, line_color=color.GRAY, fill_color=color.PURPLE(0.1))
@level(50, line_color=color.GRAY(0.5))
@plot.line(color=color.YELLOW, title='RSI-based MA')
@plot.line(color=color.PURPLE, title='RSI')
@plot.line('bb_lower', color=color.GREEN, title='RSI Lower Band')
@plot.line('bb_upper', color=color.GREEN, title='RSI Upper Band')
@plot.fill('bb_lower', 'bb_upper', color=color.GREEN(0.1), title='Bollinger Bands Background Fill')
def Main(self, rsi_length, src, ma_type, ma_length, bb_mult):
    rsi = Rsi.new(src, rsi_length)

    is_bb = ma_type == 'Bollinger Bands'

    ma_algorithm = 'SMA' if is_bb else ma_type
    rsi_ma = Ma.new(rsi, ma_length, ma_algorithm)

    std_dev = StdDev.new(rsi, ma_length)
    bb_lower = rsi_ma[0] - std_dev[0] * bb_mult if is_bb else nan
    bb_upper = rsi_ma[0] + std_dev[0] * bb_mult if is_bb else nan
    return rsi_ma[0], rsi[0], bb_lower, bb_upper, plot.Fill()
```
