# Candlestick Patterns Identified upd '26 - Technical Guide

> Detects 15 classical Japanese candlestick patterns with strict geometric rules and optional trend filtering.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Candlestick patterns |
| **Type** | Indicator |
| **Author** | @insurgent on TakeProfit |
| **Original (TradingView)** | [Candlestick Patterns Identified](https://www.tradingview.com/script/vcsWo8mh-Candlestick-Patterns-Identified-updated-3-11-15/) by repo32 |
| **Original license** | MPL-2.0 |
| **Original source** | [Candlestick Patterns Identified upd '26.pinescript6](Candlestick%20Patterns%20Identified%20upd%20'26.pinescript6) |
| **License** | [MPL-2.0](https://mozilla.org/MPL/2.0/) (derivative work) |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/candlestick-patterns-identified-upd-26-82) |
| **Source file** | [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5) |

## Overview

This indicator identifies 15 candlestick patterns (Doji, Harami, Engulfing, Piercing Line, Belt Hold, Kickers, Morning/Evening Star, Hanging Man, Shooting Star, Hammer, Inverted Hammer) using precise body-to-shadow proportions and gap validation. It is designed for traders who want high-specificity pattern recognition with minimal false positives, suitable for any market but optimized for 24/7 markets like crypto and forex.

On the chart, each pattern is marked with a colored label (LIME for bullish, RED for bearish, WHITE for neutral) positioned above or below the bar. The label text shows the pattern name, with Hammers and Inverted Hammers abbreviated as 'H' and 'IH'.

## How it works

1. Reads open, high, low, close for the current bar, and open and close for up to two prior bars.
2. Computes body size (|open-close|) and total range (high-low) for proportion checks.
3. Evaluates trend direction using SMA or momentum over a user-defined lookback, measured before the signal candle.
4. Checks each pattern's geometric conditions: body size ratios, shadow lengths, gap direction, and overlap rules.
5. Applies trend filter: bullish reversals require prior downtrend, bearish reversals require prior uptrend.
6. Returns a plot.Marker with the pattern label and color, or math.nan to draw nothing on that bar.

## Mathematical model

Each pattern uses simple arithmetic comparisons. For example, the Doji condition:

$$
\text{doji} = |\text{open} - \text{close}| \leq (\text{high} - \text{low}) \times \text{doji\_size}
$$

Hammer lower shadow proportion:

$$
\frac{\text{close} - \text{low}}{\text{high} - \text{low}} > 0.66
$$

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `trend_bars` | int | 10 | ≥ 1 | Trend Bars |
| `trend_type` | str | sma |  | Trend Filter |
| `doji_size` | float | 0.05 | ≥ 0.01 | Doji size |
| `bull_color` | color | color.LIME |  | Bullish Color |
| `bear_color` | color | color.RED |  | Bearish Color |
| `doji_color` | color | color.WHITE |  | Other (i.e. Doji) Color |

## Code walkthrough

### Trend filter setup

Lines 55-63 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    sma = Sma.new(self.close, trend_bars)
    sma1 = sma[1]
    sma2 = sma[2]
    mom1 = self.close[1 + trend_bars]
    mom2 = self.close[2 + trend_bars]
    is_up_1 = True if trend_type == 'none' else (c1 > mom1 if trend_type == 'momentum' else c1 > sma1)
    is_down_1 = True if trend_type == 'none' else (c1 < mom1 if trend_type == 'momentum' else c1 < sma1)
    is_up_2 = True if trend_type == 'none' else (c2 > mom2 if trend_type == 'momentum' else c2 > sma2)
    is_down_2 = True if trend_type == 'none' else (c2 < mom2 if trend_type == 'momentum' else c2 < sma2)
```

The trend filter uses either SMA or momentum (close N bars ago) to determine if the prior bar was in an uptrend or downtrend. The 'none' option disables the filter. The filter is measured at bar [1] for 1-2 bar patterns and at bar [2] for 3-bar stars, ensuring the trend is evaluated before the signal candle forms.

### Doji and Harami patterns

Lines 69-75 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    doji = body <= rng * doji_size

    # Bearish Harami (prior uptrend)
    bear_harami = c1 > o1 and o > c and o <= c1 and o1 <= c and o - c < c1 - o1 and is_up_1

    # Bullish Harami (prior downtrend)
    bull_harami = o1 > c1 and c > o and c <= o1 and c1 <= o and c - o < o1 - c1 and is_down_1
```

Doji is detected when the body is a small fraction of the total range. Harami patterns require the current body to be contained within the prior body, with opposite color and smaller size. Both Harami variants include a trend filter (is_up_1 for bearish, is_down_1 for bullish).

### Engulfing and Piercing Line

Lines 77-84 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    # Bearish Engulfing (prior uptrend)
    bear_eng = c1 > o1 and o > c and o >= c1 and o1 >= c and o - c > c1 - o1 and is_up_1

    # Bullish Engulfing (prior downtrend)
    bull_eng = o1 > c1 and c > o and c >= o1 and c1 >= o and c - o > o1 - c1 and is_down_1

    # Piercing Line (softened gap, long body, prior downtrend)
    piercing = c1 < o1 and o < c1 and c > c1 + ((o1 - c1) / 2) and c < o1 and (c - o) > rng * 0.5 and is_down_1
```

Engulfing patterns require the current body to completely envelop the prior body. Piercing Line requires a gap down, then a close above the midpoint of the prior bearish body, with a minimum body size of 50% of the range. All include trend filters.

### Star patterns (Evening/Morning)

Lines 98-105 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    # Evening Star (long bullish, small star, bearish close below midpoint of 1st body; prior uptrend at bar 2)
    first_body_e = abs(c2 - o2)
    star_body = abs(c1 - o1)
    evening_star = c2 > o2 and min(o1, c1) > c2 and star_body < first_body_e * 0.5 and o < min(o1, c1) and c < o and c < (o2 + c2) / 2 and is_up_2

    # Morning Star (long bearish, small star, bullish close above midpoint of 1st body; prior downtrend at bar 2)
    first_body_m = abs(o2 - c2)
    morning_star = c2 < o2 and max(o1, c1) < c2 and star_body < first_body_m * 0.5 and o > max(o1, c1) and c > o and c > (o2 + c2) / 2 and is_down_2
```

Three-bar reversal patterns: a long trend candle, a small star that gaps away, and a confirmation candle that closes beyond the midpoint of the first body. The star body must be less than half the first body. Trend is checked at bar [2] (the leading candle).

### Hammer and Inverted Hammer

Lines 110-114 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    # Hammer (long lower shadow, short upper shadow, prior downtrend)
    hammer = (rng > 3 * body) and divide(c - l, rng, 0.0) > 0.66 and divide(o - l, rng, 0.0) > 0.66 and (h - max(o, c)) <= body and is_down_1

    # Inverted Hammer (long upper shadow, short lower shadow, gap down isolation, prior downtrend)
    inv_hammer = (rng > 3 * body) and divide(h - c, rng, 0.0) > 0.66 and divide(h - o, rng, 0.0) > 0.66 and (min(o, c) - l) <= body and o < c1 and is_down_1
```

Hammer has a long lower shadow (>66% of range) and short upper shadow (≤ body). Inverted Hammer has a long upper shadow (>66%) and short lower shadow. Both require a prior downtrend. The divide() function safely handles division by zero by returning a default of 0.0.

### Return statement with markers

Lines 116-132 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    return (
        plot.Marker(above if doji else nan, color=doji_color, text='Doji'),
        plot.Marker(above if bear_harami else nan, color=bear_color, text='Bearish Harami'),
        plot.Marker(below if bull_harami else nan, color=bull_color, text='Bullish Harami'),
        plot.Marker(above if bear_eng else nan, color=bear_color, text='Bearish Engulfing'),
        plot.Marker(below if bull_eng else nan, color=bull_color, text='Bullish Engulfing'),
        plot.Marker(below if piercing else nan, color=bull_color, text='Piercing Line'),
        plot.Marker(below if bull_belt else nan, color=bull_color, text='Bullish Belt'),
        plot.Marker(below if bull_kick else nan, color=bull_color, text='Bullish Kicker'),
        plot.Marker(above if bear_kick else nan, color=bear_color, text='Bearish Kicker'),
        plot.Marker(above if hanging_man else nan, color=bear_color, text='Hanging Man'),
        plot.Marker(above if evening_star else nan, color=bear_color, text='Evening Star'),
        plot.Marker(below if morning_star else nan, color=bull_color, text='Morning Star'),
        plot.Marker(above if shooting_star else nan, color=bear_color, text='Shooting Star'),
        plot.Marker(below if hammer else nan, color=doji_color, text='H'),
        plot.Marker(below if inv_hammer else nan, color=doji_color, text='IH'),
    )
```

Each pattern returns a plot.Marker with the label text and color, positioned above or below the bar. If the pattern condition is false, math.nan is returned so nothing is drawn. The marker size is controlled by the LABEL_SIZE constant defined at the top of the file.

## Pine Script vs Indie

The Indie version is a ground-up rewrite of the original Pine Script v6 indicator by repo32. While the pattern set is the same, the Indie version adds strict geometric rules, a configurable trend filter, and removes the historical lowest-low check on Belt Hold.

| Pine Script | Indie | Note |
| --- | --- | --- |
| `input.int(5, minval=1, title="Trend in Bars")` | `@param.int('trend_bars', default=10, min=1, title='Trend Bars')` | Default changed from 5 to 10 bars. |

### Trend filter replacement

Pine Script, lines 26-26 of [Candlestick Patterns Identified upd '26.pinescript6](Candlestick%20Patterns%20Identified%20upd%20'26.pinescript6):

```pine
bearHarami = close[1] > open[1] and open > close and open <= close[1] and open[1] <= close and open - close < close[1] - open[1] and open[trend] < open
```

Indie, lines 55-63 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    sma = Sma.new(self.close, trend_bars)
    sma1 = sma[1]
    sma2 = sma[2]
    mom1 = self.close[1 + trend_bars]
    mom2 = self.close[2 + trend_bars]
    is_up_1 = True if trend_type == 'none' else (c1 > mom1 if trend_type == 'momentum' else c1 > sma1)
    is_down_1 = True if trend_type == 'none' else (c1 < mom1 if trend_type == 'momentum' else c1 < sma1)
    is_up_2 = True if trend_type == 'none' else (c2 > mom2 if trend_type == 'momentum' else c2 > sma2)
    is_down_2 = True if trend_type == 'none' else (c2 < mom2 if trend_type == 'momentum' else c2 < sma2)
```

The original Pine used a simple 'open[trend] < open' comparison for trend direction. The Indie version replaces this with a configurable SMA or momentum filter, measured at bar [1] or [2] to avoid repainting. This provides more robust trend context.

### Belt Hold simplification

Pine Script, lines 41-43 of [Candlestick Patterns Identified upd '26.pinescript6](Candlestick%20Patterns%20Identified%20upd%20'26.pinescript6):

```pine
lower = ta.lowest(10)[1]
bullBelt = low == open and open < lower and open < close and close > ((high[1] - low[1]) / 2) + low[1] and open[trend] > open
plotshape(bullBelt, title="Bullish Belt", location=location.belowbar, style=shape.arrowup, color=bullColor,  textcolor=bullText, text="Bullish\nBelt")
```

Indie, lines 86-87 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    # Bullish Belt Hold (no lower shadow, long bullish body, prior downtrend)
    bull_belt = l == o and c > o and (c - o) > rng * 0.6 and is_down_1
```

The original Pine used ta.lowest(10)[1] and a close > midpoint condition. The Indie version removes the historical lowest-low check and the midpoint condition, requiring only that low equals open, the body is bullish and >60% of range, and the prior trend is down.

### Star patterns with body size limits

Pine Script, lines 54-58 of [Candlestick Patterns Identified upd '26.pinescript6](Candlestick%20Patterns%20Identified%20upd%20'26.pinescript6):

```pine
eveningStar = close[2] > open[2] and math.min(open[1], close[1]) > close[2] and open < math.min(open[1], close[1]) and close < open
plotshape(eveningStar, title="Evening Star", style=shape.arrowdown,  color=bearColor, textcolor=bearText, text="Evening\nStar")

morningStar = close[2] < open[2] and math.max(open[1], close[1]) < close[2] and open > math.max(open[1], close[1]) and close > open
plotshape(morningStar, title="Morning Star", location=location.belowbar, style=shape.arrowup, color=bullColor,  textcolor=bullText, text="Morning\nStar")
```

Indie, lines 98-105 of [Candlestick Patterns Identified upd '26.indie5](Candlestick%20Patterns%20Identified%20upd%20'26.indie5):

```python
    # Evening Star (long bullish, small star, bearish close below midpoint of 1st body; prior uptrend at bar 2)
    first_body_e = abs(c2 - o2)
    star_body = abs(c1 - o1)
    evening_star = c2 > o2 and min(o1, c1) > c2 and star_body < first_body_e * 0.5 and o < min(o1, c1) and c < o and c < (o2 + c2) / 2 and is_up_2

    # Morning Star (long bearish, small star, bullish close above midpoint of 1st body; prior downtrend at bar 2)
    first_body_m = abs(o2 - c2)
    morning_star = c2 < o2 and max(o1, c1) < c2 and star_body < first_body_m * 0.5 and o > max(o1, c1) and c > o and c > (o2 + c2) / 2 and is_down_2
```

The original Pine only checked gap and direction for stars. The Indie version adds a strict requirement that the star body must be less than 50% of the first body's size, preventing large-bodied candles from being misidentified as stars.

## Reading the chart

* **Bullish patterns** (Harami, Engulfing, Piercing Line, Belt Hold, Kicker, Morning Star, Hammer, Inverted Hammer) are drawn in LIME below the bar.
* **Bearish patterns** (Harami, Engulfing, Kicker, Hanging Man, Evening Star, Shooting Star) are drawn in RED above the bar.
* **Neutral patterns** (Doji, Hammer, Inverted Hammer) are drawn in WHITE; Hammer and Inverted Hammer use abbreviated labels 'H' and 'IH'.
* Labels appear only when all geometric and trend conditions are met; no label means no pattern detected on that bar.
* The trend filter context (SMA/momentum/none) affects which patterns can appear – reversal patterns require the appropriate prior trend direction.

## Implementation notes

- The trend filter uses close[1] or close[2] compared to SMA/momentum, not the current bar's close, to avoid repainting on the signal bar.
- The divide() function from indie.math is used for shadow ratios to safely handle cases where range is zero (returns 0.0).
- LABEL_SIZE is a hardcoded constant (5) because marker size in Indie is a decorator metadata value and cannot be changed at runtime.
- The Piercing Line condition uses 'o < c1' (open below prior close) instead of the traditional 'o < low[1]' to adapt to gap-less 24/7 markets.

## FAQ

**How do I change the marker size?**

The marker size is controlled by the LABEL_SIZE constant on line 9. Change the value (1-7) directly in the source code; it cannot be changed from the settings UI because marker size is a decorator metadata value in Indie.

**Why does the Piercing Line use 'open < close[1]' instead of 'open < low[1]'?**

The original Pine used 'open < low[1]' which requires a gap below the prior bar's low. In 24/7 markets like crypto, such gaps rarely occur. The Indie version uses 'open < close[1]' to detect a softer gap, making the pattern applicable to continuous trading sessions.

**Can I disable the trend filter for all patterns?**

Yes. Set the 'Trend Filter' parameter to 'none'. This will make is_up_1, is_down_1, is_up_2, and is_down_2 always return True, so patterns will be detected based solely on their geometric conditions without trend context.

## License and attribution

This Indie script is a derivative work of **Candlestick Patterns Identified by repo32** on TradingView. The Pine Script original carries a Mozilla Public License 2.0 notice in its header. A modified version of MPL-2.0 code must stay under [MPL-2.0](https://mozilla.org/MPL/2.0/), so this file is distributed under that license (the notice is appended to the end of the source file). The original author keeps the credit for the algorithm; this page is not affiliated with or endorsed by them.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/candlestick-patterns-identified-upd-26-82).

```python
# indie:lang_version = 5
from math import nan
from indie import indicator, param, plot, color
from indie.algorithms import Sma
from indie.math import divide

# Size of all pattern labels (1..7). Marker size is static decorator metadata in
# Indie, so it can't be a runtime Settings input; change it here in one place.
LABEL_SIZE = 5


@indicator('Candlestick Patterns Identified', overlay_main_pane=True)
@param.int('trend_bars', default=10, min=1, title='Trend Bars')
@param.str('trend_type', default='sma', options=['sma', 'momentum', 'none'], title='Trend Filter')
@param.float('doji_size', default=0.05, min=0.01, title='Doji size')
@param.color('bull_color', default=color.LIME, title='Bullish Color')
@param.color('bear_color', default=color.RED, title='Bearish Color')
@param.color('doji_color', default=color.WHITE, title='Other (i.e. Doji) Color')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE, size=LABEL_SIZE, title='Doji')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE, size=LABEL_SIZE, title='Bearish Harami')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Bullish Harami')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE, size=LABEL_SIZE, title='Bearish Engulfing')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Bullish Engulfing')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Piercing Line')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Bullish Belt')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Bullish Kicker')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE, size=LABEL_SIZE, title='Bearish Kicker')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE, size=LABEL_SIZE, title='Hanging Man')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE, size=LABEL_SIZE, title='Evening Star')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Morning Star')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.ABOVE, size=LABEL_SIZE, title='Shooting Star')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Hammer')
@plot.marker(style=plot.marker_style.LABEL, position=plot.marker_position.BELOW, size=LABEL_SIZE, title='Inverted Hammer')
def Main(self, trend_bars, trend_type, doji_size, bull_color, bear_color, doji_color):
    o = self.open[0]
    h = self.high[0]
    l = self.low[0]
    c = self.close[0]

    o1 = self.open[1]
    c1 = self.close[1]

    o2 = self.open[2]
    c2 = self.close[2]

    body = abs(o - c)
    rng = h - l

    # --- Trend filter measured BEFORE the signal candle ---
    # Reading the reversal candle's own close (close[0]) lets a pattern cancel
    # its own signal (e.g. Evening Star's bearish 3rd candle drags close under
    # the SMA). So 1-2 bar patterns read the trend at bar [1], and the 3-bar
    # stars read it at bar [2] (the leading trend candle).
    # Direction: bullish reversals need a prior downtrend, bearish need uptrend.
    sma = Sma.new(self.close, trend_bars)
    sma1 = sma[1]
    sma2 = sma[2]
    mom1 = self.close[1 + trend_bars]
    mom2 = self.close[2 + trend_bars]
    is_up_1 = True if trend_type == 'none' else (c1 > mom1 if trend_type == 'momentum' else c1 > sma1)
    is_down_1 = True if trend_type == 'none' else (c1 < mom1 if trend_type == 'momentum' else c1 < sma1)
    is_up_2 = True if trend_type == 'none' else (c2 > mom2 if trend_type == 'momentum' else c2 > sma2)
    is_down_2 = True if trend_type == 'none' else (c2 < mom2 if trend_type == 'momentum' else c2 < sma2)

    above = h
    below = l

    # Doji (no trend filter)
    doji = body <= rng * doji_size

    # Bearish Harami (prior uptrend)
    bear_harami = c1 > o1 and o > c and o <= c1 and o1 <= c and o - c < c1 - o1 and is_up_1

    # Bullish Harami (prior downtrend)
    bull_harami = o1 > c1 and c > o and c <= o1 and c1 <= o and c - o < o1 - c1 and is_down_1

    # Bearish Engulfing (prior uptrend)
    bear_eng = c1 > o1 and o > c and o >= c1 and o1 >= c and o - c > c1 - o1 and is_up_1

    # Bullish Engulfing (prior downtrend)
    bull_eng = o1 > c1 and c > o and c >= o1 and c1 >= o and c - o > o1 - c1 and is_down_1

    # Piercing Line (softened gap, long body, prior downtrend)
    piercing = c1 < o1 and o < c1 and c > c1 + ((o1 - c1) / 2) and c < o1 and (c - o) > rng * 0.5 and is_down_1

    # Bullish Belt Hold (no lower shadow, long bullish body, prior downtrend)
    bull_belt = l == o and c > o and (c - o) > rng * 0.6 and is_down_1

    # Bullish Kicker (bearish prev, bullish body gap up, real body; no trend filter)
    bull_kick = o1 > c1 and c > o and o > o1 and (c - o) > rng * 0.5

    # Bearish Kicker (bullish prev, bearish body gap down, real body; no trend filter)
    bear_kick = o1 < c1 and c < o and o < o1 and (o - c) > rng * 0.5

    # Hanging Man (small body at top, long lower shadow, short upper shadow, prior uptrend)
    hanging_man = (rng > 4 * body) and divide(c - l, rng, 0.0) >= 0.75 and divide(o - l, rng, 0.0) >= 0.75 and (h - max(o, c)) <= body and is_up_1

    # Evening Star (long bullish, small star, bearish close below midpoint of 1st body; prior uptrend at bar 2)
    first_body_e = abs(c2 - o2)
    star_body = abs(c1 - o1)
    evening_star = c2 > o2 and min(o1, c1) > c2 and star_body < first_body_e * 0.5 and o < min(o1, c1) and c < o and c < (o2 + c2) / 2 and is_up_2

    # Morning Star (long bearish, small star, bullish close above midpoint of 1st body; prior downtrend at bar 2)
    first_body_m = abs(o2 - c2)
    morning_star = c2 < o2 and max(o1, c1) < c2 and star_body < first_body_m * 0.5 and o > max(o1, c1) and c > o and c > (o2 + c2) / 2 and is_down_2

    # Shooting Star (small body, long upper shadow, short lower shadow, gap up isolation, prior uptrend)
    shooting_star = (rng > 3 * body) and (h - max(o, c) >= body * 3) and (min(c, o) - l <= body) and o > c1 and is_up_1

    # Hammer (long lower shadow, short upper shadow, prior downtrend)
    hammer = (rng > 3 * body) and divide(c - l, rng, 0.0) > 0.66 and divide(o - l, rng, 0.0) > 0.66 and (h - max(o, c)) <= body and is_down_1

    # Inverted Hammer (long upper shadow, short lower shadow, gap down isolation, prior downtrend)
    inv_hammer = (rng > 3 * body) and divide(h - c, rng, 0.0) > 0.66 and divide(h - o, rng, 0.0) > 0.66 and (min(o, c) - l) <= body and o < c1 and is_down_1

    return (
        plot.Marker(above if doji else nan, color=doji_color, text='Doji'),
        plot.Marker(above if bear_harami else nan, color=bear_color, text='Bearish Harami'),
        plot.Marker(below if bull_harami else nan, color=bull_color, text='Bullish Harami'),
        plot.Marker(above if bear_eng else nan, color=bear_color, text='Bearish Engulfing'),
        plot.Marker(below if bull_eng else nan, color=bull_color, text='Bullish Engulfing'),
        plot.Marker(below if piercing else nan, color=bull_color, text='Piercing Line'),
        plot.Marker(below if bull_belt else nan, color=bull_color, text='Bullish Belt'),
        plot.Marker(below if bull_kick else nan, color=bull_color, text='Bullish Kicker'),
        plot.Marker(above if bear_kick else nan, color=bear_color, text='Bearish Kicker'),
        plot.Marker(above if hanging_man else nan, color=bear_color, text='Hanging Man'),
        plot.Marker(above if evening_star else nan, color=bear_color, text='Evening Star'),
        plot.Marker(below if morning_star else nan, color=bull_color, text='Morning Star'),
        plot.Marker(above if shooting_star else nan, color=bear_color, text='Shooting Star'),
        plot.Marker(below if hammer else nan, color=doji_color, text='H'),
        plot.Marker(below if inv_hammer else nan, color=doji_color, text='IH'),
    )

# ---------------------------------------------------------------------------
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/
# Derived from "Candlestick Patterns Identified by repo32" (TradingView).
# ---------------------------------------------------------------------------
```
