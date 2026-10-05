# Contributing

The site is built by GitHub Pages (Jekyll) straight from the `main` branch: push a change and it is live in about a minute. There is no build step to run locally.

## Add an indicator

Create a folder under `indicators/` and put the write-up and the source files next to each other:

```
indicators/
  Chande Momentum Oscillator/          <- folder name = display name and URL
    README.md                          <- the page
    Chande Momentum Oscillator.indie5  <- Indie v5 source
    Chande Momentum Oscillator.pinescript5   <- Pine Script original (optional)
```

`README.md` starts with front matter that puts the indicator into a category, followed by a level-one heading (it becomes the page title):

```markdown
---
category: oscillators
---
# Chande Momentum Oscillator - Indie Port

What it measures, how to read it, parameters, notes on the port...
```

That is all. The catalog, the category page, the sidebar, the home page counters, search and the source viewer pick the new folder up on the next build.

### Categories

| `category:` | Section |
| --- | --- |
| `moving-averages` | Moving averages |
| `oscillators` | Oscillators |
| `trend` | Trend |
| `volatility` | Volatility |
| `volume` | Volume |
| `support-resistance` | Support & resistance |
| `patterns` | Candlestick patterns |
| `demos` | Demos & templates |
| `other` | Other (also the fallback when `category` is missing or unknown) |

To add a category: add an entry to `categories` in `_data/portal.yml` and create `indicators/<id>/index.html` containing only front matter (`kind: category`, `category: <id>`, `title: ...`) - copy any existing one.

### Source file names

The viewer and the language badges rely on the file extension:

| Extension | Shown as |
| --- | --- |
| `.indie5`, `.indie4` | Indie v5, Indie v4 |
| `.pinescript5` (`3`, `4`, `6`) | Pine Script v5 (v3, v4, v6) |
| `.pinescript` | Pine Script |
| `.strategy.pinescript5` | Pine Script v5, tagged "strategy" |

Several versions of one script can live in the same folder; add a suffix before the extension (`Name v2.indie5`).

### Rules of thumb

- Do not rename or move existing folders and docs: the path is the public URL.
- Folder names must not start with `_` (Jekyll skips them) and must not match a category id.
- One `README.md` per indicator folder; no `index.md` / `index.html` inside it.
- Images go next to the README and are referenced relatively: `![Chart](indicator.png)`.

## Add a doc

Drop a markdown file into `docs/`. It starts with a level-one heading (the page title). To give it a short menu label, an icon and a place in the top navigation, add an entry to `docs` in `_data/portal.yml`; without one the page still appears in the sidebar under its own title.

## Change the design

Layout lives in `_layouts/default.html` and `_includes/`, styles in `assets/css/portal.css`, behaviour in `assets/js/portal.js`. Pushing to a branch named `redesign` runs the `preview-build` workflow, which builds the site exactly like GitHub Pages does and attaches the result as an artifact - use it to check a layout change before it reaches `main`.
