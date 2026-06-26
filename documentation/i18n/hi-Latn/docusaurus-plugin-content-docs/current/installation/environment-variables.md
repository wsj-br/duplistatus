# Paryavaran Char (Environment Variables) {#environment-variables}

Yah application configuration ke liye nimnalikhit paryavaran charon ka samarthan karta hai:

| Char (Variable)           | Vivaran (Description)                                                                       | Default (Mool roop se)                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Mukhya web application ke liye Port                                                          | `9666`                     |
| `CRON_PORT`               | Cron service (scheduling) ke liye Port. Agar nirdharit nahin hai, to `PORT + 1` ka upyog karega | `9667`                     |
| `NODE_ENV`                | Node.js paryavaran (`development` ya `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Next.js telemetry ko band karein                                                                   | `1`                        |
| `TZ`                      | Application ke liye samay kshetra (Timezone)                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Password complexity avashyaktaon (bade akshar, chhote akshar, sankhya) ko band karne ke liye `false` par set karein. | Lagu (poorn maan'yakaran) |
| `PWD_MIN_LEN`             | Password ki newntam lambai aksharon mein (hamesha lagu)                                    | `8`                        |
