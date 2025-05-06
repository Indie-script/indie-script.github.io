# Weis Wave Volume Indicator

## Overview & Usage Strategy

### About the Indicator

The Weis Wave Volume indicator is a powerful tool that organizes market volume into wave charts, clearly highlighting market inflection points and regions of supply and demand. Unlike traditional volume indicators that divide volume into equal time periods, Weis Wave focuses on natural price movements, providing a clearer picture of buying and selling pressure.
The indicator was originally created by David Weis as an adaptation of Richard D. Wyckoff's wave analysis method, designed to work with today's volatile markets. It's particularly effective at identifying potential turning points that might not be obvious on conventional bar charts.

### Best Practices & Strategy Tips

* **Instrument Compatibility**: Works best with instruments that have significant volume data (not recommended for Forex).
* **Trend Detection**: Adjust the "Trend Detection Length" parameter to consolidate smaller waves into larger trends based on your timeframe and instrument volatility.
* **Pullback Trading**: One of the most effective strategies is to look for heavy volume waves followed by pullbacks with diminishing volume.
* **Bearish Signals**: When price falls on heavy volume (bearish change in behavior) followed by a pullback with significantly reduced volume, consider establishing short positions.
* **Bullish Signals**: Conversely, when price rises on heavy volume followed by a low-volume pullback, this often indicates the start of a bullish trend.

## Inputs and Options

| Parameter | Default | Range | Description |
| --------- | ------- | ----- | ----------- |
| Trend Detection Length | 2 | ≥ 1 | Controls wave consolidation. Higher values combine smaller waves, creating fewer but larger waves |
| Show Distribution Below Zero | False | True/False | When enabled, displays downward waves below zero, creating an oscillator-like display |

## Formula

The core calculation logic works as follows:

```
1. Determine price movement direction (mov): 
   mov = 1 if close > previous close
   mov = -1 if close < previous close
   mov = 0 if no change

2. Identify trending conditions:
   is_trending = rising(close, trend_detection_length) OR falling(close, trend_detection_length)

3. Determine wave direction:
   wave = mov (if mov differs from previous wave AND is_trending)
   wave = previous wave (otherwise)

4. Calculate wave volume:
   vol = previous volume + current volume (if wave direction unchanged)
   vol = current volume (if wave direction changed)

5. Display result:
   res = vol (if showing absolute values)
   res = vol * wave direction (if showing distribution below zero)
```

## Visualization / How to Interpret Values

The Weis Wave Volume indicator displays colored columns:

* **Green columns**: Represent buying waves (upward price movement)
* **Red columns**: Represent selling waves (downward price movement)

The height of each column represents the cumulative volume during that particular wave. Key patterns to look for:

* **Volume Divergence**: When wave volume decreases while price continues in the same direction, it often signals weakening momentum and a potential reversal.
* **Heavy Volume Followed by Light Volume**: A wave with unusually high volume followed by a pullback with minimal volume often indicates a strong trend continuation.
* **Decreasing Wave Volume at Support/Resistance**: Diminishing wave volume as price approaches support or resistance levels suggests the level might hold.
* **Oscillator View**: When "Show Distribution Below Zero" is enabled, downward waves appear below the zero line, making divergences and trend changes more visually apparent.

## Key Takeaways

**Strengths:**

* Provides a clearer picture of volume distribution than time-based volume indicators
* Excellent at identifying potential market turning points
* Works in all timeframes from intraday to monthly charts
* Applicable across most markets (stocks, futures, commodities)

**Limitations:**

* Not suitable for Forex markets due to lack of centralized volume data
* Requires some practice to interpret effectively
* May generate false signals in low-volume or highly manipulated markets

**Ideal Conditions:**

* Liquid markets with reliable volume data
* Trending markets with clear wave patterns
* Markets exhibiting climactic volume at turning points

## Code Blocks: Key Implementation Logic

The most important Indie code elements for this indicator:

```
# Detect if price is rising for a specified number of bars
def rising(src: SeriesF, length: int) -> bool:
    for i in range(length):
        if not (src[i] > src[i + 1]):
            return False
    return True

# Detect if price is falling for a specified number of bars
def falling(src: SeriesF, length: int) -> bool:
    for i in range(length):
        if not (src[i] < src[i + 1]):
            return False
    return True

# Core Wave Calculation Logic
mov = 0
if self.close[0] > self.close[1]:
    mov = 1
elif self.close[0] < self.close[1]:
    mov = -1

is_trending = rising(self.close, trend_detection_length) or falling(self.close, trend_detection_length)

wave = MutSeriesF.new(0)
if mov != nan_to_zero(wave[1]) and is_trending:
    wave[0] = mov
else:
    wave[0] = nan_to_zero(wave[1])

vol = MutSeriesF.new(0)
if wave[0] == wave[1]:
    vol[0] = nan_to_zero(vol[1]) + self.volume[0]
else:
    vol[0] = self.volume[0]
```

## Pine to Indie Comparison (for Indie language learners)

Let's compare the key differences between Pine Script and Indie implementations:

### Variable Declaration and Initialization

**Pine Script:**

```
mov = close>close[1] ? 1 : close<close[1] ? -1 : 0
trend = (mov != 0) and (mov != mov[1]) ? mov : nz(trend[1])
```

**Indie:**

```
mov = 0
if self.close[0] > self.close[1]:
    mov = 1
elif self.close[0] < self.close[1]:
    mov = -1

wave = MutSeriesF.new(0)
if mov != nan_to_zero(wave[1]) and is_trending:
    wave[0] = mov
else:
    wave[0] = nan_to_zero(wave[1])
```

**Key Differences:**

* Indie uses Python-like if/else syntax instead of ternary operators
* Indie requires explicit declaration of `MutSeriesF` for series variables
* Indie uses `self.close[0]` to access the current close price, while Pine uses `close`
* In Indie, history access is via bracketed indices: `[0]` for current, `[1]` for previous

### Series Handling

**Pine Script:**

```
wave=(trend != nz(wave[1])) and isTrending ? trend : nz(wave[1])
vol=wave==wave[1] ? (nz(vol[1])+volume) : volume
```

**Indie:**

```
wave = MutSeriesF.new(0)
if mov != nan_to_zero(wave[1]) and is_trending:
    wave[0] = mov
else:
    wave[0] = nan_to_zero(wave[1])

vol = MutSeriesF.new(0)
if wave[0] == wave[1]:
    vol[0] = nan_to_zero(vol[1]) + self.volume[0]
else:
    vol[0] = self.volume[0]
```

**Key Differences:**

* Indie requires explicit creation of mutable series with `MutSeriesF.new()`
* Indie uses `nan_to_zero()` helper function instead of Pine's `nz()` function
* Indie requires explicit assignment to the first element `[0]` of the series
* Pine Script handles series variables implicitly without requiring index notation

### Plotting

**Pine Script:**

```
plot(up, style=histogram, color=green, linewidth=3)
plot(dn, style=histogram, color=red, linewidth=3)
```

**Indie:**

```
@plot.columns(id='#plot_0')
# In the function:
return plot.Columns(res, color=col)
```

**Key Differences:**

* Indie uses a decorator-based approach with `@plot.columns`
* Indie returns plotting objects from the main function rather than calling plot functions
* Indie's `plot.Columns` is equivalent to Pine's `plot(..., style=histogram)`
* Color handling is similar, but Indie uses an imported color enumeration (`color.GREEN`)

### Parameter Definition

**Pine Script:**

```
trendDetectionLength=input(2)
showDistributionBelowZero=input(false, type=bool)
```

**Indie:**

```
@param.int('trend_detection_length', default=2, min=1, title='Trend detection length')
@param.bool('show_distribution_below_zero', default=False, title='Show Distribution Below Zero')
```

**Key Differences:**

* Indie uses decorator syntax for parameters
* Indie allows setting minimum values and titles directly in the parameter definition
* Indie uses proper Python casing conventions (snake\_case vs. camelCase)
* Indie parameters are passed directly to the main function as arguments

## Full Source Code Templates

### Indie Source Code (Full)

```
# For education purposes 
# Ported to Indie from https://www.tradingview.com/script/HFGx4ote-Indicator-Weis-Wave-Volume-LazyBear/
# The author of the original indicator is @LazyBear

# This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.  
# If a copy of the MPL was not distributed with this file, you can obtain one at  
# <https://mozilla.org/MPL/2.0/>.

# indie:lang_version = 5
import math
from indie import indicator, SeriesF, MutSeriesF, param, plot, color


def rising(src: SeriesF, length: int) -> bool:
    for i in range(length):
        if not (src[i] > src[i + 1]):
            return False
    return True


def falling(src: SeriesF, length: int) -> bool:
    for i in range(length):
        if not (src[i] < src[i + 1]):
            return False
    return True


def nan_to_zero(val: float) -> float:
    return 0 if math.isnan(val) else val


@indicator('Weis Wave Volume')
@param.int('trend_detection_length', default=2, min=1, title='Trend detection length')
@param.bool('show_distribution_below_zero', default=False, title='Show Distribution Below Zero')
@plot.columns(id='#plot_0')
def Main(self, trend_detection_length, show_distribution_below_zero):
    mov = 0
    if self.close[0] > self.close[1]:
        mov = 1
    elif self.close[0] < self.close[1]:
        mov = -1

    is_trending = rising(self.close, trend_detection_length) or falling(self.close, trend_detection_length)

    wave = MutSeriesF.new(0)
    if mov != nan_to_zero(wave[1]) and is_trending:
        wave[0] = mov
    else:
        wave[0] = nan_to_zero(wave[1])

    vol = MutSeriesF.new(0)
    if wave[0] == wave[1]:
        vol[0] = nan_to_zero(vol[1]) + self.volume[0]
    else:
        vol[0] = self.volume[0]

    col = color.GREEN if wave[0] == 1 else color.RED
    res = vol[0]
    if show_distribution_below_zero:
        res = vol[0] * wave[0]

    return plot.Columns(res, color=col)

```

### PineScript Source Code (Full)

```
//for education purposes
//indicator page https://www.tradingview.com/script/HFGx4ote-Indicator-Weis-Wave-Volume-LazyBear/
// @author LazyBear 
// List of all my indicators: https://www.tradingview.com/v/4IneGo8h/
//
study("Weis Wave Volume [LazyBear]", shorttitle="WWV_LB")
trendDetectionLength=input(2)
showDistributionBelowZero=input(false, type=bool)
mov = close>close[1] ? 1 : close<close[1] ? -1 : 0
trend= (mov != 0) and (mov != mov[1]) ? mov : nz(trend[1])
isTrending = rising(close, trendDetectionLength) or falling(close, trendDetectionLength) //abs(close-close[1]) >= dif
wave=(trend != nz(wave[1])) and isTrending ? trend : nz(wave[1])
vol=wave==wave[1] ? (nz(vol[1])+volume) : volume
up=wave == 1 ? vol : 0
dn=showDistributionBelowZero ? (wave == 1 ? 0 : wave == -1 ? -vol : vol) : (wave == 1 ? 0 : vol)
plot(up, style=histogram, color=green, linewidth=3)
plot(dn, style=histogram, color=red, linewidth=3)

```

## License

MIT License
Copyright (c) 2025 