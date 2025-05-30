# Dynamic Volume Profile Oscillator (DVPO) – Indie Implementation

## Overview

The **Dynamic Volume Profile Oscillator** transforms traditional volume analysis into an advanced oscillator that measures price deviation from a volume-weighted equilibrium. It adapts to changing market conditions by dynamically constructing a volume profile and identifying overbought/oversold conditions based on price-volume divergence.
This indicator is designed for both discretionary traders and algorithmic strategists. It also serves as an educational tool for those transitioning from Pine Script™ to the Indie language.

***

## Core Concepts

### Volume-Weighted Equilibrium

The oscillator uses a simplified volume profile calculation:

```
VWAP = Σ (price × volume) / Σ (volume)
```

Deviation from this VWAP is then normalized:
```
Deviation = Σ (|price - VWAP| × volume_share)
```

### Oscillator Modes

The oscillator supports two modes:

1. **Mean Reversion Mode** (default):
    Measures how far current price is from VWAP, normalized by volume-weighted deviation.
    Formula:

    ```
    OscRaw = 50 + ((Price - VWAP) / (Deviation × Sensitivity)) × 25
    
    ```
2. **Standard Mode**:
    Measures smoothed volume intensity relative to its historical range:

    ```
    OscRaw = 100 × (SmoothedVolume - Min) / (Max - Min)
    
    ```

***

## Components and Visualization

### Adaptive Midline and Gradient Zones

The midline is computed as a moving average of the oscillator. Zones are defined as standard deviations around the midline:

```
Zone[i] = Midline ± StdDev × (1 - 0.1 × i)
```

These zones are plotted with 10 levels of gradient intensity, aiding visual detection of extremes.

### Signal Lines

The oscillator is double-smoothed with two EMAs:

* Fast Signal (5-period)
* Slow Signal (15-period)

Their crossovers provide early trend confirmation.

***

## Candlestick Integration

Bar colors change contextually when strong divergences occur:

```
if osc > upper_zone7 and osc > fast_signal and osc > slow_signal:
    bar_color = color.FUCHSIA
elif osc < lower_zone7 and osc < fast_signal and osc < slow_signal:
    bar_color = color.AQUA
else:
    bar_color = bullish ? GREEN : RED
```

This optional setting (`color_bars`) enhances visual clarity during extreme phases.

***

## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| `price_src` | source | Price input (e.g., close, hl2) |
| `lookback` | integer | Number of candles to build the volume profile |
| `smoothing` | integer | EMA smoothing of oscillator |
| `sensitivity` | float | Adjusts oscillator scale in mean-reversion mode |
| `mean_reversion` | bool | Toggle between mean reversion and standard volume mode |
| `use_adaptive_midline` | bool | Enables midline and zone dynamics based on historical values |
| `midline_period` | integer | Lookback for adaptive midline and standard deviation |
| `zone_width` | float | Multiplier for zone distances |
| `color_bars` | bool | Enables contextual bar coloring |

***

## Strategy Applications

### Trend Following

* Go long when `osc` crosses above midline and fast > slow signal.
* Go short when `osc` crosses below midline and fast < slow signal.

### Mean Reversion

* Look for entries near zone 9–10 or −9 to −10.
* Confirm with divergences and fading volume.

### Volume Analysis

* Use standard mode to track abnormal volume spikes.
* Use adaptive midline to detect sustained imbalances.

***

## Educational Value

This script demonstrates key Indie features:

* `@indicator`, `@param`, and `@plot` decorators for clarity
* Manual volume-weighted calculations
* Use of `MutSeriesF`, conditionals, and smoothing algorithms
* Avoidance of list comprehensions (not supported in Indie)

It is a practical reference for Pine Script users exploring Indie’s flexible, Pythonic syntax.

***

## Snippet: Oscillator Core Calculation (Simplified)

```
# Mean Reversion Mode
osc_raw = 50 + ((price - vwap) / (deviation * sensitivity)) * 25

# Standard Mode
osc_raw = 100 * (SmoothedVolume - MinVolume) / (MaxVolume - MinVolume)
```

***

## Final Notes

* Designed for intraday and swing trading
* Best combined with support/resistance and volume profile overlays
* Gradient zones provide intuitive context for positioning and risk

Indie Language code
## 
```python
# indie:lang_version = 5
# © Pavel Medvedev
# Licensed under the MIT License. You may use, copy, modify, merge, publish, 
# distribute, sublicense, and/or sell copies of the Software, subject to the 
# conditions of the MIT license. Full license text: https://opensource.org/licenses/MIT
from math import nan, isclose
from indie import indicator, param, plot, color, MutSeriesF, source, MainContext
from indie.algorithms import Sma, Ema, StdDev, Lowest, Highest

# === Indicator Declaration & Inputs ===
@indicator("Dynamic Volume Profile Oscillator", overlay_main_pane=False)
@param.source("price_src", default=source.CLOSE, title="Price Source")
@param.int("lookback", default=50, min=10, title="Lookback Period")  # Lookback for volume profile calculation
@param.int("profile_periods", default=10, min=5, max=100, title="Profile Calculation Periods")  # Not used in this version
@param.int("smoothing", default=5, min=1, max=50, title="Smoothing Length")
@param.float("sensitivity", default=1.0, min=0.1, max=5.0, step=0.1, title="Sensitivity")
@param.bool("mean_reversion", default=True, title="Mean Reversion Mode")
@param.bool("use_adaptive_midline", default=True, title="Use Adaptive Midline")
@param.int("midline_period", default=50, min=10, max=200, title="Adaptive Midline Period")
@param.float("zone_width", default=1.5, min=0.5, max=3.0, step=0.1, title="Zone Width Multiplier")
@param.bool("color_bars", default=True, title="Color Bars")

# === Plot Definitions ===
@plot.line('osc', color=color.AQUA, title="Oscillator")
@plot.line('fast_signal', color=color.FUCHSIA, title="Fast Signal")
@plot.line('slow_signal', color=color.SILVER, title="Slow Signal")
@plot.line('midline', color=color.WHITE(0.4), title="Adaptive Midline")
# Upper and Lower Zone Gradient Plots
@plot.line('upper_zone1', color=color.FUCHSIA(0.1), title="Upper Zone 1")
@plot.line('upper_zone2', color=color.FUCHSIA(0.2), title="Upper Zone 2")
@plot.line('upper_zone3', color=color.FUCHSIA(0.3), title="Upper Zone 3")
@plot.line('upper_zone4', color=color.FUCHSIA(0.4), title="Upper Zone 4")
@plot.line('upper_zone5', color=color.FUCHSIA(0.5), title="Upper Zone 5")
@plot.line('upper_zone6', color=color.FUCHSIA(0.6), title="Upper Zone 6")
@plot.line('upper_zone7', color=color.FUCHSIA(0.7), title="Upper Zone 7")
@plot.line('upper_zone8', color=color.FUCHSIA(0.8), title="Upper Zone 8")
@plot.line('upper_zone9', color=color.FUCHSIA(0.9), title="Upper Zone 9")
@plot.line('upper_zone10', color=color.FUCHSIA(1.0), title="Upper Zone 10")
@plot.line('lower_zone1', color=color.AQUA(0.1), title="Lower Zone 1")
@plot.line('lower_zone2', color=color.AQUA(0.2), title="Lower Zone 2")
@plot.line('lower_zone3', color=color.AQUA(0.3), title="Lower Zone 3")
@plot.line('lower_zone4', color=color.AQUA(0.4), title="Lower Zone 4")
@plot.line('lower_zone5', color=color.AQUA(0.5), title="Lower Zone 5")
@plot.line('lower_zone6', color=color.AQUA(0.6), title="Lower Zone 6")
@plot.line('lower_zone7', color=color.AQUA(0.7), title="Lower Zone 7")
@plot.line('lower_zone8', color=color.AQUA(0.8), title="Lower Zone 8")
@plot.line('lower_zone9', color=color.AQUA(0.9), title="Lower Zone 9")
@plot.line('lower_zone10', color=color.AQUA(1.0), title="Lower Zone 10")

class Main(MainContext):
    def calc(self, price_src, lookback, profile_periods, smoothing, sensitivity, mean_reversion,
             use_adaptive_midline, midline_period, zone_width, color_bars):

        # === 1. Calculate volume-weighted average price (VWAP) ===
        vwap_sum = 0.0
        volume_sum = 0.0
        for i in range(lookback):
            vwap_sum += price_src[i] * self.volume[i]
            volume_sum += self.volume[i]
        vwap_level = vwap_sum / volume_sum if not isclose(volume_sum, 0) else price_src[0]

        # === 2. Calculate deviation from VWAP (volume-weighted deviation) ===
        price_dev = 0.0
        for i in range(lookback):
            price_dev += abs(price_src[i] - vwap_level) * (self.volume[i] / volume_sum) if not isclose(volume_sum, 0) else 0

        # === 3. Calculate raw oscillator value based on selected mode ===
        osc_raw = 50.0
        if mean_reversion:
            if not isclose(price_dev * sensitivity, 0):
                osc_raw = 50 + ((price_src[0] - vwap_level) / (price_dev * sensitivity)) * 25
        else:
            # Use normalized smoothed volume in Standard mode
            sma_vol = Sma.new(self.volume, smoothing)
            min_vol = Lowest.new(sma_vol, lookback)[0]
            max_vol = Highest.new(sma_vol, lookback)[0]
            vol_range = max_vol - min_vol
            if not isclose(vol_range, 0):
                vol_position = (sma_vol[0] - min_vol) / vol_range
                osc_raw = min(100, max(0, vol_position * 100))

        # === 4. Smooth oscillator value ===
        osc_series = MutSeriesF.new(osc_raw)
        osc = Ema.new(osc_series, smoothing)[0]

        # === 5. Calculate signal lines ===
        fast_signal = Ema.new(osc_series, 5)[0]
        slow_signal = Ema.new(osc_series, 15)[0]

        # === 6. Calculate adaptive midline and standard deviation zones ===
        midline_series = MutSeriesF.new(osc)
        midline = Sma.new(midline_series, midline_period)[0] if use_adaptive_midline else 50.0
        stdev = StdDev.new(midline_series, midline_period)[0] * zone_width

        # === 7. Construct 10-level upper/lower zones using gradient spacing ===
        upper_zones: list[float] = [0.0] * 10
        lower_zones: list[float] = [0.0] * 10
        for i in range(10):
            upper_zones[i] = midline + stdev * (1 - i * 0.1)
            lower_zones[i] = midline - stdev * (1 - i * 0.1)

        # === 8. Return all values for plotting ===
        return (
            osc,
            fast_signal,
            slow_signal,
            midline,
            upper_zones[0], upper_zones[1], upper_zones[2], upper_zones[3], upper_zones[4],
            upper_zones[5], upper_zones[6], upper_zones[7], upper_zones[8], upper_zones[9],
            lower_zones[0], lower_zones[1], lower_zones[2], lower_zones[3], lower_zones[4],
            lower_zones[5], lower_zones[6], lower_zones[7], lower_zones[8], lower_zones[9]
        )

```
<br>

To contribute improvements or variations, feel free to fork or issue pull requests.

