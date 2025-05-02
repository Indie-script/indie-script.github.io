# Heikin Ashi Trend Channel Advanced: From Pine Script to Indie

## Overview & Usage Strategy

The Heikin Ashi Trend Channel Advanced is a sophisticated trend-following indicator that combines Heikin Ashi price smoothing with dynamic ATR-based volatility channels and optional Bollinger Band integration. It serves as a comprehensive tool for trend identification, breakout detection, and potential entry/exit points.

### Strategic Applications

This indicator excels in trending markets by providing:
1. **Trend Direction**: Green/red middle band indicates bullish/bearish momentum
2. **Trend Strength**: Channel width reflects current market volatility 
3. **Reversal Signals**: Yellow dots mark potential trend shifts when price breaches channels
4. **Support/Resistance Zones**: Upper and lower bands act as dynamic support/resistance levels

The adaptive nature of this indicator makes it particularly valuable for intermediate to long-term traders who need to filter out market noise while maintaining sensitivity to significant price movements.

## Core Algorithm

The indicator revolves around three key components:

### 1. Price Basis Calculation
```markdown
Price Close = Heikin Ashi Close OR Standard Close
where Heikin Ashi Close = (Open + High + Low + Close) / 4
```

### 2. Channel Midpoint Determination
```markdown
Smoothed Price = EMA(Price Close, ema_length)
Extra Smoothed Price = EMA(Smoothed Price, ema_length2)
Middle Band = Extra Smoothed Price
OR
Middle Band = SMA(Extra Smoothed Price, bb_length) if Bollinger option enabled
```

### 3. Dynamic Channel Boundaries
```markdown
ATR Adjustment = ATR(ema_length) × atr_multiplier × (Close / Price Close)
Upper Band = Middle Band + ATR Adjustment
Lower Band = Middle Band - ATR Adjustment
```

### 4. Signal Generation
```markdown
Trend Direction = GREEN if Middle Band > previous Middle Band, else RED
Breakout Signal = Upper Band when Close > Upper Band
                  Lower Band when Close < Lower Band
                  None otherwise
```

## Key Implementation in Indie 5

### Price Calculation and Smoothing

```python
# Compute Heikin Ashi or Standard Close
price_close = (self.open[0] + self.high[0] + self.low[0] + self.close[0]) / 4 if use_heikin_ashi else self.close[0]
price_series = MutSeriesF.new(price_close)

# Apply smoothing
smoothed_price = Ema.new(price_series, ema_length)
smoothed_price2 = Ema.new(smoothed_price, ema_length2)  # Secondary EMA for extra smoothing
```

### Channel Creation with Dynamic ATR Expansion

```python
# ATR for channel width
atr_value = Atr.new(ema_length)[0]

# Adjust ATR multiplier dynamically based on price level
price_ratio = self.close[0] / price_close if price_close != 0 else 1
adaptive_multiplier = atr_multiplier * price_ratio

# Compute channel bands
upper_band = middle_band + (adaptive_multiplier * atr_value)
lower_band = middle_band - (adaptive_multiplier * atr_value)
```

### Signal Generation Logic

```python
# Trend-based middle band color
middle_band_color = color.GREEN if middle_band > smoothed_price2[1] else color.RED

# Breakout signal with Optional[float] handling
breakout_signal: Optional[float] = None
if self.close[0] > upper_band:
    breakout_signal = upper_band  # Assign float directly
elif self.close[0] < lower_band:
    breakout_signal = lower_band

# Safe extraction using .value_or(math.nan)
plot.Line(breakout_signal.value_or(math.nan))
```

## Pine Script to Indie 5 Comparison

### Parameter Definition

#### Pine Script:
```pine
// Input parameters
ema_length = input.int(10, "EMA Length for Smoothing", minval=1)
atr_multiplier = input.float(2.0, "ATR Multiplier", minval=0.5, maxval=5.0)
use_bb_smoothing = input.bool(false, "Use Bollinger Band Smoothing?")
```

#### Indie 5:
```python
@param.int('ema_length', default=10, min=1, title='EMA Length for Smoothing')
@param.float('atr_multiplier', default=2.0, min=0.5, max=5.0, title='ATR Multiplier')
@param.bool('use_bb_smoothing', default=False, title='Use Bollinger Band Smoothing?')
```

Indie uses declarative decorators for parameter definition, making the code more organized and self-documenting. The syntax is more consistent with modern Python practices.

### Series Handling

#### Pine Script:
```pine
// Apply smoothing
smoothed_price = ta.ema(price_close, ema_length)
smoothed_price2 = ta.ema(smoothed_price, ema_length2)
```

#### Indie 5:
```python
# Apply smoothing
price_series = MutSeriesF.new(price_close)
smoothed_price = Ema.new(price_series, ema_length)
smoothed_price2 = Ema.new(smoothed_price, ema_length2)
```

Pine Script handles series implicitly, while Indie requires explicit creation of series objects with `MutSeriesF.new()`. While this adds more code, it provides clearer type safety and makes the data flow more explicit.

### Conditional Logic

#### Pine Script:
```pine
// Trend-based middle band color
middle_band_color = middle_band > smoothed_price2[1] ? color.green : color.red

// Breakout signal
var float breakout_signal = na
if close > upper_band
    breakout_signal := upper_band
else if close < lower_band
    breakout_signal := lower_band
else
    breakout_signal := na
```

#### Indie 5:
```python
# Trend-based middle band color
middle_band_color = color.GREEN if middle_band > smoothed_price2[1] else color.RED

# Breakout signal (Correct Optional[float] usage)
breakout_signal: Optional[float] = None
if self.close[0] > upper_band:
    breakout_signal = upper_band
elif self.close[0] < lower_band:
    breakout_signal = lower_band
```

Indie uses familiar Python conditional expressions (`if/elif/else`), while Pine Script uses ternary operators and reassignment syntax (`:=`). Indie's `Optional[float]` type handling is more explicit and type-safe compared to Pine's `na` approach.

### Plotting and Visualization

#### Pine Script:
```pine
// Plotting
upper_plot = plot(upper_band, "Upper Band", color=color.blue)
plot(middle_band, "Middle Band", color=middle_band_color)
lower_plot = plot(lower_band, "Lower Band", color=color.blue)
fill(upper_plot, lower_plot, color=color.new(color.gray, 90), title="Trend Channel")
```

#### Indie 5:
```python
@plot.line('upper_band', color=color.BLUE, title='Upper Band')
@plot.line('middle_band', title='Middle Band')
@plot.line('lower_band', color=color.BLUE, title='Lower Band')
@plot.fill('lower_band', 'upper_band', color=color.GRAY(0.1), title='Trend Channel')

# Then in the return statement:
return (
    plot.Line(upper_band),
    plot.Line(middle_band, color=middle_band_color),
    plot.Line(lower_band),
    plot.Line(breakout_signal.value_or(math.nan)),
    plot.Fill()
)
```

Indie separates the plot definition (decorators) from the actual value assignment (return statement), which allows for cleaner organization of code. This separation of concerns enables developers to define visualization properties once, then focus on the calculation logic.

## Key Advantages of Indie Implementation

1. **Type Safety**: Explicit typing with `Optional[float]` and series creation with `MutSeriesF.new()` leads to fewer runtime errors.

2. **Organizational Structure**: The separation of parameter definitions, plot formatting, and computational logic makes the code easier to navigate and maintain.

3. **Consistent Python Syntax**: Developers familiar with Python can leverage their existing knowledge without learning Pine Script's unique syntax.

4. **Functional Return Pattern**: The clean return statement at the end provides a clear overview of all values being plotted.

5. **Dynamic Plot Properties**: The ability to set plot colors programmatically within the `return` statement provides more flexibility than Pine Script's static plot definitions.

6. **Self-Documenting Code**: Parameter decorators with clear titles and type information make the code inherently more readable and easier to understand.

The Heikin Ashi Trend Channel Advanced indicator demonstrates how Indie's Python-based approach brings traditional software engineering benefits to trading algorithm development, offering a powerful alternative to Pine Script for developers seeking more structure and type safety in their indicators.


## Full Indie Script implementation
```
#education purpose
#created by @insurgent https://takeprofit.com/@insurgent
# indie:lang_version = 5
import math
from indie import indicator, param, plot, color, MutSeriesF, Optional
from indie.algorithms import Ema, Atr, Bb

@indicator('Heikin Ashi Trend Channel Advanced', overlay_main_pane=True)
@param.int('ema_length', default=10, min=1, title='EMA Length for Smoothing')
@param.int('ema_length2', default=20, min=1, title='Secondary EMA Length')
@param.float('atr_multiplier', default=2.0, min=0.5, max=5.0, title='ATR Multiplier')
@param.bool('use_bb_smoothing', default=False, title='Use Bollinger Band Smoothing?')
@param.int('bb_length', default=20, min=1, title='Bollinger Band Length')
@param.bool('use_heikin_ashi', default=True, title='Use Heikin Ashi Close?')

@plot.line('upper_band', color=color.BLUE, title='Upper Band')
@plot.line('middle_band', title='Middle Band')  # No `dynamic_color`
@plot.line('lower_band', color=color.BLUE, title='Lower Band')
@plot.line('breakout_signal', color=color.YELLOW, title='Breakout Signal')

@plot.fill('lower_band', 'upper_band', color=color.GRAY(0.1), title='Trend Channel', id='#fill_4')

def Main(self, ema_length, ema_length2, atr_multiplier, use_bb_smoothing, bb_length, use_heikin_ashi):
    # Compute Heikin Ashi or Standard Close
    price_close = (self.open[0] + self.high[0] + self.low[0] + self.close[0]) / 4 if use_heikin_ashi else self.close[0]
    price_series = MutSeriesF.new(price_close)

    # Apply smoothing
    smoothed_price = Ema.new(price_series, ema_length)
    smoothed_price2 = Ema.new(smoothed_price, ema_length2)  # Secondary EMA for extra smoothing

    # ATR for channel width
    atr_value = Atr.new(ema_length)[0]  # Corrected ATR usage

    # Adjust ATR multiplier dynamically based on price level
    price_ratio = self.close[0] / price_close if price_close != 0 else 1
    adaptive_multiplier = atr_multiplier * price_ratio

    # Compute default middle band (EMA-based)
    middle_band = smoothed_price2[0]

    # Override with Bollinger Band smoothing if enabled
    if use_bb_smoothing:
        bb_middle, _, _ = Bb.new(smoothed_price2, bb_length, 2.0)
        middle_band = bb_middle[0]

    # Compute channel bands
    upper_band = middle_band + (adaptive_multiplier * atr_value)
    lower_band = middle_band - (adaptive_multiplier * atr_value)

    # Trend-based middle band color
    middle_band_color = color.GREEN if middle_band > smoothed_price2[1] else color.RED

    # Breakout signal (Correct Optional[float] usage)
    breakout_signal: Optional[float] = None
    if self.close[0] > upper_band:
        breakout_signal = upper_band  # Assign float directly
    elif self.close[0] < lower_band:
        breakout_signal = lower_band

    return (
        plot.Line(upper_band),
        plot.Line(middle_band, color=middle_band_color),  # Dynamic color inside function
        plot.Line(lower_band),
        plot.Line(breakout_signal.value_or(math.nan)),  # Safe extraction using `.value_or(math.nan)`
        plot.Fill()
    )

```



## Full Pine Script implementation
```
//@version=5
indicator("Heikin Ashi Trend Channel Advanced", overlay=true)

// Input parameters
ema_length = input.int(10, "EMA Length for Smoothing", minval=1)
ema_length2 = input.int(20, "Secondary EMA Length", minval=1)
atr_multiplier = input.float(2.0, "ATR Multiplier", minval=0.5, maxval=5.0)
use_bb_smoothing = input.bool(false, "Use Bollinger Band Smoothing?")
bb_length = input.int(20, "Bollinger Band Length", minval=1)
use_heikin_ashi = input.bool(true, "Use Heikin Ashi Close?")

// Compute Heikin Ashi or Standard Close
price_close = use_heikin_ashi ? (open + high + low + close) / 4 : close

// Apply smoothing
smoothed_price = ta.ema(price_close, ema_length)
smoothed_price2 = ta.ema(smoothed_price, ema_length2)  // Secondary EMA for extra smoothing

// ATR for channel width
atr_value = ta.atr(ema_length)

// Adjust ATR multiplier dynamically based on price level
price_ratio = price_close != 0 ? close / price_close : 1
adaptive_multiplier = atr_multiplier * price_ratio

// Compute middle band - default EMA-based or Bollinger Band
var float middle_band = 0.0
if use_bb_smoothing
    middle_band := ta.sma(smoothed_price2, bb_length)
else
    middle_band := smoothed_price2

// Compute channel bands
upper_band = middle_band + (adaptive_multiplier * atr_value)
lower_band = middle_band - (adaptive_multiplier * atr_value)

// Trend-based middle band color
middle_band_color = middle_band > smoothed_price2[1] ? color.green : color.red

// Breakout signal
var float breakout_signal = na
if close > upper_band
    breakout_signal := upper_band
else if close < lower_band
    breakout_signal := lower_band
else
    breakout_signal := na

// Plotting
upper_plot = plot(upper_band, "Upper Band", color=color.blue)
plot(middle_band, "Middle Band", color=middle_band_color)
lower_plot = plot(lower_band, "Lower Band", color=color.blue)
plot(breakout_signal, "Breakout Signal", color=color.yellow)

// Fill between upper and lower bands
fill(upper_plot, lower_plot, color=color.new(color.gray, 90), title="Trend Channel")
```