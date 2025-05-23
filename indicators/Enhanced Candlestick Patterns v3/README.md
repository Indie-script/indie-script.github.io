# Enhanced Candlestick Patterns v3 (Indie v5)

## Overview

This indicator detects 10 major **reversal candlestick patterns** using price action, trend filters, volume confirmation, and volatility-based constraints. It is designed for **price action traders**, **strategy developers**, and **learners transitioning from PineScript to Indie v5**. The logic adheres closely to **canonical definitions** of each pattern, with built-in flexibility via parameters for tuning to market conditions.
The script is optimized for educational clarity and modularity, making it a valuable reference for those studying the Indie language.

***

## Patterns Detected

* **Bullish Patterns**:
    * Bullish Engulfing
    * Morning Star
    * Hammer
    * Piercing Line
    * Three White Soldiers
* **Bearish Patterns**:
    * Bearish Engulfing
    * Evening Star
    * Shooting Star
    * Dark Cloud Cover
    * Three Black Crows

Each is shown on the chart using **@plot.marker** decorators with meaningful colors and labels.

***

## Strategy & Algorithmic Approach

### Trend Detection

A trend filter is applied using a dual EMA comparison:

```
fast_ema = Ema.new(self.close, fast_ema_len)
slow_ema = Ema.new(self.close, slow_ema_len)

in_uptrend = fast_ema[0] > slow_ema[0]
in_downtrend = fast_ema[0] < slow_ema[0]
```

This ensures that reversal patterns are only considered in appropriate market phases.

### ATR-Based Volatility Normalization

All pattern logic uses ATR as a proxy for current volatility:

```
atr14 = Atr.new(14)
```

Pattern features (body size, gap size, shadows) are compared as ratios to `atr14[0]` to avoid false positives during low-volatility conditions.

### Volume Confirmation

Engulfing patterns require a volume increase for validation:

```
ctx.volume[0] > ctx.volume[1] * volume_ratio
```

This helps reduce noise in ranging markets.

***

## Example: Morning Star Logic (Simplified)

Conditions:

* Bearish first candle (large body)
* Small-bodied second candle (indecision)
* Bullish third candle that closes above midpoint of first
* At least one ATR-based gap present

```
gap_down = min(open1, close1) - max(open2, close2) > gap_atr_ratio * atr
gap_up = min(open3, close3) - max(open2, close2) > gap_atr_ratio * atr

closes_above_midpoint = close3 > (open1 + close1) / 2
```

All conditions must be satisfied for a Morning Star marker to appear.

***

## Parameters

The script includes configurable parameters for fine-tuning:

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `doji_ratio` | Max body-to-range ratio for Doji | 0.05 |
| `shadow_body_ratio` | Min shadow-to-body ratio for Hammer/Shooting Star | 2.0 |
| `minimum_body_atr` | Min body size as a % of ATR | 0.3 |
| `gap_atr_ratio` | Min gap size (ATR-normalized) for stars | 0.1 |
| `volume_ratio` | Min volume multiplier for engulfing patterns | 1.2 |
| `fast_ema` | EMA for short-term trend filtering | 20 |
| `slow_ema` | EMA for long-term trend filtering | 50 |

All are exposed via `@param.*` decorators and can be adjusted from the indicator settings panel.

***

## Educational Notes for Indie Learners

* The indicator follows the `Main(self)` entry pattern required in Indie v5.
* Uses Indie-native series objects (`Ema.new()`, `Atr.new()`) instead of manual loops.
* Pattern logic is cleanly separated into modular Python-style functions.
* The use of `Series[float]` and indexing (`ctx.close[1]`) will feel familiar to PineScript users, but Indie provides **explicit type safety and structuring**.
* Indie does **not** allow Python-style chained comparisons (`x < y < z`). Instead, use `x < y and y < z`.

***

## Visual Output

* All patterns are rendered via `@plot.marker()` using `LABEL` style.
* Marker positions (above/below) are chosen based on bullish/bearish context.
* Each pattern uses a unique color for quick visual distinction.

***

## Performance Considerations

* The pattern logic is strictly single-pass (`self[...]` used directly).
* No loops or recursive constructs are used, ensuring fast real-time updates.
* Avoids excessive historical back-referencing to maintain forward-testing compatibility.

***

## Use Case

* Suitable for discretionary traders looking for visual pattern signals.
* Can be extended into a rule-based strategy using `@strategy.order()` logic.
* Works best on higher timeframes (1H+) where patterns are statistically meaningful.

***

## License & Usage

Feel free to modify and use the code in personal or commercial projects, provided attribution is maintained. For contributions or suggestions, open a pull request or issue.

***

Source code (Indie Script Language V5)

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color, MainContext
from indie.algorithms import Ema, Atr
import math

# Define helper functions at global scope
def is_downtrend(fast_ema: float, slow_ema: float) -> bool:
    return fast_ema < slow_ema

def is_uptrend(fast_ema: float, slow_ema: float) -> bool:
    return fast_ema > slow_ema

def is_significant_body(body: float, atr_value: float, minimum_body_atr: float) -> bool:
    return body > minimum_body_atr * atr_value

def is_doji(ctx: MainContext, i: int, atr_value: float, doji_ratio: float) -> bool:
    high, low = ctx.high[i], ctx.low[i]
    open_, close = ctx.open[i], ctx.close[i]
    body = abs(close - open_)
    range_ = high - low
    
    # Check if range is significant compared to market volatility
    is_significant = range_ > 0.3 * atr_value
    
    # Traditional doji has very small body relative to range
    return is_significant and body <= doji_ratio * range_

def is_small_body(ctx: MainContext, i: int) -> bool:
    open_, close = ctx.open[i], ctx.close[i]
    high, low = ctx.high[i], ctx.low[i]
    body = abs(close - open_)
    range_ = high - low
    
    return body < 0.3 * range_

def is_bullish_engulfing(ctx: MainContext, atr_value: float, minimum_body_atr: float, volume_ratio: float) -> bool:
    body_prev = abs(ctx.close[1] - ctx.open[1])
    body_curr = abs(ctx.close[0] - ctx.open[0])
    
    # Check for significant body size
    is_significant = is_significant_body(body_curr, atr_value, minimum_body_atr)
    
    return (
        ctx.close[1] < ctx.open[1] and  # Previous candle is bearish
        ctx.close[0] > ctx.open[0] and  # Current candle is bullish
        ctx.open[0] <= ctx.close[1] and ctx.close[0] >= ctx.open[1] and  # Body engulfing
        is_significant and
        ctx.volume[0] > ctx.volume[1] * volume_ratio  # Volume confirmation
    )

def is_bearish_engulfing(ctx: MainContext, atr_value: float, minimum_body_atr: float, volume_ratio: float) -> bool:
    body_prev = abs(ctx.close[1] - ctx.open[1])
    body_curr = abs(ctx.close[0] - ctx.open[0])
    
    # Check for significant body size
    is_significant = is_significant_body(body_curr, atr_value, minimum_body_atr)
    
    return (
        ctx.close[1] > ctx.open[1] and  # Previous candle is bullish
        ctx.close[0] < ctx.open[0] and  # Current candle is bearish
        ctx.open[0] >= ctx.close[1] and ctx.close[0] <= ctx.open[1] and  # Body engulfing
        is_significant and
        ctx.volume[0] > ctx.volume[1] * volume_ratio  # Volume confirmation
    )

def is_morning_star(ctx: MainContext, atr_value: float, minimum_body_atr: float, gap_atr_ratio: float) -> bool:
    open1, close1 = ctx.open[2], ctx.close[2]
    open2, close2 = ctx.open[1], ctx.close[1]
    open3, close3 = ctx.open[0], ctx.close[0]

    body1 = abs(close1 - open1)
    body3 = abs(close3 - open3)
    
    # First candle should be bearish and significant
    is_bearish1 = close1 < open1 
    is_significant1 = is_significant_body(body1, atr_value, minimum_body_atr)
    
    # Second candle should have a small body
    is_small_body2 = is_small_body(ctx, 1)
    
    # Third candle should be bullish and significant
    is_bullish3 = close3 > open3
    is_significant3 = is_significant_body(body3, atr_value, minimum_body_atr)
    
    # Check for gaps or near-gaps using ATR
    gap_down = min(open1, close1) - max(open2, close2) > gap_atr_ratio * atr_value
    gap_up = min(open3, close3) - max(open2, close2) > gap_atr_ratio * atr_value
    
    # Check if third candle closes above midpoint of first
    closes_above_midpoint = close3 > (open1 + close1) / 2

    return (
        is_bearish1 and is_significant1 and
        is_small_body2 and
        is_bullish3 and is_significant3 and
        closes_above_midpoint and
        (gap_down or gap_up)  # At least one gap should be present
    )

def is_evening_star(ctx: MainContext, atr_value: float, minimum_body_atr: float, gap_atr_ratio: float) -> bool:
    open1, close1 = ctx.open[2], ctx.close[2]
    open2, close2 = ctx.open[1], ctx.close[1]
    open3, close3 = ctx.open[0], ctx.close[0]

    body1 = abs(close1 - open1)
    body3 = abs(close3 - open3)
    
    # First candle should be bullish and significant
    is_bullish1 = close1 > open1
    is_significant1 = is_significant_body(body1, atr_value, minimum_body_atr)
    
    # Second candle should have a small body
    is_small_body2 = is_small_body(ctx, 1)
    
    # Third candle should be bearish and significant
    is_bearish3 = close3 < open3
    is_significant3 = is_significant_body(body3, atr_value, minimum_body_atr)
    
    # Check for gaps or near-gaps using ATR
    gap_up = min(open2, close2) - max(open1, close1) > gap_atr_ratio * atr_value
    gap_down = min(open2, close2) - max(open3, close3) > gap_atr_ratio * atr_value
    
    # Check if third candle closes below midpoint of first
    closes_below_midpoint = close3 < (open1 + close1) / 2

    return (
        is_bullish1 and is_significant1 and
        is_small_body2 and
        is_bearish3 and is_significant3 and
        closes_below_midpoint and
        (gap_up or gap_down)  # At least one gap should be present
    )

def is_hammer(ctx: MainContext, in_downtrend: bool, atr_value: float, shadow_body_ratio: float) -> bool:
    open_, close = ctx.open[0], ctx.close[0]
    high, low = ctx.high[0], ctx.low[0]
    body = abs(close - open_)
    range_ = high - low
    upper_shadow = high - max(open_, close)
    lower_shadow = min(open_, close) - low
    
    is_significant = range_ > 0.5 * atr_value
    
    return (
        in_downtrend and
        is_significant and
        body > 0 and  # Ensure there is a body
        lower_shadow > shadow_body_ratio * body and  # Long lower shadow
        upper_shadow < 0.5 * body and  # Small upper shadow
        close >= open_  # Preferably bullish (close >= open)
    )

def is_shooting_star(ctx: MainContext, in_uptrend: bool, atr_value: float, shadow_body_ratio: float) -> bool:
    open_, close = ctx.open[0], ctx.close[0]
    high, low = ctx.high[0], ctx.low[0]
    body = abs(close - open_)
    range_ = high - low
    upper_shadow = high - max(open_, close)
    lower_shadow = min(open_, close) - low
    
    is_significant = range_ > 0.5 * atr_value
    
    return (
        in_uptrend and
        is_significant and
        body > 0 and  # Ensure there is a body
        upper_shadow > shadow_body_ratio * body and  # Long upper shadow
        lower_shadow < 0.5 * body and  # Small lower shadow
        close <= open_  # Preferably bearish (close <= open)
    )

def is_dark_cloud_cover(ctx: MainContext, in_uptrend: bool, atr_value: float, minimum_body_atr: float) -> bool:
    open1, close1 = ctx.open[1], ctx.close[1]
    open2, close2 = ctx.open[0], ctx.close[0]
    
    body1 = abs(close1 - open1)
    body2 = abs(close2 - open2)
    body_mid = (open1 + close1) / 2
    
    is_significant1 = is_significant_body(body1, atr_value, minimum_body_atr)
    is_significant2 = is_significant_body(body2, atr_value, minimum_body_atr)
    
    return (
        in_uptrend and
        close1 > open1 and  # First candle is bullish
        close2 < open2 and  # Second candle is bearish
        open2 > close1 and  # Second candle opens above first candle's close
        close2 < body_mid and  # Second candle closes below midpoint of first
        close2 > open1 and  # Second candle doesn't close below first candle's open
        is_significant1 and is_significant2
    )

def is_piercing(ctx: MainContext, in_downtrend: bool, atr_value: float, minimum_body_atr: float) -> bool:
    open1, close1 = ctx.open[1], ctx.close[1]
    open2, close2 = ctx.open[0], ctx.close[0]
    
    body1 = abs(close1 - open1)
    body2 = abs(close2 - open2)
    body_mid = (open1 + close1) / 2
    
    is_significant1 = is_significant_body(body1, atr_value, minimum_body_atr)
    is_significant2 = is_significant_body(body2, atr_value, minimum_body_atr)
    
    return (
        in_downtrend and
        close1 < open1 and  # First candle is bearish
        close2 > open2 and  # Second candle is bullish
        open2 < close1 and  # Second candle opens below first candle's close
        close2 > body_mid and  # Second candle closes above midpoint of first
        close2 < open1 and  # Second candle doesn't close above first candle's open
        is_significant1 and is_significant2
    )

def is_three_black_crows(ctx: MainContext, in_uptrend: bool, atr_value: float, minimum_body_atr: float) -> bool:
    # Calculate bearish body sizes
    b1 = ctx.open[2] - ctx.close[2]
    b2 = ctx.open[1] - ctx.close[1]
    b3 = ctx.open[0] - ctx.close[0]
    
    # Calculate shadows
    upper_shadow1 = ctx.high[2] - ctx.open[2]
    upper_shadow2 = ctx.high[1] - ctx.open[1]
    upper_shadow3 = ctx.high[0] - ctx.open[0]
    
    lower_shadow1 = ctx.close[2] - ctx.low[2]
    lower_shadow2 = ctx.close[1] - ctx.low[1]
    lower_shadow3 = ctx.close[0] - ctx.low[0]
    
    # Significant bodies and small shadows relative to bodies
    are_significant = (
        b1 > minimum_body_atr * atr_value and 
        b2 > minimum_body_atr * atr_value and 
        b3 > minimum_body_atr * atr_value
    )
    
    small_shadows = (
        upper_shadow1 < 0.3 * b1 and upper_shadow2 < 0.3 * b2 and upper_shadow3 < 0.3 * b3 and
        lower_shadow1 < 0.3 * b1 and lower_shadow2 < 0.3 * b2 and lower_shadow3 < 0.3 * b3
    )
    
    # Each opens within the previous candle's body (traditional definition)
    proper_opens = (
        ctx.open[1] <= ctx.open[2] and ctx.open[1] >= ctx.close[2] and
        ctx.open[0] <= ctx.open[1] and ctx.open[0] >= ctx.close[1]
    )
    
    return (
        in_uptrend and
        # All three candles are bearish
        ctx.close[2] < ctx.open[2] and ctx.close[1] < ctx.open[1] and ctx.close[0] < ctx.open[0] and
        # Each closes lower than the previous
        ctx.close[1] < ctx.close[2] and ctx.close[0] < ctx.close[1] and
        are_significant and
        small_shadows and
        proper_opens
    )

def is_three_white_soldiers(ctx: MainContext, in_downtrend: bool, atr_value: float, minimum_body_atr: float) -> bool:
    # Calculate bullish body sizes
    b1 = ctx.close[2] - ctx.open[2]
    b2 = ctx.close[1] - ctx.open[1]
    b3 = ctx.close[0] - ctx.open[0]
    
    # Calculate shadows
    upper_shadow1 = ctx.high[2] - ctx.close[2]
    upper_shadow2 = ctx.high[1] - ctx.close[1]
    upper_shadow3 = ctx.high[0] - ctx.close[0]
    
    lower_shadow1 = ctx.open[2] - ctx.low[2]
    lower_shadow2 = ctx.open[1] - ctx.low[1]
    lower_shadow3 = ctx.open[0] - ctx.low[0]
    
    # Significant bodies and small shadows relative to bodies
    are_significant = (
        b1 > minimum_body_atr * atr_value and 
        b2 > minimum_body_atr * atr_value and 
        b3 > minimum_body_atr * atr_value
    )
    
    small_shadows = (
        upper_shadow1 < 0.3 * b1 and upper_shadow2 < 0.3 * b2 and upper_shadow3 < 0.3 * b3 and
        lower_shadow1 < 0.3 * b1 and lower_shadow2 < 0.3 * b2 and lower_shadow3 < 0.3 * b3
    )
    
    # Each opens within the previous candle's body (traditional definition)
    proper_opens = (
        ctx.open[1] >= ctx.open[2] and ctx.open[1] <= ctx.close[2] and
        ctx.open[0] >= ctx.open[1] and ctx.open[0] <= ctx.close[1]
    )
    
    return (
        in_downtrend and
        # All three candles are bullish
        ctx.close[2] > ctx.open[2] and ctx.close[1] > ctx.open[1] and ctx.close[0] > ctx.open[0] and
        # Each closes higher than the previous
        ctx.close[1] > ctx.close[2] and ctx.close[0] > ctx.close[1] and
        are_significant and
        small_shadows and
        proper_opens
    )

@indicator('Enhanced Candlestick Patterns v3', overlay_main_pane=True)
@param.float('doji_ratio', default=0.05, min=0.01, max=0.2, title='Doji Body/Range Ratio')
@param.float('shadow_body_ratio', default=2.0, min=1.0, max=5.0, title='Shadow/Body Ratio')
@param.float('minimum_body_atr', default=0.3, min=0.1, max=1.0, title='Minimum Body/ATR Ratio')
@param.float('gap_atr_ratio', default=0.1, min=0.0, max=0.5, title='Gap/ATR Ratio')
@param.float('volume_ratio', default=1.2, min=1.0, max=3.0, title='Volume Increase Ratio')
@param.int('fast_ema', default=20, min=5, max=50, title='Fast EMA Length')
@param.int('slow_ema', default=50, min=20, max=200, title='Slow EMA Length')
# Bullish Patterns (varying shades of green/teal)
@plot.marker(color=color.GREEN, text='BE', style=plot.marker_style.LABEL, position=plot.marker_position.BELOW)  # Bullish Engulfing
@plot.marker(color=color.TEAL, text='MORN', style=plot.marker_style.LABEL, position=plot.marker_position.BELOW)  # Morning Star
@plot.marker(color=color.LIME, text='H', style=plot.marker_style.LABEL, position=plot.marker_position.BELOW)  # Hammer
@plot.marker(color=color.rgba(0, 180, 80, 1), text='P', style=plot.marker_style.LABEL, position=plot.marker_position.BELOW)  # Piercing
@plot.marker(color=color.rgba(0, 128, 64, 1), text='TWS', style=plot.marker_style.LABEL, position=plot.marker_position.BELOW)  # Three White Soldiers

# Bearish Patterns (varying shades of red/purple)
@plot.marker(color=color.RED, text='SE', style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE)  # Bearish Engulfing
@plot.marker(color=color.PURPLE, text='EVE', style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE)  # Evening Star
@plot.marker(color=color.FUCHSIA, text='SS', style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE)  # Shooting Star
@plot.marker(color=color.rgba(180, 0, 80, 1), text='DCC', style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE)  # Dark Cloud Cover
@plot.marker(color=color.MAROON, text='TBC', style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE)  # Three Black Crows
def Main(self, doji_ratio, shadow_body_ratio, minimum_body_atr, gap_atr_ratio, volume_ratio, fast_ema, slow_ema):
    # Main indicator logic
    h = self.high[0] - self.low[0]

    # Compute indicators
    fast_ema_series = Ema.new(self.close, fast_ema)
    slow_ema_series = Ema.new(self.close, slow_ema)
    atr14 = Atr.new(14)

    in_downtrend = is_downtrend(fast_ema_series[0], slow_ema_series[0])
    in_uptrend = is_uptrend(fast_ema_series[0], slow_ema_series[0])

    return (
        self.low[0] - h * 0.05 if is_bullish_engulfing(self, atr14[0], minimum_body_atr, volume_ratio) else math.nan,
        self.high[0] + h * 0.05 if is_bearish_engulfing(self, atr14[0], minimum_body_atr, volume_ratio) else math.nan,
        self.low[0] - h * 0.1 if is_morning_star(self, atr14[0], minimum_body_atr, gap_atr_ratio) else math.nan,
        self.high[0] + h * 0.1 if is_evening_star(self, atr14[0], minimum_body_atr, gap_atr_ratio) else math.nan,
        self.low[0] - h * 0.15 if is_hammer(self, in_downtrend, atr14[0], shadow_body_ratio) else math.nan,
        self.high[0] + h * 0.15 if is_shooting_star(self, in_uptrend, atr14[0], shadow_body_ratio) else math.nan,
        self.high[0] + h * 0.2 if is_dark_cloud_cover(self, in_uptrend, atr14[0], minimum_body_atr) else math.nan,
        self.low[0] - h * 0.2 if is_piercing(self, in_downtrend, atr14[0], minimum_body_atr) else math.nan,
        self.high[0] + h * 0.25 if is_three_black_crows(self, in_uptrend, atr14[0], minimum_body_atr) else math.nan,
        self.low[0] - h * 0.25 if is_three_white_soldiers(self, in_downtrend, atr14[0], minimum_body_atr) else math.nan
    )
```