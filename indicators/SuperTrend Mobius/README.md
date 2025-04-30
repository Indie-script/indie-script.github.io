# SuperTrend Mobius — Indie Script Version

**A modern SuperTrend indicator for Indie v5**, inspired by the legendary ThinkorSwim script from Mobius.

***

## 🔍 Overview

SuperTrend is a **trend-following indicator** that dynamically adjusts based on market volatility. It helps traders identify bullish or bearish market conditions and acts as both a trend filter and signal generator.
This version replicates the **original Mobius ThinkOrSwim script**, preserving all key logic while adapting it for Indie v5's syntax and constraints.

> ✅ **Key use-cases**: Trend confirmation, signal generation, crossover alerts, and dynamic support/resistance.

***

## Original Concept by Mobius (ThinkorSwim)

The classic SuperTrend logic from Mobius is:

```
Up = (HIGH + LOW) / 2 + Multiplier × ATR
Down = (HIGH + LOW) / 2 – Multiplier × ATR
SuperTrend = if close < SuperTrend[1] then Up else Down
```

This logic ensures the trend “flips” when price closes on the opposite side of the current band.

***

## 💡 Features

* ✅ **Faithful logic port from Mobius (ToS)**
* ✅ Fully Indie v5 compatible
* ✅ Works on any instrument or timeframe
* ✅ Customizable ATR period, multiplier, and MA type
* ✅ Signal markers for trend shifts
* ⚠️ **Bar coloring** is prepared but disabled for now (not released in Indie as of April 2025)
* ⚠️ **HULL MA** not available in Indie yet – fallback to RMA or others

***

## 🔧 Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `atr_mult` | float | ATR multiplier for volatility bands |
| `n_atr` | int | ATR length |
| `avg_type` | str | MA type used inside ATR calc (default: `RMA`) |

> 🔁 **Hull MA fallback**: Indie v5 does not yet support HULL. Default MA is `RMA`, which offers a good balance of responsiveness and smoothness. We will update as soon as HULL becomes available.

***

## Signal Logic

**Flip conditions:**

* If `close` crosses **below** current SuperTrend → trend flips to **UP** band → bearish (trend color: `FUCHSIA`)
* If `close` crosses **above** current SuperTrend → trend flips to **DOWN** band → bullish (trend color: `TEAL`)

**Trend & Signal Markers:**

* Circular markers are drawn **above or below price** indicating the current trend.
* Secondary gray markers mark **entry signal points** on crossovers.

***

## Code Snippet (Simplified)

```
hl2 = (high + low) / 2
atr = Atr.new(n_atr, avg_type)[0]

up = hl2 + atr_mult * atr
dn = hl2 - atr_mult * atr

st = MutSeriesF.new(0)
st[0] = up if close < st[1] else dn

cross_up = close[1] <= st[1] and close[0] > st[0]
cross_down = close[1] >= st[1] and close[0] < st[0]
```

***

## Visual Styling

* **FUCHSIA marker** for downtrend
* **TEAL marker** for uptrend
* **GRAY markers** at entry crossovers
* **SuperTrend line** plotted on price chart
* ❌ **Bar coloring** is currently disabled (not yet supported by Indie plot engine)

***

## Planned Features

* ✅ Hull MA when Indie supports it natively
* ✅ Enable `@plot.bar_color()` coloring once rendering support is released
* 🔔 Optional alert conditions for crossover events (coming soon)
* 📤 Exported values for scanner modules

***

## Credits

* Original idea and formula by **Mobius** (ThinkorSwim community)
* Indie port by [Pavel Medd]
* Special thanks to the Indie platform for enabling rapid features development

***

## License

This script is shared under a permissive open-source license. Attribution to original author (Mobius) is preserved for educational purposes.

## Indie V5 version

```python
# indie:lang_version = 5
# ------------------------------------------------------------------------------
# SuperTrend Mobius — Indie v5 Port
# © 2025 Pavel Medd (@pavelmedd)
# Licensed under the MIT License. You may use, copy, modify, merge, publish, 
# distribute, sublicense, and/or sell copies of the Software, subject to the 
# conditions of the MIT license. Full license text: https://opensource.org/licenses/MIT
# Original Concept by: Mobius (ThinkOrSwim Community)
# This Indie version is respectfully inspired by Mobius' original SuperTrend
# adapted to Indie v5 format.
# ------------------------------------------------------------------------------
from math import nan, isnan
from indie import indicator, param, plot, color, MutSeriesF
from indie.algorithms import Atr
@indicator("SuperTrend Mobius", overlay_main_pane=True)
@param.float("atr_mult", default=1.0, min=0.1, max=10.0, title="ATR Multiplier")
@param.int("n_atr", default=4, min=1, title="ATR Length")
@param.str("avg_type", default="RMA", options=["EMA", "SMA", "RMA", "WMA", "VWMA"], title="Average Type")
@plot.line(title="SuperTrend")
@plot.marker(style=plot.marker_style.CIRCLE, position=plot.marker_position.ABOVE, title="Trend Direction")
@plot.marker(color=color.GRAY(0.5), style=plot.marker_style.CIRCLE, position=plot.marker_position.ABOVE, title="Short Signal")
@plot.marker(color=color.GRAY(0.5), style=plot.marker_style.CIRCLE, position=plot.marker_position.ABOVE, title="Long Signal")
def Main(self, atr_mult, n_atr, avg_type):
    # Calculate ATR using the selected moving average type
    atr_value = Atr.new(n_atr, avg_type)[0]
    # Compute HL2 midpoint between high and low
    hl2 = (self.high[0] + self.low[0]) / 2
    # Calculate upper and lower SuperTrend thresholds
    up = hl2 + (atr_mult * atr_value)
    dn = hl2 - (atr_mult * atr_value)
    # Initialize SuperTrend series
    st = MutSeriesF.new(0)
    if self.bar_index == 0:
        # First bar: seed SuperTrend with the upper band (as per Mobius logic)
        st[0] = up
    else:
        # Flip condition: trend flips when price crosses the previous SuperTrend level
        prev_st = st[1]
        st[0] = up if self.close[0] < prev_st else dn
    # Determine if current trend is bearish
    is_downtrend = self.close[0] < st[0]
    # Detect bullish/bearish crossover signals
    cross_down = self.bar_index > 0 and self.close[1] >= st[1] and self.close[0] < st[0] 
    cross_up = self.bar_index > 0 and self.close[1] <= st[1] and self.close[0] > st[0]
    # Assign crossover marker positions
    short_signal = self.low[1] if cross_down else nan
    long_signal = self.high[1] if cross_up else nan
    # Choose price level and color for trend direction marker
    trend_val = self.high[0] if is_downtrend else self.low[0]
    trend_marker = plot.Marker(
        value=trend_val,
        color=color.FUCHSIA if is_downtrend else color.TEAL
    )
    # Draw SuperTrend line with dynamic color
    st_line = plot.Line(
        value=st[0],
        color=color.FUCHSIA if is_downtrend else color.TEAL
    )
    return (
        st_line,        # SuperTrend line with dynamic color
        trend_marker,   # Trend direction marker
        short_signal,   # Short (sell) signal marker
        long_signal     # Long (buy) signal marker
    )
```


## thinkScript Original Code
```
# Mobius
# SuperTrend
# Chat Room Request
input AtrMult = 1.0;
input nATR = 4;
input AvgType = AverageType.HULL;
input PaintBars = yes;
def ATR = MovingAverage(AvgType, TrueRange(high, close, low), nATR);
def UP = HL2 + (AtrMult * ATR);
def DN = HL2 + (-AtrMult * ATR);
def ST = if close < ST[1] then UP else DN;
plot SuperTrend = ST;
SuperTrend.AssignValueColor(if close < ST then Color.RED else Color.GREEN);
AssignPriceColor(if PaintBars and close < ST

                 then Color.RED

                 else if PaintBars and close > ST

                      then Color.GREEN

                      else Color.CURRENT);

AddChartBubble(close crosses below ST, low[1], low[1], color.Dark_Gray);
AddChartBubble(close crosses above ST, high[1], high[1], color.Dark_Gray, no);
# End Code SuperTrend
```
