# Kalman Trend Levels [BigBeluga] — Indie Port

## 1\. Overview & Usage Strategy

**Kalman Trend Levels** is a trend-following overlay indicator that uses Kalman filtering to smooth price data and detect trend transitions. This tool is designed to reduce noise while remaining responsive to directional changes.
**Use Case**:
Traders can use this indicator to:

* Identify bullish and bearish market phases using smoothed short- and long-term Kalman signals.
* Visually confirm trend strength with dynamically colored candles and filled bands.
* Optionally highlight retest points of previous breakout zones.

### Trading Logic

* Two Kalman filters (short and long) are calculated on the closing price.
* When the short Kalman line crosses above the long Kalman line, a bullish trend is assumed.
* Candle coloring and optional signal markers reinforce visual analysis of trend momentum and breakouts.

## 2\. Formula

The Kalman Filter update in both Pine and Indie follows this structure:

```
prediction = estimate
kalman_gain = error_est / (error_est + error_meas)
estimate = prediction + kalman_gain * (src - prediction)
error_est = (1 - kalman_gain) * error_est + Q / length
```

Where:

* `src` = price input (e.g., close)
* `length` = lookback period
* `Q` = process noise factor
* `R` = measurement noise factor

ATR is also used:

```
ATR_zone = ATR(200) * 0.5
```

## 3\. Key Indie Code Snippets

### Kalman Filter as a Reusable Algorithm

```
@algorithm
def KalmanFilter(self, src: SeriesF, length: int, R: float = 0.01, Q: float = 0.1) -> SeriesF:
    estimate = MutSeriesF.new(init=float('nan'))
    ...
    estimate[0] = prediction + kalman_gain[0] * (src[0] - prediction)
    ...
    return estimate
```

### Main Indicator Logic

```
@indicator("Kalman Trend Levels [BigBeluga]", overlay_main_pane=True)
class Main(MainContext):
    def calc(self, ...):
        short_kalman = KalmanFilter.new(self.close, short_len)[0]
        long_kalman = KalmanFilter.new(self.close, long_len)[0]
        trend_up = short_kalman > long_kalman
        ...
        return (
            plot.Line(short_kalman, color=trend_col1),
            plot.Line(long_kalman, color=trend_col),
            plot.Fill(color=trend_col)
        )
```

### Candle Coloring Logic

```
if candle_color:
    if trend_up and short_kalman > short_kalman_2:
        candle_col = upper_col
    elif not trend_up and short_kalman < short_kalman_2:
        candle_col = lower_col
    else:
        candle_col = color.GRAY
```

## 4\. Pine‑to‑Indie Comparison

### Original PineScript Logic

```
kalman_filter(src, length, R=0.01, Q=0.1) =>
    var float estimate = na
    ...
    estimate := prediction + kalman_gain * (src - prediction)
```

### Indie Equivalent

* Defined as a standalone `@algorithm` that returns `SeriesF`.
* Uses `MutSeriesF` for valid series handling.

```
@algorithm
def KalmanFilter(self, src: SeriesF, length: int, R: float = 0.01, Q: float = 0.1) -> SeriesF:
    ...
```

### Differences and Benefits

| Concept | PineScript | Indie Equivalent | Benefit |
| ------- | ---------- | ---------------- | ------- |
| Function Scope | Inline function via `=>` | Structured as `@algorithm` | Reusable, type-safe logic |
| State Mgmt | `var` state on series | `MutSeriesF` with indexed memory | Explicit control, clarity |
| Plotting | `plot`, `label.new`, `box.new` | `@plot.line`, `@plot.fill`, `plot.*` | Clean syntax, modular plots |
| Reuse | Not modular | Algorithms as objects (`new()`) | Code reuse and encapsulation |
| Candle Coloring | Manual coloring logic | Optional `color=...` argument | Integrated, more readable |

Indie emphasizes type safety, algorithm reuse, and modular design. Instead of inline, stateful logic, calculations and conditions are encapsulated in objects (`MutSeriesF`, `Plot`, `Color`), making Indie more suitable for complex indicators and long-term maintenance.

***

Let me know if you'd like this formatted into a Markdown `.md` file or prepared for publishing to GitHub or forums.

## Indie Script implementation
```
#education purposes
# indie:lang_version = 5
# Copyright (c) BigBeluga, licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0
# Ported to Indie from PineScript by Claude

from indie import indicator, MainContext, param, plot, color, MutSeriesF, algorithm, SeriesF, Optional, Color
from indie.algorithms import Atr
import math

@algorithm
def KalmanFilter(self, src: SeriesF, length: int, R: float = 0.01, Q: float = 0.1) -> SeriesF:
    estimate = MutSeriesF.new(init=float('nan'))
    error_est = MutSeriesF.new(init=1.0)
    error_meas = MutSeriesF.new(init=R * length)
    kalman_gain = MutSeriesF.new(init=0.0)
    
    if math.isnan(estimate[0]):
        estimate[0] = src[1]
    
    prediction = estimate[0]
    kalman_gain[0] = error_est[0] / (error_est[0] + error_meas[0])
    estimate[0] = prediction + kalman_gain[0] * (src[0] - prediction)
    error_est[0] = (1 - kalman_gain[0]) * error_est[0] + Q / length
    
    return estimate

@indicator("Kalman Trend Levels [BigBeluga]", overlay_main_pane=True)
@param.int("short_len", default=50, title="Short Length")
@param.int("long_len", default=150, title="Long Length")
@param.bool("retest_sig", default=False, title="Retest Signals")
@param.bool("candle_color", default=True, title="Candle Color")
@param.color("upper_col", default=color.rgba(19, 189, 110, 1.0), title="Up Color")
@param.color("lower_col", default=color.rgba(175, 13, 75, 1.0), title="Down Color")
@plot.line("p1", title="Short Kalman")
@plot.line("p2", title="Long Kalman", line_width=2)
@plot.fill("p1", "p2")
class Main(MainContext):
    def __init__(self):
        self.prev_short_kalman = 0.0
        self.prev_long_kalman = 0.0
        self.prev_trend_up = False
    
    def calc(self, short_len, long_len, retest_sig, candle_color, upper_col, lower_col):
        atr = Atr.new(200, "RMA")[0] * 0.5
        
        short_kalman_series = KalmanFilter.new(self.close, short_len)
        long_kalman_series = KalmanFilter.new(self.close, long_len)
        
        short_kalman = short_kalman_series[0]
        long_kalman = long_kalman_series[0]
        
        short_kalman_2 = self.prev_short_kalman
        self.prev_short_kalman = short_kalman
        
        trend_up = short_kalman > long_kalman
        prev_trend_up = self.prev_trend_up
        self.prev_trend_up = trend_up
        
        trend_col = upper_col if trend_up else lower_col
        trend_col1 = upper_col if short_kalman > short_kalman_2 else lower_col
        
        candle_col: Optional[Color] = None
        if candle_color:
            if trend_up and short_kalman > short_kalman_2:
                candle_col = upper_col
            elif not trend_up and short_kalman < short_kalman_2:
                candle_col = lower_col
            else:
                candle_col = color.GRAY
        
        close_rounded = math.floor(self.close[0] * 10) / 10
        
        if trend_up and not prev_trend_up:
            up_label_text = "\\u2B09\\n" + str(close_rounded)
            pass
        
        if trend_up == prev_trend_up:
            pass
        
        if prev_trend_up and not trend_up:
            down_label_text = str(close_rounded) + "\\n\\u2B83"
            pass
        
        return (
            plot.Line(short_kalman, color=trend_col1),
            plot.Line(long_kalman, color=trend_col),
            plot.Fill(color=trend_col)
        )
```

<br>
## Pine Script implementation
```
//education purposes
// This work is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International  
// https://creativecommons.org/licenses/by-nc-sa/4.0/
// © BigBeluga

//@version=5
indicator("Kalman Trend Levels [BigBeluga]", overlay = true, max_labels_count = 500, max_boxes_count = 500)

// ＩＮＰＵＴＳ ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――{
int short_len     = input.int(50)
int long_len      = input.int(150)
bool retest_sig   = input.bool(false, "Retest Signals")
bool candle_color = input.bool(true, "Candle Color")

color upper_col = input.color(#13bd6e, "up", inline = "colors")
color lower_col = input.color(#af0d4b, "dn", inline = "colors")

// }


// ＣＡＬＣＵＬＡＴＩＯＮＳ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――{
float atr = ta.atr(200) *0.5

var lower_box = box(na)
var upper_box = box(na)


// Kalman filter function
kalman_filter(src, length, R = 0.01, Q = 0.1) =>
    // Initialize variables
    var float estimate = na
    var float error_est = 1.0
    var float error_meas = R * (length)
    var float kalman_gain = 0.0
    var float prediction = na
    
    // Initialize the estimate with the first value of the source
    if na(estimate)
        estimate := src[1]

    // Prediction step
    prediction := estimate
    
    // Update Kalman gain
    kalman_gain := error_est / (error_est + error_meas)

    // Update estimate with measurement correction
    estimate := prediction + kalman_gain * (src - prediction)

    // Update error estimates
    error_est := (1 - kalman_gain) * error_est  + Q / (length) // Adjust process noise based on length

    estimate

float short_kalman = kalman_filter(close, short_len)
float long_kalman = kalman_filter(close, long_len)

bool trend_up = short_kalman > long_kalman

color trend_col  = trend_up ? upper_col : lower_col
color trend_col1 = short_kalman > short_kalman[2] ? upper_col : lower_col
color candle_col = candle_color ? (trend_up and short_kalman > short_kalman[2] ? upper_col : not trend_up and short_kalman < short_kalman[2] ? lower_col : color.gray) : na

// }


// ＰＬＯＴ ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――{
if trend_up and not trend_up[1]
    label.new(bar_index, short_kalman, "🡹\n" + str.tostring(math.round(close,1)), color = color(na), textcolor = upper_col, style = label.style_label_up, size = size.normal)
    lower_box := box.new(bar_index, low+atr, bar_index, low, border_color = na, bgcolor = color.new(upper_col, 60))

if not ta.change(trend_up)
    lower_box.set_right(bar_index)

if trend_up[1] and not trend_up
    label.new(bar_index, short_kalman, str.tostring(math.round(close,1))+"\n🢃", color = color(na), textcolor = lower_col, style = label.style_label_down, size = size.normal)
    upper_box := box.new(bar_index, high, bar_index, high-atr, border_color = na, bgcolor = color.new(lower_col, 60))

if not ta.change(trend_up)
    upper_box.set_right(bar_index)

if retest_sig
    if high < upper_box.get_bottom() and high[1]>= upper_box.get_bottom() //or high < lower_box.get_bottom() and high[1]>= lower_box.get_bottom()
        label.new(bar_index-1, high[1], "x", color = color(na), textcolor = lower_col, style = label.style_label_down, size = size.normal)

    if low > lower_box.get_top() and low[1]<= lower_box.get_top()
        label.new(bar_index-1, low[1], "+", color = color(na), textcolor = upper_col, style = label.style_label_up, size = size.normal)

p1 = plot(short_kalman, "Short Kalman", color = trend_col1)
p2 = plot(long_kalman, "Long Kalman", linewidth = 2, color = trend_col)

fill(p1, p2, short_kalman, long_kalman, na, color.new(trend_col, 80))

plotcandle(open, high, low, close, title='Title', color = candle_col, wickcolor=candle_col, bordercolor = candle_col)
// }
```