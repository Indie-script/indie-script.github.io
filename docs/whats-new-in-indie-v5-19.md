# What's new in Indie v5.19: candles plots, live data feeds and hex colors

Indie v5.19.0 (7 October 2026) lets an indicator draw its own candles next to the chart candles, read live records from a WebSocket or SSE server through `sources.DataFeed`, and build colors from `#RRGGBB` strings with `color.hex()`. This page walks through each feature with a complete script you can paste into the IDE, plus a runnable feed server in Python.

> [!NOTE]
> The source of record is the official [Indie changelog](https://takeprofit.com/docs/indie/Changelog). Every listing below was compiled on the platform on 8 October 2026. What exactly was checked, and what was not, is listed in [How this was checked](#how-this-was-checked).

---

## At a glance

| Feature | API | What it is for |
|---|---|---|
| Candles plots | `@plot.candles()`, `plot.Candles` | Your own OHLC series drawn next to the chart candles, for example Heikin Ashi |
| Live data feeds | `sources.DataFeed(url, stale_after=...)` | Records from your own server (model output, alternative data) delivered to `@data_context` callbacks and `request_series` |
| Hex colors | `color.hex('#RRGGBB')`, `color.hex(...)(alpha)` | Palettes copied from a design tool, transparency from one color input |
| Second timeframes | `@param.time_frame` | The input now accepts second-based timeframes |
| MCP | private scripts and alerts, Codex sign-in | AI assistants can work with your own scripts and alerts |

## Candles plots: Heikin Ashi next to the chart candles

A candles plot is an independent OHLC series. It does not replace the chart candles, and one indicator can declare several candles plots. Declare it with `@plot.candles()` and return a `plot.Candles(open, high, low, close)` for every bar.

Heikin Ashi is a good first use because it needs state: each open depends on the previous bar.

```python
# indie:lang_version = 5
from indie import indicator, plot, color, MutSeriesF

@indicator('Heikin Ashi Candles')
@plot.candles(title='Heikin Ashi', up_color=color.hex('#26A69A'), down_color=color.hex('#EF5350'))
def Main(self):
    ha_close = MutSeriesF.new(init=(self.open[0] + self.high[0] + self.low[0] + self.close[0]) / 4.0)
    ha_open = MutSeriesF.new(init=(self.open[0] + self.close[0]) / 2.0)
    ha_close[0] = (self.open[0] + self.high[0] + self.low[0] + self.close[0]) / 4.0
    if self.bar_index == 0:
        ha_open[0] = (self.open[0] + self.close[0]) / 2.0
    else:
        ha_open[0] = (ha_open[1] + ha_close[1]) / 2.0
    ha_high = max(self.high[0], ha_open[0], ha_close[0])
    ha_low = min(self.low[0], ha_open[0], ha_close[0])
    return plot.Candles(ha_open[0], ha_high, ha_low, ha_close[0])
```

How it works:

- Heikin Ashi close is the average of the bar's open, high, low and close. Heikin Ashi open is the average of the previous Heikin Ashi open and close, seeded on the first bar with `(open + close) / 2`.
- `MutSeriesF.new(init=...)` creates a series you can write to. `ha_open[1]` reads the previous bar.
- The Heikin Ashi high and low must contain the body, so they take the maximum and minimum of the real high or low and the two Heikin Ashi values.
- The indicator has no `overlay_main_pane=True`, so it gets its own pane under the chart. Add the argument to draw on top of the chart candles instead.
- `up_color` and `down_color` set the default body colors. When they are omitted, the plot uses the chart candle colors. A returned `plot.Candles` can override `color`, `wick_color`, `border_color` and `offset` for a single bar. If any of the four OHLC values is `NaN`, that candle is not drawn.

Reference: [`@candles()`](https://takeprofit.com/docs/indie/Library-reference/package-indie-plot#decor_candles), [`Candles`](https://takeprofit.com/docs/indie/Library-reference/package-indie-plot#class_Candles), [Data plotting](https://takeprofit.com/docs/indie/Plotting-and-drawing/Data-plotting-lines-columns-etc#candles).

## Hex colors: one color input, a translucent fill

`color.hex('#1E90FF')` builds a fully opaque `Color` from a `#RRGGBB` string, upper or lower case. Call the result with an alpha from `0.0` to `1.0` to make it transparent: `color.hex('#1E90FF')(0.3)`.

The same call works on a `@param.color` value. That gives you a pattern the settings panel handles well: the user picks one color, and the fill takes the same color at 12% opacity.

```python
# indie:lang_version = 5
from indie import indicator, param, source, color, plot
from indie.algorithms import Bb

@indicator('Bollinger Bands Hex Palette', overlay_main_pane=True)
@param.int('length', default=20, min=1, title='Length')
@param.float('mult', default=2.0, min=0.1, title='Multiplier')
@param.source('src', default=source.CLOSE, title='Source')
@param.color('band_color', default=color.hex('#1E90FF'), title='Band color')
@param.color('basis_color', default=color.hex('#FF8C00'), title='Basis color')
@plot.line('lower', title='Lower')
@plot.line('basis', title='Basis')
@plot.line('upper', title='Upper')
@plot.fill('lower', 'upper', title='Band fill')
def Main(self, length, mult, src, band_color, basis_color):
    lower, middle, upper = Bb.new(src, length, mult)
    return (
        plot.Line(lower[0], color=band_color),
        plot.Line(middle[0], color=basis_color),
        plot.Line(upper[0], color=band_color),
        plot.Fill(color=band_color(0.12)),
    )
```

Two details that cost time:

- `@plot.fill('lower', 'upper')` refers to the plot **ids** (the first argument of `@plot.line`), not to the titles. Using titles fails with `Series output with id1=Lower not found`.
- Only the six-digit form is valid. The reference says that shorthand `#1E9`, eight-digit `#1E90FF80` and strings without `#` compile but stop the indicator at runtime with `invalid hex color: expected #RRGGBB`. When a literal `'#1E9'` was used as the default of a `@param.color`, the platform's validation rejected the script already at compile time with that same message. Either way, write six digits and put transparency in the alpha call.

Reference: [`color.hex()`](https://takeprofit.com/docs/indie/Library-reference/package-indie-color#func_hex).

## Live data feed: a model signal from your own server

A CSV source is a snapshot: the platform downloads the file once. A feed is the live counterpart. You run a small server that publishes JSON records, the indicator subscribes, and every new record reaches the script while it runs. The URL scheme picks the transport: `wss://` is WebSocket, `https://` is Server-Sent Events (SSE). Plain `ws://` and `http://` are rejected.

### The indicator

Records are typed. A `@dataclass` describes one record, and a `@data_context` callback turns it into a value per bar.

```python
# indie:lang_version = 5
from dataclasses import dataclass
from datetime import timedelta
from indie import indicator, param, plot, color, MainContext, data_context
from indie.algorithms import Ema
from indie.data import sources

@dataclass
class ModelOutput:
    signal: float
    confidence: float

@data_context[ModelOutput]
def FeedSignal(self):
    return self.data[0].signal * self.data[0].confidence

@indicator('Live Model Signal')
@param.int('smooth', default=5, min=1, title='Smoothing')
@plot.line('raw', title='Signal x confidence', color=color.hex('#1E90FF')(0.5))
@plot.line('smooth', title='Smoothed', color=color.hex('#FF8C00'))
class Main(MainContext):
    def __init__(self, smooth):
        self._sig = self.calc_on(
            FeedSignal,
            source=sources.DataFeed(
                'https://feed.example.com/signal',
                stale_after=timedelta(seconds=30)))

    def calc(self, smooth):
        smoothed = Ema.new(self._sig, smooth)
        return self._sig[0], smoothed[0]
```

- `stale_after` is how long the feed may stay silent before the platform treats the stream as quiet. Whole seconds only. A quiet feed is not an error: the script keeps its last values and continues when records resume.
- A feed has no cadence, so there is no `time_frame`. A record is visible from the first chart bar that opens at or after its timestamp, and a live record inside the current bar revises that bar.
- A `@sec_context` callback does not accept a feed: there is no candle mode.
- There is no authentication in this version. If you need access control, put a signed token in the URL query string.

### The server

This server uses only the Python standard library. It publishes one record every 5 seconds over SSE, keeps the last 5,000 records, and answers the platform's replay requests, which is what fills the series with history when an indicator starts. On startup it generates 1,000 synthetic records so that replay has something to return; replace `make_record` with your own data source.

```python
import json
import math
import random
import threading
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

STEP = 5  # seconds between records
HISTORY = deque(maxlen=5000)  # oldest first, time never decreases


def make_record(t):
    rnd = random.Random(t)
    return {
        "time": t,
        "data": {
            "signal": round(math.sin(t / 300) + rnd.uniform(-0.2, 0.2), 3),
            "confidence": round(rnd.uniform(0.4, 1.0), 3),
        },
    }


def produce():
    while True:
        t = int(time.time()) // STEP * STEP
        if not HISTORY or HISTORY[-1]["time"] < t:
            HISTORY.append(make_record(t))
        time.sleep(1)


class Feed(BaseHTTPRequestHandler):
    def send_record(self, record):
        self.wfile.write(("data: " + json.dumps(record) + "\n\n").encode())
        self.wfile.flush()

    def do_GET(self):
        query = parse_qs(urlsplit(self.path).query)
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        try:
            self.stream(query)
        except ConnectionError:
            pass  # the platform hung up

    def stream(self, query):
        records = list(HISTORY)
        last = records[-1]["time"] if records else 0  # live-only start
        window = "replay_to_time" in query
        if "replay_count" in query:
            past = records[-int(query["replay_count"][0]):]
        elif "replay_from_time" in query:
            lo = int(query["replay_from_time"][0])
            hi = int(query["replay_to_time"][0]) if window else None
            past = [r for r in records if r["time"] >= lo and (hi is None or r["time"] < hi)]
        else:
            past = None
        if past is not None:
            for record in past:
                self.send_record(record)
                last = record["time"]
            self.wfile.write(b"event: replay_done\ndata: {}\n\n")
            self.wfile.flush()
            if window:
                return  # a closed window: answer, then close
        quiet = 0
        while True:
            sent = False
            for record in list(HISTORY):
                if record["time"] > last:
                    self.send_record(record)
                    last = record["time"]
                    sent = True
            quiet = 0 if sent else quiet + 1
            if quiet >= 15:  # a comment line is a heartbeat
                self.wfile.write(b": ping\n\n")
                self.wfile.flush()
                quiet = 0
            time.sleep(1)


if __name__ == "__main__":
    now = int(time.time()) // STEP * STEP
    for t in range(now - 1000 * STEP, now, STEP):  # synthetic backfill for replay
        HISTORY.append(make_record(t))
    threading.Thread(target=produce, daemon=True).start()
    ThreadingHTTPServer(("0.0.0.0", 8080), Feed).serve_forever()
```

Run it with `python feed_server.py`. It speaks plain HTTP on port 8080, and the platform accepts only secure URLs with a valid certificate on a publicly reachable address, so put it behind a reverse proxy or tunnel that terminates TLS (Caddy and nginx both do). For SSE, switch response buffering off in the proxy; in nginx that is `proxy_buffering off;`. Then put the public `https://` address into `sources.DataFeed(...)`.

### Rules the server has to follow

- **Time does not decrease.** Each record's `time` (Unix seconds, UTC) must be equal to or later than the previous one. An older record is dropped.
- **An equal timestamp is a revision.** A record with the same `time` as the previous one replaces it.
- **Flat JSON.** `data` is one flat object whose names match the dataclass fields. An unknown field, a missing non-optional field or a nested object drops the record. Nested dataclass fields use dotted names such as `"risk.beta"`.
- **Size and clock.** A record over 64 KiB is dropped, and so is one timestamped more than 5 minutes in the future.
- **Heartbeats.** If gaps between records can exceed `stale_after`, send a heartbeat. Over SSE a comment line (`: ping`) counts.
- **Never close on something unfamiliar.** An unknown frame or query parameter must not make the server hang up.
- **Replay is optional.** A server that ignores replay requests is a valid feed; indicators just get less warm-up.

### What the platform asks for

The first connection the platform opens to your feed carries a `replay_count` request (the last N records). It fills the platform's own record buffer (currently the last 1,000 records or 4 MiB per feed), which then serves live subscribers without asking you again. A chart launched from a date opens a short extra connection with `?replay_from_time=...&replay_to_time=...`, where `to_time` is exclusive. The server answers with the matching records, oldest first, then `event: replay_done`, and closes the connection. A chart launched by history depth is served from the buffer and never reaches your server.

### When something breaks

- A break between the platform and your server is not repaired: the platform reconnects and resumes with live records, so records published during the outage are lost.
- A failed feed stops the indicator with a code. The ones you will meet first: `external_feed_gone` (the server sent an error frame or answers 404 or 410), `external_feed_auth_failed` (401 or 403), `external_feed_bad_response` (a record that fails conversion to the schema, or is too large) and `external_feed_replay_interrupted` (a date-window run where the answer stopped without `replay_done`).

Reference: [Live data from a feed](https://takeprofit.com/docs/indie/External-data/Live-data-from-a-feed) and [Feed protocol and limits](https://takeprofit.com/docs/indie/External-data/Feed-protocol-and-limits).

## Also in v5.19

- **Second-based timeframes in inputs.** `@param.time_frame` now accepts second-based timeframes.
- **Private scripts and alerts in MCP.** The MCP server works with your own scripts and alerts, not only the public catalog. See [Your private scripts](https://takeprofit.com/docs/guide/platform/ai-assistant/Mcp-server-guide#your-private-scripts) and our guide to [AI coding with MCP](/docs/Vibe-Coding%20Indie%20Indicators%20AI%20with%20MCP.html).
- **Codex sign-in.** The Codex setup includes a `codex mcp login takeprofit` step, and Codex is listed among the supported MCP clients. See [Codex CLI integration](https://takeprofit.com/docs/guide/platform/ai-assistant/Mcp-server-guide#codex-cli-integration).
- **Fixes.** TPO and volume fixes in the script runner, updating an indicator from the update button on its pill, and the **New script** button in the IDE.

## How this was checked

- **Listings 1 and 2** (Heikin Ashi, Bollinger Bands with hex colors) compiled on the platform and ran on 5,000 candles without errors; the second reported three lines and one fill. The Heikin Ashi values were not compared bar by bar with another implementation.
- **Listing 3** (the feed indicator) was compiled only. A feed needs a public HTTPS address, so the full path from the platform to a live server was not exercised here.
- **The server** was run locally and queried with `curl` in every form of the protocol: live only, `replay_count`, a `replay_from_time` and `replay_to_time` window (answered, then closed), an empty window (`replay_done` alone) and `replay_from_time` alone. Timestamps came out strictly increasing and unique, with `replay_done` after the replayed records.
- **Docs version:** Indie v5.19.0, as published on 8 October 2026.

Related pages: [Indie quickstart](/docs/complete-guide-to-indie-quickstart.html), [Pine → Indie conversion pitfalls](/docs/pine-to-indie-conversion-pitfalls.html), [FAQ & solutions](/docs/indie-FAQ.html).

*Last updated: 8 October 2026*
