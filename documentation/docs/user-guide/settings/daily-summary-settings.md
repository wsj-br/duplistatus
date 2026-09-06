# Daily Summary {#daily-summary}

Daily Summary is an optional notification mode that sends **one** localized snapshot of every known backup job at an exact local time. While it is enabled, individual backup and overdue email and NTFY messages are paused, including additional per-job destinations. Those settings stay stored and become active again as soon as Daily Summary is turned off.

The snapshot is the **current** status at send time (the latest result for each job). It is not a history of the previous day’s runs.

![Daily Summary settings](../../assets/screen-settings-left-panel-admin.png)

## Requirements {#requirements}

- SMTP must be configured. Email is always sent once to the SMTP recipient.
- The cron service must be running. The dispatcher checks every minute in UTC.
- Optional NTFY delivery also requires valid stored NTFY settings.

## What is included {#what-is-included}

Known jobs are the union of:

- the latest observed backup for each server and backup name
- explicit per-job settings whose server still exists

A configured job that has never sent a report is labelled **No report received**. Status buckets (Success, Warning, Error, Fatal, Unknown, No report received) are mutually exclusive and add up to the job count. **Overdue** is counted separately: an overdue successful job is still Success and also overdue.

## Schedule {#schedule}

Choose an exact `HH:mm` time and save the browser’s IANA timezone. The saved timezone stays visible and is not replaced when another browser opens Settings.

- Enabling or changing the schedule starts at the **next future** occurrence, never an immediate surprise send.
- Restarting later on the same local day still catches up after the configured time.
- Fully missed earlier days are not replayed.
- Spring-forward missing times run at the first valid minute after the gap. Repeated autumn hours send once.

## Replacement behaviour {#replacement-behaviour}

When Daily Summary is on:

- upload and overdue email/NTFY are not sent
- overdue timestamps are not advanced, so overdue alerts can resume immediately when the mode is turned off
- template preview, transport tests, and **Send summary now** still work

**Send summary now** is an extra delivery. It does not consume the next scheduled occurrence.

## Templates {#templates}

Edit the Daily Summary email (Markdown) and compact NTFY templates under [Settings → Templates](/user-guide/settings/notification-templates). Email bodies for Success, Warning/Error, Overdue, and Daily Summary all use Markdown.

**Generate preview** on this page opens a dialog with the current snapshot. Email HTML follows the current light or dark theme.
