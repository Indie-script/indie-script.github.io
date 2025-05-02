# Elder's Force Index (EFI)

**Category:** Volume-based
**Type:** Momentum oscillator
**Used for:** Trend confirmation, divergence spotting, breakout validation

***

## Overview

Elder’s **Force Index (EFI)** is a technical indicator developed by Dr. Alexander Elder. It combines **price change** and **volume** into a single value to measure the strength of market moves.
Unlike oscillators that rely solely on price (e.g. RSI, MACD), EFI incorporates **volume**, which makes it particularly useful in identifying the **conviction** behind market movements.

***

## Formula

There are two core steps in calculating EFI:

### 1. **Raw Force Index**

```
FI = (Close_today - Close_yesterday) * Volume_today
```

This gives a one-period measurement of price momentum weighted by volume.

### 2. **Smoothed Force Index (EFI)**

To reduce noise, apply an Exponential Moving Average (EMA):

```
EFI_n = EMA(FI_raw, n)
```

Where `n` is a configurable smoothing length (default: 13).

***

## Typical Use Cases

### 1. **Trend Confirmation**

* EFI > 0: Bulls are in control (upward momentum)
* EFI < 0: Bears are dominant (downward pressure)
* Rising EFI → Increasing trend strength
* Falling EFI → Weakening trend

### 2. **Divergence Detection**

* **Bullish Divergence:** Price makes new lows, but EFI makes higher lows → potential reversal upward
* **Bearish Divergence:** Price makes new highs, but EFI makes lower highs → possible bearish setup

### 3. **Zero Line Cross**

* Cross **above zero** → bullish momentum signal
* Cross **below zero** → bearish momentum signal

***

## Indie Implementation (Lang v5)

```
#education purpose
# indie:lang_version = 5
from indie import indicator, plot, color, param, MutSeriesF
from indie.algorithms import Ema
@indicator("Elder's Force Index", overlay_main_pane=False)
@param.int('length', default=13, min=1, title="Length")
@plot.line(id='#plot_0')
def Main(self, length):
    # Create a mutable series for the Force Index calculation
    fi_series = MutSeriesF.new((self.close[0] - self.close[1]) * self.volume[0])
    # Apply exponential moving average (EMA) to smooth the Force Index
    efi = Ema.new(fi_series, length)[0]
    # Return the plotted Force Index with a white color line
    return plot.Line(efi, color=color.WHITE)
```

### Explanation:

* `MutSeriesF` allows building a time series that can be modified at each step.
* `Ema.new(series, length)[0]` returns the smoothed series.
* The result is plotted as a white line on a separate (non-overlay) pane.

***

## Pine Script Equivalent

```
//education purpose
//@version=3
// Author: Sheldon Patnett
// Discord: Sheldon#7775  / https://discord.gg/t2JTnAa
study("Elder's Force Index Function (with source)")
// User-defined input for EMA length
length = input(defval=13, title="Length")
// Function to calculate Elder's Force Index
pine_efi(len) =>
    // Calculate the raw Force Index value
    src = ((close - close[1]) * volume)
    // Apply EMA to smooth the Force Index
    efi = ema(src, len)
// Plot the Elder's Force Index with white color
plot(pine_efi(length), color=#ffffff)
```

### Key Differences vs Indie:

* Pine uses arrayless logic, whereas Indie supports mutable series (`MutSeriesF`)
* `ema()` in Pine is functionally equivalent to `Ema.new(...)[0]` in Indie

***

## Strategy Tips

* Combine EFI with **moving averages** to avoid trading against the trend.
* Use **divergences** as confirmation, not standalone signals.
* In sideways markets, EFI may give **false signals** due to low volume or noise.

***

## Limitations

* **Lag:** Due to smoothing, EFI may react late to fast reversals.
* **Volume Sensitivity:** EFI heavily depends on accurate volume data. Use cautiously in markets with low or inconsistent volume reporting (e.g., some crypto pairs).
* Not suitable for **ranging markets** without a filter.

***

## Example Pattern Recognition

**Bullish Setup:**

* Price forming higher lows
* EFI turning up from negative and crossing zero

**Bearish Setup:**

* Price hitting resistance
* EFI declining and crossing below zero

***

## Recommended Settings

* **13-period EMA**: Best for medium-term swing trading
* **2-period EMA**: Suitable for scalping or short-term signals
