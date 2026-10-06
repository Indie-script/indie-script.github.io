# Vibe-Coding Indie Indicators with AI and the TakeProfit MCP Server

The TakeProfit MCP server connects AI assistants such as Claude, Codex, Cursor and VS Code to the Indie® compiler, the documentation, your private scripts, alerts, watchlists and backtests. You describe the indicator or strategy in plain words, and the assistant writes the code, compiles it on the real runtime and fixes its own errors before handing it over.

> [!NOTE]
> This is an unofficial community guide. The official setup guide is the [MCP Server Setup Guide](https://takeprofit.com/docs/guide/platform/ai-assistant/Mcp-server-guide).

---

## What the server does

MCP (Model Context Protocol) is an open standard that lets an AI client call tools on a remote server. The TakeProfit server exposes tools in five areas:

- **Write and check Indie code.** Create, read, edit and overwrite a script, then compile it, or run it on market data.
- **Look things up.** Search the Indie documentation and the platform documentation, find built-in indicators, and search community indicators in the Marketplace.
- **Work with your account.** List your private scripts, load one into the conversation, and save changes back as a new version.
- **Manage alerts and watchlists.** Create, change, pause and review alerts, including alerts on a private indicator you never published. Read and edit watchlists.
- **Backtest strategies.** Read a strategy's parameters, run a backtest on one instrument and timeframe, and page through the orders and trades.

Sign-in uses your normal TakeProfit account through OAuth. There are no API keys to create or paste. Until you approve the connection in the browser, the TakeProfit tools stay unavailable in your client.

> [!NOTE]
> The assistant sees what you see on the platform, and only that. It cannot read the source of built-in, published or other users' indicators.

## Connect your client

The server address is `https://mcp.takeprofit.com/mcp`. The steps below follow the official guide, which also has screenshots.

### Claude and Claude Desktop

1. Open **Settings → Connectors** in Claude or Claude Desktop and choose **Add custom connector**.
2. Enter the name `TakeProfit` and the URL `https://mcp.takeprofit.com/mcp`.
3. Open **Configure** for the new connector and make sure all tools are enabled.
4. Sign in to TakeProfit when asked, return to the chat and test it (see [Test the connection](#test-the-connection)).

### Claude Code

Run this in your terminal, not inside the chat:

```bash
claude mcp add --transport http takeprofit https://mcp.takeprofit.com/mcp
```

Start `claude`, type `/mcp`, pick **takeprofit** and choose **Authenticate**. A browser window opens for TakeProfit sign-in. Until then the server is listed as needing authentication.

### Codex

```bash
codex mcp add takeprofit --url https://mcp.takeprofit.com/mcp
codex mcp login takeprofit
```

The second command opens the TakeProfit sign-in page. Check the result with `/mcp` inside Codex.

### Cursor

Open **Cursor Settings → Tools & Integrations** (or **MCP**, depending on the version), choose **Add Custom MCP** and add:

```json
{
  "mcpServers": {
    "TakeProfit": {
      "url": "https://mcp.takeprofit.com/mcp"
    }
  }
}
```

Cursor asks you to approve the first tool call. Pick a model that supports MCP tools.

### VS Code

Run **MCP: Open User Configuration** from the command palette and add:

```json
{
  "servers": {
    "TakeProfit": {
      "url": "https://mcp.takeprofit.com/mcp"
    }
  }
}
```

Then open chat in agent mode, enable the TakeProfit tools from the **Tools** button and approve the call when asked.

### Clients without remote MCP support

Some applications only run local MCP servers. The `mcp-remote` npm package can bridge to the remote server. In Claude Desktop, for example, the config entry is:

```json
{
  "mcpServers": {
    "TakeProfit": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.takeprofit.com/mcp"]
    }
  }
}
```

This needs Node.js. Restart the application after saving the file.

### Test the connection

Ask the assistant:

- `Get the Indie docs TOC using TakeProfit MCP.`
- `Generate an SMA indicator in Indie and validate it using TakeProfit MCP.`

If the tools run, you are connected. Then paste the resulting code into the [indicator code editor](https://takeprofit.com/docs/guide/platform/ide-widget/IDE-overview) on the platform to see it on a chart.

## What the assistant can call

The tool names below are those exposed by the server at the time of writing. The set grows between releases, so check the [Indie changelog](https://takeprofit.com/docs/indie/Changelog) for additions.

| Area | Tools |
| - | - |
| Scripts | `TakeProfit_CreateScript`, `TakeProfit_ReadScript`, `TakeProfit_WriteScript`, `TakeProfit_EditScript`, `TakeProfit_ValidateScript` |
| Your platform scripts | `TakeProfit_ListUserScripts`, `TakeProfit_LoadPlatformScript`, `TakeProfit_SaveScript` |
| Indie docs and rules | `TakeProfit_GetPlaybook`, `TakeProfit_GetIndieDocsTOC`, `TakeProfit_SearchIndieDocs`, `TakeProfit_GrepIndieDocs`, `TakeProfit_GetDocsChapters` |
| Platform docs | `TakeProfit_GetPlatformDocsTOC`, `TakeProfit_SearchPlatformDocs` |
| Finding indicators and tickers | `TakeProfit_SearchBuiltinsIndicators`, `TakeProfit_SearchMarketplaceIndicators`, `TakeProfit_SearchTickers` |
| Alerts | `TakeProfit_CreateAlert`, `TakeProfit_GetAlert`, `TakeProfit_UpdateAlert`, `TakeProfit_DeleteAlert`, `TakeProfit_ListAlerts`, `TakeProfit_SetAlertState`, `TakeProfit_PreviewAlert`, `TakeProfit_GetUserAlertLog`, `TakeProfit_GetAlertSchema`, `TakeProfit_GetAlertDocs`, `TakeProfit_ListAlertDocs` |
| Watchlists | `TakeProfit_ListWatchlists`, `TakeProfit_GetWatchlist`, `TakeProfit_CreateWatchlist`, `TakeProfit_EditWatchlistSecurities`, `TakeProfit_DeleteWatchlist` |
| Strategy backtests | `TakeProfit_GetStrategyInfo`, `TakeProfit_RunBacktest`, `TakeProfit_GetBacktestReport`, `TakeProfit_ReleaseBacktest` |

How validation works:

- `TakeProfit_ValidateScript` runs in three modes. `compile` checks that the script compiles. `runtime_quick` also runs it on a small window of market data (about 5,000 candles). `runtime_full` runs it on a larger window (about 20,000 candles) and can take 1-2 minutes, so it is meant for the final check.
- `TakeProfit_GetPlaybook` returns the Indie rules and a step-by-step workflow for one task: write, edit, fix, optimize or migrate. The server tells the assistant to read it before it writes code, so you rarely need to ask.

The server also ships ready-made prompts, which clients that support MCP prompts list as commands: `indie_write_indicator`, `indie_edit_script`, `indie_fix_errors`, `indie_optimize` and `indie_migrate`.

## Example prompts

**Write a new indicator**

```text
Write an indicator that shows a green column when the 10-period SMA is above
the 30-period SMA and volume is above its 20-bar average, a red column when
it is below, and nothing otherwise. Make the lengths inputs. Validate it.
```

**Find an existing one first**

```text
Search the TakeProfit Marketplace and the built-in indicators for a
volatility-adjusted RSI. Recommend one before writing anything new.
```

**Convert a script**

```text
Convert this Pine Script indicator to Indie, keep the logic the same,
and validate the result on the compiler. [paste code]
```

**Fix errors**

```text
This Indie script fails to compile. Explain the error, fix it, and keep
the original logic unchanged. [paste code]
```

**Work on your own script and add an alert**

```text
Load my "ATR Bands" indicator, add an input for the multiplier, validate
it and save it as a new version. Then create an alert on the upper band
for BTC/USDT.
```

**Test a strategy**

```text
Backtest my "SMA Cross Strategy" on BTC/USDT, 1 hour, for the last 6 months.
Then run it again with the fast SMA at 9 instead of 20 and compare the two.
```

## A typical workflow

1. **Describe the idea.** Give inputs, conditions and what you want to see: lines, markers, colored candles.
2. **The assistant checks the rules and the docs.** It reads the playbook and looks up any symbol it is unsure about.
3. **It writes and compiles the script.** Errors come back from the real compiler and the assistant corrects them. A runtime check follows once the script compiles.
4. **You review the code.** Ask the assistant to explain it line by line. The code is yours to read and judge.
5. **Save and test on a chart.** Ask the assistant to save the script to your platform scripts, or paste it into the IDE and press **Add to Chart**.
6. **Iterate in plain language.** Ask for a parameter, a color change or an extra condition. If the script is a strategy, ask for a backtest and tune from the report.
7. **Optionally add an alert or publish.** Alerts can be set on a saved private indicator without publishing it. Marketplace publishing is done in the IDE, see [Sell your indicators](https://takeprofit.com/docs/guide/monetization-tools/Sell-your-indicators).

## What the result looks like

For the first prompt above, a valid Indie script looks like this. It compiles and runs on the platform:

```python
# indie:lang_version = 5
from indie import indicator, param, plot, color
from indie.algorithms import Sma

@indicator('Volume-Confirmed Trend')
@param.int('fast_length', default=10, min=1, title='Fast MA')
@param.int('slow_length', default=30, min=1, title='Slow MA')
@param.int('volume_length', default=20, min=1, title='Volume MA')
@plot.columns(title='Trend signal')
def Main(self, fast_length, slow_length, volume_length):
    ma_fast = Sma.new(self.close, fast_length)
    ma_slow = Sma.new(self.close, slow_length)
    vol_avg = Sma.new(self.volume, volume_length)

    high_volume = self.volume[0] > vol_avg[0]

    signal = 0.0
    sig_color = color.GRAY
    if high_volume and ma_fast[0] > ma_slow[0]:
        signal = 1.0
        sig_color = color.GREEN
    elif high_volume and ma_fast[0] < ma_slow[0]:
        signal = -1.0
        sig_color = color.RED

    return plot.Columns(signal, color=sig_color)
```

A few things worth noticing, and worth checking in anything an assistant generates:

- It starts with `# indie:lang_version = 5` and imports what it uses.
- Algorithms such as `Sma` are called with `.new(...)` and read with `[0]`.
- Parameters are `@param.*` decorators, and the function signature receives them.
- There is no `plot(...)` function and no `? :` ternary. Indie returns values from `Main` and uses Python's `x if cond else y`.

> [!WARNING]
> Pine Script syntax such as `ta.sma(close, 10)`, `plot(...)`, `//` comments and `?:` does not compile in Indie. If an assistant produces it, it is not using the Indie rules. Ask it to call `TakeProfit_GetPlaybook` and validate the script.

## Limits and good practice

- **Compile success is not correctness.** A script can compile and still compute the wrong thing. Review the logic, and check the output on a chart.
- **Indicators cannot be backtested.** Only strategies can. A backtest is a simulation on historical data, and results do not predict future performance.
- **Backtest runs are temporary.** Each response says when the run expires. An expired run is not recreated silently, so ask for a new one. Reading a report back pages through up to 500 orders or trades at a time.
- **Script length.** The official guide says the workflow works best for code of roughly 200-300 lines. For longer scripts, split the work across several prompts or chats.
- **Watchlists.** A new watchlist can be pre-filled with up to 50 instruments. Deleting a watchlist is permanent, and the tool requires the exact title as confirmation. Built-in lists are not exposed. Duplicate one into your own lists first.
- **Your own scripts only.** Loading a script never exposes built-in, published or another user's source code. A script with unsaved local changes is not overwritten silently.
- **External data.** Scripts that read external CSV or feed data cannot be published to the Marketplace.
- **Assistant plan limits.** Long scripts need a client with enough context. Limits and pricing of Claude, Codex, Cursor or VS Code are set by their vendors, not by TakeProfit.
- **No financial advice.** The assistant generates code from your instructions. Decisions to trade are yours.

## Troubleshooting

- **Tools are not listed, or the server shows "Needs authentication".** Complete the TakeProfit sign-in. In Claude Code use `/mcp` → **takeprofit** → **Authenticate**. In Codex run `codex mcp login takeprofit`.
- **A newly added server is missing.** Some clients load servers only in chats started after it was added. Open a new chat.
- **`node not found`** with `mcp-remote`. Install Node.js (LTS), restart the application and check `node --version`.
- **The server does not connect.** Check your connection and that the config file was saved, then restart the application.

## Links

- [MCP Server Setup Guide](https://takeprofit.com/docs/guide/platform/ai-assistant/Mcp-server-guide): official, with screenshots and the full tool descriptions.
- [AI assistant in the IDE](https://takeprofit.com/docs/guide/platform/ai-assistant/AI-assistant-IDE): the built-in assistant, which also converts scripts from Pine Script or MQL5.
- [Alerts via AI (MCP)](https://takeprofit.com/docs/guide/alerts/Alerts-overview#creating-alerts-via-ai-mcp): alert management details.
- [Indie Quickstart](complete-guide-to-indie-quickstart.html): the language basics in this guide's style.
- [Pine Script to Indie cheat sheet](/docs/): a syntax comparison for conversions.
