![duplistatus](../documentation/static/img/duplistatus_banner.png)

# TODO List

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Fix](#fix)
- [Changes needed](#changes-needed)
- [New Features (planned or under analysis)](#new-features-planned-or-under-analysis)
- [Nice to have](#nice-to-have)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br/><br/>

## Fix

- take-screenshots.ts: some issues:

    ```log
    [00:04:47] 🌐 [Phase B] Capturing locale: en-GB
    [00:04:51] -------------------------------------------------------
    [00:04:51] Switching to table view...
    [00:04:53] Current view mode: null (will switch to table)
    [00:04:58] -------------------------------------------------------
    [00:04:58] Taking screenshot of dashboard in table mode...
    [00:04:58]   📸 Taking screenshot: screen-main-dashboard-table-mode.png... 
    [00:05:13]    ⚠ data-screenshot-target="dashboard-table-view" not found within 15000ms 
    [00:05:15]   💾 Screenshot saved: /home/wsj/src/duplistatus/documentation/static/assets/screen-main-dashboard-table-mode.png
    [00:05:15] -------------------------------------------------------
    [00:05:15] Capturing metrics chart...
    [00:05:30]    ⚠ data-screenshot-target="metrics-chart" not found within 15000ms 
    [00:05:30] Could not find metrics chart bounds
    [00:05:30] -------------------------------------------------------
    [00:05:30] Capturing dashboard summary card (screen-dashboard-summary-table.png)...
    ```

<br/>


## Changes needed

- take-screenshots.ts: add to save a copy of the log into the dev folder with .log extension (as we do in the transrewrt project)

<br/>

## New Features (planned or under analysis)

- add barcharts instead of the smothed line charts (see https://github.com/wsj-br/duplistatus/issues/54)

- Feature Request: Control of Backup Client (see https://github.com/wsj-br/duplistatus/issues/35)

- check if make sense to group servers in a hierarchy

<br/>

## Nice to have

none



