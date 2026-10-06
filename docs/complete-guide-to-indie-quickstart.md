# Indie Quickstart: From a Minimal Indicator to a Strategy

Indie is the scripting language of the TakeProfit platform. It is a Python-style language for writing indicators and trading strategies that run on TakeProfit servers and draw on your charts. This guide takes you from a three-line indicator to a backtestable strategy, with every example checked against the current language.

*Last verified against Indie v5.19 (October 2026). This is an unofficial community guide. The official documentation lives at [takeprofit.com/docs/indie](https://takeprofit.com/docs/indie/What-is-Indie).*

---

## What Indie is

Indie is a technical analysis language and runtime built into the TakeProfit platform. Every built-in indicator on the platform is written in Indie, and you can open the source of any open-source indicator in the IDE and work on your own copy.

Syntactically, Indie is a subset of Python plus a layer of decorators such as `@indicator`, `@param.int` and `@plot.line`. If you can read Python, you can read Indie. There are some differences in semantics, such as how `Optional` works and which standard-library modules are available. They are listed in [Language differences with Python](https://takeprofit.com/docs/indie/Language-differences-with-Python).

> [!NOTE]
> Indie is its own language, not Python. Code copied from Python libraries (numpy, pandas) or from Pine Script will not compile as is.

## Why a dedicated language

- **Runs on the server.** Your code is executed in a sandbox on TakeProfit servers, not in your browser tab. The same script can drive a chart, a cloud alert and a backtest.
- **One file, several uses.** An indicator becomes an alert source. Add order calls and the same idea becomes a strategy you can test over history.
- **Nothing is a black box.** Built-in indicators are open source. Reading working code is often the fastest way to learn.
- **Publishable.** A finished indicator can be published to the Marketplace, free or paid.

The official [Why Indie](https://takeprofit.com/docs/indie/Why-Indie) page covers the reasoning in more detail, including when you do not need a language at all.

## What you can build

- **Indicators.** Lines, columns, markers, fills, levels, bands and colored candles, on the price pane or in a separate pane. Since v5.19 an indicator can also draw its own independent OHLC candle series with `@plot.candles()`.
- **Strategies with backtesting.** Place, amend and cancel orders from code, then measure the result in the Strategy tester. A strategy trades the one instrument it runs on.
- **Drawings and tables.** Labels, line segments and tables pinned to a corner of the chart. A table holds up to 50 rows and 20 columns.
- **Other instruments and timeframes.** `calc_on` runs a second calculation on another instrument or timeframe and merges the result into your chart. Lower timeframes are supported since v5.14.
- **Your own data.** A public HTTPS CSV file (since v5.18) or a live WebSocket/SSE feed (since v5.19) can be read as candles, typed rows or a series. Scripts that use external data cannot be published to the Marketplace.
- **Trading sessions.** Schedules with time zones and exceptions, so a rule can apply only inside a session.

See [What you can build](https://takeprofit.com/docs/indie/What-you-can-build) in the official docs for one example of each.

## Where you write code

Indie code is written in the **Indicators Code Editor** (IDE) widget. Add the widget to your workspace, open a chart, paste the code and press **Add to Chart**. The editor keeps version history, and a **Publish** button is available once the script is saved under your indicators. Details are in the [IDE guide](https://takeprofit.com/docs/guide/platform/ide-widget/IDE-overview).

You can also describe an indicator in plain language and let an AI assistant write and compile it. See [Vibe-Coding Indie Indicators with AI and MCP](Vibe-Coding%20Indie%20Indicators%20AI%20with%20MCP.md).

## A minimal indicator

```python
# indie:lang_version = 5
from indie import indicator

@indicator('Hello Indie')
def Main(self):
    return self.close[0]
```

What each part does:

- `# indie:lang_version = 5` is required on the first line of a complete script.
- `Main` is the entry point. It is called for every candle from left to right, then again on each real-time update of the last candle.
- `self` is the context of the chart instrument. It gives access to open, high, low, close and volume as series: `self.close`.
- `self.close[0]` is the value on the current candle. `self.close[1]` is the previous candle, and so on.
- The returned value is plotted as a line. Without `overlay_main_pane=True`, it goes into a separate pane below the chart.
- `from indie import indicator` is needed because decorators are not built-in symbols.

## Example 1: an SMA with an input parameter

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma

@indicator('Configurable SMA', overlay_main_pane=True)
@param.int('length', default=20, min=1, max=500, title='Length')
@plot.line(color=color.AQUA, title='SMA')
def Main(self, length):
    sma = Sma.new(self.close, length)
    return sma[0]
```

- `overlay_main_pane=True` draws the indicator on top of the candles.
- `Sma.new(self.close, length)` creates a Simple Moving Average over the close series. Algorithms from `indie.algorithms` return series, so you read the current value with `[0]`.
- `@param.int` adds a field to the indicator's **Settings** panel. The parameter name becomes an argument of `Main`.
- `@plot.line(color=...)` sets a fixed color and title for the line. These are meta-information and are not recalculated per bar.

## Example 2: colors and a fill

Static colors go in decorators. If a color depends on price data, return a `plot.Line` or `plot.Fill` object with a per-bar color.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma

@indicator('SMA Pair with Fill', overlay_main_pane=True)
@param.int('fast_length', default=12, min=1, title='Fast length')
@param.int('slow_length', default=42, min=1, title='Slow length')
@plot.line(id='slow', color=color.GRAY, title='Slow SMA')
@plot.line(id='fast', color=color.WHITE, title='Fast SMA')
@plot.fill('slow', 'fast')
def Main(self, fast_length, slow_length):
    slow = Sma.new(self.close, slow_length)
    fast = Sma.new(self.close, fast_length)

    # Per-bar color: green while the fast line is above the slow one
    fill_color = color.GREEN(0.3) if fast[0] > slow[0] else color.RED(0.3)
    line_color = color.GREEN if fast[0] > slow[0] else color.RED

    return slow[0], plot.Line(fast[0], color=line_color), plot.Fill(color=fill_color)
```

- The values in the returned tuple match the plot decorators in order: slow line, fast line, fill.
- `@plot.fill('slow', 'fast')` fills the area between the two plots by their `id`. A `@plot.fill` decorator always needs a matching `plot.Fill()` in the return.
- `color.GREEN(0.3)` is the same color with 0.3 opacity.
- Levels and bands are declared with static `@level` and `@band` decorators and need no return value. See [Fills, levels, and bands](https://takeprofit.com/docs/indie/Plotting-and-drawing/Fills-levels-and-bands).

## Example 3: a signal with markers

A marker is a plot too. To show a marker on some bars only, return a fully transparent color on the others.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma

@indicator('SMA Cross Signals', overlay_main_pane=True)
@param.int('fast_length', default=20, min=1, title='Fast length')
@param.int('slow_length', default=50, min=1, title='Slow length')
@plot.line(id='fast', color=color.AQUA, title='Fast SMA')
@plot.line(id='slow', color=color.ORANGE, title='Slow SMA')
@plot.marker(style=plot.marker_style.CIRCLE,
    position=plot.marker_position.CENTER, size=7,
    display_options=plot.MarkerDisplayOptions(
        pane=True, status_line=False, price_label=False,
    ),
    title='Cross',
)
def Main(self, fast_length, slow_length):
    fast = Sma.new(self.close, fast_length)
    slow = Sma.new(self.close, slow_length)

    # Fully transparent marker = no signal on this bar
    marker_color = color.rgba(0, 0, 0, 0)
    if fast[0] > slow[0] and fast[1] <= slow[1]:
        marker_color = color.GREEN   # fast crossed above slow
    elif fast[0] < slow[0] and fast[1] >= slow[1]:
        marker_color = color.RED     # fast crossed below slow

    return fast[0], slow[0], plot.Marker(value=slow[0], color=marker_color)
```

- A cross is detected by comparing the current bar with the previous one (`[0]` and `[1]`).
- `plot.MarkerDisplayOptions` hides the marker value from the status line and the price axis.
- Other plot types follow the same pattern: `@plot.columns`, `@plot.histogram`, `@plot.steps` and `@plot.bar_color` (to color the candles themselves). See [Data plotting](https://takeprofit.com/docs/indie/Plotting-and-drawing/Data-plotting-lines-columns-etc).

## Example 4: a minimal strategy

A strategy is declared with `@strategy` instead of `@indicator`. In a strategy, `self.trading` lets you place orders and read the current position.

```python
# indie:lang_version = 5
from indie import strategy, param, color, plot
from indie.algorithms import Sma
from indie.strategies import order_side


@strategy('SMA Cross Strategy', overlay_main_pane=True, initial_capital=10000.0)
@param.int('fast_length', default=20, min=1, title='Fast length')
@param.int('slow_length', default=50, min=1, title='Slow length')
@param.float('order_size', default=10.0, min=0.1, max=100.0, title='Order size, % of cash')
@plot.line(id='fast', color=color.AQUA, title='Fast SMA')
@plot.line(id='slow', color=color.ORANGE, title='Slow SMA')
def Main(self, fast_length, slow_length, order_size):
    fast = Sma.new(self.close, fast_length)
    slow = Sma.new(self.close, slow_length)

    size = self.trading.cash * order_size / 100 / self.close[0]
    pos = self.trading.position.size

    if fast[0] > slow[0] and fast[1] <= slow[1] and pos <= 0:
        # go long; also closes a short position if there is one
        self.trading.place_order(order_side.BUY, size=size + abs(pos)).submit()
    elif fast[0] < slow[0] and fast[1] >= slow[1] and pos >= 0:
        self.trading.place_order(order_side.SELL, size=size + abs(pos)).submit()

    return fast[0], slow[0]
```

- `place_order(...).submit()` builds and sends an order. The builder also supports limit and stop prices, take profit and stop loss. Orders can be amended and cancelled.
- Adding `abs(pos)` to the size reverses an existing position in one order.
- The strategy runs in a built-in exchange emulator for backtesting and forward-testing on real-time bars. Open it in the [Strategy tester](https://takeprofit.com/docs/guide/platform/backtesting-widget/backtest-widget) to see the report.
- A backtest is a simulation. Results depend on the data, the settings and the assumptions of the emulator, and past results do not predict future ones.

Next: [Strategies overview](https://takeprofit.com/docs/indie/Strategies/Strategies-overview), [Orders](https://takeprofit.com/docs/indie/Strategies/Orders) and [Strategy mechanics](https://takeprofit.com/docs/indie/Strategies/Strategy-mechanics).

## Other instruments, timeframes and your own data

For anything beyond the chart instrument, write a `@sec_context` function and attach it with `calc_on`. A class-based `Main` is used because the request is made in `__init__`.

```python
# indie:lang_version = 5
from indie import indicator, MainContext, param
from indie import sec_context

@sec_context
def SecMain(self):
    return self.high[0], self.low[0]

@indicator('Higher timeframe range', overlay_main_pane=True)
@param.time_frame('sec_time_frame', default='1D')
class Main(MainContext):
    def __init__(self, sec_time_frame):
        self._sec_high, self._sec_low = self.calc_on(SecMain, time_frame=sec_time_frame)

    def calc(self):
        return self._sec_high[0], self._sec_low[0]
```

The same mechanism reads your own data. Pass a `source` instead of an instrument:

```python
# indie:lang_version = 5
from indie import indicator, sec_context, MainContext, TimeFrame
from indie.data import sources

@sec_context
def ExternalCandles(self):
    return self.close[0]

@indicator('External candle close')
class Main(MainContext):
    def __init__(self):
        self._ext_close = self.calc_on(
            ExternalCandles,
            time_frame=TimeFrame.from_str('1D'),
            source=sources.Csv('https://example.com/candles.csv'))

    def calc(self):
        return self._ext_close[0]
```

> [!IMPORTANT]
> `example.com/candles.csv` is a placeholder. The file must be reachable over public HTTPS and follow the documented format. Indie code does not do network I/O itself: TakeProfit servers fetch and validate the file. See [External data overview](https://takeprofit.com/docs/indie/External-data/External-data-overview), [CSV format and limits](https://takeprofit.com/docs/indie/External-data/CSV-format-and-limits) and [Live data from a feed](https://takeprofit.com/docs/indie/External-data/Live-data-from-a-feed).

## Publishing

When a script is ready, save it under your indicators in the IDE and use **Publish** to list it in the [Marketplace](https://takeprofit.com/indicators). You choose whether it is free or paid by subscription. The publishing flow, pricing options and revenue terms are described on the official [Sell your indicators](https://takeprofit.com/docs/guide/monetization-tools/Sell-your-indicators) page.

Scripts that use external CSV or feed data cannot be published. They stay private to your account.

## Common mistakes

- **Missing version line.** A complete script starts with `# indie:lang_version = 5`.
- **Forgotten imports.** `indicator`, `param`, `plot`, `color` and `strategy` come from `indie`. Algorithms such as `Sma` come from `indie.algorithms`.
- **Return values out of sync with plot decorators.** Each `@plot.*` decorator occupies one slot in the returned tuple, in order.
- **Reading an algorithm result as a number.** `Sma.new(...)` returns a series. Use `[0]` for the current bar.
- **Using Python libraries or Pine syntax.** Both fail to compile.

## Where to go next

- [Official Quick start](https://takeprofit.com/docs/indie/Quick-start): the same ground in the official style.
- [Library reference](https://takeprofit.com/docs/indie/Library-reference-overview): packages, classes and decorators.
- [Code examples](https://takeprofit.com/docs/indie/Code-examples/educational-indicators): longer indicators and strategies.
- [Indie changelog](https://takeprofit.com/docs/indie/Changelog): what changed in each version.
- [Pine Script to Indie cheat sheet](README.md) and [FAQ](indie-FAQ.md) on this site.
