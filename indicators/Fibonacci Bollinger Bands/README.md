# Fibonacci Bollinger Bands - Technical Guide

> Computes Fibonacci-scaled Bollinger Bands based on VWMA and standard deviation to highlight support and resistance levels.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Support & resistance |
| **Type** | Indicator |
| **Author** | @dr_jones on TakeProfit |
| **Original** | Ported to Indie from https://www.tradingview.com/script/qIKR3tbN-Fibonacci-Bollinger-Bands/ The author of the original indicator is @Rashad |
| **License** | MPL-2.0 (see the header of the source file) |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/fibonacci-bollinger-bands-93) |
| **Source file** | [Fibonacci Bollinger Bands.indie5](Fibonacci%20Bollinger%20Bands.indie5) |

## Overview

The Fibonacci Bollinger Bands indicator combines a Volume Weighted Moving Average (VWMA) with standard deviation bands scaled by Fibonacci retracement ratios. It is designed to identify potential support and resistance zones based on price volatility and volume weighting. The bands expand and contract with market volatility, providing dynamic levels that can help traders gauge overextended price moves.

On the chart, the indicator draws a central basis line (fuchsia) representing the VWMA. Above it, six upper bands are plotted: five inner bands in semi-transparent white and the outermost band in red. Below the basis, six lower bands are plotted: five inner bands in semi-transparent white and the outermost band in green. Each band corresponds to a Fibonacci ratio (0.236, 0.382, 0.5, 0.618, 0.764, 1.0) multiplied by the scaled standard deviation.

## How it works

1. Compute the Volume Weighted Moving Average (VWMA) of the source over the specified length.
2. Compute the standard deviation of the source over the same length.
3. Multiply the standard deviation by the user-defined multiplier (default 3.0).
4. Define Fibonacci retracement ratios: 0.236, 0.382, 0.5, 0.618, 0.764, 1.0.
5. Calculate six upper bands by adding each ratio times the scaled deviation to the VWMA.
6. Calculate six lower bands by subtracting each ratio times the scaled deviation from the VWMA.
7. Return the basis (VWMA) and all 12 band levels as separate series for plotting.

## Mathematical model

$$
\text{basis} = \text{VWMA}(\text{src}, \text{length})
$$

$$
\text{dev} = \text{mult} \times \text{StdDev}(\text{src}, \text{length})
$$

$$
\text{upper}_i = \text{basis} + \text{dev} \times f_i
$$

$$
\text{lower}_i = \text{basis} - \text{dev} \times f_i
$$

where $f_i \in \{0.236, 0.382, 0.5, 0.618, 0.764, 1.0\}$.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 200 | ≥ 1 |  |
| `src` | source | source.HLC3 |  | Source |
| `mult` | float | 3.0 | 0.001 - 50.0 | StdDev |

## Code walkthrough

### Header and Imports

Lines 1-11 of [Fibonacci Bollinger Bands.indie5](Fibonacci%20Bollinger%20Bands.indie5):

```python
# Ported to Indie from https://www.tradingview.com/script/qIKR3tbN-Fibonacci-Bollinger-Bands/
# The author of the original indicator is @Rashad

# This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.  
# If a copy of the MPL was not distributed with this file, you can obtain one at  
# <https://mozilla.org/MPL/2.0/>.

# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Vwma, StdDev

```

The script is ported from a TradingView script by @Rashad. It imports the necessary Indie modules and the Vwma and StdDev algorithms.

### Indicator and Plot Decorators

Lines 13-29 of [Fibonacci Bollinger Bands.indie5](Fibonacci%20Bollinger%20Bands.indie5):

```python
@indicator('FBB', overlay_main_pane=True)  # Fibonacci Bollinger Bands
@param.int('length', default=200, min=1)
@param.source('src', default=source.HLC3, title='Source')
@param.float('mult', default=3.0, min=0.001, max=50.0, title='StdDev')
@plot.line(color=color.FUCHSIA, line_width=2, title='Basis', id='#plot_0')
@plot.line(color=color.WHITE(0.5), title='0.236', id='#plot_1')
@plot.line(color=color.WHITE(0.5), title='0.382', id='#plot_2')
@plot.line(color=color.WHITE(0.5), title='0.5', id='#plot_3')
@plot.line(color=color.WHITE(0.5), title='0.618', id='#plot_4')
@plot.line(color=color.WHITE(0.5), title='0.764', id='#plot_5')
@plot.line(color=color.RED, line_width=2, title='1', id='#plot_6')
@plot.line(color=color.WHITE(0.5), title='0.236', id='#plot_7')
@plot.line(color=color.WHITE(0.5), title='0.382', id='#plot_8')
@plot.line(color=color.WHITE(0.5), title='0.5', id='#plot_9')
@plot.line(color=color.WHITE(0.5), title='0.618', id='#plot_10')
@plot.line(color=color.WHITE(0.5), title='0.764', id='#plot_11')
@plot.line(color=color.GREEN, line_width=2, title='1', id='#plot_12')
```

The @indicator decorator registers the script as 'FBB' and sets it to overlay the main pane. @param decorators define user-configurable parameters: length (lookback period), source (price series), and mult (standard deviation multiplier). @plot decorators define the 13 output lines with their colors, widths, and legend titles.

### Computing Basis and Deviation

Lines 30-32 of [Fibonacci Bollinger Bands.indie5](Fibonacci%20Bollinger%20Bands.indie5):

```python
def Main(self, length, src, mult):
    basis = Vwma.new(src, length)[0]
    dev = mult * StdDev.new(src, length)[0]
```

The Main function receives the parameters. It computes the VWMA and standard deviation of the source over the given length. The [0] index retrieves the current bar value from the series object. The deviation is scaled by the user multiplier.

### Fibonacci Band Calculations

Lines 33-44 of [Fibonacci Bollinger Bands.indie5](Fibonacci%20Bollinger%20Bands.indie5):

```python
    upper_1 = basis + dev * 0.236
    upper_2 = basis + dev * 0.382
    upper_3 = basis + dev * 0.5
    upper_4 = basis + dev * 0.618
    upper_5 = basis + dev * 0.764
    upper_6 = basis + dev * 1
    lower_1 = basis - dev * 0.236
    lower_2 = basis - dev * 0.382
    lower_3 = basis - dev * 0.5
    lower_4 = basis - dev * 0.618
    lower_5 = basis - dev * 0.764
    lower_6 = basis - dev * 1
```

Six upper and six lower bands are calculated by adding or subtracting the scaled deviation multiplied by each Fibonacci ratio. The ratios are hardcoded: 0.236, 0.382, 0.5, 0.618, 0.764, and 1.0.

### Returning the Series

Lines 45-49 of [Fibonacci Bollinger Bands.indie5](Fibonacci%20Bollinger%20Bands.indie5):

```python
    return (
        basis,
        upper_1, upper_2, upper_3, upper_4, upper_5, upper_6,
        lower_1, lower_2, lower_3, lower_4, lower_5, lower_6,
    )
```

The function returns a tuple of 13 series: the basis, six upper bands, and six lower bands. Each series is plotted according to the corresponding @plot decorator, matched by position.

## Reading the chart

- The basis line (fuchsia, line_width=2) represents the VWMA.
- Upper bands: six lines above the basis. The outermost (1.0) is red with line_width=2; the inner five are white with 50% opacity.
- Lower bands: six lines below the basis. The outermost (1.0) is green with line_width=2; the inner five are white with 50% opacity.
- The bands are labeled with their Fibonacci ratio in the legend.
- The bands widen when volatility increases (higher standard deviation) and narrow when volatility decreases.

## Implementation notes

- The indicator uses Vwma and StdDev algorithms from indie.algorithms, which return series objects; [0] accesses the current bar value.
- The multiplier parameter (default 3.0) scales the standard deviation; a value of 3 corresponds to three standard deviations, covering ~99.73% of observations under a normal distribution.
- Fibonacci ratios are hardcoded; they are not user-configurable.
- The indicator overlays the main pane (overlay_main_pane=True).

## FAQ

**How can I adjust the number of bands?**

The Fibonacci ratios are hardcoded; to change them you must edit the source code and add/remove corresponding plot decorators and return values.

**What source should I use?**

The default source is HLC3 (average of High, Low, Close), but you can select any price or volume series from the Source parameter.

**Why are the inner bands white with 50% opacity?**

The inner bands use color.WHITE(0.5) to create semi-transparent lines that are less prominent than the outer red/green bands, making the chart easier to read.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/fibonacci-bollinger-bands-93).

```python
# Ported to Indie from https://www.tradingview.com/script/qIKR3tbN-Fibonacci-Bollinger-Bands/
# The author of the original indicator is @Rashad

# This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.  
# If a copy of the MPL was not distributed with this file, you can obtain one at  
# <https://mozilla.org/MPL/2.0/>.

# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Vwma, StdDev


@indicator('FBB', overlay_main_pane=True)  # Fibonacci Bollinger Bands
@param.int('length', default=200, min=1)
@param.source('src', default=source.HLC3, title='Source')
@param.float('mult', default=3.0, min=0.001, max=50.0, title='StdDev')
@plot.line(color=color.FUCHSIA, line_width=2, title='Basis', id='#plot_0')
@plot.line(color=color.WHITE(0.5), title='0.236', id='#plot_1')
@plot.line(color=color.WHITE(0.5), title='0.382', id='#plot_2')
@plot.line(color=color.WHITE(0.5), title='0.5', id='#plot_3')
@plot.line(color=color.WHITE(0.5), title='0.618', id='#plot_4')
@plot.line(color=color.WHITE(0.5), title='0.764', id='#plot_5')
@plot.line(color=color.RED, line_width=2, title='1', id='#plot_6')
@plot.line(color=color.WHITE(0.5), title='0.236', id='#plot_7')
@plot.line(color=color.WHITE(0.5), title='0.382', id='#plot_8')
@plot.line(color=color.WHITE(0.5), title='0.5', id='#plot_9')
@plot.line(color=color.WHITE(0.5), title='0.618', id='#plot_10')
@plot.line(color=color.WHITE(0.5), title='0.764', id='#plot_11')
@plot.line(color=color.GREEN, line_width=2, title='1', id='#plot_12')
def Main(self, length, src, mult):
    basis = Vwma.new(src, length)[0]
    dev = mult * StdDev.new(src, length)[0]
    upper_1 = basis + dev * 0.236
    upper_2 = basis + dev * 0.382
    upper_3 = basis + dev * 0.5
    upper_4 = basis + dev * 0.618
    upper_5 = basis + dev * 0.764
    upper_6 = basis + dev * 1
    lower_1 = basis - dev * 0.236
    lower_2 = basis - dev * 0.382
    lower_3 = basis - dev * 0.5
    lower_4 = basis - dev * 0.618
    lower_5 = basis - dev * 0.764
    lower_6 = basis - dev * 1
    return (
        basis,
        upper_1, upper_2, upper_3, upper_4, upper_5, upper_6,
        lower_1, lower_2, lower_3, lower_4, lower_5, lower_6,
    )
```
