# Ultimate Moving Average - Multi-TimeFrame (MTF) Indicator

## Overview & Usage Strategy

The Ultimate Moving Average Multi-TimeFrame (MTF) indicator is a comprehensive solution that combines all essential moving average types into a single, versatile tool. This indicator eliminates the need to switch between multiple indicators by consolidating seven different moving average calculations with multi-timeframe capabilities.
The indicator serves as an invaluable trend identification tool, allowing traders to identify the market direction across different timeframes. By combining both time-based and type-based flexibility, it provides a more reliable signal for entry and exit points compared to single-timeframe analysis.

### About the Indicator

The Ultimate Moving Average - Multi-TimeFrame indicator was originally created by ChrisMoody (@ChrisMoody) for TradingView. This powerful indicator offers a comprehensive solution that combines all essential moving average types into a single, versatile tool. Rather than switching between multiple indicators, traders can access seven different moving average calculations with multi-timeframe capabilities in one place.
The indicator serves as an invaluable trend identification tool, allowing traders to identify market direction across different timeframes. By combining both time-based and type-based flexibility, it provides more reliable signals for entry and exit points compared to single-timeframe analysis. ChrisMoody designed this indicator to be highly customizable while maintaining a clean, easy-to-read visual presentation on charts.

### Key Features

* **Multi-Timeframe Support**: By default, operates on the current chart's timeframe, with an option to switch to higher or lower timeframes
* **Seven Moving Average Types**: SMA, EMA, WMA, Hull MA, VWMA, RMA, and TEMA
* **Dynamic Color Changes**: Option to have the MA change color based on trend direction
* **Color Smoothing**: Adjustable smoothing to prevent color flicker during minor price movements

## Inputs and Parameters

| Parameter | Default | Description |
| --------- | ------- | ----------- |
| Use Current Chart Time Frame? | True | Toggle between current chart timeframe or custom timeframe |
| Use Different Timeframe? | "1D" | Custom timeframe to use if not using current chart timeframe |
| Moving Average Length | 20 | Lookback period for the moving average calculation |
| MA Algorithm | "SMA" | Type of moving average to calculate |
| Change Color Based On Direction? | True | Enable/disable color changes based on trend direction |
| Color Smoothing | 2 | Controls sensitivity of color changes (1 = no smoothing) |

## Moving Average Types Supported

1. **SMA (Simple Moving Average)**: The classic average of price values over a specified period
2. **EMA (Exponential Moving Average)**: Averages with more weight on recent data for quicker trend recognition
3. **WMA (Weighted Moving Average)**: Prioritizes recent prices for a balanced trend analysis
4. **Hull MA (Hull Moving Average)**: Provides a smoother and more responsive moving average
5. **VWMA (Volume Weighted Moving Average)**: Adjusts based on trading volume for enhanced accuracy
6. **RMA (Relative Moving Average)**: A variation of EMA, often used in RSI calculations
7. **TEMA (Triple Exponential Moving Average)**: Offers a faster response by combining multiple EMA layers

## Visualization / How to Interpret Values

* **Green Line**: When the moving average is trending upward (current MA value is higher than a few bars ago)
* **Red Line**: When the moving average is trending downward (current MA value is lower than a few bars ago)
* **Aqua Line**: When trend color change is disabled or no clear trend is established

The indicator helps identify:

* **Trend Direction**: Clear color coding reveals the current market trend
* **Support/Resistance**: The MA line often acts as dynamic support/resistance
* **Trend Changes**: When the line changes color, it signals a potential change in market direction

## Best Practices & Strategy Tips

* **Timeframe Combination**: Use a higher timeframe MA to confirm the overall trend direction while using the current timeframe for entry/exit timing
* **Multi-MA Strategy**: When combined with other MA types or lengths, this indicator can provide crossover signals
* **Volatility Assessment**: Compare different MA types (e.g., Hull MA vs. SMA) to gauge market volatility
* **Volume Confirmation**: Pair with volume indicators to validate the strength of the trend movement
* **Trend Confirmation**: Use this indicator to confirm trends identified by other technical tools before entry

## Core Implementation Logic

### Secondary Context Function

```
@sec_context
@param_ref('len')
@param_ref('ma_type')
def SecMain(self, len, ma_type):
    src = self.close
    if ma_type == 'HullMA':
        wma_l2 = Wma.new(src, len // 2)[0]
        wma_l = Wma.new(src, len)[0]
        return Wma.new(MutSeriesF.new(2 * wma_l2 - wma_l), round(math.sqrt(len)))[0]
    elif ma_type == 'TEMA':
        ema1 = Ema.new(src, len)
        ema2 = Ema.new(ema1, len)
        ema3 = Ema.new(ema2, len)
        return 3 * (ema1[0] - ema2[0]) + ema3[0]
    return Ma.new(src, len, ma_type)[0]
```

### Main Color Logic

```
def calc(self, cc, smoothe):
    ma_up = self._out[0] >= self._out[smoothe]
    ma_down = self._out[0] < self._out[smoothe]

    col = color.AQUA
    if cc and ma_up:
        col = color.LIME
    elif cc and ma_down:
        col = color.RED

    return plot.Line(self._out[0], color=col)
```

## Pine to Indie Comparison

### Timeframe Handling

| Pine Script | Indie |
| ----------- | ----- |
| `res = useCurrentRes ? period : resCustom` | `tf_choosed = self.time_frame if use_current_tf else tf_custom` |
| `out1 = security(tickerid, res, out)` | `self._out = self.calc_on(SecMain, time_frame=tf_choosed, lookahead=True)` |

### Moving Average Type Selection

Pine Script uses numbered options and a switch-case style selection:

```
avg = atype == 1 ? sma(src,len) : atype == 2 ? ema(src,len) : atype == 3 ? wma(src,len) : atype == 4 ? hullma : atype == 5 ? vwma(src, len) : atype == 6 ? rma(src,len) : tema
```

Indie improves readability with string options and a more structured approach:

```
@param.str('ma_type', default='SMA', options=['SMA', 'EMA', 'WMA', 'HullMA', 'VWMA', 'RMA', 'TEMA'], title='MA algorithm')
```

### Color Trend Logic

Pine Script:

```
ma_up = out1 >= out1[smoothe]
ma_down = out1 < out1[smoothe]
col = cc ? ma_up ? lime : ma_down ? red : aqua : aqua
```

Indie offers improved readability with explicit if/else statements:

```
ma_up = self._out[0] >= self._out[smoothe]
ma_down = self._out[0] < self._out[smoothe]
col = color.AQUA
if cc and ma_up:
    col = color.LIME
elif cc and ma_down:
    col = color.RED
```

### Key Advantages of Indie Implementation

1. **Parameter Organization**: Indie uses decorators (@param.X) for cleaner, more readable parameter definitions
2. **Class-Based Structure**: The MainContext class in Indie creates a more organized, object-oriented approach
3. **Secondary Context**: The @sec\_context decorator in Indie simplifies timeframe calculations compared to Pine's security() function
4. **Named Colors**: Instead of using color values directly, Indie uses named colors (color.RED, color.LIME) for better readability
5. **Type Safety**: Indie uses specific types like MutSeriesF which helps prevent runtime errors
6. **Improved Modularity**: The separation of SecMain from the main class creates better code organization
7. **More Readable Options**: String options ('SMA', 'EMA') instead of Pine's numeric options (1, 2, 3)

## Key Takeaways

* The Ultimate MA - MultiTF indicator provides a comprehensive solution for multiple moving average types and timeframes in a single tool
* The indicator dynamically changes color based on trend direction, making it easy to identify market movements visually
* Smoothing options help prevent false signals from minor price fluctuations
* The implementation in Indie offers improved readability and structure compared to the Pine Script version
* The indicator works best in trending markets and should be combined with other indicators for confirmation in ranging markets

## Source Code

### Indie Code

```
#Education Purposes
# Ported to Indie from https://www.tradingview.com/script/OQs2lVvr-Ultimate-Moving-Average-Multi-TimeFrame-7-MA-Types/ created by @ChrisMoody

# This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.  
# If a copy of the MPL was not distributed with this file, you can obtain one at  
# <https://mozilla.org/MPL/2.0/>.

# indie:lang_version = 5
import math
from indie import indicator, param, sec_context, MainContext, param_ref, color, plot, MutSeriesF
from indie.algorithms import Wma, Ema, Ma


@sec_context
@param_ref('len')
@param_ref('ma_type')
def SecMain(self, len, ma_type):
    src = self.close
    if ma_type == 'HullMA':
        wma_l2 = Wma.new(src, len // 2)[0]
        wma_l = Wma.new(src, len)[0]
        return Wma.new(MutSeriesF.new(2 * wma_l2 - wma_l), round(math.sqrt(len)))[0]
    elif ma_type == 'TEMA':
        ema1 = Ema.new(src, len)
        ema2 = Ema.new(ema1, len)
        ema3 = Ema.new(ema2, len)
        return 3 * (ema1[0] - ema2[0]) + ema3[0]
    return Ma.new(src, len, ma_type)[0]


@indicator('Ultimate MA - MultiTF', overlay_main_pane=True)
@param.bool('use_current_tf', default=True, title='Use Current Chart Time Frame?')
@param.time_frame('tf_custom', default='1D', title='Use Different Timeframe? Uncheck Box Above')
@param.int('len', default=20, min=1, title='Moving Average Length - LookBack Period')
@param.str('ma_type', default='SMA', options=['SMA', 'EMA', 'WMA', 'HullMA', 'VWMA', 'RMA', 'TEMA'], title='MA algorithm')
@param.bool('cc', default=True, title='Change Color Based On Direction?')
@param.int('smoothe', default=2, min=1, max=10, title='Color Smoothing (1 = No Smoothing)')
@plot.line(line_width=4, title='Multi-Timeframe Moving Avg', id='#plot_0')
class Main(MainContext):
    def __init__(self, use_current_tf, tf_custom):
        tf_choosed = self.time_frame if use_current_tf else tf_custom
        self._out = self.calc_on(SecMain, time_frame=tf_choosed, lookahead=True)

    def calc(self, cc, smoothe):
        ma_up = self._out[0] >= self._out[smoothe]
        ma_down = self._out[0] < self._out[smoothe]

        col = color.AQUA
        if cc and ma_up:
            col = color.LIME
        elif cc and ma_down:
            col = color.RED

        return plot.Line(self._out[0], color=col)

```

### Pine Script Code

```
//Education Purposes
//Created by user ChrisMoody 4-24-2014
//Plots The Majority of Moving Averages
//Defaults to Current Chart Time Frame --- But Can Be Changed to Higher Or Lower Time Frames
//2nd MA Capability with Show Crosses Feature
study(title="CM_Ultimate_MA_MTF", shorttitle="CM_Ultimate_MA_MTF", overlay=true)
//inputs
src = close
useCurrentRes = input(true, title="Use Current Chart Resolution?")
resCustom = input(title="Use Different Timeframe? Uncheck Box Above", type=resolution, defval="D")
len = input(20, title="Moving Average Length - LookBack Period")
atype = input(1,minval=1,maxval=7,title="1=SMA, 2=EMA, 3=WMA, 4=HullMA, 5=VWMA, 6=RMA, 7=TEMA")
cc = input(true,title="Change Color Based On Direction?")
smoothe = input(2, minval=1, maxval=10, title="Color Smoothing - 1 = No Smoothing")
doma2 = input(false, title="Optional 2nd Moving Average")
len2 = input(50, title="Moving Average Length - Optional 2nd MA")
atype2 = input(1,minval=1,maxval=7,title="1=SMA, 2=EMA, 3=WMA, 4=HullMA, 5=VWMA, 6=RMA, 7=TEMA")
cc2 = input(true,title="Change Color Based On Direction 2nd MA?")
warn = input(false, title="***You Can Turn On The Show Dots Parameter Below Without Plotting 2nd MA to See Crosses***")
warn2 = input(false, title="***If Using Cross Feature W/O Plotting 2ndMA - Make Sure 2ndMA Parameters are Set Correctly***")
sd = input(false, title="Show Dots on Cross of Both MA's")


res = useCurrentRes ? period : resCustom
//hull ma definition
hullma = wma(2*wma(src, len/2)-wma(src, len), round(sqrt(len)))
//TEMA definition
ema1 = ema(src, len)
ema2 = ema(ema1, len)
ema3 = ema(ema2, len)
tema = 3 * (ema1 - ema2) + ema3

avg = atype == 1 ? sma(src,len) : atype == 2 ? ema(src,len) : atype == 3 ? wma(src,len) : atype == 4 ? hullma : atype == 5 ? vwma(src, len) : atype == 6 ? rma(src,len) : tema
//2nd Ma - hull ma definition
hullma2 = wma(2*wma(src, len2/2)-wma(src, len2), round(sqrt(len2)))
//2nd MA TEMA definition
sema1 = ema(src, len2)
sema2 = ema(sema1, len2)
sema3 = ema(sema2, len2)
stema = 3 * (sema1 - sema2) + sema3

avg2 = atype2 == 1 ? sma(src,len2) : atype2 == 2 ? ema(src,len2) : atype2 == 3 ? wma(src,len2) : atype2 == 4 ? hullma2 : atype2 == 5 ? vwma(src, len2) : atype2 == 6 ? rma(src,len2) : tema

out = avg 
out_two = avg2

out1 = security(tickerid, res, out)
out2 = security(tickerid, res, out_two)

ma_up = out1 >= out1[smoothe]
ma_down = out1 < out1[smoothe]

col = cc ? ma_up ? lime : ma_down ? red : aqua : aqua
col2 = cc2 ? ma_up ? lime : ma_down ? red : aqua : aqua

circleYPosition = out2

plot(out1, title="Multi-Timeframe Moving Avg", style=line, linewidth=4, color = col)
plot(doma2 and out2 ? out2 : na, title="2nd Multi-TimeFrame Moving Average", style=circles, linewidth=4, color=col2)
plot(sd and cross(out1, out2) ? circleYPosition : na,style=cross, linewidth=5, color=yellow)

```

## License

This work is licensed under the MIT License. 