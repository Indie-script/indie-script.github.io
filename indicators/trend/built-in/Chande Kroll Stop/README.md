# Chande Kroll Stop (Chande KS) - Built-in Indicator Guide

> Computes trailing stop levels based on ATR and price extremes, with two lines for long and short stops.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Trend |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#chande-kroll-stop) |
| **Source file** | [Chande Kroll Stop.indie5](Chande%20Kroll%20Stop.indie5) |

## Overview

The Chande Kroll Stop is a volatility-based trailing stop indicator that uses Average True Range (ATR) and price extremes over two different lookback periods. It is designed for trend-following strategies, providing dynamic support and resistance levels that adjust to market volatility.

The indicator plots two lines on the price chart: a blue Stop Long line below price and a maroon Stop Short line above price. These lines serve as trailing stop levels for long and short positions respectively, tightening during low volatility and widening during high volatility.

## How it works

1. Compute the ATR over period p using the Atr algorithm.
2. Calculate the first low stop as the lowest low over p periods plus x times the ATR.
3. Calculate the first high stop as the highest high over p periods minus x times the ATR.
4. Smooth the first low stop by taking the lowest value over q periods to obtain the final Stop Long.
5. Smooth the first high stop by taking the highest value over q periods to obtain the final Stop Short.
6. Return the current values of Stop Long and Stop Short for plotting.

## Mathematical model

$$
\text{ATR} = \text{ATR}(p)
$$

$$
\text{FirstLowStop} = \text{Lowest}(low, p) + x \times \text{ATR}
$$

$$
\text{FirstHighStop} = \text{Highest}(high, p) - x \times \text{ATR}
$$

$$
\text{StopLong} = \text{Lowest}(\text{FirstLowStop}, q)
$$

$$
\text{StopShort} = \text{Highest}(\text{FirstHighStop}, q)
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `p` | int | 10 | ≥ 1 |  |
| `x` | int | 1 | ≥ 1 |  |
| `q` | int | 9 | ≥ 1 |  |

## Code walkthrough

### ATR and First Stops

Lines 13-15 of [Chande Kroll Stop.indie5](Chande%20Kroll%20Stop.indie5):

```python
    atr = Atr.new(p)[0]
    first_low_stop = MutSeriesF.new(Lowest.new(self.low, p)[0] + x * atr)
    first_high_stop = MutSeriesF.new(Highest.new(self.high, p)[0] - x * atr)
```

Line 13 computes the ATR over period p using the Atr algorithm and retrieves the current bar's value with [0]. Lines 14-15 calculate the initial stop levels: the first low stop adds x times the ATR to the lowest low over p periods, and the first high stop subtracts x times the ATR from the highest high over p periods. These are stored in MutSeriesF to allow subsequent smoothing.

### Smoothing the Stops

Lines 16-17 of [Chande Kroll Stop.indie5](Chande%20Kroll%20Stop.indie5):

```python
    stop_long = Lowest.new(first_low_stop, q)
    stop_short = Highest.new(first_high_stop, q)
```

The first low stop is smoothed by taking the lowest value over q periods using Lowest, producing the final Stop Long. Similarly, the first high stop is smoothed by taking the highest value over q periods using Highest, producing the final Stop Short. This second pass reduces noise and creates more stable stop levels.

### Return Values

Lines 18-18 of [Chande Kroll Stop.indie5](Chande%20Kroll%20Stop.indie5):

```python
    return stop_long[0], stop_short[0]
```

The function returns a tuple of the current Stop Long and Stop Short values. These are plotted as blue and maroon lines respectively, as specified by the @plot.line decorators on lines 10-11.

## Reading the chart

- **Blue line (Stop Long)**: Typically plotted below price. It acts as a trailing stop for long positions. A price close below this line may signal a trend reversal to the downside.
- **Maroon line (Stop Short)**: Typically plotted above price. It acts as a trailing stop for short positions. A price close above this line may signal a trend reversal to the upside.
- When price is above the Stop Long and below the Stop Short, the trend is considered up. When price is below the Stop Long and above the Stop Short, the trend is considered down.
- The distance between the two lines reflects market volatility: wider during volatile periods, narrower during calm periods.

## Implementation notes

- The indicator uses current bar data (ATR, lowest low, highest high) so it does not repaint; values are fixed once the bar closes.
- MutSeriesF is used to hold the first stop series because the smoothing algorithms (Lowest, Highest) require a series input.
- The second smoothing (q) introduces additional lag; larger q values produce smoother but more delayed stop lines.
- If q is set to 1, the second smoothing is disabled, resulting in a simple ATR-based channel.

## FAQ

**How do the parameters affect the sensitivity of the stops?**

Increasing p (ATR period) makes the ATR smoother and less responsive. Increasing x widens the stops. Increasing q (smoothing period) makes the stop lines smoother but adds more lag.

**Can I use this indicator for exit signals in a trend-following strategy?**

Yes. A common use is to exit long positions when price closes below the blue Stop Long line, and exit short positions when price closes above the maroon Stop Short line.

**How does this differ from the Chandelier Exit?**

The Chandelier Exit uses a single ATR multiplier and a single lookback period. The Chande Kroll Stop uses two lookback periods (p and q) and two smoothing steps, which can produce more stable stops.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color, MutSeriesF
from indie.algorithms import Atr, Lowest, Highest


@indicator('Chande KS', overlay_main_pane=True)  # Chande Kroll Stop
@param.int('p', default=10, min=1)
@param.int('x', default=1, min=1)
@param.int('q', default=9, min=1)
@plot.line(color=color.BLUE, title='Stop Long')
@plot.line(color=color.MAROON, title='Stop Short')
def Main(self, p, x, q):
    atr = Atr.new(p)[0]
    first_low_stop = MutSeriesF.new(Lowest.new(self.low, p)[0] + x * atr)
    first_high_stop = MutSeriesF.new(Highest.new(self.high, p)[0] - x * atr)
    stop_long = Lowest.new(first_low_stop, q)
    stop_short = Highest.new(first_high_stop, q)
    return stop_long[0], stop_short[0]
```
