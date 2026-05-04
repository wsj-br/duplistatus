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

- merging duplicates is not working: error message: "Merge Failed d.successfullyMergedServers.replace is not a function"

- fix the bug: "duplistatus does not show available backup versions for some Duplicati backup jobs." (see https://github.com/wsj-br/duplistatus/issues/65)

- fix the bug: Duplistatus crash: JavaScript heap out of memory (see https://github.com/wsj-br/duplistatus/issues/62)

<br/>


## Changes needed

- adjust the documentation to make clear that the duplicate connectivity is optional and the allow remove access also is optional
  (documentation/docs/installation/duplicati-server-configuration.md item 1, line 7 ) (see https://github.com/wsj-br/duplistatus/issues/40)

- add a date/time format override in the settings (Settings > Display Settings > Date/Time Format) (see https://github.com/wsj-br/duplistatus/issues/59)



<br/>

## New Features (planned or under analysis)

- add barcharts instead of the smothed line charts (see https://github.com/wsj-br/duplistatus/issues/54)

- add a filter or search backup server list (Settings > Backup Monitoring, Settings > Servers or in the main Dashboard (card or table view) (see https://github.com/wsj-br/duplistatus/issues/53)

- Feature Request: Control of Backup Client (see https://github.com/wsj-br/duplistatus/issues/35)


- check if make sense to group servers in a hierarchy

<br/>

## Nice to have

none



