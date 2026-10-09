# Pine → Indie: conversion pitfalls & recipes

Every item on this page comes from a real conversion: 18 TradingView scripts were ported to Indie and checked bar by bar against the original on the same candles. Each entry gives the symptom you will see, the cause, and the fix. Use it as a checklist before you convert, and as a lookup when something breaks.

The [cheat sheet](/docs/) maps constructs one to one. This page covers what the mapping does not tell you: hidden defaults, engine limits, and the places where a port compiles and still gives different numbers.

## Checklist before you ship a port

- [ ] File is UTF-8 **without BOM**, LF line endings, first line exactly `# indie:lang_version = 5`.
- [ ] Every omitted argument of the Pine original was replaced by its documented default (see [defaults](#read-the-defaults-first)).
- [ ] Every input that is **on by default** in the original is part of the algorithm and is ported.
- [ ] Conditions were taken from the logic itself, not from plot titles, comments or alert texts.
- [ ] Cross-bar state lives in `self.new_var(...)`, not in plain `self._x` fields.
- [ ] Algorithms (`Ema.new`, `PivotHighLow.new`, ...) are called on every bar, outside any `if`.
- [ ] Drawings are erased and redrawn within the budget of ~25 objects per bar.
- [ ] Output was compared with the original on the same candles, not just compiled.

## Read the defaults first

Most wrong numbers do not come from a wrong formula. They come from a default value the Pine source never wrote down.

### `highest(length)` takes `high`, not `close`

In Pine v4, `highest(len)` and `lowest(len)` without a source use `high` and `low`. A port that substitutes `close` gives channels that are off by 17–26 % of their range and shifts entry and exit markers.

```python
upper_s = Highest.new(self.high, length)   # not self.close
lower_s = Lowest.new(self.low, length)
```

Found in: Turtle Trade Channels. After the fix all 12 plotted series matched (4 of 12 before).

### An option that is on by default is part of the algorithm

`UseHAcandles = input(true)` with `security(heikinashi(syminfo.tickerid), ...)` means the script computes on Heikin Ashi candles even when the chart shows regular ones. Read the default of every input before you decide what to skip.

Compute Heikin Ashi directly from the chart candles: `haClose = (o + h + l + c) / 4`, `haOpen = (prev haOpen + prev haClose) / 2`, seeded with `(open + close) / 2`.

Found in: Scalping PullBack Tool (10 of 10 plots matched after porting the option).

### `cross()` goes both ways

Pine `cross(a, b)` is true on a crossover **or** a crossunder. `crossover` and `crossunder` are directional. Porting `cross` as `crossover` flips the trend in one direction only.

### Take the condition from the logic, not from the title

A debug plot titled `barssince(haClose>pacC)` can contain `barssince(close>pacC)`. Copying the expression from the plot into the exit condition produced one extra Sell arrow (36 events instead of 35). When near-identical series exist (`haClose` and `close`), keep each exactly where the original uses it.

### Do not swap a loop for a built-in statistic

A stepped search through levels is not `percentile`. Replacing the loop in RSI Cyclic Smoothed gave bands that did not match the original. Port loops as written.

## Compile errors

| Error text | Cause | Fix |
|---|---|---|
| `NeedToMigrateVersionError (1, 5)` on a correct header | BOM or CRLF written by a Windows tool | Save as UTF-8 without BOM and with LF |
| `TypeInferrerError: cannot declare variable ... of type float` | `x: float` with no value | Always give a value: `stop: float = 0.0`, assign in the branches later |
| `function parameter ... must have a type annotation` | Helper method without parameter types | Annotate every parameter of every method except `calc` |
| `function ... has no return value type` | Helper without `-> type` | Add `-> bool` and `return True` if it returns nothing; a function returning a colour is `-> Color` |
| `positional argument ... of float type does not match ... int` on a time list | `self.time[k]` is `float` | Store times in `list[float]` |
| `Unknown symbol ...` for a variable set inside `if` / `while` | Scope ends with the indentation | Declare the variable with a default before the block |
| `please move from indie import ... to the top` | Constant placed above the imports | Imports first, then constants |
| `Symbol srt.sort not found` | Indie lists have only `append, clear, copy, extend, index, insert, pop, remove, reverse` | Write the sort, `indexof` and `min/max` as loops |

Insertion sort, since lists have no `sort()`:

```python
a = 1
while a < width:
    key_v: float = srt[a]
    b2 = a - 1
    while b2 >= 0 and srt[b2] > key_v:
        srt[b2 + 1] = srt[b2]
        b2 -= 1
    srt[b2 + 1] = key_v
    a += 1
```

## Runtime errors and engine limits

### Keep cross-bar state in `new_var`

The live bar is recalculated several times, and plain `self._x` lists are not rolled back between recalculations. Symptoms: events vanish after the history/real-time border, or the pivot count grows several times over. Keep state in `self.new_var(...)`, copy it at the start of `calc`, change the copy, and `.set()` it back at the end.

```python
def __init__(self):
    empty_f: list[float] = []
    self._levels = self.new_var(empty_f)

def calc(self):
    levels: list[float] = []
    src_l = self._levels.get()
    k = 0
    while k < len(src_l):
        levels.append(src_l[k])
        k += 1
    # ... change `levels` ...
    self._levels.set(levels)
```

Result in Liquidity Sweeps: 62 events with plain lists, the full set matching the original after the move to `new_var`.

### Call algorithms on every bar

`PivotHighLow.new`, `Ema.new`, `Sma.new` and the like keep internal state. Calling one inside an `if` desynchronises it and fails with `SortedList: trying to remove non-existent value`. Call it unconditionally and pass the result into the conditional code.

### No data-dependent series offsets

`close[length + i]` or `time[n - pivot_bar]` fails with `Series offset=N is out of size=N` once the offset exceeds the history the engine keeps for that script. Constant offsets and offsets that come from a parameter are safe. When the offset depends on data, keep your own history (times, bodies, extremes) in a `new_var` list and index that list.

### Drawing budget: 100 changes per bar

An update of the bar may change at most 100 drawings, and the rollback of the previous recalculation counts too. In practice: **about 25 objects per bar**. Merge neighbouring boxes of the same colour, merge collinear lines, and label only the most important items. Volume Orderbook labels 3 of 21 rows for this reason.

### Erase and redraw on the last bar

`is_last_bar` can be true on many bars of a test run, and a Pine script that deletes everything at the start of the bar has no counterpart in Indie. Keep the handles in `new_var` lists and erase the previous set before drawing the new one. IFVG went from 42 510 drawing commands to 10 after this change.

### Never draw an `Optional`

`failed to draw: expected IDrawingItem, got Optional`. Create the object in a typed local, draw it, then store it. Call `.value()` only when you erase.

```python
box: Rectangle = Rectangle(AbsolutePosition(t_l, top), AbsolutePosition(t_r, bot),
                           line_color=color.TRANSPARENT, line_width=1, bg_color=col)
self.chart.draw(box)
new_r.append(box)          # list[Optional[Rectangle]]

# later, to remove:
self.chart.erase(old[k].value())
```

## Mapping recipes

### Colours: transparency becomes opacity

Pine transparency `0` is opaque. Indie alpha `0` is invisible. `alpha = 1 - transp / 100`.

| Pine | Indie |
|---|---|
| `transp = 0` | `color.rgba(r, g, b, 1.0)` |
| `color.new(c, 80)` | `color.rgba(r, g, b, 0.2)` |

A port with `color.rgba(..., 0)` draws nothing.

### Markers: `plotshape` → `plot.Marker`

There is no `location` argument. Position is the value you return.

| Pine | Indie |
|---|---|
| `location.belowbar` | `plot.Marker(self.low[0] if cond else nan)` |
| `location.abovebar` | `plot.Marker(self.high[0] if cond else nan)` |
| `location.absolute` | `plot.Marker(price if cond else nan)` |
| `plotarrow(x)` | one marker: below the bar for `x > 0`, above for `x < 0` |

### Offsets belong to the value

```python
return plot.Line(v, offset=-lb_r), plot.Marker(v, offset=-lb_r)
```

Do not pass `offset` to the decorator and do not shift the series yourself.

### Lines and fills

- `hline(30)` → `plot.Line(30.0)`. A fill between two `hline`s is dropped.
- Two `fill()` calls coloured by condition → one `plot.Fill(colour)`, the colour is chosen per bar and is `color.TRANSPARENT` when neither condition holds.

### Functions that look simple

| Pine | Indie | Note |
|---|---|---|
| `sum(x, n)` | `Sma.new(x, n)[0] * float(n)` | `nan` until `n` bars exist, guard the division |
| `atr(n)` | `Atr.new(n)[0]` | Wilder RMA |
| `sma(tr, n)` | `Sma.new(Tr.new(), n)[0]` | |
| `pivothigh(src, L, R)` | `PivotHighLow.new(src, left_bars=L, right_bars=R)` | value appears on the confirmation bar, plot it with `offset=-R` |
| `valuewhen(cond, x, k)` | last `k + 1` values kept in series, updated on the event | occurrence 0 includes the current bar |
| `barssince(cond)` | `MutSeriesF` seeded with `nan`, `0` on the event, otherwise previous + 1 | |

`barssince` as used in the Turtle port:

```python
def _bs(cond: bool, prev: float) -> float:
    if cond:
        return 0.0
    return prev + 1.0

bu_s = MutSeriesF.new(nan)
bu_s[0] = _bs(h >= up_s[1], bu_s[1])
```

### Pine objects → Indie records

- A user-defined type with an array of objects becomes a flat `list[float]` with a fixed stride (one pivot = 8 numbers) kept in `new_var`. Delete by rebuilding the list.
- `line.set_x2`, `box.set_right`, `box.delete` → erase the old handle and draw a new object.
- `bar_index`-based x → time. Store `self.time[k]` when the event happens; compute a future point as `t0 + (t0 - self.time[1]) * k`.
- `Rectangle` has no text. Use a separate `LabelAbs` and count it in the drawing budget.

## Not portable

| Pine | What to do |
|---|---|
| `alertcondition()` | Drop it. Put the condition on a marker or a line and set a platform alert on it. |
| `barcolor()`, `bgcolor()` | Drop them. If the condition carries information, expose it as a marker. |
| `input.color` | Colour inputs do not exist. Hard-code the colours. |
| `table.*` dashboards | Drop them. |
| `security()` to a higher timeframe | Skip it when the block is off by default. When it is on by default, use `sec_context` / `calc_on` and verify. |

Write every skipped item into the header of the port. The next person must be able to see what is missing.

## Verify against the original

- Export the plots of the original from TradingView as CSV and compare numbers on the **same candles**. Match columns by value, not by index: shapes, colours and fills take plot numbers too.
- Boolean `plotshape` columns hold `0/1` on every bar. Treat `1` as the event.
- Colours are exported as separate integer columns above 2^24. Exclude them from value matching.
- A plot hidden by an `na` colour keeps values on every point in the export. A port that plots only the visible points is correct when its points are a subset with equal values.
- Long-memory indicators (EMA 200, Stochastic over 500 bars) do not match to 1e-6 because TradingView starts from deeper history. Check that the error **decays** over the window and that the port equals an independent implementation on the same candles.
- Assume the live bar is recalculated and make every port idempotent per bar.
- State a licence only if the source header states it.

## Known open problems

- **Fractals in VuManChu Cipher B.** TradingView finds the second-level bullish divergence at 3 places out of 32 differently from the written formula on identical input. The cause is not established.
- **Equal highs and lows in `pivothigh`/`pivotlow`.** Tie handling is unverified against TradingView, so do not rely on it for sweep-style logic.
- **First events of a series.** Comparisons with `na` at the start (`na != 0`) behave differently on the first bars. Ignore events before the warm-up or seed the state explicitly.

*This page grows with every conversion. Found something that is not here? Open an issue or a pull request in the repository.*

