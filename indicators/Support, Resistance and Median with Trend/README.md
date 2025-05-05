# Support, Resistance and Median with Trend

## About the Indicator

Based on a user-defined historical lookback period, the **Support, Resistance and Median with Trend** indicator is a market structure tool designed to identify key horizontal price zones - specifically the most recent support, resistance, and median levels.
This tool helps traders:

* Understand where price has recently found support or resistance
* Detect short-term trend bias (uptrend, downtrend, or neutral)
* Anticipate future levels via optional projections (in the Pine version)

It is ideal for range-bound and trending markets where horizontal levels serve as reversal zones or breakout triggers.

***

## Usage Strategy

Use this indicator to:

* Identify logical entry and exit zones
* Confirm breakouts or rejections around key levels
* Combine with other tools (e.g., RSI, volume, candlestick patterns) for confluence

### Trend Conditions:

* **Uptrend**: Price and previous candle are both above the median
* **Downtrend**: Price and previous candle are both below the median
* **Neutral**: Otherwise

A visual label indicates trend direction, enabling fast market scanning.

***

## Input Parameters

| Parameter | Description | Type | Default | Options |
| --------- | ----------- | ---- | ------- | ------- |
| `length` | Historical period to calculate levels | Integer | 22 | 22, 44, 66 |

***

## Formula

```
resistance = highest(high, length)
support = lowest(low, length)
median = (resistance + support) / 2

is_uptrend = close[0] > median and close[1] > median
is_downtrend = close[0] < median and close[1] < median
```

***

## Visualization & Interpretation

* **Red Line**: Resistance
* **Green Line**: Support
* **White Line**: Median
* **Top-Right Box**: Shows current trend status (Uptrend / Downtrend / Neutral)

**Interpretation Guide:**

* Price near support = potential buying zone
* Price near resistance = potential selling zone
* Median = trend pivot or mean-reversion target
* Trend box = visual cue for momentum confirmation

***

## Strategy Tips

* Combine with volume or candlestick confirmation near levels
* Use in consolidation zones for breakout planning
* Avoid false signals by filtering trend states with higher time frame bias

***

## Pine to Indie Comparison

| Feature | PineScript v5 | Indie v5 |
| ------- | ------------- | -------- |
| Plotting lines | `plot(..., style=plot.style_line)` | `@plot.line(..., color=...)` |
| Trend condition check | `close > median` | `self.close[0] > median_level` |
| Historical series | `ta.highest(high, length)` | `Highest.new(self.high, length)[0]` |
| Future projections | Manual with `line.new` and arrays | Use `MutSeriesF` and `draw_line` |
| Label rendering | `table.cell(...)` | `draw_text(...)` or `Label` (planned) |

### Indie Benefits

* Explicit typing and versioning improve readability and stability
* Class-based syntax scales better for complex indicators
* MutSeries allows time-series tracking for projections

***

## Key Code Logic (Indie v5)

```
highest_high = Highest.new(self.high, length)[0]
lowest_low = Lowest.new(self.low, length)[0]
median_level = (highest_high + lowest_low) / 2

is_uptrend = self.close[0] > median_level and self.close[1] > median_level
is_downtrend = self.close[0] < median_level and self.close[1] < median_level

return highest_high, lowest_low, median_level
```

***

## Limitations

* Uses fixed horizontal levels, not dynamic ones (like ATR bands)
* Not predictive—purely reactive to historical range
* Trend detection is binary and does not use smoothing or filtering

***

## Ideal Use Cases

* Sideways and trending markets
* Time-based exit planning (e.g., range top hit after X candles)
* Quick filtering for multi-chart scanning

***

## Educational Value for Developers

This indicator is perfect for developers transitioning from Pine to Indie. It:

* Demonstrates `SeriesF` usage
* Illustrates `@plot.line` decorators
* Uses structured, class-based `MainContext` logic
* Offers a clear comparison of how Indie handles mutable series and input parameters

***

## Full Source Code (Indie)

```python
#education purpose
# indie:lang_version = 5
from indie import indicator, param, plot, color, MainContext
from indie.algorithms import Highest, Lowest

@indicator("Support, Resistance and Median with Trend", overlay_main_pane=True)
@param.int("length", default=22, min=1, title="Historical Length")
@plot.line("resistance", color=color.RED, line_width=2, title="Resistance")
@plot.line("support", color=color.GREEN, line_width=2, title="Support")
@plot.line("median", color=color.WHITE, line_width=1, title="Median")
class Main(MainContext):
    def calc(self, length):
        # Calculate support and resistance levels
        highest_high = Highest.new(self.high, length)[0]
        lowest_low = Lowest.new(self.low, length)[0]
        
        # Adjust levels
        resistance_level = highest_high
        support_level = lowest_low
        
        # Calculate median
        median_level = (resistance_level + support_level) / 2
        
        # Trend detection
        is_uptrend = self.close[0] > median_level and self.close[1] > median_level
        is_downtrend = self.close[0] < median_level and self.close[1] < median_level
        
        return resistance_level, support_level, median_level

```

***

## Full Source Code (Pine v5)

```
//education purpose
//@version=5
indicator("Support, Resistance and Median with Trend", overlay=true)

// Parameters
length = input.int(22, title="Historical Length", options=[22, 44, 66])
projectionPeriods = 8 // Number of periods for projection

// Calculate support and resistance levels
highestHigh = ta.highest(high, length)
lowestLow = ta.lowest(low, length)

// Adjust levels based on sensitivity
resistanceLevel = highestHigh * 1
supportLevel = lowestLow * 1

// Calculate median
medianLevel = (resistanceLevel + supportLevel) / 2

// Trend detection
isUptrend = close > medianLevel and close[1] > medianLevel[1]
isDowntrend = close < medianLevel and close[1] < medianLevel[1]

// Plot support, resistance, and median levels for current periods
plot(resistanceLevel, title="Resistance", color=color.red, linewidth=2, style=plot.style_line)
plot(supportLevel, title="Support", color=color.green, linewidth=2, style=plot.style_line)
plot(medianLevel, title="Median", color=color.white, linewidth=1, style=plot.style_line)

// Trend box in top right corner
var table trendTable = table.new(position.top_right, 1, 1)
table.cell(trendTable, 0, 0, 
           isUptrend ? "Uptrend" : 
           isDowntrend ? "Downtrend" : "Neutral", 
           bgcolor=isUptrend ? color.green : 
                   isDowntrend ? color.red : color.gray)

// Create arrays to store projected values
var float[] resistanceArray = array.new_float(projectionPeriods, resistanceLevel)
var float[] supportArray = array.new_float(projectionPeriods, supportLevel)
var float[] medianArray = array.new_float(projectionPeriods, medianLevel)

// Update arrays with new values
for i = 0 to projectionPeriods - 1
    array.set(resistanceArray, i, resistanceLevel)
    array.set(supportArray, i, supportLevel)
    array.set(medianArray, i, medianLevel)

// Plot projections with lines to extend levels
for i = 0 to projectionPeriods - 1
    offset = i + 1
    if bar_index >= length - 1
        line.new(x1=bar_index, y1=array.get(resistanceArray, i),
                 x2=bar_index + offset, y2=array.get(resistanceArray, i),
                 color=color.red, width=2)
        line.new(x1=bar_index, y1=array.get(supportArray, i),
                 x2=bar_index + offset, y2=array.get(supportArray, i),
                 color=color.green, width=2)
        line.new(x1=bar_index, y1=array.get(medianArray, i),
                 x2=bar_index + offset, y2=array.get(medianArray, i),
                 color=color.white, width=1)

```

***

## License

```
MIT License
```