# Pivot Points Indicator

## Overview

The **Pivot Points** indicator is a time-tested tool in technical analysis used to determine **potential support and resistance levels** based on the prior bar’s high, low, and close values. It helps traders identify price levels at which an asset may encounter supply or demand imbalances, making it ideal for identifying reversal points or validating trend continuation.
This version includes three levels of **support (S1, S2, S3)** and **resistance (R1, R2, R3)** along with the central **pivot (PP)**. It is designed for intraday, swing, and range-bound trading strategies.

***

## Formula

```
Pivot Point (PP) = (High[1] + Low[1] + Close[1]) / 3

Support 1 (S1) = (2 × PP) - High[1]  
Resistance 1 (R1) = (2 × PP) - Low[1]

Support 2 (S2) = PP - (High[1] - Low[1])  
Resistance 2 (R2) = PP + (High[1] - Low[1])

Support 3 (S3) = Low[1] - 2 × (High[1] - PP)  
Resistance 3 (R3) = High[1] + 2 × (PP - Low[1])
```

These formulas use the **previous candle's** values to project current session levels.

***

## Interpretation

| Level | Meaning |
| ----- | ------- |
| Pivot (PP) | A neutral zone; price above suggests bullish bias; below is bearish. |
| S1/R1 | First reaction zone; may signal minor reversals or consolidation. |
| S2/R2 | More significant zones; often used as take-profit or stop levels. |
| S3/R3 | Extremes of projected range; breaks here often imply trend continuation. |

***

## Best Practices & Strategy Tips

* **Confluence is key:** Combine pivot points with trend-following indicators (e.g., EMA, RSI) for higher probability setups.
* **Use R1/S1 as early reaction levels**; consider reversals or short-term trades here.
* **Breakout traders** watch for clean moves beyond R3 or S3 on volume.
* **Do not use in isolation**: Always confirm signals with price action or supporting indicators.

***

## Indie Code Highlights

```
@indicator('Pivot Points', overlay_main_pane=True)
@plot.line(id='#plot_0')
...
def Main(self):
    pivot = (self.high[1] + self.low[1] + self.close[1]) / 3
    support1 = (2 * pivot) - self.high[1]
    resistance1 = (2 * pivot) - self.low[1]
    ...
    return (
        plot.Line(pivot, color=color.YELLOW),
        plot.Line(support1, color=color.GREEN),
        ...
    )
```

* `@plot.line(id='#plot_0')`: Each level is assigned a static plot ID.
* Uses `.Line()` objects instead of simple values for consistent plotting.

***

## Pine Script Code Comparison

```
plot(pivot, color=color.yellow, title="Pivot")
plot(support1, color=color.green, title="Support 1")
...
```

| Feature | Indie | PineScript |
| ------- | ----- | ---------- |
| Plot registration | `@plot.line(id='#plot_0')` | Implicit via `plot()` |
| Color system | `color.YELLOW` | `color.yellow` |
| Historical data | `self.high[1]` | `high[1]` |
| Return structure | `return (... plot.Line(...))` | Each plot is a function call |

### Key Differences

* Indie requires explicit plot declarations via decorators for clarity and chart control.
* Pine handles plots implicitly, but Indie’s structure makes it easier to manage multiple outputs and integrate metadata.
* Indie syntax is strongly typed and designed to prevent runtime errors common in loosely typed PineScript.

***

## Key Takeaways of Indicator

* **Indicator Strengths:**
    * Simple and robust—suitable for beginners and pros alike.
    * Effective in intraday setups and range-bound markets.
    * Easy to customize and integrate with other strategies.
* **Limitations:**
    * Lags during strong trends—acts better as reactionary tool than predictive.
    * Less useful in low-liquidity assets or high-volatility spikes.
* **Ideal Use Cases:**
    * Forex, indices, and liquid equities.
    * Intraday or swing trading strategies.
    * Mean-reversion or breakout confirmation setups.

***

## Source Code

### Indie v5

```python
#education purpose
#created by @insurgent https://takeprofit.com/@insurgent
# indie:lang_version = 5
from indie import indicator, plot, color

@indicator('Pivot Points', overlay_main_pane=True)
@plot.line(id='#plot_0')
@plot.line(id='#plot_1')
@plot.line(id='#plot_2')
@plot.line(id='#plot_3')
@plot.line(id='#plot_4')
@plot.line(id='#plot_5')
@plot.line(id='#plot_6')
def Main(self):
    pivot = (self.high[1] + self.low[1] + self.close[1]) / 3
    support1 = (2 * pivot) - self.high[1]
    resistance1 = (2 * pivot) - self.low[1]
    support2 = pivot - (self.high[1] - self.low[1])
    resistance2 = pivot + (self.high[1] - self.low[1])
    support3 = self.low[1] - 2 * (self.high[1] - pivot)
    resistance3 = self.high[1] + 2 * (pivot - self.low[1])
    
    return (
        plot.Line(pivot, color=color.YELLOW),
        plot.Line(support1, color=color.GREEN),
        plot.Line(resistance1, color=color.RED),
        plot.Line(support2, color=color.GREEN(0.7)),
        plot.Line(resistance2, color=color.RED(0.7)),
        plot.Line(support3, color=color.GREEN(0.5)),
        plot.Line(resistance3, color=color.RED(0.5))
    )

```

### Pine Script v5

```
//@version=5
//created by @insurgent https://takeprofit.com/@insurgent
indicator("Pivot Points", overlay=true)

pivot = (high[1] + low[1] + close[1]) / 3
support1 = (2 * pivot) - high[1]
resistance1 = (2 * pivot) - low[1]
support2 = pivot - (high[1] - low[1])
resistance2 = pivot + (high[1] - low[1])
support3 = low[1] - 2 * (high[1] - pivot)
resistance3 = high[1] + 2 * (pivot - low[1])

plot(pivot, color=color.yellow, title="Pivot")
plot(support1, color=color.green, title="Support 1")
plot(resistance1, color=color.red, title="Resistance 1")
plot(support2, color=color.green, linewidth=2, title="Support 2")
plot(resistance2, color=color.red, linewidth=2, title="Resistance 2")
plot(support3, color=color.green, linewidth=3, title="Support 3")
plot(resistance3, color=color.red, linewidth=3, title="Resistance 3")

```

***

## License

**MIT License**
Free to copy, modify, redistribute, and use in commercial or non-commercial projects. Attribution appreciated but not required.

