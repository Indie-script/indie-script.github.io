# Trading Windows - Technical Guide

> Highlights and labels trading sessions (Asia, London, US) with colored background zones and boundary markers on intraday charts.

| | |
| --- | --- |
| **Language** | Indie Script v5 |
| **Platform** | [TakeProfit](https://takeprofit.com) |
| **Category** | Support & resistance |
| **Type** | Indicator |
| **Author** | @nightranger on TakeProfit |
| **License** | licensed under the MIT License (see the header of the source file) |
| **Live script** | [Open on TakeProfit](https://takeprofit.com/indicator/trading-windows-33) |
| **Source file** | [Trading Windows.indie5](Trading%20Windows.indie5) |

## Overview

This indicator visualizes up to three configurable trading sessions directly on the chart pane. Each session is drawn as a semi-transparent colored background zone with dashed outline borders at the session start and end bars. The indicator also places a text label at the midpoint of each session once per day.

The indicator is designed for intraday timeframes (below 1 day) and helps traders quickly identify which major market session is currently active. It supports overnight sessions (e.g., 22:00-03:00), weekday-only filtering, and automatic DST adjustments for several timezones.

## How it works

1. Parse user-provided HHMM start/end times for Asia, London, and US sessions, normalizing values to valid 24-hour format.
2. Convert the current bar's UTC timestamp to the selected timezone and extract the day-of-week and HHMM time.
3. Check if the current bar overlaps with each session's time window, handling overnight sessions that cross midnight.
4. Detect session boundaries by comparing the current bar's session state with the previous bar's state.
5. Paint background zones with the configured color on bars that overlap a session, extending one extra bar at session end for visual continuity.
6. Place a text label at the midpoint of each session once per day, using the session name and color.

## Parameters

| Parameter | Type | Default | Range | Description |
| --- | --- | --- | --- | --- |
| `use_default_settings` | bool | true |  | Use Default Settings (Preset Lock) |
| `show_session_zones` | bool | true |  | Show Session Zones |
| `show_session_boundaries` | bool | true |  | Show Session Boundary Bars |
| `show_session_labels` | bool | true |  | Show Session Labels |
| `weekdays_only` | bool | true |  | Weekdays Only (Mon-Fri) |
| `enable_asia` | bool | true |  | Enable Asia Session |
| `asia_name` | str | Asia |  | Session 1 Name |
| `asia_start` | str | 0000 |  | Asia Start (HHMM) |
| `asia_end` | str | 0900 |  | Asia End (HHMM) |
| `asia_zone_color` | color | color.AQUA(0.08 |  | Asia Zone Color |
| `enable_london` | bool | true |  | Enable London Session |
| `london_name` | str | London |  | Session 2 Name |
| `london_start` | str | 0800 |  | London Start (HHMM) |
| `london_end` | str | 1700 |  | London End (HHMM) |
| `london_zone_color` | color | color.YELLOW(0.08 |  | London Zone Color |
| `enable_us` | bool | true |  | Enable US Session |
| `us_name` | str | US |  | Session 3 Name |
| `us_start` | str | 1430 |  | US Start (HHMM) |
| `us_end` | str | 2100 |  | US End (HHMM) |
| `us_zone_color` | color | color.BLUE(0.08 |  | US Zone Color |

## Code walkthrough

### HHMM Parsing and Normalization

Lines 14-47 of [Trading Windows.indie5](Trading%20Windows.indie5):

```python
def _normalize_hhmm(value: int) -> int:
    hours = value // 100
    minutes = value % 100

    if hours < 0:
        hours = 0
    if hours > 23:
        hours = 23
    if minutes < 0:
        minutes = 0
    if minutes > 59:
        minutes = 59

    return (hours * 100) + minutes


def _parse_hhmm_text(value: str, fallback: int) -> int:
    length = len(value)

    if length == 0:
        return _normalize_hhmm(fallback)

    if length <= 2:
        return _normalize_hhmm(int(value) * 100)

    if length == 3:
        hours = int(value[0:1])
        minutes = int(value[1:3])
        return _normalize_hhmm((hours * 100) + minutes)

    hhmm = value[0:4]
    hours = int(hhmm[0:2])
    minutes = int(hhmm[2:4])
    return _normalize_hhmm((hours * 100) + minutes)
```

These helper functions convert user-provided time strings (e.g., '830', '1430') into normalized HHMM integers. `_normalize_hhmm` clamps hours to 0-23 and minutes to 0-59. `_parse_hhmm_text` handles variable-length inputs: 1-2 digits are treated as hours, 3 digits as HMM, and 4+ as HHMM.

### Session Overlap Detection

Lines 161-194 of [Trading Windows.indie5](Trading%20Windows.indie5):

```python
def _intervals_overlap(start_a: int, end_a: int, start_b: int, end_b: int) -> bool:
    return start_a < end_b and start_b < end_a


def _bar_overlaps_session(current_hhmm: int, bar_minutes: int, start_hhmm: int, end_hhmm: int) -> bool:
    bar_start = _hhmm_to_minutes(current_hhmm)
    bar_end = bar_start + bar_minutes

    bar_a_start = bar_start % (24 * 60)
    bar_a_end = min(bar_end, 24 * 60)
    bar_b_start = 0
    bar_b_end = bar_end - (24 * 60)
    has_wrap = bar_end > (24 * 60)

    session_start = _hhmm_to_minutes(start_hhmm)
    session_end = _hhmm_to_minutes(end_hhmm)

    if session_start <= session_end:
        if _intervals_overlap(bar_a_start, bar_a_end, session_start, session_end):
            return True
        if has_wrap and _intervals_overlap(bar_b_start, bar_b_end, session_start, session_end):
            return True
        return False

    # Overnight session, split into [start, 24:00) and [00:00, end).
    if _intervals_overlap(bar_a_start, bar_a_end, session_start, 24 * 60):
        return True
    if _intervals_overlap(bar_a_start, bar_a_end, 0, session_end):
        return True
    if has_wrap and _intervals_overlap(bar_b_start, bar_b_end, session_start, 24 * 60):
        return True
    if has_wrap and _intervals_overlap(bar_b_start, bar_b_end, 0, session_end):
        return True
    return False
```

`_bar_overlaps_session` determines if a bar's time span overlaps with a session window. It handles bars that wrap past midnight by splitting the bar into two segments. For overnight sessions, it checks overlap against both the [start, 24:00) and [00:00, end) intervals.

### DST Offset Calculation

Lines 272-316 of [Trading Windows.indie5](Trading%20Windows.indie5):

```python
def _uk_dst_offset_hours(utc_dt: datetime) -> int:
    year = utc_dt.year
    march_last_sunday = _last_sunday(year, 3).day
    october_last_sunday = _last_sunday(year, 10).day
    dst_start_utc = datetime(year=year, month=3, day=march_last_sunday, hour=1, minute=0).timestamp()
    dst_end_utc = datetime(year=year, month=10, day=october_last_sunday, hour=1, minute=0).timestamp()

    utc_ts = utc_dt.timestamp()

    if utc_ts >= dst_start_utc and utc_ts < dst_end_utc:
        return 1
    return 0


def _us_dst_offset_hours(utc_dt: datetime, standard_utc_offset: int) -> int:
    year = utc_dt.year
    march_second_sunday = _second_sunday(year, 3).day
    november_first_sunday = _first_sunday(year, 11).day

    # DST starts at 02:00 local standard time.
    dst_start_utc = (datetime(year=year, month=3, day=march_second_sunday, hour=2, minute=0) - timedelta(hours=standard_utc_offset)).timestamp()
    # DST ends at 02:00 local daylight time.
    dst_end_utc = (datetime(year=year, month=11, day=november_first_sunday, hour=2, minute=0) - timedelta(hours=(standard_utc_offset + 1))).timestamp()

    utc_ts = utc_dt.timestamp()

    if utc_ts >= dst_start_utc and utc_ts < dst_end_utc:
        return standard_utc_offset + 1
    return standard_utc_offset


def _sydney_dst_offset_hours(utc_dt: datetime) -> int:
    # Sydney DST season spans calendar years (Oct -> Apr).
    season_start_year = utc_dt.year
    season_end_year = utc_dt.year

    if utc_dt.month >= 10:
        season_start_year = utc_dt.year
        season_end_year = utc_dt.year + 1
    else:
        season_start_year = utc_dt.year - 1
        season_end_year = utc_dt.year

    october_first_sunday = _first_sunday(season_start_year, 10).day
    april_first_sunday = _first_sunday(season_end_year, 4).day
```

These functions compute the UTC offset for various timezones with automatic DST adjustment. The UK uses last-Sunday rules, the US uses second-Sunday/first-Sunday rules, and Sydney uses a cross-year DST season (October to April). Each function returns the total offset in hours.

### Main Calculation and Background Rendering

Lines 447-491 of [Trading Windows.indie5](Trading%20Windows.indie5):

```python
    def calc(
        self,
        timezone_mode,
        use_default_settings,
        show_session_zones,
        show_session_boundaries,
        show_session_labels,
        weekdays_only,
        enable_asia,
        asia_name,
        asia_start,
        asia_end,
        asia_zone_color,
        enable_london,
        london_name,
        london_start,
        london_end,
        london_zone_color,
        enable_us,
        us_name,
        us_start,
        us_end,
        us_zone_color,
    ):
        if self.time_frame >= TimeFrame(1, time_frame_unit.DAY):
            return plot.Background(color=color.TRANSPARENT), plot.Background(color=color.TRANSPARENT), plot.Background(color=color.TRANSPARENT)

        if use_default_settings:
            # Keep timezone_mode user-configurable while preset lock is enabled.
            show_session_zones = True
            show_session_boundaries = True
            show_session_labels = True
            weekdays_only = True

            enable_asia = True
            asia_name = 'Asia'
            asia_start = '0000'
            asia_end = '0900'
            asia_zone_color = color.AQUA(0.08)

            enable_london = True
            london_name = 'London'
            london_start = '0800'
            london_end = '1700'
            london_zone_color = color.YELLOW(0.08)
```

The `calc` method first returns transparent backgrounds for daily or higher timeframes. If `use_default_settings` is enabled, it overrides all session parameters to their preset values, except the timezone mode.

### Session Label Placement

Lines 579-615 of [Trading Windows.indie5](Trading%20Windows.indie5):

```python
        day_key = (current_dt.year * 10000) + (current_dt.month * 100) + current_dt.day

        asia_can_label = False
        london_can_label = False
        us_can_label = False

        if enable_asia and show_session_labels and is_asia and len(asia_name) > 0:
            asia_mid_reached = _session_elapsed_minutes(current_time, asia_start_hhmm) >= (_session_duration_minutes(asia_start_hhmm, asia_end_hhmm) // 2)
            asia_can_label = asia_mid_reached and self._last_asia_label_day != day_key

        if enable_london and show_session_labels and is_london and len(london_name) > 0:
            london_mid_reached = _session_elapsed_minutes(current_time, london_start_hhmm) >= (_session_duration_minutes(london_start_hhmm, london_end_hhmm) // 2)
            london_can_label = london_mid_reached and self._last_london_label_day != day_key

        if enable_us and show_session_labels and is_us and len(us_name) > 0:
            us_mid_reached = _session_elapsed_minutes(current_time, us_start_hhmm) >= (_session_duration_minutes(us_start_hhmm, us_end_hhmm) // 2)
            us_can_label = us_mid_reached and self._last_us_label_day != day_key

        should_draw_labels = asia_can_label or london_can_label or us_can_label

        if should_draw_labels:
            label_y = _label_price_y(self)

            if asia_can_label:
                asia_mid_ts = _session_midpoint_timestamp_for_active_session(self.time[0], timezone_mode, current_time, asia_start_hhmm, asia_end_hhmm)
                self.chart.draw(LabelAbs(asia_name, AbsolutePosition(asia_mid_ts, label_y), bg_color=color.TRANSPARENT, text_color=color.AQUA, font_size=12))
                self._last_asia_label_day = day_key

            if london_can_label:
                london_mid_ts = _session_midpoint_timestamp_for_active_session(self.time[0], timezone_mode, current_time, london_start_hhmm, london_end_hhmm)
                self.chart.draw(LabelAbs(london_name, AbsolutePosition(london_mid_ts, label_y), bg_color=color.TRANSPARENT, text_color=color.YELLOW, font_size=12))
                self._last_london_label_day = day_key

            if us_can_label:
                us_mid_ts = _session_midpoint_timestamp_for_active_session(self.time[0], timezone_mode, current_time, us_start_hhmm, us_end_hhmm)
                self.chart.draw(LabelAbs(us_name, AbsolutePosition(us_mid_ts, label_y), bg_color=color.TRANSPARENT, text_color=color.BLUE, font_size=12))
                self._last_us_label_day = day_key
```

Labels are drawn once per day at the midpoint of each session. The indicator tracks which day it last drew a label using a `day_key` (YYYYMMDD integer). The label's Y position is calculated from the highest high over the last 300 bars plus 25% padding, keeping labels near the top of the pane.

## Reading the chart

* **Background zones**: Semi-transparent colored rectangles (aqua for Asia, yellow for London, blue for US) appear on bars that overlap the configured session times.
* **Dashed outlines**: Vertical dashed lines mark the first and last bar of each session, helping identify session boundaries.
* **Session labels**: Text labels (e.g., "Asia", "London", "US") appear once per day at the session midpoint, positioned near the top of the chart pane.
* **Transparent bars**: Bars outside any configured session show no background color.
* **Overnight sessions**: Sessions that cross midnight (e.g., 22:00-03:00) are handled correctly, with the background spanning the overnight period.

## Implementation notes

- The indicator only works on intraday timeframes (below 1 day); on daily or higher, it returns transparent backgrounds.
- The `use_default_settings` parameter locks all session parameters to their defaults while keeping the timezone user-configurable.
- DST calculations use hardcoded rules for each timezone and may not account for historical DST changes or future rule modifications.
- The label Y position is computed from the highest high over the last 300 bars, which may cause labels to overlap with price action on very volatile charts.

## FAQ

**How do I configure custom session times?**

Set `use_default_settings` to false, then adjust the start/end parameters for each session using HHMM format (e.g., '0800' for 8:00 AM). The parser accepts 1-4 digit inputs.

**Does this indicator repaint?**

No, the indicator uses only current and previous bar data. Session boundaries are determined by comparing consecutive bars, so they are stable once a bar closes.

**Can I use this on a 1-minute chart?**

Yes, the indicator works on any intraday timeframe. It automatically detects the bar duration from consecutive timestamps and uses it for session overlap calculations.

## Full source code

Indie Script v5, as published on TakeProfit. Copy it into the platform's script editor or [open the live script](https://takeprofit.com/indicator/trading-windows-33).

```python
# Copyright (c) 2025 @nightranger. All rights reserved.

# This work is licensed under the MIT License.
# For a copy, see <https://opensource.org/licenses/MIT>

# indie:lang_version = 5
from datetime import datetime, timedelta
from math import isnan

from indie import TimeFrame, MainContext, color, indicator, line_style, param, plot, time_frame_unit
from indie.drawings import AbsolutePosition, LabelAbs


def _normalize_hhmm(value: int) -> int:
    hours = value // 100
    minutes = value % 100

    if hours < 0:
        hours = 0
    if hours > 23:
        hours = 23
    if minutes < 0:
        minutes = 0
    if minutes > 59:
        minutes = 59

    return (hours * 100) + minutes


def _parse_hhmm_text(value: str, fallback: int) -> int:
    length = len(value)

    if length == 0:
        return _normalize_hhmm(fallback)

    if length <= 2:
        return _normalize_hhmm(int(value) * 100)

    if length == 3:
        hours = int(value[0:1])
        minutes = int(value[1:3])
        return _normalize_hhmm((hours * 100) + minutes)

    hhmm = value[0:4]
    hours = int(hhmm[0:2])
    minutes = int(hhmm[2:4])
    return _normalize_hhmm((hours * 100) + minutes)


def _hhmm_to_minutes(value: int) -> int:
    return ((value // 100) * 60) + (value % 100)


def _minutes_to_hhmm(value: int) -> int:
    hours = value // 60
    minutes = value % 60
    return (hours * 100) + minutes


def _session_midpoint_hhmm(start_hhmm: int, end_hhmm: int) -> int:
    start_minutes = _hhmm_to_minutes(start_hhmm)
    end_minutes = _hhmm_to_minutes(end_hhmm)
    duration = 0

    if end_minutes >= start_minutes:
        duration = end_minutes - start_minutes
    else:
        duration = (24 * 60) - start_minutes + end_minutes

    midpoint = (start_minutes + (duration // 2)) % (24 * 60)
    return _minutes_to_hhmm(midpoint)


def _session_midpoint_timestamp_from_current(current_utc_ts: float, current_hhmm: int, start_hhmm: int, end_hhmm: int) -> float:
    midpoint_hhmm = _session_midpoint_hhmm(start_hhmm, end_hhmm)
    current_minutes = _hhmm_to_minutes(current_hhmm)
    midpoint_minutes = _hhmm_to_minutes(midpoint_hhmm)

    delta_minutes = midpoint_minutes - current_minutes
    if delta_minutes < 0:
        delta_minutes += 24 * 60

    return current_utc_ts + (delta_minutes * 60.0)


def _session_midpoint_timestamp_for_active_session(current_utc_ts: float, timezone_mode: str, current_hhmm: int, start_hhmm: int, end_hhmm: int) -> float:
    local_dt = _session_datetime(current_utc_ts, timezone_mode)
    local_session_start = datetime(
        year=local_dt.year,
        month=local_dt.month,
        day=local_dt.day,
        hour=(start_hhmm // 100),
        minute=(start_hhmm % 100),
    )

    # For overnight sessions, bars after midnight belong to the prior session start day.
    if start_hhmm > end_hhmm and current_hhmm <= end_hhmm:
        local_session_start = local_session_start - timedelta(days=1)

    midpoint_local = local_session_start + timedelta(minutes=(_session_duration_minutes(start_hhmm, end_hhmm) // 2))

    current_utc_dt = datetime.utcfromtimestamp(current_utc_ts)
    offset_hours = _timezone_offset_hours(current_utc_dt, timezone_mode)
    midpoint_utc_dt = midpoint_local - timedelta(hours=offset_hours)

    # Re-evaluate offset at midpoint to handle rare DST-shift edge cases.
    midpoint_offset_hours = _timezone_offset_hours(midpoint_utc_dt, timezone_mode)
    if midpoint_offset_hours != offset_hours:
        midpoint_utc_dt = midpoint_local - timedelta(hours=midpoint_offset_hours)

    return midpoint_utc_dt.timestamp()


def _label_price_y(ctx: MainContext, lookback_bars: int = 300) -> float:
    highest = ctx.high[0]
    lowest = ctx.low[0]

    i = 1
    while i < lookback_bars:
        if isnan(ctx.time[i]):
            break

        if ctx.high[i] > highest:
            highest = ctx.high[i]
        if ctx.low[i] < lowest:
            lowest = ctx.low[i]

        i += 1

    price_range = highest - lowest
    if price_range <= 0:
        price_range = highest * 0.01 if highest > 0 else 1.0

    # Strong padding to keep tags near the pane top rather than near candles.
    return highest + (price_range * 0.25)


def _is_in_window(current_hhmm: int, start_hhmm: int, end_hhmm: int) -> bool:
    if start_hhmm <= end_hhmm:
        return current_hhmm >= start_hhmm and current_hhmm <= end_hhmm
    # Overnight window support, e.g. 2200 -> 0300.
    return current_hhmm >= start_hhmm or current_hhmm <= end_hhmm


def _session_duration_minutes(start_hhmm: int, end_hhmm: int) -> int:
    start_minutes = _hhmm_to_minutes(start_hhmm)
    end_minutes = _hhmm_to_minutes(end_hhmm)
    if end_minutes >= start_minutes:
        return end_minutes - start_minutes
    return (24 * 60) - start_minutes + end_minutes


def _session_elapsed_minutes(current_hhmm: int, start_hhmm: int) -> int:
    current_minutes = _hhmm_to_minutes(current_hhmm)
    start_minutes = _hhmm_to_minutes(start_hhmm)
    if current_minutes >= start_minutes:
        return current_minutes - start_minutes
    return (24 * 60) - start_minutes + current_minutes


def _intervals_overlap(start_a: int, end_a: int, start_b: int, end_b: int) -> bool:
    return start_a < end_b and start_b < end_a


def _bar_overlaps_session(current_hhmm: int, bar_minutes: int, start_hhmm: int, end_hhmm: int) -> bool:
    bar_start = _hhmm_to_minutes(current_hhmm)
    bar_end = bar_start + bar_minutes

    bar_a_start = bar_start % (24 * 60)
    bar_a_end = min(bar_end, 24 * 60)
    bar_b_start = 0
    bar_b_end = bar_end - (24 * 60)
    has_wrap = bar_end > (24 * 60)

    session_start = _hhmm_to_minutes(start_hhmm)
    session_end = _hhmm_to_minutes(end_hhmm)

    if session_start <= session_end:
        if _intervals_overlap(bar_a_start, bar_a_end, session_start, session_end):
            return True
        if has_wrap and _intervals_overlap(bar_b_start, bar_b_end, session_start, session_end):
            return True
        return False

    # Overnight session, split into [start, 24:00) and [00:00, end).
    if _intervals_overlap(bar_a_start, bar_a_end, session_start, 24 * 60):
        return True
    if _intervals_overlap(bar_a_start, bar_a_end, 0, session_end):
        return True
    if has_wrap and _intervals_overlap(bar_b_start, bar_b_end, session_start, 24 * 60):
        return True
    if has_wrap and _intervals_overlap(bar_b_start, bar_b_end, 0, session_end):
        return True
    return False


def _bar_minutes_from_context(ctx: MainContext) -> int:
    if isnan(ctx.time[1]):
        return 1

    seconds = int(ctx.time[0] - ctx.time[1])
    if seconds <= 0:
        return 1

    minutes = seconds // 60
    if minutes < 1:
        minutes = 1
    if minutes > 24 * 60:
        minutes = 24 * 60
    return minutes


def _is_session_bar_active(enable_session: bool, is_active_day: bool, current_hhmm: int, bar_minutes: int, start_hhmm: int, end_hhmm: int) -> bool:
    if not enable_session or not is_active_day:
        return False
    return _bar_overlaps_session(current_hhmm, bar_minutes, start_hhmm, end_hhmm)


def _session_day_for_weekday_filter(day_index: int, current_hhmm: int, start_hhmm: int, end_hhmm: int) -> int:
    # For overnight windows, bars after midnight belong to the previous session day.
    if start_hhmm > end_hhmm and current_hhmm <= end_hhmm:
        return (day_index + 6) % 7
    return day_index


def _is_active_day_for_session(day_index: int, current_hhmm: int, weekdays_only: bool, start_hhmm: int, end_hhmm: int) -> bool:
    if not weekdays_only:
        return True
    session_day = _session_day_for_weekday_filter(day_index, current_hhmm, start_hhmm, end_hhmm)
    return session_day >= 0 and session_day <= 4


def _is_session_active(enable_session: bool, is_active_day: bool, current_hhmm: int, start_hhmm: int, end_hhmm: int) -> bool:
    if not enable_session or not is_active_day:
        return False
    return _is_in_window(current_hhmm, start_hhmm, end_hhmm)


def _is_leap_year(year: int) -> bool:
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    return year % 4 == 0


def _days_in_month(year: int, month: int) -> int:
    if month == 2:
        return 29 if _is_leap_year(year) else 28
    if month in [4, 6, 9, 11]:
        return 30
    return 31


def _last_sunday(year: int, month: int) -> datetime:
    day = _days_in_month(year, month)
    dt = datetime(year=year, month=month, day=day)
    days_back = (dt.weekday() + 1) % 7
    return datetime(year=year, month=month, day=(day - days_back))


def _first_sunday(year: int, month: int) -> datetime:
    dt = datetime(year=year, month=month, day=1)
    days_forward = (6 - dt.weekday()) % 7
    return datetime(year=year, month=month, day=(1 + days_forward))


def _second_sunday(year: int, month: int) -> datetime:
    return _first_sunday(year, month) + timedelta(days=7)


def _uk_dst_offset_hours(utc_dt: datetime) -> int:
    year = utc_dt.year
    march_last_sunday = _last_sunday(year, 3).day
    october_last_sunday = _last_sunday(year, 10).day
    dst_start_utc = datetime(year=year, month=3, day=march_last_sunday, hour=1, minute=0).timestamp()
    dst_end_utc = datetime(year=year, month=10, day=october_last_sunday, hour=1, minute=0).timestamp()

    utc_ts = utc_dt.timestamp()

    if utc_ts >= dst_start_utc and utc_ts < dst_end_utc:
        return 1
    return 0


def _us_dst_offset_hours(utc_dt: datetime, standard_utc_offset: int) -> int:
    year = utc_dt.year
    march_second_sunday = _second_sunday(year, 3).day
    november_first_sunday = _first_sunday(year, 11).day

    # DST starts at 02:00 local standard time.
    dst_start_utc = (datetime(year=year, month=3, day=march_second_sunday, hour=2, minute=0) - timedelta(hours=standard_utc_offset)).timestamp()
    # DST ends at 02:00 local daylight time.
    dst_end_utc = (datetime(year=year, month=11, day=november_first_sunday, hour=2, minute=0) - timedelta(hours=(standard_utc_offset + 1))).timestamp()

    utc_ts = utc_dt.timestamp()

    if utc_ts >= dst_start_utc and utc_ts < dst_end_utc:
        return standard_utc_offset + 1
    return standard_utc_offset


def _sydney_dst_offset_hours(utc_dt: datetime) -> int:
    # Sydney DST season spans calendar years (Oct -> Apr).
    season_start_year = utc_dt.year
    season_end_year = utc_dt.year

    if utc_dt.month >= 10:
        season_start_year = utc_dt.year
        season_end_year = utc_dt.year + 1
    else:
        season_start_year = utc_dt.year - 1
        season_end_year = utc_dt.year

    october_first_sunday = _first_sunday(season_start_year, 10).day
    april_first_sunday = _first_sunday(season_end_year, 4).day

    # Start: 02:00 local standard time (UTC+10).
    dst_start_utc = (datetime(year=season_start_year, month=10, day=october_first_sunday, hour=2, minute=0) - timedelta(hours=10)).timestamp()
    # End: 03:00 local daylight time (UTC+11).
    dst_end_utc = (datetime(year=season_end_year, month=4, day=april_first_sunday, hour=3, minute=0) - timedelta(hours=11)).timestamp()

    utc_ts = utc_dt.timestamp()

    if utc_ts >= dst_start_utc and utc_ts < dst_end_utc:
        return 11
    return 10


def _timezone_offset_hours(utc_dt: datetime, timezone_mode: str) -> int:
    if timezone_mode == 'UTC':
        return 0

    if timezone_mode == 'Europe/London (DST Auto)':
        return _uk_dst_offset_hours(utc_dt)

    if timezone_mode == 'America/New_York (DST Auto)':
        return _us_dst_offset_hours(utc_dt, -5)

    if timezone_mode == 'America/Chicago (DST Auto)':
        return _us_dst_offset_hours(utc_dt, -6)

    if timezone_mode == 'America/Los_Angeles (DST Auto)':
        return _us_dst_offset_hours(utc_dt, -8)

    if timezone_mode == 'Asia/Tokyo':
        return 9

    if timezone_mode == 'Asia/Singapore':
        return 8

    if timezone_mode == 'Australia/Sydney (DST Auto)':
        return _sydney_dst_offset_hours(utc_dt)

    return 0


def _session_datetime(timestamp: float, timezone_mode: str) -> datetime:
    utc_dt = datetime.utcfromtimestamp(timestamp)
    return utc_dt + timedelta(hours=_timezone_offset_hours(utc_dt, timezone_mode))


@indicator('Trading Windows', overlay_main_pane=True)
@param.str(
    'timezone_mode',
    default='Europe/London (DST Auto)',
    title='Timezone Mode',
    options=[
        'Europe/London (DST Auto)',
        'America/New_York (DST Auto)',
        'America/Chicago (DST Auto)',
        'America/Los_Angeles (DST Auto)',
        'Asia/Tokyo',
        'Asia/Singapore',
        'Australia/Sydney (DST Auto)',
        'UTC',
    ],
)
@param.bool('use_default_settings', default=True, title='Use Default Settings (Preset Lock)')
@param.bool('show_session_zones', default=True, title='Show Session Zones')
@param.bool('show_session_boundaries', default=True, title='Show Session Boundary Bars')
@param.bool('show_session_labels', default=True, title='Show Session Labels')
@param.bool('weekdays_only', default=True, title='Weekdays Only (Mon-Fri)')
@param.bool('enable_asia', default=True, title='Enable Asia Session')
@param.str('asia_name', default='Asia', title='Session 1 Name')
@param.str('asia_start', default='0000', title='Asia Start (HHMM)')
@param.str('asia_end', default='0900', title='Asia End (HHMM)')
@param.color('asia_zone_color', default=color.AQUA(0.08), title='Asia Zone Color')
@param.bool('enable_london', default=True, title='Enable London Session')
@param.str('london_name', default='London', title='Session 2 Name')
@param.str('london_start', default='0800', title='London Start (HHMM)')
@param.str('london_end', default='1700', title='London End (HHMM)')
@param.color('london_zone_color', default=color.YELLOW(0.08), title='London Zone Color')
@param.bool('enable_us', default=True, title='Enable US Session')
@param.str('us_name', default='US', title='Session 3 Name')
@param.str('us_start', default='1430', title='US Start (HHMM)')
@param.str('us_end', default='2100', title='US End (HHMM)')
@param.color('us_zone_color', default=color.BLUE(0.08), title='US Zone Color')
@plot.background(title='Asia Session Zone', outline_color=color.AQUA, outline_style=line_style.DASHED, outline_width=1)
@plot.background(title='London Session Zone', outline_color=color.YELLOW, outline_style=line_style.DASHED, outline_width=1)
@plot.background(title='US Session Zone', outline_color=color.BLUE, outline_style=line_style.DASHED, outline_width=1)
class Main(MainContext):
    def __init__(self):
        self._asia_start_text = ''
        self._asia_end_text = ''
        self._london_start_text = ''
        self._london_end_text = ''
        self._us_start_text = ''
        self._us_end_text = ''

        self._asia_start_hhmm = 0
        self._asia_end_hhmm = 900
        self._london_start_hhmm = 800
        self._london_end_hhmm = 1700
        self._us_start_hhmm = 1430
        self._us_end_hhmm = 2100

        self._last_asia_label_day = -1
        self._last_london_label_day = -1
        self._last_us_label_day = -1

    def _refresh_hhmm_cache(self, asia_start: str, asia_end: str, london_start: str, london_end: str, us_start: str, us_end: str) -> None:
        if asia_start != self._asia_start_text:
            self._asia_start_text = asia_start
            self._asia_start_hhmm = _parse_hhmm_text(asia_start, 0)

        if asia_end != self._asia_end_text:
            self._asia_end_text = asia_end
            self._asia_end_hhmm = _parse_hhmm_text(asia_end, 900)

        if london_start != self._london_start_text:
            self._london_start_text = london_start
            self._london_start_hhmm = _parse_hhmm_text(london_start, 800)

        if london_end != self._london_end_text:
            self._london_end_text = london_end
            self._london_end_hhmm = _parse_hhmm_text(london_end, 1700)

        if us_start != self._us_start_text:
            self._us_start_text = us_start
            self._us_start_hhmm = _parse_hhmm_text(us_start, 1430)

        if us_end != self._us_end_text:
            self._us_end_text = us_end
            self._us_end_hhmm = _parse_hhmm_text(us_end, 2100)

    def calc(
        self,
        timezone_mode,
        use_default_settings,
        show_session_zones,
        show_session_boundaries,
        show_session_labels,
        weekdays_only,
        enable_asia,
        asia_name,
        asia_start,
        asia_end,
        asia_zone_color,
        enable_london,
        london_name,
        london_start,
        london_end,
        london_zone_color,
        enable_us,
        us_name,
        us_start,
        us_end,
        us_zone_color,
    ):
        if self.time_frame >= TimeFrame(1, time_frame_unit.DAY):
            return plot.Background(color=color.TRANSPARENT), plot.Background(color=color.TRANSPARENT), plot.Background(color=color.TRANSPARENT)

        if use_default_settings:
            # Keep timezone_mode user-configurable while preset lock is enabled.
            show_session_zones = True
            show_session_boundaries = True
            show_session_labels = True
            weekdays_only = True

            enable_asia = True
            asia_name = 'Asia'
            asia_start = '0000'
            asia_end = '0900'
            asia_zone_color = color.AQUA(0.08)

            enable_london = True
            london_name = 'London'
            london_start = '0800'
            london_end = '1700'
            london_zone_color = color.YELLOW(0.08)

            enable_us = True
            us_name = 'US'
            us_start = '1430'
            us_end = '2100'
            us_zone_color = color.BLUE(0.08)

        self._refresh_hhmm_cache(asia_start, asia_end, london_start, london_end, us_start, us_end)
        asia_start_hhmm = self._asia_start_hhmm
        asia_end_hhmm = self._asia_end_hhmm
        london_start_hhmm = self._london_start_hhmm
        london_end_hhmm = self._london_end_hhmm
        us_start_hhmm = self._us_start_hhmm
        us_end_hhmm = self._us_end_hhmm

        current_dt = _session_datetime(self.time[0], timezone_mode)
        current_day = current_dt.weekday()  # Monday = 0, Sunday = 6
        current_time = (current_dt.hour * 100) + current_dt.minute
        bar_minutes = _bar_minutes_from_context(self)

        is_asia_day = _is_active_day_for_session(current_day, current_time, weekdays_only, asia_start_hhmm, asia_end_hhmm)
        is_london_day = _is_active_day_for_session(current_day, current_time, weekdays_only, london_start_hhmm, london_end_hhmm)
        is_us_day = _is_active_day_for_session(current_day, current_time, weekdays_only, us_start_hhmm, us_end_hhmm)

        is_asia = _is_session_active(enable_asia, is_asia_day, current_time, asia_start_hhmm, asia_end_hhmm)
        is_london = _is_session_active(enable_london, is_london_day, current_time, london_start_hhmm, london_end_hhmm)
        is_us = _is_session_active(enable_us, is_us_day, current_time, us_start_hhmm, us_end_hhmm)

        is_asia_zone = _is_session_bar_active(enable_asia, is_asia_day, current_time, bar_minutes, asia_start_hhmm, asia_end_hhmm)
        is_london_zone = _is_session_bar_active(enable_london, is_london_day, current_time, bar_minutes, london_start_hhmm, london_end_hhmm)
        is_us_zone = _is_session_bar_active(enable_us, is_us_day, current_time, bar_minutes, us_start_hhmm, us_end_hhmm)

        prev_is_asia = False
        prev_is_london = False
        prev_is_us = False
        prev_is_asia_zone = False
        prev_is_london_zone = False
        prev_is_us_zone = False

        if isnan(self.time[1]):
            prev_is_asia = False
            prev_is_london = False
            prev_is_us = False
        else:
            prev_dt = _session_datetime(self.time[1], timezone_mode)
            prev_day = prev_dt.weekday()
            prev_time = (prev_dt.hour * 100) + prev_dt.minute

            prev_is_asia_day = _is_active_day_for_session(prev_day, prev_time, weekdays_only, asia_start_hhmm, asia_end_hhmm)
            prev_is_london_day = _is_active_day_for_session(prev_day, prev_time, weekdays_only, london_start_hhmm, london_end_hhmm)
            prev_is_us_day = _is_active_day_for_session(prev_day, prev_time, weekdays_only, us_start_hhmm, us_end_hhmm)

            prev_is_asia = _is_session_active(enable_asia, prev_is_asia_day, prev_time, asia_start_hhmm, asia_end_hhmm)
            prev_is_london = _is_session_active(enable_london, prev_is_london_day, prev_time, london_start_hhmm, london_end_hhmm)
            prev_is_us = _is_session_active(enable_us, prev_is_us_day, prev_time, us_start_hhmm, us_end_hhmm)

            prev_is_asia_zone = _is_session_bar_active(enable_asia, prev_is_asia_day, prev_time, bar_minutes, asia_start_hhmm, asia_end_hhmm)
            prev_is_london_zone = _is_session_bar_active(enable_london, prev_is_london_day, prev_time, bar_minutes, london_start_hhmm, london_end_hhmm)
            prev_is_us_zone = _is_session_bar_active(enable_us, prev_is_us_day, prev_time, bar_minutes, us_start_hhmm, us_end_hhmm)

        asia_ends = show_session_boundaries and prev_is_asia_zone and not is_asia_zone
        london_ends = show_session_boundaries and prev_is_london_zone and not is_london_zone
        us_ends = show_session_boundaries and prev_is_us_zone and not is_us_zone

        # Render compensation: keep color on the transition-out bar so visual fill meets boundary lines.
        asia_zone_paint = is_asia_zone or (prev_is_asia_zone and not is_asia_zone)
        london_zone_paint = is_london_zone or (prev_is_london_zone and not is_london_zone)
        us_zone_paint = is_us_zone or (prev_is_us_zone and not is_us_zone)

        asia_background = plot.Background(color=color.TRANSPARENT)
        if show_session_zones and asia_zone_paint:
            asia_background.color = asia_zone_color
        asia_background.outline_left = show_session_boundaries and is_asia_zone and not prev_is_asia_zone
        asia_background.outline_right = show_session_boundaries and asia_ends

        london_background = plot.Background(color=color.TRANSPARENT)
        if show_session_zones and london_zone_paint:
            london_background.color = london_zone_color
        london_background.outline_left = show_session_boundaries and is_london_zone and not prev_is_london_zone
        london_background.outline_right = show_session_boundaries and london_ends

        us_background = plot.Background(color=color.TRANSPARENT)
        if show_session_zones and us_zone_paint:
            us_background.color = us_zone_color
        us_background.outline_left = show_session_boundaries and is_us_zone and not prev_is_us_zone
        us_background.outline_right = show_session_boundaries and us_ends

        day_key = (current_dt.year * 10000) + (current_dt.month * 100) + current_dt.day

        asia_can_label = False
        london_can_label = False
        us_can_label = False

        if enable_asia and show_session_labels and is_asia and len(asia_name) > 0:
            asia_mid_reached = _session_elapsed_minutes(current_time, asia_start_hhmm) >= (_session_duration_minutes(asia_start_hhmm, asia_end_hhmm) // 2)
            asia_can_label = asia_mid_reached and self._last_asia_label_day != day_key

        if enable_london and show_session_labels and is_london and len(london_name) > 0:
            london_mid_reached = _session_elapsed_minutes(current_time, london_start_hhmm) >= (_session_duration_minutes(london_start_hhmm, london_end_hhmm) // 2)
            london_can_label = london_mid_reached and self._last_london_label_day != day_key

        if enable_us and show_session_labels and is_us and len(us_name) > 0:
            us_mid_reached = _session_elapsed_minutes(current_time, us_start_hhmm) >= (_session_duration_minutes(us_start_hhmm, us_end_hhmm) // 2)
            us_can_label = us_mid_reached and self._last_us_label_day != day_key

        should_draw_labels = asia_can_label or london_can_label or us_can_label

        if should_draw_labels:
            label_y = _label_price_y(self)

            if asia_can_label:
                asia_mid_ts = _session_midpoint_timestamp_for_active_session(self.time[0], timezone_mode, current_time, asia_start_hhmm, asia_end_hhmm)
                self.chart.draw(LabelAbs(asia_name, AbsolutePosition(asia_mid_ts, label_y), bg_color=color.TRANSPARENT, text_color=color.AQUA, font_size=12))
                self._last_asia_label_day = day_key

            if london_can_label:
                london_mid_ts = _session_midpoint_timestamp_for_active_session(self.time[0], timezone_mode, current_time, london_start_hhmm, london_end_hhmm)
                self.chart.draw(LabelAbs(london_name, AbsolutePosition(london_mid_ts, label_y), bg_color=color.TRANSPARENT, text_color=color.YELLOW, font_size=12))
                self._last_london_label_day = day_key

            if us_can_label:
                us_mid_ts = _session_midpoint_timestamp_for_active_session(self.time[0], timezone_mode, current_time, us_start_hhmm, us_end_hhmm)
                self.chart.draw(LabelAbs(us_name, AbsolutePosition(us_mid_ts, label_y), bg_color=color.TRANSPARENT, text_color=color.BLUE, font_size=12))
                self._last_us_label_day = day_key

        return asia_background, london_background, us_background
```
