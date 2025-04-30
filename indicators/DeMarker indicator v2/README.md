## DeMarker v2 Indicator — Smoothed Momentum Oscillator

**Language:** Indie v5
**Author:** Pavel Medd (@pavelmedd)
**License:** MIT License ([https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT))
**Intended Use:** Educational and Research Purposes

***

### Overview

The **DeMarker v2** indicator is a refined implementation of the classic DeMarker oscillator. It improves stability and visual clarity by applying Simple Moving Average (SMA) smoothing to directional price movements. The indicator assists in identifying potential trend reversals by quantifying intra-bar buying and selling pressure.

***

### Indicator Objective

DeMarker v2 is designed to:

* Detect overbought and oversold conditions in price action.
* Provide early reversal signals based on smoothed momentum extremes.
* Support configurable smoothing length to adapt to different market contexts.

***

### Calculation Logic

1. **Directional Movement Calculation**:
    * **DeMax**: Difference between current and previous high, if positive.
    * **DeMin**: Difference between previous and current low, if positive.
2. **Smoothing**:
    Both DeMax and DeMin values are smoothed using a Simple Moving Average (SMA) over a user-defined period (`per`, default = 13).
3. **DeMarker Value**:
    The smoothed DeMax and DeMin values are combined into a normalized momentum ratio:
## `DeMarker = SMA(DeMax) / (SMA(DeMax) + SMA(DeMin))`
    The result is a bounded value in the range [0, 1].
### Value Interpretation

* **\> 0\.7**: Market may be overbought, increasing probability of downside reversal.
* **< 0.3**: Market may be oversold, increasing probability of upside reversal.
* **0.3 – 0.7**: Neutral zone, indicates ongoing or consolidating trend.

Horizontal reference lines are drawn at 0.3 and 0.7 to visually support this interpretation.

***

### Code Reference (Indie v5)

```python
#education purpose
# © 2025 Pavel Medd (@pavelmedd)
# Licensed under the MIT License. You may use, copy, modify, merge, publish, 
# distribute, sublicense, and/or sell copies of the Software, subject to the 
# conditions of the MIT license. Full license text: https://opensource.org/licenses/MIT
# indie:lang_version = 5
from indie import indicator, param, plot, color, MutSeriesF
from indie.algorithms import Sma

@indicator("DeMarker v2")
@param.int("per", default=13, min=1, title="Period")
@plot.line(color=color.WHITE, id='#plot_0')
@plot.line(id='#plot_1')
@plot.line(id='#plot_2')
def Main(self, per):
    demax = MutSeriesF.new(0)
    demin = MutSeriesF.new(0)
    
    if self.high[0] > self.high[1]:
        demax[0] = self.high[0] - self.high[1]
    
    if self.low[0] < self.low[1]:
        demin[0] = self.low[1] - self.low[0]
    
    demax_av = Sma.new(demax, per)
    demin_av = Sma.new(demin, per)
    
    dmark = demax_av[0] / (demax_av[0] + demin_av[0])
    
    h1 = plot.Line(0.3, color=color.BLUE)
    h2 = plot.Line(0.7, color=color.BLUE)
    
    return plot.Line(dmark), plot.Line(h1.value, color=h1.color, offset=h1.offset), plot.Line(h2.value, color=h2.color, offset=h2.offset)
```

## Pine Script version.

```
//education purpose
//@version=5
//education purpose
//© 2025 Pavel Medd (@pavelmedd)
//Licensed under the MIT License. You may use, copy, modify, merge, publish, 
//distribute, sublicense, and/or sell copies of the Software, subject to the 
//conditions of the MIT license. Full license text: https://opensource.org/licenses/MIT

indicator("DeMarker v2", overlay=false)

per = input(13, title="Period")

demax = ta.highest(high, 2) - high[1] > 0 ? high - high[1] : 0
demin = ta.lowest(low, 2) - low[1] < 0 ? low[1] - low : 0

demax_av = ta.sma(demax, per)
demin_av = ta.sma(demin, per)

dmark = demax_av / (demax_av + demin_av)

// // Level Boundaries
h1 = hline(0.3, "Lower Bound", color=color.gray)
h2 = hline(0.7, "Upper Bound", color=color.gray)

// Filling between levels
fill(h1, h2, color=color.blue, transp=90)

// Indicator display
plot(dmark, title="DeMarker", color=color.orange, linewidth=2)
```

### Best Practices and Applications

* Use DeMarker v2 as part of a **mean-reversion strategy** in consolidating markets.
* For confirmation in **trending conditions**, combine with a trend filter such as EMA, ADX, or MACD.
* Monitor **divergences** between DeMarker and price for potential early reversal cues.
* Adjust the `period` parameter to increase sensitivity (shorter period) or reduce noise (longer period).

***

### Notes

* This version does not include filled bands or dynamic coloring but is optimized for clarity and educational analysis.
* Further enhancements could include multi-timeframe overlays, alerts, or threshold-based coloring schemes.