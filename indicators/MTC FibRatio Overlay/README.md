# MTC FibRatio Overlay - Technical Guide

> Displays a cheat sheet of Fibonacci ratio ranges for 24 harmonic patterns as labelled overlays on the chart.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Candlestick patterns |
| **Type** | Indicator |
| **Author** | @mustermann84 on TakeProfit |
| **License** | MIT |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/mtc-fibratio-overlay-19) |
| **Source file** | [MTC FibRatio Overlay.indie5](MTC%20FibRatio%20Overlay.indie5) |

## Overview

The MTC FibRatio Overlay is a reference indicator that places static text labels directly on the chart, each showing the name of a harmonic pattern together with the Fibonacci retracement/extension ranges for the key legs (X→B, A→C, B→D, X→D). It is intended as a quick visual aid for traders who manually identify patterns such as Gartley, Butterfly, Bat, Crab, Cypher, Shark, and many exotic variants.

The labels are drawn at the bottom-left of the chart (fixed position relative to the pane) and stack vertically as more patterns are enabled. Each label uses white text on a semi-transparent black background for readability. The indicator does not perform any calculation – it simply outputs the known ratio intervals that define each pattern, making it a static cheat sheet that updates only when settings are changed.

## How it works

1. Initialises a vertical position variable at 0.01 (near bottom-left corner).
2. For each of the 24 harmonic patterns, checks the corresponding boolean parameter (e.g., show_gartley).
3. If enabled, creates a new LabelRel instance using Var[LabelRel].new() to hold a mutable reference.
4. Sets the label text to the pattern name and four Fibonacci ratio ranges (e.g., X→B: 0.382 – 0.618).
5. Configures font size (8), white text color, and semi-transparent black background.
6. Draws the label on the chart with self.chart.draw() then increments the vertical position by 0.06.
7. Repeats for every pattern, producing a stack of labels from bottom upward.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `show_gartley` | bool | true |  | Gartley anzeigen |
| `show_butterfly` | bool | true |  | Butterfly anzeigen |
| `show_bat` | bool | true |  | Bat anzeigen |
| `show_crab` | bool | true |  | Crab anzeigen |
| `show_deep_crab` | bool | true |  | Deep Crab anzeigen |
| `show_cypher` | bool | true |  | Cypher anzeigen |
| `show_shark` | bool | true |  | Shark anzeigen |
| `show_black_swan` | bool | true |  | Black Swan anzeigen |
| `show_max_butterfly` | bool | false |  | Max Butterfly anzeigen |
| `show_max_gartley` | bool | false |  | Max Gartley anzeigen |
| `show_navarro200` | bool | false |  | Navarro 200 anzeigen |
| `show_white_swan` | bool | false |  | White Swan anzeigen |
| `show_strong_henry` | bool | false |  | Strong Henry anzeigen |
| `show_five_zero` | bool | false |  | 5-0 anzeigen |
| `show_butterfly113` | bool | false |  | Butterfly 113 anzeigen |
| `show_three_drives` | bool | false |  | Three Drives anzeigen |
| `show_nen_star` | bool | false |  | Nen Star anzeigen |
| `show_a_nen_star` | bool | false |  | A Nen Star anzeigen |
| `show_leonardo` | bool | false |  | Leonardo anzeigen |
| `show_anti_crab` | bool | false |  | Anti Crab anzeigen |
| `show_anti_shark` | bool | false |  | Anti Shark anzeigen |
| `show_alt_bat` | bool | false |  | Alt Bat anzeigen |
| `show_pattern121` | bool | false |  | 121 anzeigen |
| `show_a_alt_shark` | bool | false |  | A Alt Shark anzeigen |

## Code walkthrough

### Parameter declarations and initialisation

Lines 6-43 of [MTC FibRatio Overlay.indie5](MTC%20FibRatio%20Overlay.indie5):

```python
@indicator('MTC Pattern FibRatio Overlay)', overlay_main_pane=True)
# === Standard (default = True) ===
@param.bool('show_gartley', default=True, title='Gartley anzeigen')
@param.bool('show_butterfly', default=True, title='Butterfly anzeigen')
@param.bool('show_bat', default=True, title='Bat anzeigen')
@param.bool('show_crab', default=True, title='Crab anzeigen')
@param.bool('show_deep_crab', default=True, title='Deep Crab anzeigen')
@param.bool('show_cypher', default=True, title='Cypher anzeigen')
@param.bool('show_shark', default=True, title='Shark anzeigen')
@param.bool('show_black_swan', default=True, title='Black Swan anzeigen')

# === Erweiterte / Exotische (default = False) ===
@param.bool('show_max_butterfly', default=False, title='Max Butterfly anzeigen')
@param.bool('show_max_gartley', default=False, title='Max Gartley anzeigen')
@param.bool('show_navarro200', default=False, title='Navarro 200 anzeigen')
@param.bool('show_white_swan', default=False, title='White Swan anzeigen')
@param.bool('show_strong_henry', default=False, title='Strong Henry anzeigen')
@param.bool('show_five_zero', default=False, title='5-0 anzeigen')
@param.bool('show_butterfly113', default=False, title='Butterfly 113 anzeigen')
@param.bool('show_three_drives', default=False, title='Three Drives anzeigen')
@param.bool('show_nen_star', default=False, title='Nen Star anzeigen')
@param.bool('show_a_nen_star', default=False, title='A Nen Star anzeigen')
@param.bool('show_leonardo', default=False, title='Leonardo anzeigen')

# === Anti-Muster / Alternativ (default = False) ===
@param.bool('show_anti_crab', default=False, title='Anti Crab anzeigen')
@param.bool('show_anti_shark', default=False, title='Anti Shark anzeigen')
@param.bool('show_alt_bat', default=False, title='Alt Bat anzeigen')
@param.bool('show_pattern121', default=False, title='121 anzeigen')
@param.bool('show_a_alt_shark', default=False, title='A Alt Shark anzeigen')

def Main(self,
         show_gartley, show_butterfly, show_bat, show_crab, show_deep_crab, show_cypher, show_shark, show_black_swan,
         show_max_butterfly, show_max_gartley, show_navarro200, show_white_swan, show_strong_henry,
         show_five_zero, show_butterfly113, show_three_drives, show_nen_star, show_a_nen_star, show_leonardo,
         show_anti_crab, show_anti_shark, show_alt_bat, show_pattern121, show_a_alt_shark):

    position = 0.01  # Startposition (unten links). Nach jedem Label += 0.06
```

The indicator is declared with overlay_main_pane=True so labels are drawn on the price chart. A series of @param.bool decorators (lines 8-35) creates UI toggles for each pattern. The Main function receives all these booleans and initialises a position variable at 0.01, which controls the vertical placement of the first label.

### Single pattern label block (Crab example)

Lines 50-57 of [MTC FibRatio Overlay.indie5](MTC%20FibRatio%20Overlay.indie5):

```python
    if show_crab:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "CRAB\nX→B: 0.382 – 0.618\nA→C: 0.382 – 0.886\nB→D: 2.240 – 3.618\nX→D: 1.618 – 1.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06
```

When show_crab is True, a new LabelRel is created inside a Var[LabelRel] wrapper (a mutable container required for drawing objects). The label text includes the pattern name and four ratio lines. Font size 8 and white text with semi-transparent black background are set for readability. After drawing, position is incremented by 0.06 to place the next label below.

### Exotic patterns (Max Butterfly, Cypher, etc.)

Lines 119-137 of [MTC FibRatio Overlay.indie5](MTC%20FibRatio%20Overlay.indie5):

```python
    # MAX BUTTERFLY
    if show_max_butterfly:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "MAX BUTTERFLY\nX→B: 0.618 – 0.886\nA→C: 0.382 – 0.886\nB→D: 1.272 – 2.618\nX→D: 1.272 – 1.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # CYPHER
    if show_cypher:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "CYPHER\nX→B: 0.382 – 0.618\nA→C: 1.130 – 1.414\nB→D: 1.272 – 2.000\nX→D: 0.786 – 0.786"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06
```

The same pattern repeats for 23 additional patterns, covering both standard (e.g., Gartley, Butterfly) and exotic variants (e.g., Max Butterfly, Cypher). Each uses the same styling and positioning logic. The code is highly repetitive, reflecting the cheat-sheet nature of the indicator.

### Alternative / anti-patterns section

Lines 203-211 of [MTC FibRatio Overlay.indie5](MTC%20FibRatio%20Overlay.indie5):

```python
    # ANTI CRAB
    if show_anti_crab:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "ANTI CRAB\nX→B: 0.276 – 0.446\nA→C: 1.128 – 2.618\nB→D: 1.618 – 2.618\nX→D: 0.618 – 0.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06
```

Patterns marked as 'anti' (Anti Crab, Anti Shark) or alternative (Alt Bat, 121, A Alt Shark) are gated behind separate boolean parameters. Their ratio ranges differ from the standard counterparts, but the drawing mechanics are identical.

## Reading the chart

All labels are painted in the chart's bottom-left corner, stacked vertically. Each label shows the pattern name in uppercase and four lines of Fibonacci ratio ranges. Enabled patterns appear as a list; disabled patterns are omitted. The colours are fixed: white text on a black background at 80% opacity. There are no lines, markers, or dynamic signals – the indicator serves solely as a static reference overlay.

## Implementation notes

- The indicator redraws all labels on every bar because Main runs per bar, but the content never changes (no time-series data is used).
- Labels are placed using RelativePosition with va.BOTTOM and ha.LEFT, anchored at 95% from the left and the current vertical offset from bottom.
- If many patterns are enabled, labels may extend below the visible chart area; users can scroll down or disable patterns via the boolean toggles.
- The code uses Var[LabelRel] to obtain a mutable reference; label properties are set via .get() and discarded after drawing – the Var itself is recreated each bar.

## FAQ

**How do I enable or disable specific patterns?**

In the indicator settings, toggle the boolean parameters corresponding to each pattern name. For example, set 'Gartley anzeigen' to false to remove the Gartley label.

**Can I change the text colour or background?**

Yes, modify the text_color or bg_color properties in the pattern block (e.g., line 54). The background uses color.BLACK(0.8) for 80% opacity; you can change the alpha value or use a different colour.

**Why are the labels redrawn every bar? Does this cause repainting?**

Labels are redrawn on each bar because Main runs repeatedly, but since the text and position are identical every bar, there is no visible repainting or flickering. The indicator does not rely on price data, so it behaves as a static overlay.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/mtc-fibratio-overlay-19).

```python
# indie:lang_version = 5
from indie import indicator, param, Var
from indie.drawings import LabelRel, RelativePosition, vertical_anchor as va, horizontal_anchor as ha
from indie import color

@indicator('MTC Pattern FibRatio Overlay)', overlay_main_pane=True)
# === Standard (default = True) ===
@param.bool('show_gartley', default=True, title='Gartley anzeigen')
@param.bool('show_butterfly', default=True, title='Butterfly anzeigen')
@param.bool('show_bat', default=True, title='Bat anzeigen')
@param.bool('show_crab', default=True, title='Crab anzeigen')
@param.bool('show_deep_crab', default=True, title='Deep Crab anzeigen')
@param.bool('show_cypher', default=True, title='Cypher anzeigen')
@param.bool('show_shark', default=True, title='Shark anzeigen')
@param.bool('show_black_swan', default=True, title='Black Swan anzeigen')

# === Erweiterte / Exotische (default = False) ===
@param.bool('show_max_butterfly', default=False, title='Max Butterfly anzeigen')
@param.bool('show_max_gartley', default=False, title='Max Gartley anzeigen')
@param.bool('show_navarro200', default=False, title='Navarro 200 anzeigen')
@param.bool('show_white_swan', default=False, title='White Swan anzeigen')
@param.bool('show_strong_henry', default=False, title='Strong Henry anzeigen')
@param.bool('show_five_zero', default=False, title='5-0 anzeigen')
@param.bool('show_butterfly113', default=False, title='Butterfly 113 anzeigen')
@param.bool('show_three_drives', default=False, title='Three Drives anzeigen')
@param.bool('show_nen_star', default=False, title='Nen Star anzeigen')
@param.bool('show_a_nen_star', default=False, title='A Nen Star anzeigen')
@param.bool('show_leonardo', default=False, title='Leonardo anzeigen')

# === Anti-Muster / Alternativ (default = False) ===
@param.bool('show_anti_crab', default=False, title='Anti Crab anzeigen')
@param.bool('show_anti_shark', default=False, title='Anti Shark anzeigen')
@param.bool('show_alt_bat', default=False, title='Alt Bat anzeigen')
@param.bool('show_pattern121', default=False, title='121 anzeigen')
@param.bool('show_a_alt_shark', default=False, title='A Alt Shark anzeigen')

def Main(self,
         show_gartley, show_butterfly, show_bat, show_crab, show_deep_crab, show_cypher, show_shark, show_black_swan,
         show_max_butterfly, show_max_gartley, show_navarro200, show_white_swan, show_strong_henry,
         show_five_zero, show_butterfly113, show_three_drives, show_nen_star, show_a_nen_star, show_leonardo,
         show_anti_crab, show_anti_shark, show_alt_bat, show_pattern121, show_a_alt_shark):

    position = 0.01  # Startposition (unten links). Nach jedem Label += 0.06

    # -------------------------
    # Bild 2 Muster (aus Liste 2)
    # -------------------------

    # CRAB
    if show_crab:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "CRAB\nX→B: 0.382 – 0.618\nA→C: 0.382 – 0.886\nB→D: 2.240 – 3.618\nX→D: 1.618 – 1.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # 5-0
    if show_five_zero:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "5-0\nX→B: 1.128 – 1.618\nA→C: 1.618 – 2.236\nB→D: 0.500 – 0.500\nX→D: 0.0 – 0.0"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # STRONG HENRY
    if show_strong_henry:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "STRONG HENRY\nX→B: 0.128 – 2.618\nA→C: 0.440 – 0.618\nB→D: 0.618 – 0.886\nX→D: 0.618 – 1.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # BUTTERFLY (Bild 2)
    if show_butterfly:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "BUTTERFLY\nX→B: 0.786 – 0.786\nA→C: 0.382 – 0.886\nB→D: 1.618 – 2.618\nX→D: 1.272 – 1.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # DEEP CRAB (Bild 2)
    if show_deep_crab:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "DEEP CRAB\nX→B: 0.886 – 0.886\nA→C: 0.382 – 0.886\nB→D: 2.618 – 3.618\nX→D: 1.618 – 1.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # WHITE SWAN
    if show_white_swan:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "WHITE SWAN\nX→B: 0.382 – 0.724\nA→C: 2.000 – 4.237\nB→D: 0.500 – 0.886\nX→D: 0.382 – 0.886"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # BLACK SWAN
    if show_black_swan:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "BLACK SWAN\nX→B: 1.382 – 2.618\nA→C: 0.236 – 0.500\nB→D: 1.128 – 2.000\nX→D: 1.128 – 2.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # MAX BUTTERFLY
    if show_max_butterfly:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "MAX BUTTERFLY\nX→B: 0.618 – 0.886\nA→C: 0.382 – 0.886\nB→D: 1.272 – 2.618\nX→D: 1.272 – 1.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # CYPHER
    if show_cypher:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "CYPHER\nX→B: 0.382 – 0.618\nA→C: 1.130 – 1.414\nB→D: 1.272 – 2.000\nX→D: 0.786 – 0.786"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # A NEN STAR
    if show_a_nen_star:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "A NEN STAR\nX→B: 0.500 – 0.886\nA→C: 0.467 – 0.707\nB→D: 1.618 – 2.618\nX→D: 0.786 – 0.786"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # THREE DRIVES
    if show_three_drives:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "THREE DRIVES\nX→B: 0.618 – 0.618\nA→C: 1.272 – 1.272\nB→D: 0.618 – 0.618\nX→D: 1.272 – 1.272"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # BUTTERFLY 113
    if show_butterfly113:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "BUTTERFLY 113\nX→B: 0.786 – 1.000\nA→C: 0.618 – 1.000\nB→D: 1.128 – 1.618\nX→D: 1.128 – 1.128"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # -------------------------
    # Bild 1 Muster (aus Liste 1)
    # -------------------------

    # SHARK
    if show_shark:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "SHARK\nX→B: 0.382 – 0.618\nA→C: 1.128 – 1.618\nB→D: 1.618 – 2.236\nX→D: 0.886 – 0.886"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # GARTLEY
    if show_gartley:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "GARTLEY\nX→B: 0.618 – 0.618\nA→C: 0.382 – 0.886\nB→D: 1.272 – 1.618\nX→D: 0.786 – 0.786"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # BAT (Bild 1)
    if show_bat:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "BAT\nX→B: 0.382 – 0.500\nA→C: 0.382 – 0.886\nB→D: 1.618 – 2.618\nX→D: 0.886 – 0.886"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # ANTI CRAB
    if show_anti_crab:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "ANTI CRAB\nX→B: 0.276 – 0.446\nA→C: 1.128 – 2.618\nB→D: 1.618 – 2.618\nX→D: 0.618 – 0.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # ANTI SHARK
    if show_anti_shark:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "ANTI SHARK\nX→B: 0.446 – 0.618\nA→C: 0.618 – 0.886\nB→D: 1.618 – 2.618\nX→D: 1.128 – 1.128"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # MAX GARTLEY
    if show_max_gartley:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "MAX GARTLEY\nX→B: 0.382 – 0.618\nA→C: 0.382 – 0.886\nB→D: 1.128 – 2.236\nX→D: 0.618 – 0.786"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # ALT BAT
    if show_alt_bat:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "ALT BAT\nX→B: 0.382 – 0.382\nA→C: 0.382 – 0.886\nB→D: 2.000 – 3.618\nX→D: 1.128 – 1.128"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # 121
    if show_pattern121:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "121\nX→B: 0.618 – 0.786\nA→C: 1.272 – 2.000\nB→D: 0.447 – 0.618\nX→D: 0.500 – 0.618"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # A ALT SHARK
    if show_a_alt_shark:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "A ALT SHARK\nX→B: 0.446 – 0.618\nA→C: 0.886 – 1.272\nB→D: 1.618 – 2.618\nX→D: 0.886 – 0.886"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # NEN STAR (von Bild 1)
    if show_nen_star:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "NEN STAR\nX→B: 0.382 – 0.618\nA→C: 1.414 – 2.140\nB→D: 1.128 – 2.000\nX→D: 1.272 – 1.272"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # NAVARRO 200
    if show_navarro200:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "NAVARRO 200\nX→B: 0.382 – 0.786\nA→C: 0.886 – 1.128\nB→D: 0.886 – 3.618\nX→D: 0.886 – 1.128"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # LEONARDO
    if show_leonardo:
        label_var = Var[LabelRel].new(LabelRel("", RelativePosition(va.BOTTOM, ha.LEFT, 0.95, position)))
        label_var.get().text = "LEONARDO\nX→B: 0.500 – 0.500\nA→C: 0.382 – 0.886\nB→D: 1.128 – 2.618\nX→D: 0.786 – 0.786"
        label_var.get().font_size = 8
        label_var.get().text_color = color.WHITE
        label_var.get().bg_color = color.BLACK(0.8)
        self.chart.draw(label_var.get())
        position += 0.06

    # Ende
    return
```
