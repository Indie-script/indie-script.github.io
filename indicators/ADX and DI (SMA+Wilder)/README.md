# ADX and DI (SMA+Wilder) - Technical Guide

> Computes ADX, DI+ and DI- lines with a choice of SMA or Wilder smoothing for ADX.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Indicator |
| **Author** | @insurgent on TakeProfit |
| **Original (TradingView)** | [ADX and DI](https://www.tradingview.com/script/VTPMMOrx-ADX-and-DI/) by BeikabuOyaji |
| **Original license** | MPL-2.0 |
| **Original source** | [ADX and DI (SMA+Wilder).pinescript4](ADX%20and%20DI%20(SMA+Wilder).pinescript4) |
| **License** | [MPL-2.0](https://mozilla.org/MPL/2.0/) (derivative work) |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/adx-and-di-sma-wilder-82) |
| **Source file** | [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5) |

## Overview

This indicator measures both the direction (DI+/DI-) and the absolute strength (ADX) of a trend. It is a port of the TradingView "ADX and DI" by BeikabuOyaji, extended with a user-selectable ADX smoothing method (SMA or Wilder).

The chart displays four lines: a green DI+ line, a red DI- line, a navy ADX line, and a black horizontal threshold line (default at 20). The ADX line can be computed either with a simple moving average (SMA) or with Wilder's classic exponential-style smoothing, chosen in the settings.

## How it works

1. Compute the Directional Movement Index (DMI) components using the built-in `Adx.new` algorithm, which returns minus_di, classic_adx, and plus_di series.
2. Calculate the Directional Index (DX) from the current DI+ and DI- values, with zero-division protection.
3. Store the DX value in a `MutSeriesF` to make it available as a series for SMA computation.
4. Compute an SMA of the DX series over the given length to obtain the original (SMA-smoothed) ADX.
5. Select the final ADX value: use the SMA-smoothed ADX if the user chose 'SMA (Original)', otherwise use the classic ADX from `Adx.new` (Wilder smoothing).
6. Return the current DI+, DI-, final ADX, and the threshold value as a constant line.

## Mathematical model

$$
DX = \frac{|DI+ - DI-|}{DI+ + DI-} \times 100
$$

$$
ADX_{\text{SMA}} = \text{SMA}(DX, \text{length})
$$

$$
ADX_{\text{Wilder}} = \text{WilderSmooth}(DX, \text{length})
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 1 | Length |
| `th` | int | 20 | ≥ 1 | Threshold |
| `adx_smoothing` | str | SMA (Original) |  | ADX Smoothing Method |

## Code walkthrough

### Indicator declaration and parameters

Lines 7-14 of [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5):

```python
@indicator('ADX and DI', format=format.PRICE)
@param.int('length', default=14, min=1, title='Length')
@param.int('th', default=20, min=1, title='Threshold')
@param.str('adx_smoothing', default='SMA (Original)', options=['SMA (Original)', 'Wilder (Classic)'], title='ADX Smoothing Method')
@plot.line(color=color.GREEN, title='DI+')
@plot.line(color=color.RED, title='DI-')
@plot.line(color=color.NAVY, title='ADX')
@plot.line(color=color.BLACK, title='Threshold')
```

The `@indicator` decorator sets the name and price format. Three `@param` decorators define the length, threshold, and ADX smoothing method as user-configurable settings. The `@plot.line` decorators assign colors and titles to the four output lines.

### Core DMI computation via Adx.new

Lines 15-16 of [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5):

```python
def Main(self, length, th, adx_smoothing):
    minus_di, classic_adx, plus_di = Adx.new(length, length)
```

The `Main` function receives the parameters. `Adx.new(length, length)` computes the minus_di, classic_adx, and plus_di series. The classic_adx uses Wilder's smoothing internally.

### DX calculation with zero-division protection

Lines 18-19 of [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5):

```python
    denom = plus_di[0] + minus_di[0]
    dx_val = 0.0 if (isnan(denom) or denom == 0.0) else abs(plus_di[0] - minus_di[0]) / denom * 100
```

The denominator is the sum of DI+ and DI-. If it is zero or NaN, DX is set to 0.0 to avoid division errors. Otherwise, DX is the absolute difference divided by the sum, multiplied by 100.

### SMA smoothing and final ADX selection

Lines 21-24 of [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5):

```python
    dx_series = MutSeriesF.new(dx_val)
    original_adx = Sma.new(dx_series, length)

    final_adx_val = original_adx[0] if adx_smoothing == 'SMA (Original)' else classic_adx[0]
```

The DX value is wrapped in a `MutSeriesF` so it can be passed to `Sma.new`. The SMA of DX over `length` bars gives the original ADX. The final ADX is chosen based on the user's `adx_smoothing` parameter: either the SMA-smoothed or the classic (Wilder) ADX.

### Return values for plotting

Lines 26-26 of [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5):

```python
    return plus_di[0], minus_di[0], final_adx_val, float(th)
```

The function returns a tuple of four values: plus_di[0], minus_di[0], final_adx_val, and the threshold as a float. These are plotted as lines according to the `@plot.line` decorators.

## Pine Script vs Indie

The original Pine Script v4 by BeikabuOyaji computes the DMI manually and uses `sma()` for ADX. The Indie port uses the built-in `Adx.new` algorithm and adds a choice of smoothing methods.

| Pine Script | Indie | Note |
| --- | --- | --- |
| `study("ADX and DI for v4")` | `@indicator('ADX and DI', format=format.PRICE)` | Both declare the indicator; Indie uses a decorator. |
| `len = input(14)` | `@param.int('length', default=14, min=1, title='Length')` | Parameter definition; Indie uses a decorator. |
| `th = input(20)` | `@param.int('th', default=20, min=1, title='Threshold')` | Threshold parameter; identical default. |
| `DIPlus = SmoothedDirectionalMovementPlus / SmoothedTrueRange * 100` | `plus_di[0]` | Indie gets DI+ directly from Adx.new. |
| `DX = abs(DIPlus-DIMinus) / (DIPlus+DIMinus)*100` | `abs(plus_di[0] - minus_di[0]) / denom * 100` | Same formula; Indie adds zero-division check. |
| `ADX = sma(DX, len)` | `Sma.new(dx_series, length)` | Both compute SMA of DX; Indie uses a series wrapper. |
| `plot(DIPlus, color=color.green, title="DI+")` | `@plot.line(color=color.GREEN, title='DI+')` | Plotting via decorator in Indie. |

### DMI calculation

Pine Script, lines 21-25 of [ADX and DI (SMA+Wilder).pinescript4](ADX%20and%20DI%20(SMA+Wilder).pinescript4):

```pine
TrueRange = max(max(high-low, abs(high-nz(close[1]))), abs(low-nz(close[1])))

DirectionalMovementPlus = high-nz(high[1]) > nz(low[1])-low ? max(high-nz(high[1]), 0): 0

DirectionalMovementMinus = nz(low[1])-low > high-nz(high[1]) ? max(nz(low[1])-low, 0): 0
```

Indie, lines 15-16 of [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5):

```python
def Main(self, length, th, adx_smoothing):
    minus_di, classic_adx, plus_di = Adx.new(length, length)
```

The Pine script manually computes True Range and Directional Movements. The Indie script delegates all of this to the built-in `Adx.new` algorithm, which returns the DI+ and DI- series directly.

### ADX smoothing

Pine Script, lines 51-53 of [ADX and DI (SMA+Wilder).pinescript4](ADX%20and%20DI%20(SMA+Wilder).pinescript4):

```pine
DX = abs(DIPlus-DIMinus) / (DIPlus+DIMinus)*100

ADX = sma(DX, len)
```

Indie, lines 21-24 of [ADX and DI (SMA+Wilder).indie5](ADX%20and%20DI%20(SMA+Wilder).indie5):

```python
    dx_series = MutSeriesF.new(dx_val)
    original_adx = Sma.new(dx_series, length)

    final_adx_val = original_adx[0] if adx_smoothing == 'SMA (Original)' else classic_adx[0]
```

Pine uses `sma(DX, len)` for ADX. Indie computes both an SMA-based ADX and the classic ADX from `Adx.new`, then selects one based on the user's `adx_smoothing` parameter. This adds the flexibility of choosing between SMA and Wilder smoothing.

## Reading the chart

* **DI+ (green line):** When above DI-, bullish momentum is dominant.
* **DI- (red line):** When above DI+, bearish momentum is dominant.
* **ADX (navy line):** Values above the threshold (default 20) indicate a strong trend; values below suggest a weak or ranging market.
* **Threshold (black line):** A horizontal reference line at the user-set level (default 20) to help filter out weak trends.
* **Crossovers:** A DI+ crossing above DI- can signal a bullish move; a DI- crossing above DI+ can signal a bearish move.

## Implementation notes

- The `Adx.new` algorithm internally handles the Wilder smoothing for the classic ADX, so no manual Wilder smoothing is needed in this code.
- Zero-division protection is applied only to the DX calculation; the built-in `Adx.new` already handles its own edge cases.
- The threshold line is drawn as a constant value across all bars; it does not change over time.
- The `MutSeriesF` wrapper is necessary because `Sma.new` expects a series input, but `dx_val` is a scalar per bar.

## FAQ

**What is the difference between 'SMA (Original)' and 'Wilder (Classic)' smoothing?**

SMA (Original) computes ADX as a simple moving average of the DX values, matching the original BeikabuOyaji script. Wilder (Classic) uses Wilder's exponential-style smoothing, which is the traditional method from J. Welles Wilder's original ADX.

**How should I set the threshold value?**

The threshold (default 20) is a horizontal line used to filter out weak trends. ADX values above the threshold indicate a strong trend; values below suggest a ranging market. You can adjust it based on the asset's typical ADX range.

**Does this indicator repaint?**

No, the indicator does not repaint. All calculations use current and past bar data only, and the output for a given bar is fixed once the bar closes.

## License and attribution

This Indie script is a derivative work of **ADX and DI by BeikabuOyaji** on TradingView. The Pine Script original carries a Mozilla Public License 2.0 notice in its header. A modified version of MPL-2.0 code must stay under [MPL-2.0](https://mozilla.org/MPL/2.0/), so this file is distributed under that license (the notice is appended to the end of the source file). The original author keeps the credit for the algorithm; this page is not affiliated with or endorsed by them.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/adx-and-di-sma-wilder-82).

```python
# indie:lang_version = 5
from math import isnan
from indie import indicator, format, param, plot, color, MutSeriesF
from indie.algorithms import Adx, Sma


@indicator('ADX and DI', format=format.PRICE)
@param.int('length', default=14, min=1, title='Length')
@param.int('th', default=20, min=1, title='Threshold')
@param.str('adx_smoothing', default='SMA (Original)', options=['SMA (Original)', 'Wilder (Classic)'], title='ADX Smoothing Method')
@plot.line(color=color.GREEN, title='DI+')
@plot.line(color=color.RED, title='DI-')
@plot.line(color=color.NAVY, title='ADX')
@plot.line(color=color.BLACK, title='Threshold')
def Main(self, length, th, adx_smoothing):
    minus_di, classic_adx, plus_di = Adx.new(length, length)

    denom = plus_di[0] + minus_di[0]
    dx_val = 0.0 if (isnan(denom) or denom == 0.0) else abs(plus_di[0] - minus_di[0]) / denom * 100

    dx_series = MutSeriesF.new(dx_val)
    original_adx = Sma.new(dx_series, length)

    final_adx_val = original_adx[0] if adx_smoothing == 'SMA (Original)' else classic_adx[0]

    return plus_di[0], minus_di[0], final_adx_val, float(th)

# ---------------------------------------------------------------------------
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/
# Derived from "ADX and DI by BeikabuOyaji" (TradingView).
# ---------------------------------------------------------------------------
```
