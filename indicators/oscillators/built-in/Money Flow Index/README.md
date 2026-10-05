# Money Flow Index (MFI) - Built-in Indicator Guide

> Computes the Money Flow Index (MFI) using typical price and volume to measure overbought/oversold conditions.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#money-flow-index) |
| **Source file** | [Money Flow Index.indie5](Money%20Flow%20Index.indie5) |

## Overview

The Money Flow Index (MFI) is a momentum oscillator that incorporates both price and volume data. It is calculated using the typical price (HLC3) and volume to measure buying and selling pressure. The MFI oscillates between 0 and 100, with values above 80 considered overbought and below 20 considered oversold. This indicator is useful for identifying potential trend reversals and divergences.

On the chart, a purple line represents the MFI value, with gray bands at 20 and 80 and a gray line at 50. The area between 20 and 80 is filled with a semi-transparent purple background, visually highlighting the normal range.

## How it works

1. The source parameter (default HLC3) provides the price series; HLC3 represents the typical price (high + low + close) / 3.
2. Compute raw money flow as typical price multiplied by volume.
3. Determine positive and negative money flow based on whether typical price increased or decreased from the previous bar.
4. Sum positive and negative money flows over the specified length (default 14).
5. Calculate the money flow ratio as sum of positive money flow divided by sum of negative money flow.
6. Compute the MFI as 100 - (100 / (1 + money flow ratio)).
7. Return the current MFI value for plotting.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 1 |  |
| `src` | source | source.HLC3 |  | Source |

## Code walkthrough

### Indicator Decorators and Parameters

Lines 6-10 of [Money Flow Index.indie5](Money%20Flow%20Index.indie5):

```python
@indicator('MFI', format=format.PRICE)  # Money Flow Index
@param.int('length', default=14, min=1)
@param.source('src', default=source.HLC3, title='Source')
@band(20, 80, line_color=color.GRAY, fill_color=color.PURPLE(0.1), title='Background')
@level(50, line_color=color.GRAY, title='Middle Band')
```

The @indicator decorator sets the short name 'MFI' and the price format. The @param.int and @param.source decorators define user-configurable settings: the lookback length (default 14) and the price source (default HLC3). The @band and @level decorators draw the overbought/oversold zones and the middle line on the chart.

### Plot Configuration

Lines 11-11 of [Money Flow Index.indie5](Money%20Flow%20Index.indie5):

```python
@plot.line(color=color.PURPLE, title='MF')
```

The @plot.line decorator configures the main output line with a purple color and the title 'MF'. This line will be drawn on the chart based on the value returned from the Main function.

### Main Function and Algorithm Call

Lines 12-13 of [Money Flow Index.indie5](Money%20Flow%20Index.indie5):

```python
def Main(self, length, src):
    return Mfi.new(src, length)[0]
```

The Main function receives the length and source parameters. It calls Mfi.new(src, length) which returns a series of MFI values. The [0] index retrieves the value for the current bar, which is then returned as the plot value. The algorithm handles all internal calculations.

## Reading the chart

- The purple line oscillates between 0 and 100.
- Values above 80 suggest overbought conditions; values below 20 suggest oversold conditions.
- The gray line at 50 acts as a centerline.
- The shaded background between 20 and 80 highlights the normal range.
- Divergences between price and MFI can indicate trend reversals.

## Implementation notes

- The indicator requires volume data; if volume is unavailable, the MFI will be NaN.
- The default source is HLC3 (high, low, close average), but can be changed to any price source.
- The MFI line may be choppy on shorter timeframes; consider adjusting the length parameter.
- The algorithm internally handles the accumulation over the length period; the first (length-1) bars will produce NaN values.

## FAQ

**What is the difference between MFI and RSI?**

Both are momentum oscillators, but MFI incorporates volume while RSI only uses price. MFI is often considered a volume-weighted RSI.

**How can I change the overbought/oversold thresholds?**

The bands at 20 and 80 are fixed in this implementation. To change them, you would need to modify the @band decorator values in the source code.

**Why does the MFI show NaN for the first few bars?**

The MFI requires a full lookback period (default 14 bars) to compute. Until enough data is accumulated, the value is undefined (NaN).

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, source, band, color, level, plot
from indie.algorithms import Mfi


@indicator('MFI', format=format.PRICE)  # Money Flow Index
@param.int('length', default=14, min=1)
@param.source('src', default=source.HLC3, title='Source')
@band(20, 80, line_color=color.GRAY, fill_color=color.PURPLE(0.1), title='Background')
@level(50, line_color=color.GRAY, title='Middle Band')
@plot.line(color=color.PURPLE, title='MF')
def Main(self, length, src):
    return Mfi.new(src, length)[0]
```
