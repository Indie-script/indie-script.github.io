# Smoothed Moving Average (SMMA) - Built-in Indicator Guide

> Smoothed Moving Average (SMMA) that applies a recursive smoothing to price data.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#smoothed-moving-average) |
| **Source file** | [Smoothed Moving Average.indie5](Smoothed%20Moving%20Average.indie5) |

## Overview

The Smoothed Moving Average (SMMA) is a recursive moving average that reduces noise by applying exponential smoothing that weights recent data more heavily but updating the average gradually. It is designed for traders who want a smoother trend-following line that reacts less to short-term fluctuations than a simple moving average.
On the chart, a single purple line is plotted directly over price. The line represents the current SMMA value of the chosen source (default close).

## How it works

1. The indicator accepts a `length` (integer, default 7) and a `src` price source (default close).
2. It calls `Rma.new(src, length)` which creates a recursive moving average series.
3. The current bar's value is obtained with `[0]` and returned as the plot output.
4. The Rma algorithm computes: SMMA = (previous SMMA * (length - 1) + src) / length, starting with a simple average of the first `length` bars.
5. The result is plotted as a continuous line on the main chart pane.

## Mathematical model

$$
\text{SMMA}_t = \frac{\text{SMMA}_{t-1} \cdot (\text{length} - 1) + \text{src}_t}{\text{length}}
$$

The initial value is the simple average of the first `length` bars.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 7 | ≥ 1 |  |
| `src` | source | source.CLOSE |  | Source |

## Code walkthrough

### Imports and dependencies

Lines 2-3 of [Smoothed Moving Average.indie5](Smoothed%20Moving%20Average.indie5):

```python
from indie import indicator, param, source, plot, color
from indie.algorithms import Rma
```

The indicator imports the necessary decorators and the `Rma` algorithm from the built-in library. `Rma` implements the recursive smoothing logic, so the indicator itself only needs to call it.

### Decorators for indicator metadata and parameters

Lines 6-9 of [Smoothed Moving Average.indie5](Smoothed%20Moving%20Average.indie5):

```python
@indicator('SMMA', overlay_main_pane=True)  # Smoothed Moving Average
@param.int('length', default=7, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@plot.line(color=color.PURPLE)
```

The `@indicator` decorator sets the display name 'SMMA' and places the plot in the main price pane. `@param.int` and `@param.source` define user-configurable inputs: a length (minimum 1) and a price source. `@plot.line` sets the line color to purple.

### Main function – single-line computation

Lines 10-11 of [Smoothed Moving Average.indie5](Smoothed%20Moving%20Average.indie5):

```python
def Main(self, length, src):
    return Rma.new(src, length)[0]
```

The `Main` function receives the parameters and returns the current value of the Rma series. `Rma.new(src, length)` creates the series, and `[0]` fetches the value for the current bar. The returned value is automatically plotted as a line.

## Reading the chart

- The purple line represents the smoothed moving average of the selected source.
- When price is above the line, it may indicate an uptrend; below the line, a downtrend.
- The line itself is smoother than a simple moving average of the same length, making trend changes appear later but with fewer false signals.
- The line is continuous; no gaps or markers are drawn.

## Implementation notes

- The indicator relies on the `Rma` algorithm, which maintains internal state across bars (previous SMMA value).
- The first `length` bars may produce NaN or incomplete values until the initial simple average is computed.
- Changing the `length` parameter recalculates the entire series; no partial updates.
- The indicator is overlaid on the main chart pane, so it scales with price.

## FAQ

**How do I change the color of the SMMA line?**

Modify the `color` argument in the `@plot.line` decorator (line 9) to any supported color constant, e.g., `color.RED`.

**What is the difference between SMMA and SMA?**

SMA gives equal weight to each bar in the window and resets each bar. SMMA (Rma) is recursive: it incorporates the previous average, making it smoother and more responsive to longer-term trends.

**Can I use a source other than close?**

Yes. The `src` parameter accepts any price source (open, high, low, close, hl2, etc.). Change it in the indicator settings or by modifying the `@param.source` default.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color
from indie.algorithms import Rma


@indicator('SMMA', overlay_main_pane=True)  # Smoothed Moving Average
@param.int('length', default=7, min=1)
@param.source('src', default=source.CLOSE, title='Source')
@plot.line(color=color.PURPLE)
def Main(self, length, src):
    return Rma.new(src, length)[0]
```
