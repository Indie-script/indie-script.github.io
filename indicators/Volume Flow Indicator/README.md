# Volume Flow Indicator (VFI) - Technical Analysis Tool

## Overview & Usage Strategy

### About the Indicator

The Volume Flow Indicator (VFI), developed by Markos Katsanos, is an enhanced volume-based technical indicator that improves upon the classic On Balance Volume (OBV) with three critical modifications:

1. The indicator values have clear interpretations - positive readings signal bullish conditions while negative readings indicate bearish conditions
2. Calculations use the day's typical price (HLC3) instead of just closing price
3. It implements volatility and volume thresholds to filter out noise and extreme values

The VFI helps traders identify underlying buying and selling pressure that may not be immediately evident in price action alone. It quantifies money flow by monitoring price changes in relation to volume, while filtering out insignificant movements.

### Best Practices & Strategy Tips

* **Trend Identification**: Use VFI crossing above zero as a bullish signal, below zero as bearish
* **Divergence Analysis**: Look for divergence between VFI and price as an early warning of potential reversals
* **V-Formations**: Watch for V-shaped patterns in the VFI as potential turning points
* **Confirmation Tool**: Use alongside other indicators like RSI or MACD for trade confirmation
* **Timeframe Selection**: Adjust the coefficient (coef) based on your timeframe - 0.2 for day trading, 0.1 for intraday

## Input Parameters

| Parameter | Default | Description |
| --------- | ------- | ----------- |
| length | 130 | The lookback period for VFI calculations |
| coef | 0.2 | Cutoff coefficient for volatility threshold |
| vcoef | 2.5 | Maximum volume cutoff multiplier |
| signal\_length | 5 | Length of the EMA signal line |
| smooth\_vfi | false | Apply additional smoothing to the VFI |
| show\_histo | true | Display the histogram of VFI-Signal difference |

## Formula

The VFI calculation involves several steps:

1. Calculate the log difference of typical prices:

    ```
    inter = log(typical) - log(typical[1])
    
    ```
2. Calculate volatility threshold:

    ```
    vinter = StdDev(inter, 30)
    cutoff = coef * vinter * close
    
    ```
3. Determine volume to consider:

    ```
    vave = SMA(volume, length)[1]
    vmax = vave * vcoef
    vc = min(volume, vmax)
    
    ```
4. Apply money flow calculation:

    ```
    mf = typical - typical[1]
    vcp = if mf > cutoff then vc else if mf < -cutoff then -vc else 0
    
    ```
5. Final VFI calculation:

    ```
    vfi = Sum(vcp, length) / vave
    
    ```

## Visualization & Interpretation

The VFI is displayed with multiple components:

* **Green Line**: The main VFI line showing the current money flow
* **Red Line**: EMA of the VFI (signal line)
* **Gray Histogram**: Difference between VFI and its signal line (optional)
* **Horizontal Line**: Zero line separating bullish from bearish zones

### How to Interpret Values

* **VFI > 0**: Bullish market conditions with net buying pressure
* **VFI < 0**: Bearish market conditions with net selling pressure
* **Zero Line Crossovers**: Potential trend change signals
* **Divergences**: When price makes new highs/lows but VFI doesn't confirm, a potential reversal may occur
* **Histogram Expansion**: Accelerating trend strength
* **Histogram Contraction**: Weakening trend momentum

## Key Takeaways

**Strengths:**

* Filters out insignificant price movements and extreme volume spikes
* Clear bullish/bearish interpretation based on zero line
* More sensitive than basic volume indicators for early signal detection

**Limitations:**

* Can generate false signals in ranging markets
* Requires sufficient volume data to be effective
* The default length (130) may need adjustment for different markets

**Ideal Market Conditions:**

* Works best in trending markets with consistent volume
* More reliable in liquid instruments with meaningful volume data
* Particularly effective for stocks, futures, and major cryptocurrency pairs

## Code Implementation

### Core VFI Logic in Indie

```
# Calculate typical price and log difference
typical = self.hlc3
inter = math.log(typical[0]) - math.log(typical[1])

# Calculate volatility threshold
vinter = StdDev.new(MutSeriesF.new(inter), 30)[0]
cutoff = coef * vinter * self.close[0]

# Determine volume to consider with cutoff
vave = Sma.new(self.volume, length)[1]
vmax = vave * vcoef
vc = min(self.volume[0], vmax)

# Calculate money flow and apply thresholds
mf = typical[0] - typical[1]
vcp = MutSeriesF.new(0)
if mf > cutoff:
    vcp[0] = vc
elif mf < -cutoff:
    vcp[0] = -vc

# Calculate final VFI
vfi = MutSeriesF.new(Sum.new(vcp, length)[0] / vave)
```

## Pine to Indie Comparison

For those transitioning from Pine Script to Indie, here are the key syntax differences:

| Pine Script | Indie | Notes |
| ----------- | ----- | ----- |
| `study(title = "Title")` | `@indicator('Title')` | Decorators are used in Indie for indicator definition |
| `input(130)` | `@param.int('length', default=130)` | Parameters are defined with decorators |
| `plot(vfi, color=green)` | `@plot.line(color=color.GREEN)` | Plotting is handled with decorators in Indie |
| `iff(condition, val1, val2)` | `val1 if condition else val2` | Indie uses Python's conditional expressions |
| `log(price)` | `math.log(price)` | Indie requires math module import |
| `sma(series, length)` | `Sma.new(series, length)[0]` | Indie uses class-based algorithms with `.new()` method |
| `series[1]` | `series[1]` | Array indexing is similar in both languages |
| `na` | `math.nan` | Not-a-number values use math.nan in Indie |
| No explicit series creation | `MutSeriesF.new(value)` | Indie requires explicit series creation |

### Key Differences:

1. **Series Handling**: Indie requires explicit creation of series objects using `MutSeriesF.new()` for values that will be used in time-series calculations.
2. **Indexing**: Both languages use `[0]` for current bar, but in Indie, you must specifically access the current value with `[0]` when using algorithm results.
3. **Module Imports**: In Indie, you need to explicitly import modules like `math` and algorithm classes.
4. **Parameter Definitions**: Indie uses decorators above the main function, while Pine uses `input()` inside the function.
5. **Return Values**: In Indie, you return values directly to generate plots in the order defined by decorators, while Pine uses `plot()` statements.

## Source Code

### Full Indie Implementation

```
#Education Purposes
# Ported to Indie from https://www.tradingview.com/script/MhlDpfdS-Volume-Flow-Indicator-LazyBear/ created by @LazyBear
# More info about the algorithm could be found here: https://precisiontradingsystems.com/volume-flow.htm

# This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.  
# If a copy of the MPL was not distributed with this file, you can obtain one at  
# <https://mozilla.org/MPL/2.0/>.

# indie:lang_version = 5
import math
from indie import indicator, param, MutSeriesF, level, line_style, color, plot, SeriesF
from indie.algorithms import StdDev, Sma, Sum, Ema


@indicator('VFI')  # Volume Flow Indicator
@param.int('length', default=130, min=1, title='VFI length')
@param.float('coef', default=0.2, title='Cutoff coef')
@param.float('vcoef', default=2.5, title='Max. vol. cutoff')
@param.int('signal_length', default=5, min=1, title='Signal length')
@param.bool('smooth_vfi', default=False, title='Smooth VFI')
@param.bool('show_histo', default=True, title='Show histogram')
@level(0, line_color=color.GRAY, line_style=line_style.DASHED)
@plot.histogram(color=color.GRAY(0.5), line_width=3, id='#plot_0')
@plot.line(color=color.RED, title='EMA of VFI', id='#plot_1')
@plot.line(color=color.GREEN, line_width=2, title='VFI', id='#plot_2')
def Main(self, length, coef, vcoef, signal_length, smooth_vfi, show_histo):
    typical = self.hlc3

    inter = math.log(typical[0]) - math.log(typical[1])
    vinter = StdDev.new(MutSeriesF.new(inter), 30)[0]
    cutoff = coef * vinter * self.close[0]
    vave = Sma.new(self.volume, length)[1]
    vmax = vave * vcoef
    vc = min(self.volume[0], vmax)
    mf = typical[0] - typical[1]

    vcp = MutSeriesF.new(0)
    if mf > cutoff:
        vcp[0] = vc
    elif mf < -cutoff:
        vcp[0] = -vc

    vfi: SeriesF = MutSeriesF.new(Sum.new(vcp, length)[0] / vave)
    if smooth_vfi:
        vfi = Sma.new(vfi, 3)

    vfima = Ema.new(vfi, signal_length)
    d = vfi[0] - vfima[0]

    return (
        d if show_histo else math.nan,
        vfima[0],
        vfi[0],
    )

```

### Full Pine Script Implementation

```
//Education Purposes
// @author LazyBear
//
// If you use this code in its original/modified form, do drop me a note. 
//

study(title = "Volume Flow Indicator [LazyBear]", shorttitle="VFI_LB")

length = input(130, title="VFI length")
coef = input(0.2)
vcoef = input(2.5, title="Max. vol. cutoff")
signalLength=input(5)
smoothVFI=input(false, type=bool)

ma(x,y) => smoothVFI ? sma(x,y) : x

typical=hlc3
inter = log( typical ) - log( typical[1] )
vinter = stdev(inter, 30 )
cutoff = coef * vinter * close
vave = sma( volume, length )[1]
vmax = vave * vcoef
vc = iff(volume < vmax, volume, vmax) //min( volume, vmax )
mf = typical - typical[1]
vcp = iff( mf > cutoff, vc, iff ( mf < -cutoff, -vc, 0 ) )

vfi = ma(sum( vcp , length )/vave, 3)
vfima=ema( vfi, signalLength )
d=vfi-vfima

plot(0, color=gray, style=3)
showHisto=input(false, type=bool)
plot(showHisto ? d : na, style=histogram, color=gray, linewidth=3, transp=50)
plot( vfima , title="EMA of vfi", color=orange)
plot( vfi, title="vfi", color=green,linewidth=2)

```

## License

MIT License
Copyright (c) 2025
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute
*Note: This implementation is based on the concept developed by Markos Katsanos. The original VFI indicator was adapted for educational purposes.*