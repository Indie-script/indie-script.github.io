# Least Squares Moving Average (LSMA) - Built-in Indicator Guide

> Computes a least-squares linear regression line as a moving average, often used as a smoother with reduced lag.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#least-squares-moving-average) |
| **Source file** | [Least Squares Moving Average.indie5](Least%20Squares%20Moving%20Average.indie5) |

## Overview

The Least Squares Moving Average (LSMA) fits a straight line to the most recent 'length' data points using ordinary least squares regression. The value plotted is the endpoint of that line, which effectively acts as a moving average that can respond more quickly to price changes than a simple moving average. It is often used to identify trend direction and potential support/resistance levels.

The indicator is drawn as a line on the main price chart, with an optional horizontal offset. The offset parameter shifts the regression line forward or backward in time, allowing for leading or lagging projections of the trend.

## How it works

1. Collect the most recent 'length' values of the source series (default close).
2. Perform ordinary least squares linear regression on these points, treating the bar index as the independent variable.
3. Compute the slope and intercept of the best-fit line.
4. Evaluate the regression line at the current bar index plus the 'offset' parameter.
5. Output that value as the LSMA for the current bar.

## Mathematical model

$$
\hat{y}_t = a + b \cdot (t + \text{offset})
$$

where $a$ and $b$ are the intercept and slope from OLS on the last $n$ points.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 25 | ≥ 1 |  |
| `offset` | int | 0 |  |  |
| `src` | source | source.CLOSE |  |  |

## Code walkthrough

### Imports and Dependencies

Lines 1-3 of [Least Squares Moving Average.indie5](Least%20Squares%20Moving%20Average.indie5):

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot
from indie.algorithms import LinReg
```

Imports the necessary decorators and the LinReg algorithm from the indie.algorithms module. LinReg encapsulates the least-squares regression computation.

### Indicator Decorators and Parameters

Lines 6-10 of [Least Squares Moving Average.indie5](Least%20Squares%20Moving%20Average.indie5):

```python
@indicator('LSMA', overlay_main_pane=True)  # Least Squares Moving Average
@param.int('length', default=25, min=1)
@param.int('offset', default=0)
@param.source('src', default=source.CLOSE)
@plot.line(title='LSMA')
```

Defines the indicator name 'LSMA' with overlay on the main pane. Three parameters are exposed: length (window size), offset (horizontal shift), and source (price series). The @plot.line decorator declares that the output will be drawn as a line.

### Main Function – Computation

Lines 11-12 of [Least Squares Moving Average.indie5](Least%20Squares%20Moving%20Average.indie5):

```python
def Main(self, length, offset, src):
    return LinReg.new(src, length, offset)[0]
```

The Main function calls LinReg.new with the source, length, and offset. The result is a series; [0] retrieves the current bar's value. This single line performs the entire regression and returns the fitted endpoint.

## Reading the chart

The LSMA line is plotted on the chart. When the line is rising, the trend is considered up; when falling, down. The offset parameter shifts the line horizontally (positive offset shifts to the right, negative to the left). The line may lead or lag price depending on offset. Crossovers between price and LSMA can be used as potential trend change signals.

## Implementation notes

- The LinReg algorithm internally handles NaN values; if insufficient data, returns NaN.
- The offset parameter can be used to shift the line forward or backward, but may cause repainting if offset is positive (future data used).
- The indicator is non-repainting for offset=0; for offset>0 it uses future bars.

## FAQ

**How does LSMA differ from a simple moving average?**

LSMA fits a line to the data, reducing lag and better following trends, but can be more sensitive to noise.

**What is the purpose of the offset parameter?**

It shifts the regression line horizontally; positive offset projects the line forward, negative shifts it backward.

**Can I use this indicator for trading signals?**

Yes, common signals include crossovers with price or other moving averages, but always combine with other analysis.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot
from indie.algorithms import LinReg


@indicator('LSMA', overlay_main_pane=True)  # Least Squares Moving Average
@param.int('length', default=25, min=1)
@param.int('offset', default=0)
@param.source('src', default=source.CLOSE)
@plot.line(title='LSMA')
def Main(self, length, offset, src):
    return LinReg.new(src, length, offset)[0]
```
