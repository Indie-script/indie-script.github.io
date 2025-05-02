# Multi-Timeframe Candle Range Visualizer

**Overlay Visual Indicator \| Indie v5 \+ PineScript Source \| Educational Use**

## 1\. Overview & Usage Strategy

This indicator overlays the high/low range of a selected higher timeframe (HTF) candle on the current chart. It visually highlights key support/resistance zones, aiding traders in recognizing dominant market structure without switching timeframes.

### Trading Application:

* **Support/Resistance Mapping:** Aligns intraday entries with daily/weekly swing zones.
* **Trend Context:** Bullish/bearish candle fills provide immediate sentiment cues.
* **MA Confluence:** Adds a current-timeframe moving average (MA) to gauge local trend context within broader HTF structure.

### Logic Summary:

* Uses HTF OHLC data via a secondary context (`@sec_context`)
* Compares `close` vs `open` of HTF candle to detect direction
* Visual elements:
    * Color-coded **HTF high/low lines**
    * **Transparent fill** for full candle body range
    * Overlayed **MA line** on main timeframe

***

## 2\. Formula

```
HTF_is_bullish = HTF_close >= HTF_open  
Fill_Color = GREEN (bullish) or RED (bearish), with user-defined opacity  
Current_MA = SMA(close, ma_length)
```

***

## 3\. Important Indie Code Snippets

### Define HTF Context:

```
@sec_context
def SimpleHigherTimeframeData(self):
    is_bullish = self.close[0] >= self.open[0]
    direction = 1.0 if is_bullish else 0.0
    return self.high[0], self.low[0], direction
```

### Main Class with Visual Output:

```
@indicator('Multi-timeframe with candles visualisation demo', overlay_main_pane=True)
@param.time_frame('higher_tf', default='1D', title='Higher Timeframe')
@param.int('ma_length', default=20, min=1, title='MA Length')
@param.float('fill_opacity', default=0.15, min=0.05, max=0.5, title='Fill Opacity')
@plot.line('htf_high', title='HTF High')
@plot.line('htf_low', title='HTF Low')
@plot.fill('htf_high', 'htf_low', title='HTF Candle Range')
@plot.line(color=color.YELLOW, title='Current TF MA')
class Main(MainContext):
    def __init__(self, higher_tf):
        self._htf_high, self._htf_low, self._htf_direction = self.calc_on(
            sec_context=SimpleHigherTimeframeData,
            time_frame=higher_tf
        )

    def calc(self, ma_length, fill_opacity):
        is_bullish = self._htf_direction[0] > 0.5
        level_color = color.GREEN if is_bullish else color.RED
        fill_color = color.GREEN(fill_opacity) if is_bullish else color.RED(fill_opacity)
        current_ma = Sma.new(self.close, ma_length)[0]

        return (
            plot.Line(self._htf_high[0], color=level_color),
            plot.Line(self._htf_low[0], color=level_color),
            plot.Fill(color=fill_color),
            current_ma
        )
```

***

## 4\. Pine Script to Indie Comparison

| Feature | PineScript | Indie (v5) |
| ------- | ---------- | ---------- |
| Timeframe request | `request.security(...)` | `self.calc_on(..., time_frame='1D')` |
| HTF logic location | Inline expression | Decorated `@sec_context` subroutine |
| MA calculation | `ta.sma(...)` | `Sma.new(...)` from `indie.algorithms` |
| Plot & fill setup | `plot`, `fill()` | `@plot.line`, `@plot.fill`, flexible decorators |
| Opacity/alpha control | `color.new(color, alpha)` | `color.GREEN(alpha)` using built-in color funcs |

### Key Indie Advantages:

* **Cleaner separation of logic and visuals** via class-based main context.
* **Structured multi-timeframe management** using `@sec_context`.
* **Explicit typing and code clarity**—ideal for debugging and maintainability.
* **Direct parameter control** for plotting, without nested function calls.

***

## 5\. Full Source Code

### Indie (v5)

```
# indie:lang_version = 5
#This indicator displays higher timeframe candle ranges on your current chart, making it easy to identify key support and resistance levels from larger timeframes.
#=====Overview=====
#Indicator shows the high and low of each candle from your selected higher timeframe, with color-coding to instantly identify bullish or bearish price action.
#=====Features=====
#Color-Coded Visualization: Green for bullish candles, red for bearish candles
#Transparent Fill: Highlights the entire price range of the higher timeframe candle
#Moving Average Reference: Shows a moving average on your current timeframe for context
from indie import indicator, param, plot, color, MainContext, sec_context
from indie.algorithms import Sma

@sec_context
def SimpleHigherTimeframeData(self):
    # We only need high/low range and direction
    is_bullish = self.close[0] >= self.open[0]
    direction = 1.0 if is_bullish else 0.0
    
    # Return the high, low and direction
    return self.high[0], self.low[0], direction

@indicator('Multi-timeframe with candles visualisation demo', overlay_main_pane=True)
@param.time_frame('higher_tf', default='1D', title='Higher Timeframe')
@param.int('ma_length', default=20, min=1, title='MA Length')
@param.float('fill_opacity', default=0.15, min=0.05, max=0.5, title='Fill Opacity')
@plot.line('htf_high', title='HTF High')
@plot.line('htf_low', title='HTF Low')
@plot.fill('htf_high', 'htf_low', title='HTF Candle Range')
@plot.line(color=color.YELLOW, title='Current TF MA')
class Main(MainContext):
    def __init__(self, higher_tf):
        # Get minimal data from higher timeframe
        self._htf_high, self._htf_low, self._htf_direction = self.calc_on(
            sec_context=SimpleHigherTimeframeData,
            time_frame=higher_tf
        )
    
    def calc(self, ma_length, fill_opacity):
        # Determine colors based on direction
        is_bullish = self._htf_direction[0] > 0.5
        level_color = color.GREEN if is_bullish else color.RED
        
        # Set fill color with custom opacity
        fill_color = color.GREEN(fill_opacity) if is_bullish else color.RED(fill_opacity)
        
        # Calculate current timeframe MA
        current_ma = Sma.new(self.close, ma_length)[0]
        
        # Return simplified visualization with fill
        return (
            plot.Line(self._htf_high[0], color=level_color),
            plot.Line(self._htf_low[0], color=level_color),
            plot.Fill(color=fill_color),
            current_ma
        )
```

### Pine Script (v5)

```
//@version=5
indicator("Multi-timeframe with candles visualisation demo", overlay=true)

// Input parameters
higher_tf = input.timeframe("D", "Higher Timeframe")
ma_length = input.int(20, "MA Length", minval=1)
fill_opacity = input.float(0.15, "Fill Opacity", minval=0.05, maxval=0.5)

// Get data from higher timeframe
htf_high = request.security(syminfo.ticker, higher_tf, high)
htf_low = request.security(syminfo.ticker, higher_tf, low)
htf_is_bullish = request.security(syminfo.ticker, higher_tf, close >= open)

// Calculate current timeframe MA
current_ma = ta.sma(close, ma_length)

// Determine colors based on direction
level_color = htf_is_bullish ? color.green : color.red
fill_color = htf_is_bullish ? color.new(color.green, 100 - fill_opacity * 100) : color.new(color.red, 100 - fill_opacity * 100)

// Plot the higher timeframe levels and current MA
h_line = plot(htf_high, "HTF High", color=level_color)
l_line = plot(htf_low, "HTF Low", color=level_color)
fill(h_line, l_line, title="HTF Candle Range", color=fill_color)
plot(current_ma, "Current TF MA", color=color.yellow)
```

***

## License

MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction