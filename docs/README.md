# Pine Script to Indie Language Conversion Cheat Sheet

This is a migration reference for Pine Script™ users who want to port indicators and strategies to TakeProfit's Indie™ language. Each section maps a Pine construct to its Indie counterpart, shows a short working example, and says plainly where Indie has no equivalent. It is written for **Indie v5.19** (language directive `# indie:lang_version = 5`).

> [!NOTE]
> Code samples were compiled and, where the sample does not need an external URL, run against the TakeProfit runtime. This is a community page, not official TakeProfit documentation; the official reference is at [takeprofit.com/docs/indie](https://takeprofit.com/docs/indie/Overview).

---

## 1. Script structure and context

Indie source is Python syntax with a stricter compiler and its own runtime. Every name you use must be imported, the entry point is a function or class called `Main`, and the values you `return` from it become the plots.

| **Feature** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| Version | `//@version=5` | `# indie:lang_version = 5` | A comment directive on the first line. It is the only directive. |
| Imports | None; built-ins are global | `from indie import indicator, MainContext, plot, color` | Every Indie name must be imported. Only the packages listed in [section 15](#15-standard-library-available-in-indie) exist. |
| Indicator declaration | `indicator("My Indicator", overlay=true)` | `@indicator('My Indicator', overlay_main_pane=True)` on `Main` | The title is required. Optional: `format=format.PRICE`, `precision=2`. |
| Entry point | The script body runs once per bar | `def Main(self)` or `class Main(MainContext)` with `calc(self)` | Runs for every historical bar and every realtime update. The function form is shorthand for the class form. |
| Strategy declaration | `strategy("My Strategy", overlay=true)` | `@strategy('My Strategy', overlay_main_pane=True)` | Supported since v5.10. See [section 10](#10-strategies). |
| Price series | `open`, `high`, `low`, `close`, `volume` | `self.open`, `self.high`, `self.low`, `self.close`, `self.volume` | Also `self.hl2`, `self.hlc3`, `self.ohlc4`. All are read-only `Series[float]`. |
| History reference | `close[1]` | `self.close[1]` | Index `0` is the current bar. Missing history returns `nan`. |
| Bar index | `bar_index` | `self.bar_index` | `0` is the oldest bar. `self.bar_count` equals `bar_index + 1`. |
| Time | `time` (milliseconds) | `self.time[0]` (UNIX seconds, UTC, `float`) | Not milliseconds and not a `datetime` object. See [section 14](#14-time-sessions-and-symbol-info). |
| Plot output | `plot(x)` | `return x` from `Main` | Returning a tuple draws several plots. See [section 5](#5-plotting). |
| Inputs | `input.int(...)` | `@param.int(...)` plus an argument on `Main` | See [section 3](#3-inputs-parameters). |

The same script in class form, with formatting options and three plots (`plot(close)`, `plot(close[1])`, `plot(bar_index)` in Pine):

```python
# indie:lang_version = 5
from indie import indicator, MainContext, format


@indicator('My Indicator', overlay_main_pane=True, format=format.PRICE, precision=2)
class Main(MainContext):
    def calc(self):
        # Pine: plot(close), plot(close[1]), plot(bar_index)
        return self.close[0], self.close[1], float(self.bar_index)
```

The function form is the shortest valid indicator; it draws one line with default settings:

```python
# indie:lang_version = 5
from indie import indicator

@indicator('Hello', overlay_main_pane=True)
def Main(self):
    return self.close[0]
```

> [!NOTE]
> Use the class form when you need a constructor. `__init__` runs once, and `Context.calc_on` (multi-timeframe and external data, [section 9](#9-multi-timeframe-other-symbols-and-external-data)) must be called from it. Parameters from `@param.*` are passed to `Main` (function form) or to `__init__` and `calc` (class form) by name.

---

## 2. Types, series and state

Pine treats every variable as a series. Indie keeps plain values (`float`, `int`, `bool`, `str`) and series (`Series[T]`, `MutSeries[T]`) apart, and persistent state is explicit.

| **Concept** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| Basic types | `int`, `float`, `bool`, `string` | `int`, `float`, `bool`, `str` | `float` is 64-bit. `int` is a **32-bit signed** integer (about ±2.1 billion). |
| Color type | `color` | `Color` (`from indie import Color`) | See [section 12](#12-colors). |
| Read-only series | Every variable | `Series[T]`, alias `SeriesF` for `Series[float]` | `self.close` is a `SeriesF`. `T` can be `float`, `int`, `bool` or `str`. |
| Persistent series with history | `var float x = 0.0`, then `x[1]` | `x = MutSeriesF.new(init=0.0)`, then `x[0]`, `x[1]` | `init=` is written once, on the first bar. Use `MutSeries[int]` or `MutSeries[bool]` for other types. |
| Persistent scalar | `var int n = 0` | `n = Var[int].new(0)`, then `n.get()` and `n.set(v)` | Holds the current value only, no history. |
| Reassignment | `x := x + 1` | `x[0] += 1` or `x.set(x.get() + 1)` | Writing goes to index `0` of a `MutSeries`. |
| Derived value with history | `y = close - open`, then `y[1]` | `y = MutSeriesF.new(self.close[0] - self.open[0])`, then `y[1]` | A plain `float` has no history. Wrap it to read previous bars or to feed an algorithm such as `Sma.new(y, 10)`. |
| Missing value | `na` | `math.nan` for numbers, `Optional[T]` for "no value" | See [section 13](#13-nan-optional-and-errors). |
| Arrays and maps | `array.*`, `map.*` | `list[T]`, `dict[K, V]` | See [section 8](#8-functions-classes-and-containers). |
| First-bar logic | `if barstate.isfirst` | `if self.bar_index == 0`, or `MutSeriesF.new(init=...)`, or `__init__` | See [section 14](#14-time-sessions-and-symbol-info) for the other `barstate` flags. |

```python
# indie:lang_version = 5
from indie import indicator, MutSeriesF, Var

@indicator('State demo')
def Main(self):
    counter = MutSeriesF.new(init=0.0)
    counter[0] += 1
    highest_seen = Var[float].new(0.0)
    if self.high[0] > highest_seen.get():
        highest_seen.set(self.high[0])
    return counter[0], highest_seen.get(), counter[1]
```

> [!WARNING]
> `MutSeriesF.new(0.0)` is **not** Pine's `var x = 0.0`. The first positional argument (`reset`) is written into `x[0]` on every bar, so the series restarts from that value each time. For "initialise once, then carry forward" use `MutSeriesF.new(init=0.0)`.

Rules that differ from Python and from Pine:

- **Block scope.** A variable first assigned inside `if`, `for` or `while` does not exist after the block. Declare and initialise it before the block (`res = 0`, or `res: int`).
- **Explicit types on helper functions.** Parameters and return values of your own functions need type hints. `Main` and `@sec_context` functions are exempt.
- **No `None` on plain types.** `a: int = None` does not compile; use `Optional[int]`.
- **Where `.new()` is allowed.** `Sma.new(...)`, `MutSeriesF.new(...)` and `Var[T].new(...)` can only be called from `Main`/`calc`, an `@algorithm` or an `@sec_context` function, not from `__init__`, plain helper functions or module level. Call them on every bar; hiding a call behind an `if` freezes the algorithm.
- **Realtime.** On a realtime bar every update triggers a recalculation, and `MutSeries` and `Var` values are rolled back to the previous bar before each one, the same idea as Pine's `var`. The docs describe no equivalent of `varip`.

---

## 3. Inputs (parameters)

Inputs are decorators on `Main`. Each decorator needs a unique `id` (a valid Python identifier) and a `default`, and `Main` must take an argument with the same name.

| **Input** | **Pine Script™** | **Indie** |
|---|---|---|
| Integer | `input.int(14, "Length", minval=1)` | `@param.int('length', default=14, min=1, max=500, step=1, title='Length')` |
| Float | `input.float(1.5, "Factor")` | `@param.float('factor', default=1.5, min=0.1, max=10.0, step=0.1, title='Factor')` |
| Boolean | `input.bool(true, "Filter")` | `@param.bool('use_filter', default=True, title='Filter')` |
| String with options | `input.string("SMA", options=["SMA", "EMA"])` | `@param.str('ma_type', default='SMA', options=['SMA', 'EMA'], title='MA type')` |
| Source | `input.source(close, "Source")` | `@param.source('src', default=source.CLOSE, options=[source.CLOSE, source.HL2], title='Source')` |
| Color | `input.color(color.red)` | `@param.color('line_color', default=color.RED, title='Line color')` |
| Timeframe | `input.timeframe("D")` | `@param.time_frame('tf', default='1D', options=['1h', '4h', '1D'], title='Timeframe')` |

```python
# indie:lang_version = 5
from indie import indicator, param, source, color, plot
from indie.algorithms import Ma


@indicator('Inputs demo', overlay_main_pane=True)
@param.int('length', default=14, min=1, max=500, title='Length')
@param.float('factor', default=1.0, min=0.1, max=10.0, step=0.1, title='Factor')
@param.bool('use_factor', default=True, title='Apply factor')
@param.str('ma_type', default='SMA', options=['SMA', 'EMA', 'WMA'], title='MA type')
@param.source('src', default=source.CLOSE, title='Source')
@param.color('line_color', default=color.BLUE, title='Line color')
@plot.line(title='MA')
def Main(self, length, factor, use_factor, ma_type, src, line_color):
    ma = Ma.new(src, length, ma_type)
    value = ma[0] * factor if use_factor else ma[0]
    return plot.Line(value, color=line_color)
```

Differences to expect when porting:

- **A source input is already a series.** `src` arrives in `Main` as a `SeriesF`. Pass it straight to algorithms (`Ma.new(src, length, ma_type)`); there is no string lookup and `getattr` is not available. `source.*` values are `OPEN`, `HIGH`, `LOW`, `CLOSE`, `VOLUME`, `HL2`, `HLC3`, `OHLC4`.
- **`title=` is the only UI text.** `@param.*` has no `tooltip`, `group`, `inline` or `confirm` arguments. Fold hints and group names into `title`.
- **`min`, `max` and `step`** exist for `int` and `float` only.
- **No `input.time`, `input.symbol` or `input.price`.** For a date use `@param.str` and parse it with `datetime.strptime`.
- **A timeframe input is already a `TimeFrame`.** Pass it directly to `calc_on(time_frame=tf)`. Its `default` must appear in `options`.

---

## 4. Built-in functions and indicators

Pine's `ta.*` functions are classes in `indie.algorithms`, created with `.new(...)`. Each returns a series (or a tuple of series), and you read the current value with `[0]`.

```python
# indie:lang_version = 5
from math import nan
from indie import indicator, plot, color
from indie.algorithms import Sma, Ema, Bb, Macd, Highest, Atr, Rsi
from indie.math import cross_over, cross_under


@indicator('Built-ins demo', overlay_main_pane=True)
@plot.line(title='SMA 20')
@plot.line(title='EMA 50')
@plot.line(title='BB lower')
@plot.line(title='BB middle')
@plot.line(title='BB upper')
@plot.marker(title='Cross up', color=color.GREEN, position=plot.marker_position.BELOW)
@plot.marker(title='Cross down', color=color.RED, position=plot.marker_position.ABOVE)
def Main(self):
    sma = Sma.new(self.close, 20)
    ema = Ema.new(self.close, 50)
    lower, middle, upper = Bb.new(self.close, 20, 2.0)
    macd_line, signal_line, hist = Macd.new(self.close, 12, 26, 9)
    highest = Highest.new(self.high, 10)
    atr = Atr.new(14)
    rsi = Rsi.new(self.close, 14)

    up = cross_over(sma, ema)
    down = cross_under(sma, ema)
    up_marker = self.low[0] if up else nan
    down_marker = self.high[0] if down else nan
    return sma[0], ema[0], lower[0], middle[0], upper[0], plot.Marker(up_marker), plot.Marker(down_marker)
```

| **Pine Script™** | **Indie** | **Notes** |
|---|---|---|
| `ta.sma(close, 20)` | `Sma.new(self.close, 20)` | Same for `Ema`, `Rma`, `Wma`. |
| `ta.vwma(close, 20)` | `Vwma.new(self.close, 20)` | Takes `(src, length)`. Volume comes from the chart, so there is no volume argument. |
| `ta.rsi(close, 14)` | `Rsi.new(self.close, 14)` | |
| `ta.macd(close, 12, 26, 9)` | `macd_line, signal_line, hist = Macd.new(self.close, 12, 26, 9)` | Returns a tuple. Optional `ma_source`, `ma_signal` accept `'EMA'` or `'SMA'`. |
| `ta.bb(close, 20, 2)` | `lower, middle, upper = Bb.new(self.close, 20, 2.0)` | **Order is lower, middle, upper**, not Pine's basis, upper, lower. |
| `ta.stdev(close, 20)` | `StdDev.new(self.close, 20)` | There is no `Variance` class. |
| `ta.dev(close, 20)` | `Dev.new(self.close, 20)` | Mean absolute deviation. |
| `ta.tr`, `ta.atr(14)` | `Tr.new()`, `Atr.new(14)` | `Atr` takes `length` and an optional `ma_algorithm` (default `'RMA'`); there is no `src`. |
| `ta.highest(high, 10)`, `ta.lowest(low, 10)` | `Highest.new(self.high, 10)`, `Lowest.new(self.low, 10)` | |
| `ta.highestbars`, `ta.lowestbars` | `SinceHighest.new(src, length)`, `SinceLowest.new(src, length)` | Return `Series[int]`, the number of bars since the extreme. |
| `ta.crossover(a, b)` | `cross_over(a, b)` | `from indie.math import cross_over, cross_under, cross`. Takes two series or a series and a constant level. |
| `ta.crossunder(a, b)` | `cross_under(a, b)` | |
| `ta.cross(a, b)` | `cross(a, b)` | |
| `ta.change(src, n)`, `ta.mom` | `Change.new(src, n)` | Difference from `n` bars ago. |
| `ta.roc(src, n)` | `Roc.new(src, n)` | |
| `ta.cum(src)` | `CumSum.new(src)` | |
| `ta.sum(src, n)` | `Sum.new(src, n)` | |
| `ta.median(src, n)` | `Median.new(src, n)` | |
| `ta.correlation(a, b, n)` | `Corr.new(a, b, n)` | |
| `ta.linreg(src, n, off)` | `LinReg.new(src, n, off)` | |
| `ta.percentrank(src, n)` | `PercentRank.new(src, n)` | |
| `ta.percentile_*` | `Percentile.new(src, n, pct, interpolate)` | `pct` is 0 to 100. `interpolate=True` is linear interpolation, `False` is nearest rank. |
| `ta.pivothigh`, `ta.pivotlow` | `ph, pl = PivotHighLow.new(src, left, right)` | One source for both pivots. Non-pivot bars are `nan`. |
| `ta.barssince(cond)` | `SinceTrue.new(cond_series)` | Needs a `Series[bool]`; wrap a plain `bool` with `MutSeries[bool].new(...)`. |
| `ta.stoch(src, high, low, n)` | `Stoch.new(src, low, high, n)` | **Argument order is `low`, then `high`.** |
| `ta.supertrend(f, n)` | `value, direction = Supertrend.new(f, n, 'RMA')` | `ma_algorithm` is required. |
| `ta.vwap` | `main, upper, lower = Vwap.new(src, 'day', mult)` | `anchor` is `'day'`, `'week'`, `'month'` or `'year'`. |
| `ta.dmi` | `minus_di, adx, plus_di = Adx.new(adx_len, di_len)` | Note the order. |
| `ta.sar` | `Sar.new(start, increment, maximum)` | |
| `ta.cci`, `ta.mfi`, `ta.tsi`, `ta.uo` | `Cci`, `Mfi`, `Tsi`, `Uo` | See the [appendix](#17-appendix-indiealgorithms-reference) for signatures. |
| `ta.ema`/`ta.sma` selected by a string | `Ma.new(src, n, 'WMA')` | `algorithm` is one of `'EMA'`, `'SMA'`, `'RMA'`, `'WMA'`, `'VWMA'`, `'SMMA (RMA)'`. |
| `nz(x)` on a series | `NanToZero.new(src)` | See [section 13](#13-nan-optional-and-errors). |
| `fixnan(x)` | `FixNan.new(src)` | |
| `ta.hma`, `ta.alma`, `ta.swma`, `ta.kc`, `ta.wpr`, `ta.rising`, `ta.falling`, `ta.valuewhen` | No built-in class | Compose from the algorithms above, or from `Var` and loops. |

> [!IMPORTANT]
> Several tuple results are easy to mix up because a wrong order compiles and silently gives wrong data: `Bb` is (lower, middle, upper), `Macd` is (macd, signal, histogram), `Adx` is (minus DI, ADX, plus DI), `Vwap` is (main, upper, lower). The prose in the library reference for `Bb` lists the bands in a different order than the code returns; the order above is what the runtime produces.

A Pine function that calls `ta.*` inside has to become an `@algorithm` in Indie, because `.new()` cannot be called from a plain helper. The next sample shows a custom algorithm and a typical `ta.pivothigh` plus `ta.barssince` pair.

```python
# indie:lang_version = 5
from indie import indicator, algorithm, MainContext, SeriesF, MutSeriesF
from indie.algorithms import Sma


# Pine: smoothed(src, len) => (src + ta.sma(src, len)) / 2
@algorithm
def Smoothed(self, src: SeriesF, length: int) -> SeriesF:
    avg = Sma.new(src, length)
    return MutSeriesF.new((src[0] + avg[0]) / 2)


@indicator('Custom algorithm', overlay_main_pane=True)
class Main(MainContext):
    def calc(self):
        s = Smoothed.new(self.close, 10)
        return s[0], s[1]
```

```python
# indie:lang_version = 5
from math import isnan
from indie import indicator, plot, MutSeries
from indie.algorithms import PivotHighLow, SinceTrue


@indicator('Bars since pivot high', overlay_main_pane=False)
@plot.histogram(title='Bars since pivot high')
def Main(self):
    # Pine: ta.pivothigh(close, 5, 5)
    pivot_high, pivot_low = PivotHighLow.new(self.close, 5, 5)

    # Pine: ta.barssince(not na(pivot_high))
    has_pivot_high = MutSeries[bool].new(not isnan(pivot_high[0]))
    bars_since = SinceTrue.new(has_pivot_high)
    return float(bars_since[0])
```

The platform also ships dozens of built-in indicators written in Indie; their source is in the [built-in indicators examples](https://takeprofit.com/docs/indie/Code-examples/built-in-indicators).

---

## 5. Plotting

Plots in Indie are values returned from `Main`. A `@plot.*` decorator describes each one (color, width, title), and the decorators and the returned values are matched **in order**.

| **Feature** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| Line | `plot(x)` | `@plot.line(...)` and `return x` | The decorator is optional for lines with default settings. |
| Several plots | `plot(x)`, `plot(y)` | `return x, y` | One returned value per `@plot.*` decorator, in the same order. |
| Width, style, color | `linewidth`, `style`, `color` | `line_width=`, `line_style=`, `color=` | `line_style` is `line_style.SOLID`, `DASHED` or `DOTTED`. |
| Gaps at `na` | `plot(..., style=plot.style_linebr)` | `@plot.line(continuous=True)` | `continuous=True` connects across `nan` values. |
| Per-bar color | `color = cond ? a : b` | `return plot.Line(x, color=a if cond else b)` | Colors are `Color` objects, not strings ([section 12](#12-colors)). |
| Histogram, columns, steps | `style_histogram`, `style_columns`, `style_stepline` | `@plot.histogram`, `@plot.columns`, `@plot.steps` | Return `plot.Histogram(v)`, `plot.Columns(v)`, `plot.Steps(v)` for per-bar color. |
| Horizontal line | `hline(50)` | `@level(50, title='Mid')` | Static, drawn with no return value. |
| Horizontal band | `hline` ×2 plus `fill` | `@band(30, 70)` | Static. |
| Fill between plots | `fill(p1, p2, color)` | `@plot.fill('id1', 'id2')` and `plot.Fill(color=...)` | Give the lines `id=`. The fill takes a slot in the returned tuple. |
| Background color | `bgcolor(...)` | `@plot.background(...)` and `plot.Background(color=...)` | Use `color.TRANSPARENT` for "no color". Optional `outline_left`, `outline_right`. |
| Bar color | `barcolor(...)` | `@plot.bar_color()` and `plot.BarColor(color)` | `plot.BarColor(None)` keeps the default candle color. |
| Candles | `plotcandle(o, h, l, c)` | `@plot.candles(...)` and `plot.Candles(o, h, l, c)` | Added in v5.19. Draws an independent OHLC series. A `nan` in any value skips the candle. |
| Shapes and chars | `plotshape`, `plotchar` | `@plot.marker(...)` and `plot.Marker(value, color, text)` | Styles `NONE`, `CIRCLE`, `LABEL`, `CROSS`. No triangles or arrows. |
| Marker placement | `location.abovebar` | `position=plot.marker_position.ABOVE` | Also `BELOW`, `LEFT`, `RIGHT`, `CENTER`. The marker sits at `value`, so pass `self.high[0]` or `self.low[0]`. |
| Hide a point | `na` | `nan` (markers) or `None` (bar color) | A `nan` marker value draws nothing. |
| Shift | `offset=` | `offset=` on the plot object | E.g. `plot.Steps(v, offset=-4)`. |
| Where values show | `display=` | `display_options=plot.LineDisplayOptions(pane=..., status_line=..., price_label=...)` | Each plot type has its own `...DisplayOptions` class. |

```python
# indie:lang_version = 5
from math import nan
from indie import indicator, plot, color, level, band
from indie.algorithms import Ema, Rsi


@indicator('Plot map', overlay_main_pane=False)
@level(50, title='Midline')
@band(30, 70, title='Neutral zone')
@plot.line(id='rsi', title='RSI', color=color.AQUA, line_width=2)
@plot.line(id='rsi_ma', title='RSI EMA', color=color.ORANGE)
@plot.fill('rsi', 'rsi_ma', title='RSI vs EMA')
@plot.bar_color(title='Bar color')
@plot.background(title='Overbought background')
@plot.marker(title='Oversold marker', style=plot.marker_style.LABEL, position=plot.marker_position.BELOW)
def Main(self):
    rsi = Rsi.new(self.close, 14)
    rsi_ma = Ema.new(rsi, 9)

    fill_color = color.GREEN(0.2) if rsi[0] > rsi_ma[0] else color.RED(0.2)
    bar_color = color.YELLOW if rsi[0] > 70 else None
    background = color.RED(0.1) if rsi[0] > 70 else color.TRANSPARENT
    marker_value = rsi[0] if rsi[0] < 30 else nan

    return (
        rsi[0],
        rsi_ma[0],
        plot.Fill(color=fill_color),
        plot.BarColor(bar_color),
        plot.Background(color=background),
        plot.Marker(marker_value, text='OS'),
    )
```

Per-bar line color, a histogram and the candles plot:

```python
# indie:lang_version = 5
from indie import indicator, plot, color


@indicator('Dynamic colors and candles', overlay_main_pane=True)
@plot.line(title='Close', line_width=2, continuous=True)
@plot.histogram(title='Body size', base_value=0.0)
@plot.candles(title='Candles', up_color=color.GREEN, down_color=color.RED)
def Main(self):
    line_color = color.GREEN if self.close[0] > self.open[0] else color.RED
    body = self.close[0] - self.open[0]
    hist_color = color.rgba(30, 144, 255, 0.5)
    return (
        plot.Line(self.close[0], color=line_color),
        plot.Histogram(body, color=hist_color),
        plot.Candles(self.open[0], self.high[0], self.low[0], self.close[0]),
    )
```

> [!NOTE]
> `@level` and `@band` need no return value. Every `@plot.*` decorator, including `@plot.fill`, does: the tuple length must equal the number of `@plot.*` decorators. Plots (series) can be used in alerts; drawings, levels and bands cannot.

---

## 6. Drawings: labels, lines, boxes, tables

Series plots cannot be erased or placed outside the bar grid. For that Indie has a separate drawing API: create objects, call `self.chart.draw(obj)`, change their fields and `draw` again, and `self.chart.erase(obj)` to remove them. `self.chart` exists only in `MainContext`.

| **Pine Script™** | **Indie** | **Notes** |
|---|---|---|
| `label.new(x, y, text)` | `LabelAbs(text, AbsolutePosition(time, price))` | `LabelRel(text, RelativePosition(...))` pins a label to the screen instead of the chart. |
| `line.new(x1, y1, x2, y2)` | `LineSegment(AbsolutePosition(...), AbsolutePosition(...), color=...)` | Segments, rays and arrow or circle ends. |
| `box.new(left, top, right, bottom)` | `Rectangle(AbsolutePosition(...), AbsolutePosition(...), line_color=..., bg_color=...)` | Added in v5.13. |
| (no Pine equivalent) | `Circle`, `Triangle`, `Channel` | Added in v5.13. |
| `table.new`, `table.cell` | `Table`, `TableRow`, `TableCell` | Added in v5.17. Cell values are strings. Fixed to the screen via `RelativePosition`. |
| `label.set_*`, `line.set_*` | Assign to the object's fields, then `self.chart.draw(obj)` again | |
| `label.delete(l)` | `self.chart.erase(obj)` | |
| `chart.point(index, time, price)` | `AbsolutePosition(self.time[i], price)` | The time coordinate is a timestamp in seconds. Read it from `self.time[i]`. |

```python
# indie:lang_version = 5
from math import isnan
from indie import indicator, MainContext, color
from indie.algorithms import Highest, Lowest
from indie.drawings import (
    LabelAbs, LineSegment, Rectangle, Table, TableRow, TableCell,
    AbsolutePosition, RelativePosition, vertical_anchor as va, horizontal_anchor as ha,
)


@indicator('Drawings map', overlay_main_pane=True)
class Main(MainContext):
    def __init__(self):
        self._table = Table(position=RelativePosition(va.TOP, ha.RIGHT, 0.05, 0.95))

    def calc(self):
        hi = Highest.new(self.high, 20)
        lo = Lowest.new(self.low, 20)

        if self.bar_index % 50 == 0 and not isnan(self.time[20]):
            # Pine: label.new(bar_index, high, text="...")
            self.chart.draw(LabelAbs('H=' + str(self.high[0]), AbsolutePosition(self.time[0], self.high[0])))
            # Pine: line.new(x1, y1, x2, y2)
            self.chart.draw(LineSegment(
                AbsolutePosition(self.time[20], self.close[20]),
                AbsolutePosition(self.time[0], self.close[0]),
                color=color.BLUE,
            ))
            # Pine: box.new(left, top, right, bottom)
            self.chart.draw(Rectangle(
                AbsolutePosition(self.time[20], hi[0]),
                AbsolutePosition(self.time[0], lo[0]),
                line_color=color.PURPLE,
                bg_color=color.PURPLE(0.1),
            ))

        if self.is_last_bar:
            # Pine: table.new / table.cell
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

> [!TIP]
> Create a `Table` once in `__init__`, refill it only on `self.is_last_bar`, and call `self.chart.draw` once after the changes. A table holds at most 50 rows and 20 columns, cells cannot be merged, and there is no separate header row (style the first row yourself). Pine arrays of drawings map to a bounded `list[LineSegment]` that you mutate in place.

---

## 7. Control flow

| **Feature** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| `if` / `else if` / `else` | `if c` ... `else if c` ... `else` | `if c:` ... `elif c:` ... `else:` | Python syntax: colon and indentation. |
| Conditional expression | `x = c ? a : b` | `x = a if c else b` | |
| `for` loop | `for i = 0 to 9` | `for i in range(10):` | Pine's upper bound is inclusive, `range` excludes it. |
| Reverse loop | `for i = 9 to 0` | `for i in range(9, -1, -1):` | |
| `while` | `while cond` | `while cond:` | Supported. |
| `break`, `continue` | `break`, `continue` | `break`, `continue` | Both supported. |
| `switch` | `switch x` | `if` / `elif` chain | `match` statements are rejected by the compiler. |
| Logic operators | `and`, `or`, `not` | `and`, `or`, `not` | |
| Chained comparison | `a < b < c` is not valid | `a < b and b < c` | Python's `a < b < c` does not compile in Indie. |
| Variable scope | Block-local | Block-local | Declare before the block. See [section 2](#2-types-series-and-state). |

```python
# indie:lang_version = 5
from indie import indicator


@indicator('Control flow')
def Main(self):
    total = 0.0
    for i in range(10):
        if i == 3:
            continue
        total += self.close[i]

    j = 0
    while j < 5 and self.close[j] > 0:
        j += 1

    label = 0
    if self.close[0] > self.open[0]:
        label = 1
    elif self.close[0] < self.open[0]:
        label = -1
    else:
        label = 0

    side = 'up' if label > 0 else 'down'
    return total / 9.0, float(j), float(label), float(len(side))
```

---

## 8. Functions, classes and containers

| **Feature** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| Function | `f(x) => x + 1` | `def f(x: float) -> float:` | Type hints are required on parameters and return values. |
| Default arguments | `f(x, k = 2) => x * k` | `def f(x: float, k: float = 2.0) -> float:` | |
| Several results | `[a, b] = f(x)` | `a, b = f(x)` | Tuple unpacking works from a function call. |
| Multi-line bodies | Allowed | Allowed | Full Python blocks. |
| Nested function, `lambda` | Not allowed | Not allowed | Declare every function at module level or as a method. |
| Function that keeps series state | Any function | `@algorithm` function, called as `Name.new(...)` | Needed whenever the body calls `Sma.new`, `MutSeriesF.new` or `Var.new`. |
| Arrays | `array<float>` | `list[float]` | `append`, `pop`, `insert`, `remove`, `extend`, `clear`, `copy`, `index`, `count`, `reverse`, slices, `len`. |
| Maps | `map<string, int>` | `dict[str, int]` | Added in v5.18. Keys: `str`, `int`, `bool`, finite `float`. `get`, `keys()`, `values()`, `len`, `del d[k]`. |
| Matrices, sets | `matrix<float>` | Not available | Nested lists work. `set`, `queue`, `deque` are not implemented. |
| Sorted collection | (arrays + sort) | `from sortedcontainers import SortedList` | Added in v5.8. |
| User-defined type | `type Pivot` with fields | A plain class with typed `__init__` | Keep instances in a `list[Pivot]`. No decorators on the class. |
| Libraries | `import user/lib/1` | Not available | One file per indicator. You cannot import other scripts. |

```python
# indie:lang_version = 5
from indie import indicator, MainContext


def band_edges(mid: float, width: float = 2.0) -> tuple[float, float]:
    return mid - width, mid + width


class Pivot:
    def __init__(self, price: float, bar: int):
        self.price = price
        self.bar = bar


@indicator('Functions and containers', overlay_main_pane=True)
class Main(MainContext):
    def __init__(self):
        self._pivots: list[Pivot] = []
        self._counts: dict[str, int] = {}

    def calc(self):
        low_edge, high_edge = band_edges(self.close[0], 1.5)

        if self.high[1] > self.high[0] and self.high[1] > self.high[2]:
            self._pivots.append(Pivot(self.high[1], self.bar_index - 1))
            if len(self._pivots) > 50:
                del self._pivots[0]
            key = 'up' if self.close[0] > self.open[0] else 'down'
            self._counts[key] = self._counts.get(key, 0) + 1

        last = self._pivots[-1].price if len(self._pivots) > 0 else self.close[0]
        return low_edge, high_edge, last, float(len(self._counts))
```

Python features the compiler rejects: `try`/`except`, `with`, `lambda`, `global`/`nonlocal`, comprehensions and generator expressions, `match`, the walrus operator, `assert` (raise `IndieError` instead), `%` string formatting, nested functions and functions passed as arguments (except to `calc_on`). Unpacking a tuple stored in a variable (`a, b = some_tuple`) is rejected; unpack directly from a call. f-strings work only as `{expr}` and `{expr:.Nf}`. Containers stored as indicator state may hold tuples of two items only.

---

## 9. Multi-timeframe, other symbols and external data

### `request.security` becomes `@sec_context` plus `calc_on`

Put the expression you would pass to `request.security` into a `@sec_context` function, then request it with `self.calc_on(...)` **in `__init__`**. The result is a series merged into the chart's timeline.

| **Feature** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| Other timeframe | `request.security(syminfo.tickerid, "D", close)` | `self.calc_on(Fn, time_frame=TimeFrame.from_str('1D'))` | `Fn` is a function decorated with `@sec_context`. |
| Other symbol | `request.security("BINANCE:BTCUSD", ...)` | `self.calc_on(Fn, exchange='BINANCEUS', ticker='BTC/USD', ...)` | Exchange and ticker are separate arguments. Omitted ones default to the chart's. |
| Several values | `[a, b] = request.security(..., [h, l])` | `a, b = self.calc_on(Fn, ...)` | The function returns a tuple. |
| Past values | `request.security(...)[1]` | `result[1]` | The result is a `SeriesF`. |
| Expression with `ta.*` | `request.security(..., ta.ema(close, 20))` | `return Ema.new(self.close, 20)[0]` inside `Fn` | Algorithms are created inside the secondary context. |
| Lookahead | `lookahead=barmerge.lookahead_on` | `lookahead=True` | Default is `False`. `True` can leak future data into history. |
| Timeframe strings | `"D"`, `"60"`, `"W"` | `'1D'`, `'1h'`, `'1W'`, `'1M'`, `'3m'` | Format is `<number><unit>` with `m`, `h`, `D`, `W`, `M`, `Y`. A bare `'60'` is invalid. |
| Chart timeframe | `timeframe.period` | `self.time_frame` | A `TimeFrame`; compare with `<`, `<=`, `==`. |
| Read Main's inputs | Closure | `@param_ref('id')` on the `@sec_context` function | |

```python
# indie:lang_version = 5
from indie import indicator, MainContext, sec_context, param, TimeFrame
from indie.algorithms import Ema


@sec_context
def HtfData(self):
    return self.close[0], self.high[0], self.low[0], Ema.new(self.close, 20)[0]


@sec_context
def OtherSymbolClose(self):
    return self.close[0]


@indicator('Multi-timeframe demo', overlay_main_pane=True)
@param.time_frame('htf', default='1D', options=['1h', '4h', '1D', '1W'], title='Higher timeframe')
class Main(MainContext):
    def __init__(self, htf):
        self._htf_close, self._htf_high, self._htf_low, self._htf_ema = self.calc_on(HtfData, time_frame=htf)
        self._other = self.calc_on(OtherSymbolClose, exchange='BINANCEUS', ticker='BTC/USD', time_frame=htf)

    def calc(self):
        return self._htf_close[0], self._htf_high[0], self._htf_low[0], self._htf_ema[1], self._other[0]
```

Since v5.14 `calc_on` also accepts a timeframe **lower** than the chart's, so signals can be computed on a faster series while you watch a slower chart:

```python
# indie:lang_version = 5
from indie import indicator, MainContext, sec_context, TimeFrame


@sec_context
def MinuteBar(self):
    return self.close[0], self.volume[0]


@indicator('Lower timeframe demo')
class Main(MainContext):
    def __init__(self):
        self._min_close, self._min_volume = self.calc_on(MinuteBar, time_frame=TimeFrame.from_str('1m'))

    def calc(self):
        return self._min_close[0], self._min_volume[0]
```

> [!NOTE]
> The library reference entry for `Context.calc_on` still says only higher or equal timeframes are allowed; the changelog entry for v5.14 and the runtime say otherwise, and the sample above ran without error. Secondary instruments (including external sources) count toward one shared limit per indicator.

### External data (new since v5.18)

Pine has no equivalent of the following. An indicator can read your own data from a public HTTPS CSV file (a frozen snapshot, fetched once when the indicator is created) or from a live WebSocket or SSE feed (v5.19):

- candle CSV: a `@sec_context` function attached with `calc_on(..., source=sources.Csv(url))`;
- typed rows: a `@dataclass` row type read through a `@data_context` callback or `request_series[T](source=...)`;
- live feed: `sources.DataFeed('wss://...', stale_after=timedelta(seconds=30))` in place of `sources.Csv`.

```python
# indie:lang_version = 5
from dataclasses import dataclass
from indie import indicator, MainContext, request_series
from indie.data import sources


@dataclass
class RiskFactor:
    value: float


@indicator('External CSV demo')
class Main(MainContext):
    def __init__(self):
        self._risk = request_series[RiskFactor](
            source=sources.Csv('https://example.com/risk.csv'))

    def calc(self):
        row = self._risk.get(0, RiskFactor(1.0))
        return self.close[0] * row.value
```

Use `.get(0, default)` while history is warming up; `[0]` raises before the first row arrives. Indicators that use external data **cannot be published to the Marketplace**. Format rules, limits and the feed protocol are in the official [External data](https://takeprofit.com/docs/indie/External-data/External-data-overview) pages. The platform's own TPO and volume-footprint profiles are read through the same `request_series` mechanism.

---

## 10. Strategies

Strategies exist in Indie since v5.10, with backtesting since v5.11. A strategy is declared with `@strategy`, its `self` is a `MainStrategyContext`, and orders go through `self.trading`. The current limit: a strategy trades **only the chart instrument** (other instruments can be requested with `calc_on` for analysis).

| **Pine Script™** | **Indie** | **Notes** |
|---|---|---|
| `strategy("S", overlay=true, initial_capital=100000)` | `@strategy('S', overlay_main_pane=True, initial_capital=100000.0)` | Also `commission`, `leverage`, `intrabar_order_filter`, `market_order_price`, `risk_free_rate`. |
| `commission_type`, `commission_value` | `commission=Commission(0.0008, commission_type.PERCENT)` | Percent is a **fraction**: Pine's 0.08 % is `0.0008`. |
| `process_orders_on_close=true` | `intrabar_order_filter=intrabar_order_filter.ON_BAR_CLOSE` | `ON_BAR_CLOSE` is the default. |
| `strategy.entry("L", strategy.long, qty)` | `self.trading.place_order(order_side.BUY, size=qty).submit()` | A market order. Pine's `entry` reverses an opposite position by itself; in Indie make the size `qty + abs(position)`. |
| Limit or stop entry | `.limit(price=...)`, `.stop(price=...)` on the builder | Both together make a stop-limit order. |
| `strategy.exit(..., limit=, stop=)` | `.take_profit(stop=..., limit=...)`, `.stop_loss(stop=...)` on the entry order | Supported on **limit and stop-limit** entries, not on market orders. |
| `strategy.close`, `strategy.close_all` | An opposite market order of size `position.size` | There is no close method. |
| `strategy.cancel` | `self.trading.cancel_order(order.id)` | Or `order.cancel()`. |
| Modify an order | `self.trading.amend_order(order.id)....submit()` | |
| `strategy.position_size` | `self.trading.position.size` | Signed: positive long, negative short. |
| `strategy.position_avg_price` | `self.trading.position.price` | |
| `strategy.initial_capital`, cash | `self.trading.cash` | |
| `default_qty_type`, `pyramiding`, margin settings | No decorator arguments | Size every order yourself. |

```python
# indie:lang_version = 5
from indie import strategy, param
from indie.algorithms import Sma
from indie.math import cross_over, cross_under
from indie.strategies import order_side


@strategy('MA Cross Strategy', overlay_main_pane=True, initial_capital=100000.0)
@param.int('fast_len', default=10, min=1, title='Fast length')
@param.int('slow_len', default=30, min=1, title='Slow length')
@param.float('order_size', default=1.0, min=0.01, title='Order size')
def Main(self, fast_len, slow_len, order_size):
    fast = Sma.new(self.close, fast_len)
    slow = Sma.new(self.close, slow_len)
    pos_size = self.trading.position.size

    # Pine: strategy.entry("Long", strategy.long)
    # A market order that is larger than the open short position reverses it.
    if cross_over(fast, slow) and pos_size <= 0:
        self.trading.place_order(order_side.BUY, size=order_size + abs(pos_size)).submit()
    elif cross_under(fast, slow) and pos_size >= 0:
        self.trading.place_order(order_side.SELL, size=order_size + abs(pos_size)).submit()
```

A limit entry with take-profit and stop-loss, and a flatten step, in class form so the order can be remembered:

```python
# indie:lang_version = 5
from indie import strategy, MainStrategyContext, Optional
from indie.algorithms import Rsi
from indie.strategies import order_side, Order


@strategy('RSI Bracket Strategy', overlay_main_pane=True)
class Main(MainStrategyContext):
    def __init__(self):
        self._entry: Optional[Order] = None

    def calc(self):
        rsi = Rsi.new(self.close, 14)
        pos_size = self.trading.position.size

        if pos_size == 0 and self._entry is None and rsi[0] < 30:
            # Pine: strategy.entry("Long", strategy.long, limit=...) + strategy.exit(..., stop=..., limit=...)
            self._entry = (
                self.trading.place_order(order_side.BUY, size=1.0).
                limit(price=self.close[0]).
                take_profit(stop=self.close[0] * 1.03).
                stop_loss(stop=self.close[0] * 0.98).
                submit()
            )

        if pos_size > 0 and rsi[0] > 70:
            # Pine: strategy.close_all(): submit an opposite market order for the whole position
            self.trading.place_order(order_side.SELL, size=pos_size).submit()
            self._entry = None
```

> [!WARNING]
> Check the unit of every number you port. The commission fraction above is the usual silent error (`0.08` instead of `0.0008` is 8 % per trade). Also note that `take_profit` and `stop_loss` are position-level orders: one of each can be active, and they are cancelled when the position closes or reverses. Details are in the official [Strategies](https://takeprofit.com/docs/indie/Strategies/Strategies-overview) and [Orders](https://takeprofit.com/docs/indie/Strategies/Orders) pages. Nine ready-made strategies are listed in the [built-in strategies examples](https://takeprofit.com/docs/indie/Code-examples/built-in-strategies).

---

## 11. Alerts

Indie has no `alert()` or `alertcondition()` call inside the script. The pattern is:

1. Compute the signal and return it as a **plot** (a line, a column series, or a marker).
2. Create the alert in the platform on that plot of the indicator.

Alert messages can reference any plot of the indicator, not only the series in the condition (v5.16). Drawings, levels and bands are not available to alerts.

| **Pine Script™** | **Indie** |
|---|---|
| `alertcondition(cond, "Bullish", "msg")` | Return `1.0 if cond else 0.0` (or a marker value) as a plot, then add a platform alert on it. |
| `alert("msg")` inside a script | Not available. |
| Webhook configuration in the script | Configured on the platform alert, not in code. |

---

## 12. Colors

Colors are `Color` objects. **Plain strings such as `'red'` do not compile** (`color` arguments accept `Color` only).

| **Feature** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| Named color | `color.red` | `color.RED` | Constants: `AQUA`, `BLACK`, `BLUE`, `BROWN`, `FUCHSIA`, `GRAY`, `GREEN`, `LIME`, `MAROON`, `NAVY`, `OLIVE`, `ORANGE`, `PINK`, `PURPLE`, `RED`, `SILVER`, `TEAL`, `TRANSPARENT`, `WHITE`, `YELLOW`. |
| RGB color | `color.rgb(255, 0, 0)` | `color.rgba(255, 0, 0)` | `alpha` defaults to `1.0`. |
| Hex color | `#FF0000` | `color.hex('#FF0000')` | Exactly `#RRGGBB`. Short or 8-digit forms fail at runtime. |
| Transparency | `color.new(color.red, 80)` | `color.RED(0.2)` | Indie takes **opacity** (0.0 to 1.0), Pine takes transparency (0 to 100). Pine's 80 is Indie's 0.2. |
| RGBA | `color.rgb(r, g, b, 80)` | `color.rgba(255, 0, 0, 0.2)` | |
| No color | `na` | `color.TRANSPARENT` or `None` | `None` needs an `Optional[Color]` variable. |
| Color input | `input.color(...)` | `@param.color('id', default=...)` | v5.9. The default can be a constant or `color.hex(...)`. |
| Gradient, `color.r()` and similar | `color.from_gradient`, `color.r` | Not available | |

```python
# indie:lang_version = 5
from indie import indicator, plot, color


@indicator('Colors', overlay_main_pane=True)
@plot.line(title='Named constant', color=color.TEAL)
@plot.line(title='Hex', color=color.hex('#1E90FF'))
@plot.line(title='RGBA', color=color.rgba(255, 140, 0, 0.5))
@plot.line(title='Named with opacity', color=color.RED(0.3))
def Main(self):
    return self.close[0], self.open[0], self.high[0], self.low[0]
```

---

## 13. NaN, Optional and errors

| **Feature** | **Pine Script™** | **Indie** | **Notes** |
|---|---|---|---|
| Not-a-number | `na` | `math.nan` | `from math import nan, isnan`. |
| Test | `na(x)` | `isnan(x)` | |
| Replace in a series | `nz(x)` | `NanToZero.new(src)` | Or `0.0 if isnan(x[0]) else x[0]` for one value. |
| Carry last value | `fixnan(x)` | `FixNan.new(src)` | |
| Missing history | `na` | `nan` (`Series.get(offset, default)` for a custom default) | |
| Safe division | `a / (b == 0 ? na : b)` | `divide(a, b)` or `divide(a, b, default)` | `from indie.math import divide`. Default result is `nan`. |
| "No value" for non-numbers | `na` | `Optional[T]` | Test with `is None`; read with `.value()` or `.value_or(default)`. |
| Raise an error | `runtime.error("msg")` | `raise IndieError('msg')` | Stops the indicator. |
| Catch an error | Not available | Not available | There is no `try`/`except`. |

```python
# indie:lang_version = 5
from math import nan, isnan
from indie import indicator, MainContext, Optional
from indie.algorithms import Sma, NanToZero, FixNan


@indicator('NaN and Optional demo', overlay_main_pane=True)
class Main(MainContext):
    def __init__(self):
        self._last_pivot: Optional[float] = None

    def calc(self):
        sma = Sma.new(self.close, 20)
        zeroed = NanToZero.new(sma)
        filled = FixNan.new(sma)
        manual = 0.0 if isnan(sma[0]) else sma[0]

        if self.high[1] > self.high[0] and self.high[1] > self.high[2]:
            self._last_pivot = self.high[1]
        pivot = nan
        if self._last_pivot is not None:
            pivot = self._last_pivot.value()
        return zeroed[0], filled[0], manual, pivot
```

Errors and safe division:

```python
# indie:lang_version = 5
from math import isnan
from indie import indicator, MainContext, IndieError
from indie.math import divide


@indicator('Errors and safe division')
class Main(MainContext):
    def __init__(self):
        if self.info.ticker == '':
            raise IndieError('This indicator needs a symbol with a ticker')

    def calc(self):
        # Pine: close / (volume == 0 ? na : volume)
        price_per_volume = divide(self.close[0], self.volume[0])
        # Pine: na(x) ? 0 : x
        return 0.0 if isnan(price_per_volume) else price_per_volume
```

> [!NOTE]
> If a calculation error does occur at runtime, since v5.15 the indicator keeps the history it already has and shows a refresh button instead of crashing the chart.

---

## 14. Time, sessions and symbol info

`self.time` is a **series of UNIX timestamps in seconds (UTC)**. It is not a `datetime`, so there is no `self.time.year`. Convert a value with `datetime.utcfromtimestamp(...)`.

| **Pine Script™** | **Indie** | **Notes** |
|---|---|---|
| `time` (ms) | `self.time[0]` (seconds) | One hour is `3600`, not `3600000`. |
| `hour`, `minute`, `month`, `year` | `t = datetime.utcfromtimestamp(self.time[0])`, then `t.hour`, `t.minute`, `t.month`, `t.year` | Also `day`, `second`. |
| `dayofweek` | `t.weekday()` | Monday is `0`, Sunday is `6` (Pine counts Sunday as 1). |
| `timestamp(2024, 1, 1)` | `datetime(2024, 1, 1).timestamp()` | `datetime.strptime` parses a string. There is no `strftime`. |
| `timenow` | Not available | There is no wall-clock `now()`. |
| `syminfo.ticker` | `self.info.ticker` | |
| `syminfo.prefix` | `self.info.exchange_code` | `self.info.exchange_aliases` lists common aliases. |
| `syminfo.mintick` | `self.info.tick_size` | |
| `syminfo.timezone` | `self.info.timezone` | |
| (price decimals) | `self.info.price_precision` | |
| `syminfo.tickerid` | Not available | Combine `exchange_code` and `ticker` yourself. |
| `timeframe.period`, `timeframe.multiplier` | `self.time_frame` | A `TimeFrame` with `.count`, `.unit`, `.to_minutes()`, `.to_seconds()`. |
| `barstate.isfirst` | `self.bar_index == 0` | |
| `barstate.islast` | `self.is_last_bar` | `True` on the last historical bar and on realtime bars. |
| `barstate.ishistory` | `self.is_history` | |
| `barstate.isrealtime` | `self.is_realtime` | |
| `barstate.isconfirmed` | `self.is_closed_bar` | `True` on historical bars and on the final update of a realtime bar. |
| `barstate.isnew` | `self.is_new_bar` | |
| `barstate.islastconfirmedhistory` | `self.is_last_history_bar` | |
| `session.isfirstbar` | `self.is_first_in_session()` | Also `is_first_in_regular_session()`, `is_last_in_session()`, `is_last_in_regular_session()`. |
| `session.ispremarket`, `session.ispostmarket` | `self.trading_session.is_pre_market(ts)`, `.is_after_hours(ts)` | Also `is_regular(ts)` and `is_extended(ts)`. The argument is a timestamp. |

```python
# indie:lang_version = 5
from datetime import datetime
from indie import indicator, plot, color


@indicator('Session filter', overlay_main_pane=True)
@plot.background(title='Trading hours')
def Main(self):
    t = datetime.utcfromtimestamp(self.time[0])
    in_hours = t.hour >= 8 and t.hour < 16 and t.weekday() < 5
    return plot.Background(color=color.BLUE(0.1) if in_hours else color.TRANSPARENT)
```

For custom time windows there is the `indie.schedule` package (`Schedule`, `ScheduleRule`, `week_day`, `WORKDAYS`, `WEEKEND`, `ALL_DAYS`); see [Schedules and Trading Sessions](https://takeprofit.com/docs/indie/Schedules-and-Trading-Sessions).

---

## 15. Standard library available in Indie

Only the following can be imported. Anything else (NumPy, pandas, TA-Lib, file or network access) is unavailable because the runtime is sandboxed.

| **Package** | **What is there** |
|---|---|
| `indie` | `indicator`, `strategy`, `algorithm`, `sec_context`, `data_context`, `param_ref`, `param`, `level`, `band`, `request_series`, `MainContext`, `MainStrategyContext`, `SecContext`, `Algorithm`, `Context`, `Series`, `SeriesF`, `MutSeries`, `MutSeriesF`, `Var`, `Optional`, `Color`, `color`, `plot`, `source`, `format`, `line_style`, `TimeFrame`, `time_frame_unit`, `TradingSession`, `SymbolInfo`, `IndieError` |
| `indie.algorithms` | Series algorithms; see the [appendix](#17-appendix-indiealgorithms-reference) |
| `indie.math` | `cross`, `cross_over`, `cross_under`, `divide` |
| `indie.color` | `rgba`, `hex` and the color constants |
| `indie.plot` | `Line`, `Histogram`, `Columns`, `Steps`, `Marker`, `Fill`, `Background`, `BarColor`, `Candles` and their decorators, `marker_style`, `marker_position` |
| `indie.drawings` | `LabelAbs`, `LabelRel`, `LineSegment`, `Rectangle`, `Circle`, `Triangle`, `Channel`, `Table`, `TableRow`, `TableCell`, `Chart`, `AbsolutePosition`, `RelativePosition`, `relative_position`, `vertical_anchor`, `horizontal_anchor` |
| `indie.strategies` | `Trading`, `Order`, `Position`, `Commission`, `order_side`, `order_status`, `commission_type`, `intrabar_order_filter`, `market_order_price`, and more |
| `indie.schedule` | `Schedule`, `ScheduleRule`, `week_day`, `WORKDAYS`, `WEEKEND`, `ALL_DAYS` |
| `indie.data` | `sources` (`Csv`, `DataFeed`, `Tpo`, `VolumeFootprint`), `TpoProfile`, `VolumeFootprintProfile` |
| `math` | `nan`, `inf`, `pi`, `e`, `isnan`, `isclose`, `sqrt`, `pow`, `exp`, `exp2`, `log`, `log2`, `log10`, `floor`, `ceil`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan` |
| `statistics` | `mean`, `fmean`, `median`, `mode`, `stdev`, `pstdev` |
| `datetime` | `datetime`, `time`, `timedelta` |
| `dataclasses` | `dataclass` (row types for external data) |
| `sortedcontainers` | `SortedList` |

Built-ins that need no import: `abs`, `bool`, `dict`, `enumerate`, `float`, `int`, `len`, `list`, `max`, `min`, `range`, `round`, `str`, `sum`, `tuple`, plus the usual string methods (`split`, `join`, `replace`, `startswith`, `strip`, `upper`, `lower` and similar). `abs`, `min`, `max`, `round` and `sum` are built-ins, not members of `math`. `sum` works on lists, not on series.

---

## 16. Pine features Indie does not have

Based on the v5.19 documentation; if a feature is not listed in the library reference, treat it as missing.

| **Pine feature** | **Status in Indie** |
|---|---|
| `alert()`, `alertcondition()` | None in code. Alert on a plot in the platform ([section 11](#11-alerts)). |
| `plotshape` triangles and arrows, `plotarrow` | Marker styles are `NONE`, `CIRCLE`, `LABEL`, `CROSS` only. |
| Input `tooltip`, `group`, `inline`, `confirm`; `input.time`, `input.symbol`, `input.price` | Not available. |
| `request.*` other than `security` (financial, economic, dividends, earnings, splits, seed) | Not documented. Use `calc_on` for other instruments or a CSV or feed for your own data. |
| Libraries, `import`/`export` of other scripts | Not available. |
| `matrix.*`, sets | Not available. Lists and dicts only. |
| `varip`, intrabar persistent state | No documented equivalent. |
| `strategy.close`, `strategy.exit` as functions | No. Flatten with an opposite market order; use `take_profit` and `stop_loss` on limit entries. |
| Multi-instrument strategies | A strategy trades only its chart instrument. |
| `timenow`, `strftime`, `syminfo.tickerid` | Not available. |
| `log.*`, `print`, debug output | Not available. |
| `try`/`except`, `lambda`, nested functions, `match` | Rejected by the compiler. |
| Third-party Python libraries | Not available (sandbox). |
| Gradient colors, `color.r()` and similar helpers | Not available. |
| `ta.hma`, `ta.alma`, `ta.kc`, `ta.wpr`, `ta.valuewhen`, `ta.variance` | No built-in class; compose from other algorithms. |

---

## 17. Appendix: `indie.algorithms` reference

All algorithms are used as `Name.new(...)` from `Main`, `calc`, an `@algorithm` or an `@sec_context` function. Import with `from indie.algorithms import Sma, Ema`.

| **Algorithm** | **Signature** | **Returns** |
|---|---|---|
| `Adx` | `new(adx_len, di_len)` | `(minus_di, adx, plus_di)` |
| `Atr` | `new(length, ma_algorithm='RMA')` | `SeriesF` |
| `Bb` | `new(src, length, mult)` | `(lower, middle, upper)` |
| `Cci` | `new(src, length)` | `SeriesF` |
| `Change` | `new(src, length=1)` | `SeriesF` |
| `Corr` | `new(x, y, length)` | `SeriesF` |
| `CumSum` | `new(src)` | `SeriesF` |
| `Dev` | `new(src, length)` | `SeriesF` |
| `Donchian` | `new(length)` | `SeriesF`, the middle line |
| `Ema` | `new(src, length)` | `SeriesF` |
| `FixNan` | `new(src)` | `SeriesF` |
| `Highest` | `new(src, length)` | `SeriesF` |
| `LinReg` | `new(src, length, offset=0)` | `SeriesF` |
| `Lowest` | `new(src, length)` | `SeriesF` |
| `Ma` | `new(src, length, algorithm)` | `SeriesF` |
| `Macd` | `new(src, fast_len, slow_len, sig_len, ma_source='EMA', ma_signal='EMA')` | `(macd, signal, histogram)` |
| `Median` | `new(src, length)` | `SeriesF` |
| `Mfi` | `new(src, length)` | `SeriesF` |
| `Mfv` | `new()` | `SeriesF` |
| `NanToZero` | `new(src)` | `SeriesF` |
| `NetVolume` | `new(src)` | `SeriesF` |
| `PercentRank` | `new(src, length)` | `SeriesF` |
| `Percentile` | `new(src, length, pct, interpolate)` | `SeriesF` (added in v5.8) |
| `PivotHighLow` | `new(src, left_bars, right_bars)` | `(pivot_high, pivot_low)` (added in v5.8) |
| `Rma` | `new(src, length)` | `SeriesF` |
| `Roc` | `new(src, length)` | `SeriesF` |
| `Rsi` | `new(src, length)` | `SeriesF` |
| `Sar` | `new(start, increment, maximum)` | `SeriesF` |
| `SinceHighest` | `new(src, length)` | `Series[int]` |
| `SinceLowest` | `new(src, length)` | `Series[int]` |
| `SinceTrue` | `new(condition)` | `Series[int]`; `condition` is a `Series[bool]` |
| `Sma` | `new(src, length)` | `SeriesF` |
| `StdDev` | `new(src, length)` | `SeriesF` |
| `Stoch` | `new(src, low, high, length)` | `SeriesF` |
| `Sum` | `new(src, length)` | `SeriesF` |
| `Supertrend` | `new(factor, atr_period, ma_algorithm)` | `(value, direction)` |
| `Tr` | `new(handle_na=False)` | `SeriesF` |
| `Tsi` | `new(src, long_len, short_len)` | `SeriesF` |
| `Uo` | `new(fast_len, middle_len, slow_len)` | `SeriesF` |
| `Vwap` | `new(src, anchor, std_dev_mult)` | `(main, upper, lower)` |
| `Vwma` | `new(src, length)` | `SeriesF` |
| `Wma` | `new(src, length)` | `SeriesF` |
| `ZigZag` | `new(left_bars, right_bars, dev_threshold, allow_zig_zag_within_one_bar)` | four `bool` values: new high pivot, updated high pivot, new low pivot, updated low pivot. Pivots are reported `right_bars` bars late. |

The complete, current API is in the official [library reference](https://takeprofit.com/docs/indie/Library-reference-overview), and the [changelog](https://takeprofit.com/docs/indie/Changelog) lists what changed between versions.
