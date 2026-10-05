# Ultimate Oscillator (UO) - Built-in Indicator Guide

> Plots the Ultimate Oscillator (UO) as a red line using fast, middle, and slow period lengths (defaults 7, 14, 28).

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Oscillators |
| **Type** | Built-in indicator |
| **Author** | TakeProfit |
| **License** | MIT |
| **Documentation** | [Built-in indicators](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators#ultimate-oscillator) |
| **Source file** | [Ultimate Oscillator.indie5](Ultimate%20Oscillator.indie5) |

## Overview

This indicator displays the Ultimate Oscillator as a single red line. It exposes three period settings — fast, middle, and slow — through the settings UI and passes them directly to the platform's built-in `Uo` algorithm. The script is a thin wrapper around that algorithm rather than a re-implementation of the oscillator math.

The output is produced by calling `Uo.new(fast_len, middle_len, slow_len)[0]` on every bar and returning that current value for plotting. The chart shows only the oscillator line; no extra levels, bands, or markers are added by this source code.

## How it works

1. `Main` is called on each bar and receives the configured `fast_len`, `middle_len`, and `slow_len` values.
2. `Uo.new(fast_len, middle_len, slow_len)` creates or updates the Ultimate Oscillator algorithm instance.
3. The `.new()` call returns a series, and `[0]` selects the value for the current bar.
4. That value is returned from `Main` and drawn as a red line by the `@plot.line` decorator.
5. The `Uo` algorithm keeps its own internal state from bar to bar, producing a continuous indicator series.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `fast_len` | int | 7 | ≥ 1 | Fast Length |
| `middle_len` | int | 14 | ≥ 1 | Middle Length |
| `slow_len` | int | 28 | ≥ 1 | Slow Length |

## Code walkthrough

### Indicator and parameter registration

Lines 6-9 of [Ultimate Oscillator.indie5](Ultimate%20Oscillator.indie5):

```python
@indicator('UO', format=format.PRICE)  # Ultimate Oscillator
@param.int('fast_len', default=7, min=1, title='Fast Length')
@param.int('middle_len', default=14, min=1, title='Middle Length')
@param.int('slow_len', default=28, min=1, title='Slow Length')
```

The `@indicator` decorator registers the script with the display name `UO` and PRICE formatting. The three `@param.int` decorators create numeric input fields for fast, middle, and slow lengths, each with a default and a minimum value of 1.

### Plot configuration

Lines 10-10 of [Ultimate Oscillator.indie5](Ultimate%20Oscillator.indie5):

```python
@plot.line(color=color.RED)
```

This decorator declares the visual output as a red line. Because the script contains a single plot decorator and `Main` returns one value, exactly one line is drawn on the chart.

### Per-bar computation

Lines 11-12 of [Ultimate Oscillator.indie5](Ultimate%20Oscillator.indie5):

```python
def Main(self, fast_len, middle_len, slow_len):
    return Uo.new(fast_len, middle_len, slow_len)[0]
```

`Main` takes the three period parameters, calls `Uo.new(...)` to obtain the algorithm's output series, and reads index `[0]` for the current bar. Calling `.new()` each bar lets the algorithm update its internal state before the current value is returned for plotting.

## Reading the chart

The only visual output is a single red line named `UO`.
The vertical position of the line on each bar equals the value returned from `Uo.new(fast_len, middle_len, slow_len)[0]`.
This script draws no overbought, oversold, or midpoint levels, so readings must be compared against the visible range of the indicator pane.
A rising red line means the oscillator value is increasing; a falling line means the oscillator value is decreasing.

## Implementation notes

- The actual oscillator calculation is encapsulated in `Uo` from `indie.algorithms`; this script only supplies parameters and selects the current series value.
- `Uo.new(...)[0]` follows the Indie convention that `.new()` algorithms return a series, with `[0]` representing the current bar.
- All three period parameters have `min=1`, so the UI prevents zero or negative lookback lengths.
- No extra chart objects such as levels, fills, or markers are created by this code.

## FAQ

**What do the three length parameters control?**

They are passed unchanged as `fast_len`, `middle_len`, and `slow_len` to `Uo.new(...)`. Defaults are 7, 14, and 28, and the settings UI enforces a minimum of 1 for each.

**Why does the code call `Uo.new` on every bar instead of once?**

In Indie Script, `.new()` is the standard way to create or update an algorithm instance. Calling it each bar maintains the algorithm's internal state and returns a series; `[0]` selects the current bar's value for plotting.

**Can I change the color of the plotted line?**

Yes, change `color.RED` in the `@plot.line` decorator to another supported color. The script still produces a single line in the new color.

## Full source code

Indie Script v5, the built-in indicator as shipped with TakeProfit. Add it from the indicators menu or copy the code into the platform's script editor.

```python
# indie:lang_version = 5
from indie import indicator, format, param, plot, color
from indie.algorithms import Uo


@indicator('UO', format=format.PRICE)  # Ultimate Oscillator
@param.int('fast_len', default=7, min=1, title='Fast Length')
@param.int('middle_len', default=14, min=1, title='Middle Length')
@param.int('slow_len', default=28, min=1, title='Slow Length')
@plot.line(color=color.RED)
def Main(self, fast_len, middle_len, slow_len):
    return Uo.new(fast_len, middle_len, slow_len)[0]
```
