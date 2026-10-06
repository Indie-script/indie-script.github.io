# Indie FAQ & solutions

Short answers and working code for the questions Indie developers ask most: plotting and fills, colors and inputs, series and state, other instruments and timeframes, strategies, drawings, external data and alerts. Every code sample is complete, starts with `# indie:lang_version = 5`, and was compiled with the TakeProfit MCP validator (most also ran on market data; the exceptions are marked in the text).

> [!NOTE]
> This is an unofficial community FAQ. The official documentation lives at [takeprofit.com/docs/indie](https://takeprofit.com/docs/indie/What-is-Indie).

---

## Plotting and fills

### How do I fill the area between two plot lines in Indie?

Declare both lines with `@plot.line` and give each an `id`, then add `@plot.fill('id1', 'id2', color=...)`. The decorator only declares the fill: `Main` must also return a `plot.Fill()` object in the matching position. Transparency is the alpha value passed to the color, so `color.PURPLE(0.3)` is 30% opaque.

```python
# indie:lang_version = 5
from indie import indicator, plot, color
from indie.algorithms import Sma


@indicator('Area Between Moving Averages', overlay_main_pane=True)
@plot.line('fast_ma', color=color.BLUE, title='Fast MA')
@plot.line('slow_ma', color=color.RED, title='Slow MA')
@plot.fill('fast_ma', 'slow_ma', color=color.PURPLE(0.3), title='MA Area')
def Main(self):
    fast_ma = Sma.new(self.close, 20)
    slow_ma = Sma.new(self.close, 50)
    return fast_ma[0], slow_ma[0], plot.Fill()
```

> [!NOTE]
> The return tuple must have one value per `@plot.*` decorator, in decorator order. Here that is two lines and one fill. Levels and bands (`@level`, `@band`) are the exception: they are static and return nothing. See [Fills, levels and bands](https://takeprofit.com/docs/indie/Plotting-and-drawing/Fills-levels-and-bands).

### How do I change a fill's color or opacity on each bar?

Build the color in `Main` and pass it to `plot.Fill(color=...)`. A color given there overrides the one in the decorator for that bar. The example scales the opacity with how far the price is from its average, and picks green or red by side.

```python
# indie:lang_version = 5
from indie import indicator, plot, color
from indie.algorithms import Sma


@indicator('Fill With Dynamic Opacity', overlay_main_pane=True)
@plot.line('price', color=color.WHITE, title='Price')
@plot.line('ma', color=color.YELLOW, title='Moving Average')
@plot.fill('price', 'ma', title='Distance Fill')
def Main(self):
    ma = Sma.new(self.close, 20)
    price = self.close[0]

    # 0.0 when price is on the average, 1.0 when it is 5% or more away
    strength = min(1.0, abs(price - ma[0]) / price * 20)
    alpha = 0.1 + 0.4 * strength

    fill_color = color.GREEN(alpha) if price > ma[0] else color.RED(alpha)
    return price, ma[0], plot.Fill(color=fill_color)
```

To get several fills (for example one between price and a fast average and one between price and a slow average), add one `@plot.fill` decorator and one `plot.Fill(...)` return value per fill.

### How do I color the chart background by trend direction?

Use `@plot.background` and return `plot.Background(color=...)`. This tints the whole pane behind the candles. A fill between two lines only shades the gap between them, so it is not a substitute.

```python
# indie:lang_version = 5
from indie import indicator, plot, color
from indie.algorithms import Sma


@indicator('Trend Background', overlay_main_pane=True)
@plot.line('ma', color=color.YELLOW, title='Moving Average')
@plot.background(title='Trend Background')
def Main(self):
    ma = Sma.new(self.close, 20)
    bg = color.GREEN(0.1) if self.close[0] > ma[0] else color.RED(0.1)
    return ma[0], plot.Background(color=bg)
```

> [!TIP]
> Return `plot.Background(color=color.TRANSPARENT)` on bars where you want no tint. `plot.Background` also has `outline_left` and `outline_right` flags for vertical lines at the edges of a colored area.

### How do I add colored zones and levels to an oscillator such as RSI?

Use `@level` for a horizontal line and `@band` for two lines with a fill between them. Color the RSI line itself by returning `plot.Line(value, color=...)`.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color, level, band
from indie.algorithms import Rsi


@indicator('RSI With Zones')
@param.int('length', default=14, min=1, title='RSI Length')
@param.source('src', default=source.CLOSE, title='Source')
@param.int('overbought', default=70, min=50, max=100, title='Line Overbought Level')
@param.int('oversold', default=30, min=0, max=50, title='Line Oversold Level')
@level(50, line_color=color.GRAY(0.5), title='Middle Line')
@band(70, 100, line_color=color.RED, fill_color=color.RED(0.1), title='Overbought Zone')
@band(0, 30, line_color=color.GREEN, fill_color=color.GREEN(0.1), title='Oversold Zone')
@plot.line(color=color.BLUE, line_width=2, title='RSI')
def Main(self, length, src, overbought, oversold):
    rsi = Rsi.new(src, length)[0]

    line_color = color.BLUE
    if rsi >= overbought:
        line_color = color.RED
    elif rsi <= oversold:
        line_color = color.GREEN

    return plot.Line(rsi, color=line_color)
```

> [!WARNING]
> `@level` and `@band` values are fixed when the script compiles, so they cannot read `@param` inputs. In this example the shaded zones stay at 70 and 30 while the line color follows the inputs. If the zones must move with an input, plot two extra lines and join them with `@plot.fill`.

### How do I make a stacked histogram with different colors?

Indie has no stacking mode. The usual trick is to plot the total first and the component you want to show on top of it second, each as its own `@plot.histogram` with its own per-bar color. Here the total volume (bullish plus bearish) takes the bearish color and the bullish part is drawn over it in a color picked from RSI.

```python
# indie:lang_version = 5
from indie import indicator, param, source, plot, color, MutSeriesF
from indie.algorithms import Rsi, Sum


@indicator('Stacked Volume Histogram')
@param.int('rsi_length', default=14, min=1, title='RSI Length')
@param.int('volume_length', default=14, min=1, title='Volume Length')
@param.source('src', default=source.CLOSE, title='Source')
@plot.histogram(title='Total Volume')
@plot.histogram(title='Bullish Volume')
def Main(self, rsi_length, volume_length, src):
    rsi = Rsi.new(src, rsi_length)

    bull = MutSeriesF.new(self.volume[0] if self.close[0] > self.open[0] else 0.0)
    bear = MutSeriesF.new(self.volume[0] if self.close[0] < self.open[0] else 0.0)
    bull_sum = Sum.new(bull, volume_length)
    bear_sum = Sum.new(bear, volume_length)

    bull_color = color.GREEN if rsi[0] >= 60 else color.LIME if rsi[0] >= 50 else color.GREEN(0.5)
    bear_color = color.RED if rsi[0] <= 40 else color.MAROON if rsi[0] <= 50 else color.RED(0.5)

    total = bull_sum[0] + bear_sum[0]
    return plot.Histogram(total, color=bear_color), plot.Histogram(bull_sum[0], color=bull_color)
```

> [!WARNING]
> The sample compiles and runs, but the documentation does not say which plot is drawn in front when two histograms overlap. Check the result on your chart. If the bars hide each other, plot the bearish volume as a negative value (`-bear_sum[0]`) so the two histograms no longer overlap.

### How do I recolor the candles on the chart?

Use `@plot.bar_color` and return `plot.BarColor(color)`. Passing `None` leaves that bar in its normal colors. The example highlights bars whose volume is more than twice the 20-bar average.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma


@indicator('Volume Spike Bars', overlay_main_pane=True)
@param.int('volume_ma_len', default=20, min=1, title='Volume MA Length')
@param.float('spike_coef', default=2.0, min=1.0, max=1000.0, title='Spike coefficient')
@plot.bar_color(title='Bar Color')
def Main(self, volume_ma_len, spike_coef):
    volume_ma = Sma.new(self.volume, volume_ma_len)
    spike = self.volume[0] > volume_ma[0] * spike_coef
    return plot.BarColor(color.YELLOW if spike else None)
```

`@plot.bar_color` was added in v5.10. It recolors the bars of the main chart, so the examples in the docs use `overlay_main_pane=True`.

### How do I draw my own candles (for example Heikin Ashi) from an indicator?

Declare `@plot.candles()` and return a `plot.Candles(open, high, low, close)` every bar. This draws an independent OHLC series and leaves the chart candles alone (available from v5.19). If any of the four values is `NaN`, that candle is simply not drawn.

```python
# indie:lang_version = 5
from indie import indicator, plot, color, MutSeriesF


@indicator('Heikin Ashi Candles', overlay_main_pane=True)
@plot.candles(title='Heikin Ashi', up_color=color.GREEN, down_color=color.RED)
def Main(self):
    ha_close = MutSeriesF.new((self.open[0] + self.high[0] + self.low[0] + self.close[0]) / 4)
    ha_open = MutSeriesF.new(init=0.0)
    if self.bar_index == 0:
        ha_open[0] = (self.open[0] + self.close[0]) / 2
    else:
        ha_open[0] = (ha_open[1] + ha_close[1]) / 2

    ha_high = max(self.high[0], ha_open[0], ha_close[0])
    ha_low = min(self.low[0], ha_open[0], ha_close[0])
    return plot.Candles(ha_open[0], ha_high, ha_low, ha_close[0])
```

Set `overlay_main_pane=False` to draw the candles in their own pane instead of on top of the chart. A returned `plot.Candles` can also override body, wick and border colors for a single bar. See [Candles](https://takeprofit.com/docs/indie/Plotting-and-drawing/Data-plotting-lines-columns-etc#candles).

---

## Inputs and colors

### How do I let users change colors in the indicator settings?

Add `@param.color(id, default=..., title=...)` and take the value as a `Main` argument with the same name. It arrives as a `Color` you can pass straight to `plot.Line(..., color=...)`. For the default, use a built-in constant, `color.rgba(r, g, b, alpha)` or `color.hex('#RRGGBB')`.

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma


@indicator('Colored SMA', overlay_main_pane=True)
@param.int('length', default=20, min=1, title='Length')
@param.color('up_color', default=color.hex('#26A69A'), title='Rising color')
@param.color('down_color', default=color.RED, title='Falling color')
@plot.line(title='SMA')
def Main(self, length, up_color, down_color):
    sma = Sma.new(self.close, length)
    line_color = up_color if sma[0] >= sma[1] else down_color
    return plot.Line(sma[0], color=line_color)
```

> [!NOTE]
> `color.hex()` accepts exactly `#RRGGBB`. Shorthand (`#1E9`), eight-digit (`#1E90FF80`) or a string without `#` compiles but stops the indicator at runtime. For transparency call the color with an alpha value: `color.hex('#1E90FF')(0.3)`. Every `@param.*` decorator takes `title`; do not use the same title twice, or users will see two identical rows. `@param.color` was added in v5.9.

---

## Series, state and NaN

### How do I handle NaN values in Indie?

Most algorithms return `NaN` during warm-up (for example `Sma` with length 50 for the first 49 bars). Math with `NaN` quietly gives `NaN`, and a comparison with `NaN` is `False`. Two operations raise a runtime error instead, and they are the ones to guard: `int(nan)` and division by zero (unlike Python or Pine, a zero denominator stops the script rather than returning `inf` or `NaN`).

```python
# indie:lang_version = 5
from math import isnan, nan
from indie import indicator, plot, MutSeriesF
from indie.algorithms import Sma, FixNan
from indie.math import divide


@indicator('NaN Handling')
@plot.line('pct', title='Distance from SMA, %')
@plot.line('filled', title='Close, gaps filled')
def Main(self):
    sma = Sma.new(self.close, 50)

    # Sma is NaN until it has 50 bars; skip the bar instead of computing with NaN
    if isnan(sma[0]):
        return nan, nan

    # divide() returns the default instead of raising on a zero denominator
    pct = divide(self.close[0] - sma[0], sma[0], nan) * 100

    # a series with real gaps: no volume -> no value; FixNan carries the last valid one forward
    gappy = MutSeriesF.new(self.close[0] if self.volume[0] > 0 else nan)
    filled = FixNan.new(gappy)

    return pct, filled[0]
```

> [!TIP]
> `NanToZero.new(series)` replaces every `NaN` with `0`, and `FixNan.new(series)` repeats the last valid value. Both are in `indie.algorithms`. Do not confuse `NaN` with a bad history offset: asking for a bar far beyond the loaded history (for example `self.close[100000]`) is a runtime error ("Requested series offset ... exceeds the max allowed offset"), not a `NaN`.

### How do I keep state between bars, such as counts per price level?

Use a class-form `Main` and store the data in a typed field created in `__init__`. Indie has built-in `dict[K, V]` containers (since v5.18): keys can be `str`, `int`, `bool` or a finite `float`, and an empty dict needs a type annotation. The example counts how many closed bars finished in the same price bucket as the current bar.

```python
# indie:lang_version = 5
from indie import indicator, param, MainContext


@indicator('Level Visit Counter')
@param.float('step', default=100.0, min=0.0001, title='Level step (price units)')
class Main(MainContext):
    def __init__(self, step):
        self._step = step
        self._visits: dict[int, int] = {}

    def calc(self):
        level = int(self.close[0] / self._step)
        if self.is_closed_bar:
            self._visits[level] = self._visits.get(level, 0) + 1
        return float(self._visits.get(level, 0))
```

> [!WARNING]
> Plain class fields are not rolled back between realtime ticks the way `Var[T]` and `MutSeries` values are. Update them only when `self.is_closed_bar` is `True` (history bars and the final update of a realtime bar), or counts will grow on every tick. For a single scalar that must survive between bars, `Var[float].new(init=0.0)` is simpler than a field. Sets, queues and deques are not supported.

---

## Other instruments and timeframes

### How do I request another symbol or timeframe in Indie?

Write a `@sec_context` function (the code that runs on the other instrument), then connect it from `__init__` with `self.calc_on(...)`. The returned series is merged into the chart's timescale. The call must be made in `__init__`, and at least one of `exchange`, `ticker` or `time_frame` must be given.

```python
# indie:lang_version = 5
from indie import indicator, sec_context, MainContext
from math import nan
from indie.math import divide


@sec_context
def Other(self):
    return self.close[0]


@indicator('Price Ratio To BTC')
class Main(MainContext):
    def __init__(self):
        self._btc = self.calc_on(Other, exchange='BINANCE', ticker='BTC/USDT')

    def calc(self):
        return divide(self.close[0], self._btc[0], nan)
```

For another timeframe of the same symbol, pass only `time_frame` (use `@param.time_frame` to make it an input). Instruments and external sources share one limit per indicator; identical requests count once. See [Request additional instruments](https://takeprofit.com/docs/indie/Request-additional-instruments).

### Can I calculate on a lower timeframe than the chart?

Yes, since v5.14: pass a `time_frame` smaller than the chart's to `calc_on`. This sample computes a 14-period SMA on 5-minute data and shows it on whatever chart you add it to.

```python
# indie:lang_version = 5
from indie import indicator, sec_context, MainContext, param
from indie.algorithms import Sma


@sec_context
def Lower(self):
    return Sma.new(self.close, 14)[0]


@indicator('Lower Timeframe SMA', overlay_main_pane=True)
@param.time_frame('low_tf', default='5m', title='Calculation time frame')
class Main(MainContext):
    def __init__(self, low_tf):
        self._sma = self.calc_on(Lower, time_frame=low_tf)

    def calc(self):
        return self._sma[0]
```

> [!NOTE]
> The library reference for `Context.calc_on` still says only higher or equal timeframes are allowed. The [changelog](https://takeprofit.com/docs/indie/Changelog) (v5.14) and [What you can build](https://takeprofit.com/docs/indie/What-you-can-build) say lower ones are supported, and the sample above compiled and ran. The docs do not spell out which lower-timeframe value appears on a given chart bar, so test that on your chart before relying on it for signals.

---

## Strategies and backtesting

### How do I place orders from an Indie strategy?

Use `@strategy` instead of `@indicator` and call `self.trading.place_order(side, size=...).submit()`. `self.trading.position.size` is the current position (positive long, negative short) and `self.trading.cash` is the available cash. Buying more than the open short size closes the short and opens a long in a single order, which is how reversals are written.

```python
# indie:lang_version = 5
from indie import strategy, param, plot, color
from indie.algorithms import Sma
from indie.math import cross_over, cross_under
from indie.strategies import order_side


@strategy('SMA Cross Strategy', overlay_main_pane=True, initial_capital=100000.0)
@param.int('fast_len', default=20, min=1, title='Fast length')
@param.int('slow_len', default=50, min=1, title='Slow length')
@param.float('cash_pct', default=10.0, min=0.1, max=100.0, title='Order size, % of cash')
@plot.line('fast', color=color.BLUE, title='Fast SMA')
@plot.line('slow', color=color.RED, title='Slow SMA')
def Main(self, fast_len, slow_len, cash_pct):
    fast = Sma.new(self.close, fast_len)
    slow = Sma.new(self.close, slow_len)

    size = self.trading.cash * cash_pct / 100 / self.close[0]
    pos = self.trading.position.size

    # a buy larger than the open short closes it and opens a long in one order
    if cross_over(fast, slow) and pos <= 0:
        self.trading.place_order(order_side.BUY, size=size + abs(pos)).submit()
    elif cross_under(fast, slow) and pos >= 0:
        self.trading.place_order(order_side.SELL, size=size + abs(pos)).submit()

    return fast[0], slow[0]
```

> [!NOTE]
> Orders are not instant: a placed, amended or canceled order takes effect on the next tick, so do not read `FILLED` right after `submit()`. A strategy trades only the instrument it runs on. See [Orders](https://takeprofit.com/docs/indie/Strategies/Orders) and [Strategy mechanics](https://takeprofit.com/docs/indie/Strategies/Strategy-mechanics).

### How do I close an open position?

Send an order in the opposite direction with `size` equal to the open position. For a long, that is a `SELL` of `self.trading.position.size`.

```python
# indie:lang_version = 5
from indie import strategy, param
from indie.algorithms import Sma
from indie.math import cross_over, cross_under
from indie.strategies import order_side


@strategy('Long Only With Exit', overlay_main_pane=True)
@param.int('fast_len', default=20, min=1, title='Fast length')
@param.int('slow_len', default=50, min=1, title='Slow length')
def Main(self, fast_len, slow_len):
    fast = Sma.new(self.close, fast_len)
    slow = Sma.new(self.close, slow_len)
    pos = self.trading.position.size

    if cross_over(fast, slow) and pos == 0:
        self.trading.place_order(order_side.BUY, size=1.0).submit()
    elif cross_under(fast, slow) and pos > 0:
        # to close a long, sell exactly the open size
        self.trading.place_order(order_side.SELL, size=pos).submit()
```

For a pending (not yet filled) order, keep the `Order` that `submit()` returns and call `self.trading.cancel_order(order.id)`. Cancel and amend are safe on orders that already filled or were canceled: the call is ignored instead of failing.

### How do I attach take profit and stop loss to an entry?

Chain `.take_profit(stop=...)` and `.stop_loss(stop=...)` onto a limit (or stop-limit) entry. Once the entry fills, they become protective orders for the whole position, and when one executes the other is canceled (an OCO bracket). Keep the returned `Order` and check its status so you do not stack a new entry while one is still working.

```python
# indie:lang_version = 5
from indie import strategy, MainStrategyContext, Optional
from indie.strategies import order_side, order_status, Order


def is_active(order: Optional[Order]) -> bool:
    return order is not None and order.value().status in [
        order_status.CREATED, order_status.PLACED,
        order_status.PENDING_PLACED, order_status.PARTIALLY_FILLED,
    ]


@strategy('Limit Entry With TP and SL', overlay_main_pane=True)
class Main(MainStrategyContext):
    def __init__(self):
        self._entry: Optional[Order] = None

    def calc(self):
        price = self.close[0]
        if self.trading.position.size == 0 and not is_active(self._entry) and price > self.open[0]:
            self._entry = (
                self.trading.place_order(order_side.BUY, size=1.0).
                limit(price=price).
                take_profit(stop=price * 1.02).
                stop_loss(stop=price * 0.99).
                submit()
            )
```

> [!WARNING]
> Per the current docs, take profit and stop loss are supported only on limit and stop-limit entries, not on market orders. They follow the position, not the single order: at most one TP and one SL are active, and their size tracks the position. Pass `limit=` as well to make the exit a stop-limit order. The position-level rules describe the backtest emulator; on a live exchange the exchange's own rules apply.

### How do I set commission, capital and leverage for a backtest, and stop duplicate orders on every tick?

Set them in `@strategy(...)`. The same settings can also be changed in the UI before launch. `PERCENT` commission is a fraction of order value, so `0.001` means 0.1%. `intrabar_order_filter` controls how many orders a bar may produce: `ON_BAR_CLOSE` accepts orders only at bar close, `FIRST_IN_BAR` only the first batch, `LAST_IN_BAR` only the last, `NO_FILTER` every update.

```python
# indie:lang_version = 5
from indie import strategy
from indie.strategies import Commission, commission_type, intrabar_order_filter, market_order_price, order_side


@strategy('Backtest Settings Demo',
          overlay_main_pane=True,
          initial_capital=50000.0,
          commission=Commission(0.001, commission_type.PERCENT),
          leverage=2.0,
          intrabar_order_filter=intrabar_order_filter.ON_BAR_CLOSE,
          market_order_price=market_order_price.MARKET_PRICE)
def Main(self):
    if self.close[0] > self.open[0] and self.trading.position.size == 0:
        self.trading.place_order(order_side.BUY, size=self.trading.cash * 0.5 / self.close[0]).submit()
    elif self.close[0] < self.open[0] and self.trading.position.size > 0:
        self.trading.place_order(order_side.SELL, size=self.trading.position.size).submit()
```

> [!NOTE]
> A strategy's `Main` runs on every price update, not only at bar close. A rule such as "close crossed above a level" can therefore fire several times inside one bar. Using the `ON_BAR_CLOSE` filter above is the shortest fix. `commission` and `market_order_price` only model the backtest; on a live exchange the real fees and fills apply. A backtest is an approximation of live results, not a guarantee. See [Strategy params](https://takeprofit.com/docs/indie/Strategies/Strategy-params).

---

## Drawings and tables

### How do I show a table (summary box) on the chart?

Create a `Table` once in `__init__`, fill it and call `self.chart.draw(table)` on the last bar. Tables use a `RelativePosition`, so they stay in a corner while the chart scrolls. Each row is a `TableRow` of `TableCell`s, and cell text must be strings, so convert numbers with `str()`. Tables arrived in v5.17.

```python
# indie:lang_version = 5
from indie import indicator, color, MainContext
from indie.drawings import Table, TableCell, TableRow, RelativePosition, vertical_anchor as va, horizontal_anchor as ha


@indicator('Market Summary Table', overlay_main_pane=True)
class Main(MainContext):
    def __init__(self):
        self._table = Table(position=RelativePosition(va.TOP, ha.RIGHT, 0.05, 0.95))

    def calc(self):
        if self.is_last_bar:
            self._table.clear()
            self._table.append(TableRow([
                TableCell('Metric', bg_color=color.GRAY(0.5)),
                TableCell('Value', bg_color=color.GRAY(0.5)),
            ]))
            self._table.add_row(['Close', str(self.close[0])])
            self._table.add_row(['Bars loaded', str(self.bar_count)])
            self.chart.draw(self._table)
        return self.close[0]
```

> [!NOTE]
> There is no header row type: make the first row a normal row with colored cells. `add_row([...])` uses the table's default style; `append(TableRow([...]))` lets each cell carry its own text and background color. Cells cannot be merged, and a table can have at most 50 rows and 20 columns. Remove one with `self.chart.erase(self._table)`. See [Drawings](https://takeprofit.com/docs/indie/Plotting-and-drawing/Drawings-lines-labels#table).

### How do I draw a rectangle (box) around a zone?

Call `self.chart.draw(Rectangle(corner1, corner2, ...))`, where each corner is an `AbsolutePosition(time, price)`. Rectangles have a line style, line color and a `bg_color` fill (added in v5.13, together with `Circle`, `Triangle` and `Channel`). This sample boxes every inside bar, from the previous bar's high to its low.

```python
# indie:lang_version = 5
from indie import indicator, color, line_style
from indie.drawings import Rectangle, AbsolutePosition


@indicator('Inside Bar Boxes', overlay_main_pane=True)
def Main(self):
    inside = self.high[0] < self.high[1] and self.low[0] > self.low[1]
    if inside:
        self.chart.draw(Rectangle(
            AbsolutePosition(self.time[1], self.high[1]),
            AbsolutePosition(self.time[0], self.low[1]),
            line_style=line_style.DASHED,
            line_color=color.ORANGE,
            bg_color=color.ORANGE(0.1),
        ))
    return
```

> [!NOTE]
> Drawings can be changed or erased after they were drawn, which plots cannot. A bare `return` is fine when the indicator only draws. Remember to guard `self.time[n]` with `isnan` if `n` can reach before the first bar. Drawings are not available as alert conditions.

---

## External data and alerts

### How do I use my own CSV data in an indicator?

Host a CSV at a public HTTPS URL and declare it with `sources.Csv(url)` (v5.18). If the file has OHLCV candles, attach it with `calc_on(..., source=...)` and a `@sec_context` callback; the `time_frame` argument is required and describes the cadence of your rows. If the rows have another shape, describe them with a `@dataclass` and read them with `request_series`.

Candle file (columns `time, open, high, low, close`, optional `volume`):

```python
# indie:lang_version = 5
from indie import indicator, MainContext, sec_context, TimeFrame
from indie.data import sources


@sec_context
def ExternalCandles(self):
    return self.close[0]


@indicator('External Candle Close')
class Main(MainContext):
    def __init__(self):
        self._ext_close = self.calc_on(
            ExternalCandles,
            time_frame=TimeFrame.from_str('1D'),
            source=sources.Csv('https://example.com/candles.csv'))

    def calc(self):
        return self._ext_close[0]
```

Typed rows (columns `time, signal, confidence`; an empty `confidence` cell reads as `None`):

```python
# indie:lang_version = 5
from dataclasses import dataclass
from indie import indicator, MainContext, request_series, Optional
from indie.data import sources


@dataclass
class ModelOutput:
    signal: float
    confidence: Optional[float]


@indicator('External Model Signal')
class Main(MainContext):
    def __init__(self):
        self._rows = request_series[ModelOutput](
            source=sources.Csv('https://example.com/signals.csv'))

    def calc(self):
        row = self._rows.get(0, ModelOutput(0.0, None))
        return row.signal * row.confidence.value_or(1.0)
```

> [!WARNING]
> Both samples were compile-checked only; `example.com` is a placeholder, so replace the URL with your own file. The file is fetched once and frozen (a cached copy may be served for up to about 10 minutes), so re-add the indicator to pick up changes. The URL must be public HTTPS, with no authentication headers. Timestamps must be strictly increasing. On bars before the first row, `series[0]` on typed rows raises an error: use `.get(0, default_row)` as above. Indicators that use external data cannot be published to the Marketplace. Details: [External data](https://takeprofit.com/docs/indie/External-data/External-data-overview) and [CSV format and limits](https://takeprofit.com/docs/indie/External-data/CSV-format-and-limits).

### Can I stream live data into an indicator?

Yes, since v5.19, with `sources.DataFeed(url)`. You run a small WebSocket (`wss://`) or SSE (`https://`) server that publishes records; each record's JSON fields are matched by name to a `@dataclass`, and the records are processed in a `@data_context` callback or read through `request_series`.

```python
# indie:lang_version = 5
from dataclasses import dataclass
from datetime import timedelta
from indie import indicator, MainContext, data_context
from indie.data import sources


@dataclass
class ModelOutput:
    signal: float
    confidence: float


@data_context[ModelOutput]
def FeedSignal(self):
    return self.data[0].signal * self.data[0].confidence


@indicator('Live Model Signal')
class Main(MainContext):
    def __init__(self):
        self._sig = self.calc_on(
            FeedSignal,
            source=sources.DataFeed(
                'wss://feeds.example.com/signal',
                stale_after=timedelta(seconds=30)))

    def calc(self):
        return self._sig[0]
```

> [!WARNING]
> Compile-checked only; the feed URL is a placeholder. A feed has no `time_frame` and no candle mode, and the server must be publicly reachable with no authentication (a signed token in the URL query string is passed through). History warm-up is best effort, and records published while the connection between the platform and your server is down are lost. See [Live data from a feed](https://takeprofit.com/docs/indie/External-data/Live-data-from-a-feed).

### How do I set an alert from my indicator?

Indie code does not create alerts. You expose a plotted value, then create the alert in the platform and choose your indicator as its source. Plots can be alert sources; fills, levels, bands and drawings cannot. The simplest pattern is a signal plot that is `1` on a buy bar, `-1` on a sell bar and `0` otherwise.

```python
# indie:lang_version = 5
from indie import indicator, plot, color, param
from indie.algorithms import Sma
from indie.math import cross_over, cross_under


@indicator('SMA Cross Signal')
@param.int('fast_len', default=20, min=1, title='Fast length')
@param.int('slow_len', default=50, min=1, title='Slow length')
@plot.columns(title='Cross signal')
def Main(self, fast_len, slow_len):
    fast = Sma.new(self.close, fast_len)
    slow = Sma.new(self.close, slow_len)

    signal = 0.0
    signal_color = color.TRANSPARENT
    if cross_over(fast, slow):
        signal = 1.0
        signal_color = color.GREEN
    elif cross_under(fast, slow):
        signal = -1.0
        signal_color = color.RED

    return plot.Columns(signal, color=signal_color)
```

Then add the indicator to a chart, open **Alerts → New Alert**, set **Source** to the indicator, pick a criterion such as **Greater Than** (target `0.5` for buys) or **Lower Than** (target `-0.5` for sells), and save. An alert message can reference any plot of the indicator, not only the one in the condition. See [Alerts overview](https://takeprofit.com/docs/guide/alerts/Alerts-overview) and [alert trigger criteria](https://takeprofit.com/docs/guide/alerts/Alert-trigger-criteria).

---

## Troubleshooting

### What do the common Indie compile errors mean?

Indie looks like Python but is a stricter, typed subset. These messages come from the real compiler (the last two are runtime errors that only show up when the script runs).

| Message (shortened) | What it means | Fix |
| --- | --- | --- |
| `cannot assign value of type float to target level of type NoneType, did you mean to declare level as Optional[float]` | `x = None` fixes the type to "nothing". | Declare `level: Optional[float] = None`, read it with `.value()`, test it with `is None`. |
| `list comprehension expressions are prohibited` | No list/dict/set comprehensions or generator expressions. | Use a `for` loop and `append`. |
| `cannot process multiple operands in comparison like x < y < z` | Chained comparisons are not supported. | Write `x < y and y < z`. |
| `number of indicator outputs (1) must be greater or equal to the number of indicator plots (2)` | `Main` returns fewer values than there are `@plot.*` decorators (fills and markers count too). | Return one value per decorator, in order. |
| `Unknown symbol res ... variable scopes in Indie end with indentation` | A variable first assigned inside `if` or `for` is used after the block. | Declare it before the block: `res = 0.0`, or `res: float` when every branch assigns. |
| `functions can only be declared in the global scope or inside classes as methods` | Nested `def` is not allowed. | Move the helper to module level and pass data as arguments. |
| `Unknown symbol plot, did you forget to define or import it?` | A name is used without being imported. | Add it to `from indie import ...`, for example `plot, color`. |
| `cannot find corresponding @indie.param.<type> decorators for Main parameter(s): period` | `Main` has an argument that no `@param` declares. | Add `@param.int('period', ...)` with the same name, or remove the argument. |
| `cannot apply operator - to operands of types Series[float] and Series[float]` | Whole series cannot be subtracted. | Index the values: `self.close[0] - sma[0]`. |
| `cannot convert float NaN to integer` (runtime) | `int()` of a warm-up `NaN`. | `int(x) if not isnan(x) else 0`, or skip the bar with `isnan`. |
| `division by zero` (runtime) | The denominator was exactly `0.0`. | Use `divide(a, b, default)` from `indie.math`. |
| `Attempt to call Context.calc_on after __init__, which is prohibited` (runtime) | `calc_on` was called inside `calc()`. | Call it in `__init__` and keep the result in a field. |

A few more rules that cause first-try failures:

- The first line must be `# indie:lang_version = 5`, and the entry point must be named `Main`.
- `try`/`except`, `lambda`, `with` and nested functions are not available. Use `raise IndieError('message')` to stop a script.
- Integers are 32-bit; use `float` for bigger numbers.
- Create algorithms and series (`Sma.new(...)`, `MutSeriesF.new(...)`) inside `Main` or `calc`, as in the samples above.
- `calc_on` and `request_series` belong in `__init__`.
- Importing `numpy`, `pandas` or other third-party libraries is not possible; Indie runs in a sandbox with its own small standard library.

The full list of differences from Python is on [Indie vs. Python](https://takeprofit.com/docs/indie/Language-differences-with-Python). If you are coming from Pine Script, start with the [Pine Script to Indie cheat sheet](/docs/).
