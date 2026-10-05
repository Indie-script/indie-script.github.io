# Aroon - Built-in Indicator Guide

> Computes Aroon Up and Aroon Down indicators to measure trend strength and direction over a given period.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#aroon) |
| **Source file** | [Aroon.indie5](Aroon.indie5) |

## Overview

The Aroon indicator measures the time elapsed since the highest high and lowest low over a specified period. It outputs two lines: Aroon Up (yellow) and Aroon Down (blue), ranging from 0 to 100. High values indicate strong trends.

It is used to identify trend direction and strength, as well as potential reversal points. When Aroon Up is above 70 and Aroon Down is below 30, an uptrend is strong; vice versa for downtrend. Crossovers can signal trend changes.

## How it works

1. For each bar, compute the number of bars since the highest high over the last `length` bars using `SinceHighest`.
2. Similarly, compute the number of bars since the lowest low using `SinceLowest`.
3. Calculate Aroon Down as 100 * (length - lo_offset[0]) / length.
4. Calculate Aroon Up as 100 * (length - hi_offset[0]) / length.
5. Return both values as a tuple for plotting.

## Mathematical model

$$
\text{Aroon Down} = 100 \times \frac{\text{length} - \text{bars since lowest low}}{\text{length}}
$$

$$
\text{Aroon Up} = 100 \times \frac{\text{length} - \text{bars since highest high}}{\text{length}}
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `length` | int | 14 | ≥ 1 |  |

## Code walkthrough

### Indicator decorators and parameters

Lines 6-9 of [Aroon.indie5](Aroon.indie5):

```python
@indicator('Aroon', format=format.PRICE)  # TODO: format=format.PERCENT
@param.int('length', default=14, min=1)
@plot.line(color=color.BLUE, title='Aroon Down')
@plot.line(color=color.YELLOW, title='Aroon Up')
```

Sets the indicator name 'Aroon', display format (PRICE, though output is percentage), a single integer parameter `length` with default 14 and minimum 1, and two plot lines (Aroon Down in blue, Aroon Up in yellow).

### Computing offsets using built-in algorithms

Lines 11-12 of [Aroon.indie5](Aroon.indie5):

```python
    lo_offset = SinceLowest.new(self.low, length)
    hi_offset = SinceHighest.new(self.high, length)
```

Uses `SinceLowest.new` and `SinceHighest.new` to obtain the number of bars since the lowest low and highest high over the lookback period. These algorithms return a series; `[0]` accesses the current bar's value.

### Calculating Aroon values

Lines 14-15 of [Aroon.indie5](Aroon.indie5):

```python
    down = 100 * (length - lo_offset[0]) / length
    up = 100 * (length - hi_offset[0]) / length
```

Converts the offsets into percentage values: the closer the offset is to 0, the higher the Aroon value. A value of 100 means the extreme occurred on the current bar; 0 means it occurred exactly `length` bars ago.

### Returning the tuple for plotting

Lines 17-17 of [Aroon.indie5](Aroon.indie5):

```python
    return down, up
```

Returns a tuple `(down, up)` which is automatically mapped to the two plot lines defined by the decorators. The order matches the decorator order: first Aroon Down, then Aroon Up.

## Reading the chart

- Aroon Up (yellow line) above 70 indicates a strong uptrend; below 30 indicates weak uptrend.
- Aroon Down (blue line) above 70 indicates a strong downtrend; below 30 indicates weak downtrend.
- When Aroon Up crosses above Aroon Down, it may signal a bullish trend change; opposite for bearish.
- Values near 100 indicate very recent highs/lows; values near 0 indicate the high/low occurred long ago.

## Implementation notes

- The indicator uses `SinceLowest` and `SinceHighest` algorithms which return the number of bars since the extreme, including the current bar (offset 0 means current bar is the extreme).
- The `length` parameter defaults to 14, minimum 1.
- The format is set to PRICE but commented as TODO for PERCENT; actual output is percentage (0-100).
- The indicator does not repaint because it uses current bar data only.

## FAQ

**How can I change the period length?**

Modify the `length` parameter in the indicator settings; default is 14.

**What do values above 70 mean?**

Values above 70 indicate that the recent high/low occurred within the last 30% of the period, suggesting a strong trend.

**Can I use Aroon for intraday charts?**

Yes, it works on any timeframe; the period length should be adjusted based on the chart's volatility.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color
from indie.algorithms import SinceLowest, SinceHighest


@indicator('Aroon', format=format.PRICE)  # TODO: format=format.PERCENT
@param.int('length', default=14, min=1)
@plot.line(color=color.BLUE, title='Aroon Down')
@plot.line(color=color.YELLOW, title='Aroon Up')
def Main(self, length):
    lo_offset = SinceLowest.new(self.low, length)
    hi_offset = SinceHighest.new(self.high, length)

    down = 100 * (length - lo_offset[0]) / length
    up = 100 * (length - hi_offset[0]) / length

    return down, up
```
