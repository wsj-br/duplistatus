
# Delivery failures {/* #delivery-failures */}

A <IconButton icon="lucide:siren" tone="alert" /> button with a soft red tint appears in the [Application Toolbar](overview.md#application-toolbar) for administrators while email or ntfy delivery is failing. It stays hidden when both channels are healthy, and it is not shown on the login page. Regular users do not see it.

![Delivery failures](../assets/screen-delivery-failures.png)

Open the button for one card per failing channel (Email, ntfy), not one row for every audit entry. Each card shows:

- The error, and a monospace **Original error** when the SMTP reply was logged
- The SMTP host or the ntfy topic
- The last failure time
- How many deliveries have failed since the last success, or since you last cleared that channel

**Open Email settings** goes to [Settings → Email](settings/email-settings.md). **Open NTFY settings** goes to [Settings → NTFY](settings/ntfy-settings.md).

**Close** only dismisses the panel. **Clear** hides the listed channels until a newer failure is logged, even when the error text is the same. A later successful delivery keeps the button hidden. That includes `email_sent`, `notification_sent`, and a successful [Daily Summary](settings/daily-summary-settings.md) send for that channel.


