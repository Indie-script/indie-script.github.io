# Arnaud Legoux Moving Average (ALMA) - Built-in Indicator Guide

> Arnaud Legoux Moving Average (ALMA) with adjustable window, offset, and sigma for reduced lag and smoothness.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#arnaud-legoux-moving-average) |
| **Source file** | [Arnaud Legoux Moving Average.indie5](Arnaud%20Legoux%20Moving%20Average.indie5) |

## Overview

The Arnaud Legoux Moving Average (ALMA) is a weighted moving average that applies a Gaussian-like weighting to price data. It is designed to reduce the lag commonly associated with traditional moving averages while preserving smoothness, making it useful for identifying trends with less delay. On the chart, a single blue line is plotted, following the price series with the ALMA value for each bar.

## How it works

1. Calculate m = offset × (window_size - 1) and s = window_size / sigma.
2. For each i from 0 to window_size-1, compute weight = exp(-(i - m)² / (2 × s²)).
3. Accumulate all weights and the sum of close prices multiplied by their corresponding weight (close values taken from oldest to most recent).
4. Return the weighted average sum / norm, using divide to avoid division by zero.

## Mathematical model

$$
\text{weight}_i = \exp\left(-\frac{(i-m)^2}{2s^2}\right) \quad \text{for } i = 0,\dots,N-1
$$

$$
\text{ALMA} = \frac{\sum_{i=0}^{N-1} \text{close}_{N-i-1} \cdot \text{weight}_i}{\sum_{i=0}^{N-1} \text{weight}_i}
$$

where $N = \text{window\_size}$, $m = \text{offset} \cdot (N-1)$, $s = N / \text{sigma}$.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `window_size` | int | 9 | ≥ 1 | Window Size |
| `offset` | float | 0.85 |  |  |
| `sigma` | float | 6.0 | ≥ 0.001 |  |

## Code walkthrough

### Parameter setup and precomputations

Lines 13-15 of [Arnaud Legoux Moving Average.indie5](Arnaud%20Legoux%20Moving%20Average.indie5):

```python
    m = offset * (window_size - 1)
    s = window_size / sigma
    sum, norm = 0.0, 0.0
```

Lines 13-14 compute constants m and s that define the center and spread of the Gaussian kernel. The sum and norm accumulators are initialized for the weighted average calculation.

### Weight calculation and summation loop

Lines 16-18 of [Arnaud Legoux Moving Average.indie5](Arnaud%20Legoux%20Moving%20Average.indie5):

```python
    for i in range(window_size):
        weight = exp(-1 * pow(i - m, 2) / (2 * pow(s, 2)))
        norm += weight
```

A loop iterates over the window size, computing each weight using the Gaussian formula. Weights are summed into norm to later normalize the result.

### Weighted price sum and return

Lines 19-20 of [Arnaud Legoux Moving Average.indie5](Arnaud%20Legoux%20Moving%20Average.indie5):

```python
        sum += self.close[window_size - i - 1] * weight
    return divide(sum, norm)
```

The close price at position window_size - i - 1 (oldest for i=0) is multiplied by the corresponding weight and added to sum. The final value is sum divided by norm, handled via the divide function for safety when norm is zero.

## Reading the chart

The ALMA indicator appears as a single blue line on the chart. Its response to price changes is faster than that of a simple moving average of the same length, due to the Gaussian weighting with an adjustable offset. A higher offset (closer to 1) further reduces lag but may introduce more noise. A lower sigma widens the Gaussian curve, increasing smoothness at the cost of higher lag. The line can be used to identify trend direction and potential support/resistance levels.

## Implementation notes

- The weight calculation is performed from scratch on every bar; no previous state is retained between bars.
- The divide function prevents NaN when norm is zero, ensuring a valid numeric output even with extreme parameters.
- Price values are accessed in reverse chronological order within the window: self.close[window_size - i - 1] selects the oldest price first for i=0.
- The offset parameter effectively shifts the Gaussian peak toward the most recent data, reducing lag relative to a centered Gaussian moving average.

## FAQ

**What does the offset parameter do?**

Offset (default 0.85) shifts the Gaussian weight distribution toward the most recent price, controlling the amount of lag. Higher values give less lag but may reduce smoothness.

**How can I make the ALMA smoother?**

Decrease the sigma parameter (default 6.0) to widen the Gaussian curve, averaging more data across the window. A larger window size also increases smoothness.

**Can this indicator be used on other timeframes?**

Yes. The indicator uses the close prices from the current chart's timeframe. You can apply it to any timeframe in the TakeProfit platform; the ALMA formula remains the same.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from math import exp, pow
from indie import indicator, param, plot, color
from indie.math import divide


@indicator('ALMA', overlay_main_pane=True)  # Arnaud Legoux Moving Average
@param.int('window_size', default=9, min=1, title='Window Size')
@param.float('offset', default=0.85)
@param.float('sigma', default=6.0, min=0.001)
@plot.line(color=color.BLUE)
def Main(self, window_size, offset, sigma):
    m = offset * (window_size - 1)
    s = window_size / sigma
    sum, norm = 0.0, 0.0
    for i in range(window_size):
        weight = exp(-1 * pow(i - m, 2) / (2 * pow(s, 2)))
        norm += weight
        sum += self.close[window_size - i - 1] * weight
    return divide(sum, norm)
```
