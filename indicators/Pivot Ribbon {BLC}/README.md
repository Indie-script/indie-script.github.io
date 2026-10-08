# Pivot Ribbon {BLC} - Technical Guide

> Plots a 3-EMA ribbon with conviction EMAs and color-coded clouds to visualize trend direction and EMA crossovers.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Moving averages |
| **Type** | Indicator |
| **Author** | @belegendarycapital on TakeProfit |
| **Original** | Ported to Indie from https://www.tradingview.com/script/I4VXGe18-Saty-Pivot-Ribbon/ created by https://x.com/satymahajan |
| **License** | [MPL-2.0](https://mozilla.org/MPL/2.0/) (derivative work) |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/pivot-ribbon-blc-46) |
| **Source file** | [Pivot Ribbon {BLC}.indie5](Pivot%20Ribbon%20{BLC}.indie5) |

## Overview

This indicator displays a ribbon of three EMAs (fast, pivot, slow) with optional long-term EMA and two conviction EMAs. It uses color-coded fills between the EMAs to show bullish or bearish bias: green/red for the fast cloud and aqua/yellow for the slow cloud. The ribbon "folds" when EMAs cross, changing the fill color.
It is designed for traders who follow EMA-based trend and support/resistance levels, inspired by Ripster EMA Clouds. The conviction EMAs (13 and 48 by default) can be toggled on to highlight additional trend confirmation lines.

## How it works

1. Computes EMAs of the close price for fast, pivot, slow, long-term, and conviction lengths.
2. Determines pivot bias by comparing pivot bias EMA to pivot EMA; colors the pivot line green if bullish, red if bearish.
3. Determines long-term bias by comparing long-term bias EMA to long-term EMA; colors the long-term line aqua or yellow.
4. Sets fast cloud fill color to bullish_fast_cloud_color if fast EMA >= pivot EMA, else bearish_fast_cloud_color.
5. Sets slow cloud fill color to bullish_slow_cloud_color if pivot EMA >= slow EMA, else bearish_slow_cloud_color.
6. Applies transparency to cloud fills using the cloud_transparency parameter.
7. Returns line plots for all EMAs and fill plots for the two cloud regions.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `fast_ema` | int | 8 |  | Fast EMA Length |
| `pivot_ema` | int | 21 |  | Pivot EMA Length |
| `show_pivot_bias` | bool | true |  | Show Pivot Bias |
| `pivot_bias_ema` | int | 8 |  | Pivot Bias EMA Length |
| `slow_ema` | int | 48 |  | Slow EMA Length |
| `show_long_term_ema` | bool | true |  | Show Long-Term EMA |
| `long_term_ema` | int | 200 |  | Long-term EMA Length |
| `show_long_term_bias` | bool | true |  | Show Long-term Bias |
| `long_term_bias_ema` | int | 21 |  | Long-term Bias EMA Length |
| `bullish_fast_cloud_color` | color | color.GREEN |  | Bullish Fast Cloud Color |
| `bearish_fast_cloud_color` | color | color.RED |  | Bearish Fast Cloud Color |
| `bullish_slow_cloud_color` | color | color.AQUA |  | Bullish Slow Cloud Color |
| `bearish_slow_cloud_color` | color | color.YELLOW |  | Bearish Slow Cloud Color |
| `cloud_transparency` | int | 60 | 0 - 100 | Cloud Transparency (0-100) |
| `show_fast_conviction_ema` | bool | false |  | Show Fast Conviction EMA |
| `fast_conviction_ema` | int | 13 |  | Fast Conviction EMA Length |
| `fast_conviction_ema_color` | color | color.SILVER |  | Fast Conviction EMA Color |
| `show_slow_conviction_ema` | bool | false |  | Show Slow Conviction EMA |
| `slow_conviction_ema` | int | 48 |  | Slow Conviction EMA Length |
| `slow_conviction_ema_color` | color | color.YELLOW |  | Slow Conviction EMA Color |

## Code walkthrough

### Parameter and plot decorators

Lines 12-40 of [Pivot Ribbon {BLC}.indie5](Pivot%20Ribbon%20{BLC}.indie5):

```python
@indicator('Pivot Ribbon [BLC]', overlay_main_pane=True)
@param.int('fast_ema', default=8, title='Fast EMA Length')
@param.int('pivot_ema', default=21, title='Pivot EMA Length')
@param.bool('show_pivot_bias', default=True, title='Show Pivot Bias')
@param.int('pivot_bias_ema', default=8, title='Pivot Bias EMA Length')
@param.int('slow_ema', default=48, title='Slow EMA Length')
@param.bool('show_long_term_ema', default=True, title='Show Long-Term EMA')
@param.int('long_term_ema', default=200, title='Long-term EMA Length')
@param.bool('show_long_term_bias', default=True, title='Show Long-term Bias')
@param.int('long_term_bias_ema', default=21, title='Long-term Bias EMA Length')
@param.color('bullish_fast_cloud_color', default=color.GREEN, title='Bullish Fast Cloud Color')
@param.color('bearish_fast_cloud_color', default=color.RED, title='Bearish Fast Cloud Color')
@param.color('bullish_slow_cloud_color', default=color.AQUA, title='Bullish Slow Cloud Color')
@param.color('bearish_slow_cloud_color', default=color.YELLOW, title='Bearish Slow Cloud Color')
@param.int('cloud_transparency', default=60, title='Cloud Transparency (0-100)', min=0, max=100)
@param.bool('show_fast_conviction_ema', default=False, title='Show Fast Conviction EMA')
@param.int('fast_conviction_ema', default=13, title='Fast Conviction EMA Length')
@param.color('fast_conviction_ema_color', default=color.SILVER, title='Fast Conviction EMA Color')
@param.bool('show_slow_conviction_ema', default=False, title='Show Slow Conviction EMA')
@param.int('slow_conviction_ema', default=48, title='Slow Conviction EMA Length')
@param.color('slow_conviction_ema_color', default=color.YELLOW, title='Slow Conviction EMA Color')
@plot.line(id='fast_ema')
@plot.line(id='pivot_ema')
@plot.line(id='slow_ema')
@plot.line(id='long_term_ema')
@plot.fill('fast_ema', 'pivot_ema')
@plot.fill('pivot_ema', 'slow_ema')
@plot.line(id='fast_conviction_ema')
@plot.line(id='slow_conviction_ema')
```

The indicator is declared with overlay_main_pane=True so it draws on the price chart. All user-configurable parameters are defined via @param decorators, including EMA lengths, toggles, colors, and transparency. The @plot decorators register the line and fill IDs that will be returned from Main.

### EMA computation and bias logic

Lines 44-51 of [Pivot Ribbon {BLC}.indie5](Pivot%20Ribbon%20{BLC}.indie5):

```python
    fast_ema_value = Ema.new(self.close, fast_ema)[0]
    pivot_ema_value = Ema.new(self.close, pivot_ema)[0]
    pivot_bias_ema_value = Ema.new(self.close, pivot_bias_ema)[0]
    slow_ema_value = Ema.new(self.close, slow_ema)[0]
    long_term_ema_value = Ema.new(self.close, long_term_ema)[0] if show_long_term_ema else nan
    long_term_bias_ema_value = Ema.new(self.close, long_term_bias_ema)[0] if show_long_term_ema else nan
    fast_conviction_ema_value = Ema.new(self.close, fast_conviction_ema)[0]
    slow_conviction_ema_value = Ema.new(self.close, slow_conviction_ema)[0]
```

Each EMA is computed using Ema.new(self.close, length)[0], which returns the current bar's value. The long-term EMA and its bias EMA are only computed if show_long_term_ema is true; otherwise they are set to nan. The conviction EMAs are always computed and always plotted, but shown in white when the respective show flags are false.

### Line and cloud color assignment

Lines 54-63 of [Pivot Ribbon {BLC}.indie5](Pivot%20Ribbon%20{BLC}.indie5):

```python
    fast_ema_color = color.WHITE
    pivot_ema_color = color.GREEN if pivot_bias_ema_value >= pivot_ema_value else color.RED if show_pivot_bias else color.WHITE
    slow_ema_color = color.WHITE
    long_term_ema_color = color.AQUA if long_term_bias_ema_value >= long_term_ema_value else color.YELLOW if show_long_term_bias else color.WHITE
    fast_conviction_color = fast_conviction_ema_color if show_fast_conviction_ema else color.WHITE
    slow_conviction_color = slow_conviction_ema_color if show_slow_conviction_ema else color.WHITE

    # Cloud colors
    fast_cloud_color = bullish_fast_cloud_color(alpha) if fast_ema_value >= pivot_ema_value else bearish_fast_cloud_color(alpha)
    slow_cloud_color = bullish_slow_cloud_color(alpha) if pivot_ema_value >= slow_ema_value else bearish_slow_cloud_color(alpha)
```

Line colors are set based on bias comparisons: pivot_ema_color is green if pivot_bias_ema >= pivot_ema, red otherwise (if show_pivot_bias is true). Cloud colors use the user-provided colors with alpha applied via color(alpha). The fast cloud uses fast_ema vs pivot_ema; the slow cloud uses pivot_ema vs slow_ema.

### Return tuple with plots

Lines 65-74 of [Pivot Ribbon {BLC}.indie5](Pivot%20Ribbon%20{BLC}.indie5):

```python
    return (
        plot.Line(fast_ema_value, color=fast_ema_color),
        plot.Line(pivot_ema_value, color=pivot_ema_color),
        plot.Line(slow_ema_value, color=slow_ema_color),
        plot.Line(long_term_ema_value, color=long_term_ema_color),
        plot.Fill(color=fast_cloud_color),
        plot.Fill(color=slow_cloud_color),
        plot.Line(fast_conviction_ema_value, color=fast_conviction_color),
        plot.Line(slow_conviction_ema_value, color=slow_conviction_color)
    )
```

The function returns a tuple of plot.Line and plot.Fill objects matching the order of @plot decorators. The first four lines are the EMAs, then two fills, then the two conviction EMAs. Each line gets its computed value and color; fills get only a color (the fill region is defined by the two line IDs declared in @plot.fill).

## Reading the chart

- **Fast EMA line** (default 8): white.
- **Pivot EMA line** (default 21): green when pivot bias EMA >= pivot EMA (bullish bias), red when below (bearish bias), white if show_pivot_bias is off.
- **Slow EMA line** (default 48): white.
- **Long-term EMA line** (default 200): aqua when long-term bias EMA >= long-term EMA, yellow when below, white if show_long_term_bias is off.
- **Fast cloud** (fill between fast and pivot EMAs): user-defined bullish color (default green) when fast >= pivot, bearish color (default red) otherwise.
- **Slow cloud** (fill between pivot and slow EMAs): user-defined bullish color (default aqua) when pivot >= slow, bearish color (default yellow) otherwise.
- **Conviction EMAs** (optional): plotted in user-defined colors (default silver and yellow) when enabled.

## Implementation notes

- The long-term EMA and its bias EMA are both set to nan when show_long_term_ema is false, which hides them from the chart.
- Cloud transparency is applied by calling the color object with an alpha factor: color(alpha).
- Conviction EMAs are always computed internally but always plotted; when disabled they are drawn in white.
- The indicator repaints on every bar because it uses [0] to get the current EMA value; no lookahead bias is introduced.

## FAQ

**How do I change the EMA lengths?**

Adjust the fast_ema, pivot_ema, slow_ema, and long_term_ema parameters in the indicator settings. The default values are 8, 21, 48, and 200.

**What does the cloud transparency do?**

The cloud_transparency parameter (0-100) controls the opacity of the fill between EMAs. 0 is fully opaque, 100 is fully transparent (invisible).

**Can I hide the conviction EMAs?**

Yes. Set show_fast_conviction_ema and show_slow_conviction_ema to false in the settings. They are off by default.

## License and attribution

This Indie script is a derivative work of **Saty Pivot Ribbon by Saty Mahajan** on TradingView. This is a port of an open-source TradingView script whose header we could not retrieve; TradingView applies MPL-2.0 by default to open-source scripts, so that license is assumed. A modified version of MPL-2.0 code must stay under [MPL-2.0](https://mozilla.org/MPL/2.0/), so this file is distributed under that license (the notice is appended to the end of the source file). The original author keeps the credit for the algorithm; this page is not affiliated with or endorsed by them.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/pivot-ribbon-blc-46).

```python
# Ported to Indie from https://www.tradingview.com/script/I4VXGe18-Saty-Pivot-Ribbon/ created by https://x.com/satymahajan

# This work is licensed under the MIT License.
# For a copy, see <https://opensource.org/licenses/MIT>.

# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Ema
from indie import MutSeriesF
from math import nan

@indicator('Pivot Ribbon [BLC]', overlay_main_pane=True)
@param.int('fast_ema', default=8, title='Fast EMA Length')
@param.int('pivot_ema', default=21, title='Pivot EMA Length')
@param.bool('show_pivot_bias', default=True, title='Show Pivot Bias')
@param.int('pivot_bias_ema', default=8, title='Pivot Bias EMA Length')
@param.int('slow_ema', default=48, title='Slow EMA Length')
@param.bool('show_long_term_ema', default=True, title='Show Long-Term EMA')
@param.int('long_term_ema', default=200, title='Long-term EMA Length')
@param.bool('show_long_term_bias', default=True, title='Show Long-term Bias')
@param.int('long_term_bias_ema', default=21, title='Long-term Bias EMA Length')
@param.color('bullish_fast_cloud_color', default=color.GREEN, title='Bullish Fast Cloud Color')
@param.color('bearish_fast_cloud_color', default=color.RED, title='Bearish Fast Cloud Color')
@param.color('bullish_slow_cloud_color', default=color.AQUA, title='Bullish Slow Cloud Color')
@param.color('bearish_slow_cloud_color', default=color.YELLOW, title='Bearish Slow Cloud Color')
@param.int('cloud_transparency', default=60, title='Cloud Transparency (0-100)', min=0, max=100)
@param.bool('show_fast_conviction_ema', default=False, title='Show Fast Conviction EMA')
@param.int('fast_conviction_ema', default=13, title='Fast Conviction EMA Length')
@param.color('fast_conviction_ema_color', default=color.SILVER, title='Fast Conviction EMA Color')
@param.bool('show_slow_conviction_ema', default=False, title='Show Slow Conviction EMA')
@param.int('slow_conviction_ema', default=48, title='Slow Conviction EMA Length')
@param.color('slow_conviction_ema_color', default=color.YELLOW, title='Slow Conviction EMA Color')
@plot.line(id='fast_ema')
@plot.line(id='pivot_ema')
@plot.line(id='slow_ema')
@plot.line(id='long_term_ema')
@plot.fill('fast_ema', 'pivot_ema')
@plot.fill('pivot_ema', 'slow_ema')
@plot.line(id='fast_conviction_ema')
@plot.line(id='slow_conviction_ema')
def Main(self, fast_ema: int, pivot_ema: int, show_pivot_bias: bool, pivot_bias_ema: int, slow_ema: int, show_long_term_ema: bool, long_term_ema: int, show_long_term_bias: bool, long_term_bias_ema: int, bullish_fast_cloud_color, bearish_fast_cloud_color, bullish_slow_cloud_color, bearish_slow_cloud_color, cloud_transparency: int, show_fast_conviction_ema: bool, fast_conviction_ema: int, fast_conviction_ema_color, show_slow_conviction_ema: bool, slow_conviction_ema: int, slow_conviction_ema_color):
    alpha = (100 - cloud_transparency) / 100.0

    fast_ema_value = Ema.new(self.close, fast_ema)[0]
    pivot_ema_value = Ema.new(self.close, pivot_ema)[0]
    pivot_bias_ema_value = Ema.new(self.close, pivot_bias_ema)[0]
    slow_ema_value = Ema.new(self.close, slow_ema)[0]
    long_term_ema_value = Ema.new(self.close, long_term_ema)[0] if show_long_term_ema else nan
    long_term_bias_ema_value = Ema.new(self.close, long_term_bias_ema)[0] if show_long_term_ema else nan
    fast_conviction_ema_value = Ema.new(self.close, fast_conviction_ema)[0]
    slow_conviction_ema_value = Ema.new(self.close, slow_conviction_ema)[0]

    # Line colors
    fast_ema_color = color.WHITE
    pivot_ema_color = color.GREEN if pivot_bias_ema_value >= pivot_ema_value else color.RED if show_pivot_bias else color.WHITE
    slow_ema_color = color.WHITE
    long_term_ema_color = color.AQUA if long_term_bias_ema_value >= long_term_ema_value else color.YELLOW if show_long_term_bias else color.WHITE
    fast_conviction_color = fast_conviction_ema_color if show_fast_conviction_ema else color.WHITE
    slow_conviction_color = slow_conviction_ema_color if show_slow_conviction_ema else color.WHITE

    # Cloud colors
    fast_cloud_color = bullish_fast_cloud_color(alpha) if fast_ema_value >= pivot_ema_value else bearish_fast_cloud_color(alpha)
    slow_cloud_color = bullish_slow_cloud_color(alpha) if pivot_ema_value >= slow_ema_value else bearish_slow_cloud_color(alpha)

    return (
        plot.Line(fast_ema_value, color=fast_ema_color),
        plot.Line(pivot_ema_value, color=pivot_ema_color),
        plot.Line(slow_ema_value, color=slow_ema_color),
        plot.Line(long_term_ema_value, color=long_term_ema_color),
        plot.Fill(color=fast_cloud_color),
        plot.Fill(color=slow_cloud_color),
        plot.Line(fast_conviction_ema_value, color=fast_conviction_color),
        plot.Line(slow_conviction_ema_value, color=slow_conviction_color)
    )

# ---------------------------------------------------------------------------
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/
# Derived from "Saty Pivot Ribbon by Saty Mahajan" (TradingView).
# ---------------------------------------------------------------------------
```
