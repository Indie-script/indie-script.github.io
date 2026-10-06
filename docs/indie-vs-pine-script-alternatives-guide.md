# Indie vs Pine Script: A Developer's Guide to Pine Script Alternatives (2026)

Indie is the Python-style scripting language of the TakeProfit platform. Pine Script is the scripting language of TradingView. Both let you write custom indicators and trading strategies that run on the platform's servers. This guide compares them from a developer's point of view: syntax, strategies and backtesting, data access, tooling, AI support, publishing, and what it takes to move code from one to the other.

> [!NOTE]
> This is a community guide, not official documentation. For the authoritative Indie reference, use the [official Indie docs](https://takeprofit.com/docs/indie/Overview). Facts about TradingView and Pine Script reflect our understanding at the time of writing; check [TradingView's documentation](https://www.tradingview.com/pine-script-docs/) for current details.

## TL;DR

- **Indie** is a subset of Python plus decorators (`@indicator`, `@strategy`, `@param`, `@plot`). It runs sandboxed on TakeProfit's servers and covers indicators, strategies with backtesting, drawings and tables, multi-instrument and multi-timeframe data, and your own CSV or live-feed data.
- **Pine Script** is TradingView's own language. It also runs on the platform's servers and has a much larger community, more tutorials, and a bigger library of published scripts.
- **Indie is not indicator-only.** Strategies and backtesting arrived in early 2026 (Indie v5.10 and v5.11), and the language has kept growing since: dictionaries, table drawings, external data, lower-timeframe requests, new plot types, and AI/MCP tooling.
- **Neither language is portable.** Moving between them means rewriting, though the logic usually translates well. TakeProfit's AI assistant can help convert Pine Script to Indie.
- **Pricing and limits change.** This guide deliberately does not quote subscription prices. Check each platform's current pricing page.

> [!TIP]
> If you already know Python and want to read the source of every built-in indicator, Indie is worth a look. If you live in TradingView's ecosystem and rely on its community scripts, Pine Script is the natural choice.

## Indie vs Pine Script at a glance

| | Indie (TakeProfit) | Pine Script (TradingView) |
| --- | --- | --- |
| Language base | Subset of Python with decorators | Proprietary domain-specific language |
| Where code runs | TakeProfit servers, sandboxed | TradingView servers |
| Script types | Indicators and strategies | Indicators, strategies, libraries |
| Backtesting | Yes, Strategy/Backtesting widget (since Feb 2026) | Yes, Strategy Tester |
| Live trading from a strategy | Described in the Indie docs; check the platform docs for current venues | Via alerts and webhooks, or supported brokers |
| Drawings | Lines, labels, rectangles, circles, triangles, channels, tables | Lines, labels, boxes, tables, polylines |
| Other instruments and timeframes | `@sec_context` + `calc_on()`, including lower timeframes | `request.security()` and related `request.*` functions |
| Your own data | External CSV and live WebSocket/SSE feeds (private scripts) | Limited to what `request.*` functions and seed data provide |
| Volume Footprint / TPO data in scripts | Yes, profile requests in Indie | Check TradingView's current documentation |
| Built-in indicators | Written in Indie, source is open, can be forked | Many are written in Pine; availability of source varies |
| AI tooling | AI chat, IDE assistant, MCP server for Claude, Codex, Cursor, VS Code | Third-party tools and general-purpose LLMs |
| Publishing | Marketplace, free or paid, with moderation | Public library and invite-only scripts |
| Community size | Smaller, growing | Large and established |

## What Is Indie?

Indie is a technical analysis language and runtime built for TakeProfit. Every built-in indicator on the platform is written in Indie, and the source of open-source indicators can be opened in the platform's IDE as your own editable copy.

Indie is a subset of Python with added syntactic sugar: decorators such as `@indicator`, `@strategy`, `@algorithm`, `@param.int`, and `@plot.line` turn ordinary functions into classes that process series data behind the scenes. If you have written Python, you can read Indie quickly. It is still its own language, and code written in plain Python or Pine Script will not compile without changes.

Indie code runs in a sandbox on TakeProfit's servers. File and socket I/O are not allowed, and execution time and memory are limited. You cannot import numpy, pandas, or TA-Lib. What you can import is the `indie` package and its sub-packages (`indie.algorithms`, `indie.strategies`, `indie.plot`, `indie.drawings`, `indie.math`, `indie.color`, `indie.data`, `indie.schedule`), plus a few modules such as `dataclasses`, `datetime`, `math`, `statistics`, and `sortedcontainers`. See the [library reference](https://takeprofit.com/docs/indie/Library-reference-overview).

The workflow is built into the platform: write code in the IDE widget, add the indicator to a chart, put a cloud alert on it, test a strategy in the Strategy/Backtesting widget, and publish the result to the Marketplace.

## What Is Pine Script?

Pine Script is TradingView's proprietary scripting language for indicators, strategies, and libraries. Scripts run on TradingView's servers and cannot be exported to other platforms. The language is versioned (v5 and v6 are the recent ones), and each script declares its version on the first line, for example `//@version=6`. Older scripts keep their declared version; moving to a newer version usually requires code changes.

Pine's main strengths are its community and its ecosystem: years of tutorials, forum answers, open-source scripts, and third-party tooling. If you want to learn from a large body of existing examples, that matters.

## Write Your First Indie Indicator

This section walks through four small scripts. All Indie samples in this guide were checked with the TakeProfit MCP `ValidateScript` tool (compile check, plus a quick runtime run on market data for most of them).

### Step 1: Open the IDE widget

TakeProfit's workspace is built from widgets. Open the Widget Hub, add the IDE widget, and create a new indicator. See the [IDE overview](https://takeprofit.com/docs/guide/platform/ide-widget/IDE-overview) for details.

### Step 2: A minimal indicator

```python
# indie:lang_version = 5
from indie import indicator

@indicator('My First Indicator', overlay_main_pane=True)
def Main(self):
    return self.close[0]
```

`Main` is called for every candle from left to right, and then on every real-time update of the latest candle. `self` gives you the chart instrument's OHLCV series: `self.close[0]` is the current bar's close, `self.close[1]` is the previous bar's close. Whatever `Main` returns is plotted. The `# indie:lang_version = 5` comment on the first line selects the language version.

### Step 3: Add a built-in algorithm and a parameter

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma

@indicator('SMA Indicator', overlay_main_pane=True)
@param.int('length', default=20, min=1, title='SMA length')
@plot.line(color=color.AQUA)
def Main(self, length):
    return Sma.new(self.close, length)[0]
```

Algorithms in `indie.algorithms` are created with `.new()`. The package includes `Sma`, `Ema`, `Wma`, `Rma`, `Vwma`, `Rsi`, `Macd`, `Bb` (Bollinger Bands), `Stoch`, `Adx`, `Atr`, `Cci`, `Mfi`, `Roc`, `Sar`, `Supertrend`, `Donchian`, `Vwap`, `Highest`, `Lowest`, `PivotHighLow`, `ZigZag`, and more. `@param.int` creates an input the user can change from the settings panel. Other parameter types include `float`, `bool`, `str`, `source`, `time_frame`, and `color`.

### Step 4: A class-based indicator

When you need one-time setup in `__init__` (for example to request another instrument), use the class form:

```python
# indie:lang_version = 5
from indie import indicator, MainContext, param
from indie.algorithms import Rsi

@indicator('RSI with class-based Main')
@param.int('length', default=14, min=1, title='RSI length')
class Main(MainContext):
    def __init__(self):
        # one-time setup goes here; algorithms such as Rsi.new() are created in calc()
        pass

    def calc(self, length):
        rsi = Rsi.new(self.close, length)
        return rsi[0]
```

> [!IMPORTANT]
> `Rsi.new()` and other algorithm constructors can only be called from `calc()`, from `Main` in function form, or from `@algorithm` / `@sec_context` functions. Calling them in `__init__` is a compile error. The compiler message says so explicitly.

## Strategies and Backtesting in Indie

Indie became a strategy language in early 2026: the `@strategy` decorator and the `indie.strategies` package arrived with v5.10, and the backtesting widget with v5.11. A strategy is a script with an extra `self.trading` interface for placing, amending, and cancelling orders and reading the current position. The same code runs in two modes according to the docs: backtesting (and forward-testing on live bars) against a built-in exchange emulator, and live trading against a real exchange. A backtest approximates live results; fills, fees, and latency will differ.

A crossover strategy that reverses its position on each signal:

```python
# indie:lang_version = 5
from indie import strategy, MainStrategyContext, param
from indie.algorithms import Sma
from indie.strategies import Commission, commission_type, order_side
from indie.math import cross_over, cross_under

@strategy('MA Crossover',
          overlay_main_pane=True,
          commission=Commission(0.001, commission_type.PERCENT),
          initial_capital=50000.0)
@param.int('fast', default=10, min=1, title='Fast SMA')
@param.int('slow', default=30, min=1, title='Slow SMA')
class Main(MainStrategyContext):
    def __init__(self):
        pass

    def calc(self, fast, slow):
        fast_sma = Sma.new(self.close, length=fast)
        slow_sma = Sma.new(self.close, length=slow)
        pos_size = self.trading.position.size

        if cross_over(fast_sma, slow_sma) and pos_size <= 0:
            # reverse a short position if there is one, otherwise open a long
            self.trading.place_order(order_side.BUY, size=1.0 + abs(pos_size)).submit()

        if cross_under(fast_sma, slow_sma) and pos_size >= 0:
            self.trading.place_order(order_side.SELL, size=1.0 + abs(pos_size)).submit()
```

Strategy settings include initial capital, commission (fixed or percent), leverage, risk-free rate, `intrabar_order_filter` (controls on which ticks of a bar orders may be placed), and `market_order_price` (which simulated price market orders fill at in backtests). Order types are market, limit, stop, and stop-limit. A note on units: a `PERCENT` commission is a fraction, so `0.001` means 0.1%.

Take-profit and stop-loss are attached to the entry order and form an OCO bracket that protects the whole position:

```python
# indie:lang_version = 5
from indie import strategy, MainStrategyContext, param
from indie.algorithms import Sma
from indie.math import cross_over
from indie.strategies import Commission, commission_type, order_side

@strategy('SMA cross with bracket',
          overlay_main_pane=True,
          initial_capital=10000.0,
          commission=Commission(0.001, commission_type.PERCENT))
@param.int('length', default=50, min=1, title='SMA length')
@param.float('tp_pct', default=4.0, min=0.1, title='Take profit, %')
@param.float('sl_pct', default=2.0, min=0.1, title='Stop loss, %')
class Main(MainStrategyContext):
    def calc(self, length, tp_pct, sl_pct):
        sma = Sma.new(self.close, length)
        if self.trading.position.size == 0 and cross_over(self.close, sma):
            entry = self.close[0]
            take = entry * (1 + tp_pct / 100)
            stop = entry * (1 - sl_pct / 100)
            (
                self.trading.place_order(order_side.BUY, size=1.0).
                limit(price=entry).
                take_profit(stop=take, limit=take).
                stop_loss(stop=stop).
                submit()
            )
```

> [!NOTE]
> Per the current docs, take-profit and stop-loss can be attached only to limit and stop-limit entry orders, not to market orders. Strategies can trade only one instrument at a time (they can still read other instruments through `calc_on`). Order changes take effect on the next `calc()` call, not immediately. See [Strategies overview](https://takeprofit.com/docs/indie/Strategies/Strategies-overview) and [Orders](https://takeprofit.com/docs/indie/Strategies/Orders).

The Strategy/Backtesting widget reports, among others, total P&L, win rate, profit factor, expectancy, max drawdown, Sharpe, Sortino and Calmar ratios, daily Value at Risk, and a trade-by-trade log. The amount of history available to a backtest depends on your plan (the docs give 5,000 candles on the free plan and 20,000 on the paid All-In plan at the time of writing). See [Strategy tester and backtesting](https://takeprofit.com/docs/guide/platform/backtesting-widget/backtest-widget).

TradingView's Strategy Tester is the established counterpart for Pine Script strategies, and it is a mature, widely used tool. If deep backtesting history and a large pool of shared strategies matter to you, compare both for your own instruments.

## Key Capabilities Compared

### Syntax and learning curve

Indie supports top-level function definitions, `if`/`for`/`while`, `int` (32-bit signed), `float` (64-bit), `bool`, `str`, typed `list[T]` and `dict[K, V]` containers, tuple pairs, basic f-strings (`{x}` and `{x:.2f}`), simple classes, and `raise`. Variables use block-level scoping, like C or Java, rather than Python's function-level scoping. The compiler infers types where it can and asks for explicit annotations elsewhere. Not supported yet: nested functions, lambdas, generator expressions and comprehensions, `try`/`except`, `with`, and `set`, `queue` and `deque` containers. See [Indie vs. Python](https://takeprofit.com/docs/indie/Language-differences-with-Python).

Pine Script has its own syntax that resembles no mainstream language exactly; it is compact and designed around series data, so a simple indicator is only a few lines. Pine v5 and later also support user-defined types, methods, and libraries.

### Algorithms and open-source built-ins

Indie's `indie.algorithms` package exposes the building blocks used by TakeProfit's own indicators, and the source of open-source built-ins is available to read and fork. Pine has a large built-in `ta.*` namespace and a big library of community scripts.

### Drawings, tables, and plot types

Indie indicators can plot lines, histograms, columns, steps, candles (`@plot.candles`, since v5.19), markers, fills, background colors, and bar colors (`@plot.bar_color`, which recolors the chart's own candles). They can also draw labels, line segments, rectangles, circles, triangles, channels, and tables (since v5.13 and v5.17). Tables are useful for on-chart summaries:

```python
# indie:lang_version = 5
from indie import MainContext, color, indicator
from indie.drawings import Table, TableCell, TableRow, RelativePosition, vertical_anchor as va, horizontal_anchor as ha

@indicator('Market summary', overlay_main_pane=True)
class Main(MainContext):
    def __init__(self):
        self._table = Table(
            position=RelativePosition(va.TOP, ha.RIGHT, 0.05, 0.95),
        )

    def calc(self):
        if not self.is_last_bar:
            return self.close[0]

        self._table.clear()
        self._table.append(TableRow([
            TableCell('Metric', bg_color=color.GRAY(0.5)),
            TableCell('Value', bg_color=color.GRAY(0.5)),
        ]))
        self._table.add_row(['Close', str(self.close[0])])
        self._table.add_row(['Bar', str(self.bar_index)])

        self.chart.draw(self._table)
        return self.close[0]
```

Pine Script has comparable drawing objects (`line`, `label`, `box`, `table`, `polyline`).

### Dictionaries

Since v5.18, Indie has `dict[K, V]` containers (keys can be `str`, `int`, `bool`, or finite `float`). A small example that counts how many bars closed in each 100-point price band and shows the counts in a table:

```python
# indie:lang_version = 5
from indie import indicator, MainContext
from indie.drawings import Table, RelativePosition, vertical_anchor as va, horizontal_anchor as ha

@indicator('Price level touches', overlay_main_pane=True)
class Main(MainContext):
    def __init__(self):
        self._touches: dict[int, int] = {}
        self._table = Table(position=RelativePosition(va.TOP, ha.RIGHT, 0.05, 0.95))

    def calc(self):
        level = int(self.close[0] / 100.0) * 100
        if level in self._touches:
            self._touches[level] = self._touches[level] + 1
        else:
            self._touches[level] = 1

        if self.is_last_bar:
            self._table.clear()
            self._table.add_row(['Level', 'Bars closed there'])
            for key in self._touches.keys():
                self._table.add_row([f'{key}', f'{self._touches[key]}'])
            self.chart.draw(self._table)
        return self.close[0]
```

### Other instruments and timeframes

Indie requests additional instruments or timeframes with `@sec_context` and `Context.calc_on()`, which must be called from `__init__`. Since v5.14, `calc_on` also supports timeframes lower than the chart's. Pine uses `request.security()` for the same purpose, with different syntax and scoping rules.

```python
# indie:lang_version = 5
from indie import indicator, MainContext, sec_context, param

@sec_context
def FastBars(self):
    return self.high[0], self.low[0]

@indicator('Lower timeframe range', overlay_main_pane=True)
@param.time_frame('fast_tf', default='1m')
class Main(MainContext):
    def __init__(self, fast_tf):
        self._fast_high, self._fast_low = self.calc_on(FastBars, time_frame=fast_tf)

    def calc(self):
        return self._fast_high[0], self._fast_low[0]
```

> [!WARNING]
> Requesting data with `lookahead=True`, or mixing higher-timeframe data into history, can make an indicator repaint or leak future information into backtests. This is true on any platform. TakeProfit's Marketplace rules ask authors to disclose such behavior.

### Your own data: CSV and live feeds

Since v5.18, an Indie indicator can read a public HTTPS CSV file as candles (through `@sec_context`), as typed rows (`@data_context`), or directly with `request_series`. Since v5.19, `sources.DataFeed` can stream records from your own WebSocket or SSE server into an indicator. This makes it possible to chart macro figures, on-chain metrics, or a trading journal next to price.

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

The URL above is a placeholder; point it at your own file. Scripts that use external data cannot be published to the Marketplace and stay private to your account. File format, size limits, and the feed protocol are described in the [External data docs](https://takeprofit.com/docs/indie/External-data/External-data-overview).

### Volume Footprint and TPO data

Indie can request Volume Footprint and TPO (Market Profile) profiles for the chart instrument, for example to plot the point of control or calculate buy-sell delta. On the platform side, the chart supports Volume Footprint and TPO chart types and a Liquidity Heatmap overlay. See [Volume Footprint profiles](https://takeprofit.com/docs/indie/Profile-data/Volume-Footprint-profiles) and [TPO profiles](https://takeprofit.com/docs/indie/Profile-data/TPO-profiles).

### Schedules and sessions

Indie has an `indie.schedule` package and documentation for trading sessions and schedules. See [Schedules and Trading Sessions](https://takeprofit.com/docs/indie/Schedules-and-Trading-Sessions).

### AI and MCP tooling

TakeProfit ships three AI entry points for Indie development:

- **AI chat and the assistant in the IDE** write, explain, debug, and convert scripts, including from Pine Script or MQL5.
- **The MCP server** (`https://mcp.takeprofit.com/mcp`) connects clients such as Claude, Codex, Cursor, and VS Code to the Indie compiler, the docs, the built-in and Marketplace indicator search, your private scripts, your alerts, and your watchlists. The assistant can compile and run a script on real market data before handing it over.
- **Alerts through AI:** since v5.16 the AI can create, edit, pause, and delete alerts, including alerts on a private indicator that was never published.

According to the docs, writing Indie code with the platform's AI requires a paid plan or your own API key, and the MCP server runs on your AI application's own subscription. See [TakeProfit AI](https://takeprofit.com/docs/guide/platform/ai-assistant/AI-assistant-overview) and the [MCP setup guide](https://takeprofit.com/docs/guide/platform/ai-assistant/Mcp-server-guide).

Pine Script developers use general-purpose LLMs and third-party tools. Whether those can validate code against TradingView's own compiler depends on the tool; we have not evaluated them here.

### Alerts and automation

Cloud alerts can fire on price and on indicator values, including your own scripts, and can notify through the platform, email, Telegram, and webhooks. Limits depend on the plan: the docs list 1 alert (up to 3 months) for free users and up to 400 non-expiring alerts on All-In, and say webhook notifications are rate limited. See [Alert limitations and delivery](https://takeprofit.com/docs/guide/alerts/Alert-limitations-delivery-history). TradingView also has alerts and webhooks; check its documentation for current limits.

### Trading, brokers, and data

TakeProfit's trading integrations are listed on its [Brokers and exchanges](https://takeprofit.com/docs/guide/trading/brokers) page: at the time of writing, Bybit (crypto spot and derivatives) and Lime Trading (US stocks and ETFs) are live, while Binance and Exness are listed as coming soon. Market data comes from direct exchange feeds for some venues and from an aggregator for others; see [Markets We Cover](https://takeprofit.com/docs/guide/market-data/Market-data-overview). TradingView supports a wider range of brokers; compare the lists for your own markets.

### Marketplace and monetization

Indicators can be published to the TakeProfit Marketplace after moderation, free or at a price chosen by the author, with open or closed source. The docs state an 80% author share on sales to platform users (100% on referred users or for Maxx Rewards members), and a payout threshold of $200 on the cash rewards balance. Rules, review times, and eligibility are in [Sell Your Indicators](https://takeprofit.com/docs/guide/monetization-tools/Sell-your-indicators). TradingView has its own publishing and moderation rules, which differ; check them before deciding.

### Stability and versioning

Indie scripts declare their language version (`# indie:lang_version = 5`). TakeProfit's docs say scripts are upgraded to the latest language version unless a feature was explicitly removed. Built-in indicators change only when a bug is fixed, and you can fork any open-source indicator to keep your own copy. Pine Script versions are also explicit; older versions keep running, and migrating a script to a newer version is a manual job. Neither approach removes the need to test your scripts after platform updates.

## Other Scripting Languages Worth Comparing

If you are evaluating alternatives to Pine Script more broadly, these are the other well-known options. Check each vendor's site for current features and pricing.

| | Indie | Pine Script | NinjaScript | ThinkScript | MQL4 / MQL5 |
| --- | --- | --- | --- | --- | --- |
| Platform | TakeProfit | TradingView | NinjaTrader | thinkorswim (Charles Schwab) | MetaTrader |
| Language base | Python subset | Proprietary | C# | Proprietary | C++-like |
| Typical focus | Multi-asset charting, crypto, US stocks | Multi-asset charting | Futures and forex | Stocks, options, futures | Forex and CFDs |
| Runs where | Platform servers | Platform servers | Local desktop | Platform | Local terminal |
| Needs a broker account | Only for trading | Only for trading | Data and broker setup | Yes | Yes (broker-supplied) |

## Pine Script to Indie: Migration Notes

There is no automatic converter built into the language, and the two do not map line by line. The TakeProfit AI assistant can convert a script for you; the official FAQ recommends converting one indicator at a time and describing what it should do, because a conversion that keeps the intent beats one that keeps the syntax. If you port by hand, this table helps:

| Pine Script | Indie |
| --- | --- |
| `//@version=6` | `# indie:lang_version = 5` |
| `indicator("Title", overlay=true)` | `@indicator('Title', overlay_main_pane=True)` |
| `input.int(14, "Length")` | `@param.int('length', default=14, title='Length')` |
| `ta.sma(close, 20)` | `Sma.new(self.close, 20)[0]` |
| `ta.rsi(close, 14)` | `Rsi.new(self.close, 14)[0]` |
| `close[1]` | `self.close[1]` |
| `ta.crossover(a, b)` | `cross_over(a, b)` from `indie.math` |
| `plot(x)` | return `x` from `Main`, styled with `@plot.line(...)` |
| `plotshape(...)` | `@plot.marker(...)` and `plot.Marker(value)` |
| `request.security(...)` | `@sec_context` function plus `self.calc_on(...)` in `__init__` |
| `strategy.entry("Long", strategy.long)` | `self.trading.place_order(order_side.BUY, size=...).submit()` |
| `strategy.exit(...)` with stop and limit | `take_profit(...)` and `stop_loss(...)` on a limit entry order |
| `var x = 0` | `Var[int].new(init=0)` |
| `array.*` / `map.*` | `list[T]` / `dict[K, V]` |
| `table.new(...)` | `Table`, `TableRow`, `TableCell` from `indie.drawings` |
| `na` | `float('nan')` |

Things to watch for when porting:

- **Series vs. calls.** In Indie you create an algorithm with `.new()` on every bar from `calc()` or `Main`. Do not cache it behind an `if`; it must run each bar to keep its state.
- **Scoping.** Variables declared inside an `if` or loop are not visible after the block. Declare them first with a type annotation.
- **No `None` for plain types.** Use `Optional[T]` and call `.value()` to read it.
- **Alerts.** Pine's `alert()` and `alertcondition()` have no one-to-one form. In TakeProfit, you create alerts in the platform on the indicator's values.
- **Strategy semantics.** Order fills, `calc_on_every_tick`-style behavior, and position sizing differ between platforms. Re-test the ported strategy rather than assuming identical results.
- **Libraries.** Pine libraries do not map directly. Indie has no numpy/pandas; use the standard library packages or `@algorithm` functions.

## Practical Examples: Indie and Pine Side by Side

The Pine Script samples below are written for Pine v6 syntax. We could not compile them in this guide, so treat them as illustrative and test them in TradingView's editor.

### Example 1: Minimal indicator

**Pine Script**

```pinescript
//@version=6
indicator("Simple Close Plot", overlay=true)
plot(close)
```

**Indie**

```python
# indie:lang_version = 5
from indie import indicator

@indicator('Simple Close Plot', overlay_main_pane=True)
def Main(self):
    return self.close[0]
```

### Example 2: RSI with a volume-confirmed marker

The Indie version returns values from `Main` and uses decorators to define how they are shown; Pine calls `plot()` and `plotshape()` inline.

**Indie**

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Rsi, Sma

@indicator('RSI Volume Signal')
@param.int('rsi_len', default=14, min=1, title='RSI Length')
@param.float('vol_mult', default=1.5, min=1.0, title='Volume Multiplier')
@plot.line(color=color.PURPLE)
@plot.marker(color=color.GREEN, style=plot.marker_style.CIRCLE,
             position=plot.marker_position.BELOW)
def Main(self, rsi_len, vol_mult):
    rsi = Rsi.new(self.close, length=rsi_len)
    vol_avg = Sma.new(self.volume, length=20)

    show_marker = rsi[0] < 30 and self.volume[0] > vol_avg[0] * vol_mult

    return rsi[0], plot.Marker(rsi[0] if show_marker else float('nan'))
```

**Pine Script**

```pinescript
//@version=6
indicator("RSI Volume Signal")
rsiLen  = input.int(14, "RSI Length", minval=1)
volMult = input.float(1.5, "Volume Multiplier", minval=1.0)

rsi    = ta.rsi(close, rsiLen)
volAvg = ta.sma(volume, 20)
signal = rsi < 30 and volume > volAvg * volMult

plot(rsi, "RSI", color=color.purple)
plotshape(signal ? rsi : na, "Signal", shape.circle, location.absolute, color.green, size=size.tiny)
```

### Example 3: Moving average crossover strategy

The Indie version is the strategy shown in the strategies section above. The Pine equivalent:

```pinescript
//@version=6
strategy("MA Crossover", overlay=true, initial_capital=50000,
         commission_type=strategy.commission.percent, commission_value=0.1)
fastLen = input.int(10, "Fast SMA", minval=1)
slowLen = input.int(30, "Slow SMA", minval=1)

fast = ta.sma(close, fastLen)
slow = ta.sma(close, slowLen)

if ta.crossover(fast, slow)
    strategy.entry("Long", strategy.long)
if ta.crossunder(fast, slow)
    strategy.entry("Short", strategy.short)
```

### Example 4: Another instrument's RSI on the same chart

**Indie**

```python
# indie:lang_version = 5
from indie import indicator, MainContext, sec_context
from indie.algorithms import Rsi

@sec_context
def BtcRsi(self):
    rsi = Rsi.new(self.close, length=14)
    return rsi[0]

@indicator('BTC RSI Comparison')
class Main(MainContext):
    def __init__(self):
        self._btc = self.calc_on(BtcRsi, exchange='BINANCEUS', ticker='BTC/USD')

    def calc(self):
        local_rsi = Rsi.new(self.close, length=14)
        return local_rsi[0], self._btc[0]
```

The exchange code and ticker format depend on how the instrument is listed on TakeProfit; pick them from the platform's symbol search.

**Pine Script**

```pinescript
//@version=6
indicator("BTC RSI Comparison")
btcRsi = request.security("BINANCE:BTCUSDT", timeframe.period, ta.rsi(close, 14))
plot(ta.rsi(close, 14), "Local RSI")
plot(btcRsi, "BTC RSI", color=color.orange)
```

## Current Limitations of Indie

- **Smaller community.** Fewer public tutorials, forum threads, and shared scripts than Pine Script.
- **Python subset.** No external libraries (numpy, pandas, TA-Lib), no lambdas, nested functions, comprehensions, `try`/`except`, or `set`.
- **Strategies trade one instrument at a time**, and take-profit/stop-loss currently attach only to limit and stop-limit entries.
- **External-data scripts are private.** They cannot be published to the Marketplace.
- **Sandboxed runtime.** No file or network access from code; execution time and memory are limited.
- **Venue coverage.** Trading and data coverage are narrower than a long-established platform's. Check the current lists.

## How to Choose: Five Questions

1. **What do you already know?** Python developers will read Indie quickly. If you know Pine, the concepts transfer, but syntax and some semantics do not.
2. **Where do your markets and brokers live?** Compare data coverage and trading integrations on each platform for the instruments you trade.
3. **Do you need a big community or open built-ins?** Pine has the larger pool of shared scripts. Indie lets you read and fork every open-source built-in.
4. **How much do you want AI in the loop?** If you plan to prototype with an LLM, TakeProfit's MCP server and IDE assistant validate scripts against the real compiler, which cuts down on broken code.
5. **What will it cost for your usage?** Compare plan limits (alerts, indicators per chart, history depth, AI access) on the current pricing pages of each platform, not on third-party summaries.

Neither language locks in your *ideas*. The logic of an indicator usually survives a port; the code does not.

## Frequently Asked Questions

### Is Indie only for indicators?

No. Indie supports strategies (`@strategy`) and backtesting since early 2026, plus tables, dictionaries, external data, and more. See the [changelog](https://takeprofit.com/docs/indie/Changelog).

### Is Indie the same as Python?

No. It is a subset of Python syntax with differences: 32-bit integers, block-level scoping, required type annotations in some cases, no lambdas or nested functions, and no external libraries. Code written in plain Python or Pine will not compile without changes.

### Can I use numpy or pandas in Indie?

No. The runtime is sandboxed and its data types are not compatible with those libraries. Available imports are the `indie` packages and a few standard modules such as `math`, `statistics`, `datetime`, `dataclasses`, and `sortedcontainers`.

### Can I convert Pine Script to Indie?

Yes, with help from TakeProfit's AI assistant (in the AI chat or the IDE) or by rewriting by hand using the table above. Check the result and re-test strategies.

### Does Indie support backtesting?

Yes. The Strategy/Backtesting widget shows P&L, win rate, profit factor, drawdown, Sharpe, Sortino, and Calmar ratios, and a full trade log. Available history depends on your plan.

### Can I build trading bots with Indie?

The Indie docs describe strategies that can run in a live-trading mode against a connected exchange, and cloud alerts can notify through webhooks to external tools. Venue support is limited to what the platform integrates (see the Brokers page). Test carefully; backtests are approximations of live trading, and nothing here is financial advice.

### Can I use my own data in an indicator?

Yes: public HTTPS CSV files and live WebSocket/SSE feeds, with limits described in the docs. Such scripts stay private and cannot be published to the Marketplace.

### Does Indie have an AI assistant?

Yes. There is an AI chat, an assistant inside the IDE, and an MCP server for external AI clients. See the [MCP setup guide](https://takeprofit.com/docs/guide/platform/ai-assistant/Mcp-server-guide).

### Is Indie free to use?

TakeProfit has a free plan, and some features (such as larger limits and Indie AI assistance) depend on the plan. We do not quote prices here because they change; see the platform's current plan information.

### Can I publish and sell indicators?

Yes, through the Marketplace after moderation. Revenue share, payout rules, and eligibility are in the [Sell Your Indicators](https://takeprofit.com/docs/guide/monetization-tools/Sell-your-indicators) guide.

### Can Pine Script run outside TradingView?

No. Pine Script runs only on TradingView; moving to another platform means rewriting the script in that platform's language.

### Which language is easier to learn?

For Python programmers, Indie. For readers without programming experience, both have a learning curve, and Pine has more beginner tutorials from its community.

### What about NinjaScript, ThinkScript, and MQL?

They are the main alternatives on other platforms: NinjaScript (C#) on NinjaTrader, ThinkScript on thinkorswim, and MQL4/5 on MetaTrader. Each is tied to its platform, like Pine and Indie.

## Summary

Indie and Pine Script solve the same problem on different platforms. Indie offers Python-style syntax, open-source built-ins, strategies with backtesting, tables, dictionaries, external data, and AI/MCP tooling on TakeProfit. Pine Script offers a large community, a big library of public scripts, and the established TradingView ecosystem. The right choice depends on the skills you have, the markets and brokers you need, and how much you value community size versus language familiarity. Try both on a small script before committing.
