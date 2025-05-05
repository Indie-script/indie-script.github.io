# Squeeze Momentum Indicator (TTM Squeeze)

## Overview & Usage Strategy

### About the Indicator

The Squeeze Momentum indicator is an adaptation of John Carter's "TTM Squeeze" volatility indicator, described in chapter 11 of his book "Mastering the Trade." This technical tool helps traders identify periods of low volatility (the "squeeze") and potential explosive price movements that often follow.
Unlike Carter's original method, which uses a simple momentum indicator, this version applies a linear regression-based approach to plot the histogram, providing a more nuanced view of momentum dynamics.

### Key Takeaways

* **Volatility Detection**: Blue dots on the midline signal a market "squeeze" where Bollinger Bands are contained within Keltner Channels (low volatility).
* **Momentum Direction**: The histogram color indicates momentum direction and strength.
* **Signal Timing**: Gray dots mark the "squeeze release," signaling potential trading opportunities.
* **Entry Strategy**: Carter recommends waiting for the first gray dot after a blue dot sequence and opening a position in the momentum direction.
* **Exit Criteria**: Consider exiting when momentum reverses (histogram color changes).

## Formula

The indicator uses two main components:

1. **Volatility Comparison**:
    * Bollinger Bands: `SMA ± (StdDev × MultFactor)`
    * Keltner Channels: `SMA ± (ATR × MultFactor)`
    * Squeeze occurs when: `BBLower > KCLower AND BBUpper < KCUpper`
2. **Momentum Calculation**:

    ```
    Mean = (Highest(high, length)/4 + Lowest(low, length)/4 + SMA(close, length)/2)
    Momentum = LinReg(close - Mean, length, 0)
    
    ```

## How to Interpret Values

* **Histogram Color**:
    * Green/Lime: Positive momentum (bullish)
    * Red/Maroon: Negative momentum (bearish)
    * Brighter colors (Lime/Red): Momentum is increasing
    * Darker colors (Green/Maroon): Momentum is decreasing
* **Zero Line Markers**:
    * Blue/Navy: Market is in squeeze (low volatility)
    * Gray: Squeeze is released (potential for larger moves)
    * Olive: No squeeze condition

## Best Practices & Strategy Tips

* Use alongside trend indicators (ADX, Moving Averages) for confirmation
* For entry timing: Wait for the gray dot after a sequence of blue dots
* Direction matters: Go long when histogram is green, short when red
* Combine with support/resistance levels for better risk management
* Consider higher timeframes for more significant signals
* Be cautious in ranging markets where false signals may occur

## Code Comparison: Pine Script vs. Indie

### Key Differences

#### Variable Declaration and Access

* **Pine Script**:

    ```
    sqzOn = (lowerBB > lowerKC) and (upperBB < upperKC)
    
    ```
* **Indie**:

    ```
    sqz_on = (bb_lower[0] > kc_lower) and (bb_upper[0] < kc_upper)
    
    ```

#### Series Handling

* **Pine Script**: Automatically handles series

    ```
    basis = sma(source, length)
    
    ```
* **Indie**: Requires explicit indexing with `[0]` for current values

    ```
    ma = Sma.new(self.close, length_kc)[0]
    
    ```

#### Default Value Handling

* **Pine Script**: Uses `nz()` function

    ```
    val > nz(val[1])
    
    ```
* **Indie**: Uses custom helper function

    ```
    val[0] > nan_to_zero(val[1])
    
    ```

#### Color Logic

* **Pine Script**: Uses `iff()` function (conditional)

    ```
    bcolor = iff(val > 0,           iff(val > nz(val[1]), lime, green),          iff(val < nz(val[1]), red, maroon))
    
    ```
* **Indie**: Uses standard if-else statements

    ```
    if val[0] > 0:    if val[0] > nan_to_zero(val[1]):        bcolor = color.LIME    else:        bcolor = color.GREEN
    
    ```

#### Plotting

* **Pine Script**: Function-based plotting

    ```
    plot(val, color=bcolor, style=histogram, linewidth=4)plot(0, color=scolor, style=cross, linewidth=2)
    
    ```
* **Indie**: Return-based plotting with decorators

    ```
    @plot.histogram(line_width=4, id='#plot_0')@plot.line(line_style=line_style.SOLID, line_width=4, id='#plot_1')# ...return plot.Histogram(val[0], color=bcolor), plot.Line(0, color=scolor)
    
    ```

## Implementation

### Indie Implementation Highlights

The core of the Squeeze Momentum indicator's implementation:

```
# Detect squeeze conditions
sqz_on = (bb_lower[0] > kc_lower) and (bb_upper[0] < kc_upper)
sqz_off = (bb_lower[0] < kc_lower) and (bb_upper[0] > kc_upper)
no_sqz = (sqz_on == False) and (sqz_off == False)

# Calculate momentum
val = LinReg.new(MutSeriesF.new(self.close[0] - mean(Highest.new(self.high, length_kc),
                                                    Lowest.new(self.low, length_kc),
                                                    Sma.new(self.close, length_kc))),
                  length_kc)
```

Handling color logic for the histogram:

```
# Color logic for momentum histogram
bcolor = color.BLACK  # initialization
if val[0] > 0:
    if val[0] > nan_to_zero(val[1]):
        bcolor = color.LIME      # Increasing positive momentum
    else:
        bcolor = color.GREEN     # Decreasing positive momentum
else:
    if val[0] < nan_to_zero(val[1]):
        bcolor = color.RED       # Increasing negative momentum
    else:
        bcolor = color.MAROON    # Decreasing negative momentum
```

## Full Source Code

### Indie v5 Code

```python
#Education Purposes
# Ported to Indie from https://www.tradingview.com/script/nqQ1DT5a-Squeeze-Momentum-Indicator-LazyBear/ created by @LazyBear
# More info about the algorithm could be found in the book "Mastering The Trade" by John F Carter

# This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.  
# If a copy of the MPL was not distributed with this file, you can obtain one at  
# <https://mozilla.org/MPL/2.0/>.

# indie:lang_version = 5
from math import isnan
from indie import indicator, SeriesF, MutSeriesF, plot, param, color, line_style
from indie.algorithms import Sma, Tr, Bb, Highest, Lowest, LinReg


def mean(s1: SeriesF, s2: SeriesF, s3: SeriesF) -> float:
    return s1[0] / 4 + s2[0] / 4 + s3[0] / 2


def nan_to_zero(val: float) -> float:
    return 0 if isnan(val) else val


@indicator('Squeeze Momentum')
@param.int('length', default=20, min=1, title='BB Length')
@param.float('mult', default=1.5, title='BB MultFactor')
@param.int('length_kc', default=20, min=1, title='KC Length')
@param.float('mult_kc', default=1.5, title='KC MultFactor')
@param.bool('use_true_range', default=True, title='Use TrueRange (KC)')
@plot.histogram(line_width=4, id='#plot_0')
@plot.line(line_style=line_style.SOLID, line_width=4, id='#plot_1')  # TODO: use markers
def Main(self, length, mult, length_kc, mult_kc, use_true_range):
    (bb_lower, _, bb_upper) = Bb.new(self.close, length, mult)

    ma = Sma.new(self.close, length_kc)[0]
    range_s = Tr.new() if use_true_range else MutSeriesF.new(self.high[0] - self.low[0])
    range_ma = Sma.new(range_s, length_kc)[0]
    kc_upper = ma + range_ma * mult_kc
    kc_lower = ma - range_ma * mult_kc

    sqz_on  = (bb_lower[0] > kc_lower) and (bb_upper[0] < kc_upper)
    sqz_off = (bb_lower[0] < kc_lower) and (bb_upper[0] > kc_upper)
    no_sqz  = (sqz_on == False) and (sqz_off == False)

    val = LinReg.new(MutSeriesF.new(self.close[0] - mean(Highest.new(self.high, length_kc),
                                                         Lowest.new(self.low, length_kc),
                                                         Sma.new(self.close, length_kc))),
                     length_kc)

    bcolor = color.BLACK  # just random color to initialize variable
    if val[0] > 0:
        if val[0] > nan_to_zero(val[1]):
            bcolor = color.LIME
        else:
            bcolor = color.GREEN
    else:
        if val[0] < nan_to_zero(val[1]):
            bcolor = color.RED
        else:
            bcolor = color.MAROON

    scolor = color.GRAY
    if no_sqz:
        scolor = color.OLIVE
    elif sqz_on:
        scolor = color.NAVY

    return plot.Histogram(val[0], color=bcolor), plot.Line(0, color=scolor)

```

### Pine Script v5 Code

```
//Education Purposes
// @author LazyBear 
// List of all my indicators: https://www.tradingview.com/v/4IneGo8h/
//
study(shorttitle = "SQZMOM_LB", title="Squeeze Momentum Indicator [LazyBear]", overlay=false)

length = input(20, title="BB Length")
mult = input(2.0,title="BB MultFactor")
lengthKC=input(20, title="KC Length")
multKC = input(1.5, title="KC MultFactor")

useTrueRange = input(true, title="Use TrueRange (KC)", type=bool)

// Calculate BB
source = close
basis = sma(source, length)
dev = multKC * stdev(source, length)
upperBB = basis + dev
lowerBB = basis - dev

// Calculate KC
ma = sma(source, lengthKC)
range = useTrueRange ? tr : (high - low)
rangema = sma(range, lengthKC)
upperKC = ma + rangema * multKC
lowerKC = ma - rangema * multKC

sqzOn  = (lowerBB > lowerKC) and (upperBB < upperKC)
sqzOff = (lowerBB < lowerKC) and (upperBB > upperKC)
noSqz  = (sqzOn == false) and (sqzOff == false)

val = linreg(source  -  avg(avg(highest(high, lengthKC), lowest(low, lengthKC)),sma(close,lengthKC)), 
            lengthKC,0)

bcolor = iff( val > 0, 
            iff( val > nz(val[1]), lime, green),
            iff( val < nz(val[1]), red, maroon))
scolor = noSqz ? blue : sqzOn ? black : gray 
plot(val, color=bcolor, style=histogram, linewidth=4)
plot(0, color=scolor, style=cross, linewidth=2)
```

## License

MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.