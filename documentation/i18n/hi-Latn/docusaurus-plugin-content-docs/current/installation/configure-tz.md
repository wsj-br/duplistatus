# Samay Kshetra {#timezone}

Aavedan upayogkarta interface taareekh aur samay brauzar ki sammaan ke anusaar pradarshit honge. Haalanki, logging aur suchnaayein uddeshyon ke liye, aavedan samay kshetro ko format karne ke liye `TZ` environment variable mein paribhashit maan ka upayog karega.

Yadi yah environment variable nirdharit nahin hai, to default maan `TZ=Europe/London` hai.

:::note
Suchnaayein ke liye bhasha aur locale settings (number aur date formats) ko [Sammaan → Templates](../user-guide/settings/notification-templates.md) mein configure kiya ja sakta hai.
:::

## Samay Kshetra Configure Karna {#configuring-the-timezone}

Aavedan upayogkarta interface taareekh aur samay brauzar ki sammaan ke anusaar pradarshit honge. Haalanki, logging aur suchnaayein uddeshyon ke liye, aavedan samay kshetro ko format karne ke liye `TZ` environment variable mein paribhashit maan ka upayog karega.

Yadi yah environment variable nirdharit nahin hai, to default maan `TZ=Europe/London` hai.

Udaharan ke liye, São Paulo mein samay kshetra badalne ke liye, `duplistatus` directory mein `compose.yml` mein ye lainein jodein:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ya command line (Docker ya Podman) mein environment variable pass karein:

```bash
  --env TZ=America/Sao_Paulo
```

### Apne Linux Configuration ka Upayog Karna {#using-your-linux-configuration}

Apne Linux host ke configuration prapt karne ke liye, aap ise execute kar sakte hain:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Samay Kshetron ki Soochi {#list-of-timezones}

Aap samay kshetron ki soochi yahan paa sakte hain: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
