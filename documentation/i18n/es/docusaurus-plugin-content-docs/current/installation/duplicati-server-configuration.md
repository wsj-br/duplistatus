# Configuración del Servidor Duplicati (Requerido) {#duplicati-server-configuration-required}

Para que esta aplicación funcione correctamente, cada uno de sus servidores Duplicati debe configurarse para enviar informes HTTP para cada ejecución de backup al servidor **duplistatus**.

Aplique esta configuración a cada uno de sus servidores Duplicati:

1. **Configurar la notificación de resultados de copia de seguridad:** En la página de configuración de Duplicati, seleccione `Settings` y, en la sección `Default Options`, incluya las siguientes opciones.

![Configuración de Duplicati](/img/duplicati-options.png)

Reemplace `my.local.server` con el nombre de host o la dirección IP que el servidor de Duplicati usa para alcanzar **duplistatus**. Consulte [Duplicati y duplistatus en el mismo host](#duplicati-and-duplistatus-on-the-same-host) si ambos se ejecutan en una máquina.

Consulte la documentación de [notificaciones HTTP](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) de Duplicati para obtener la referencia de opciones.

### Opciones recomendadas (Duplicati 2.0.9.106 y posteriores) {#recommended-options-duplicati-209106-and-later}

`--send-http-json-urls` ya envía JSON, por lo que `--send-http-result-output-format=Json` no es necesario (y se ignora para estas URLs).

| Opción avanzada           | Valor                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (añadir `?api_key=` cuando se requieren claves de API) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Alternativamente, puede hacer clic en `Edit as text` y copiar las líneas siguientes, reemplazando `my.local.server` con la dirección de su servidor.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Cuando se requieren [claves de API](../user-guide/settings/api-keys-settings.md), añadir la clave de ámbito de subida a la URL:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati no puede establecer encabezados HTTP personalizados. El parámetro de consulta es la forma admitida de enviar la clave. Los registros de acceso de los proxies inversos contendrán el secreto, por lo que restrinja quién puede leer esos registros.

`--send-http-max-log-lines=500` mantiene el informe JSON por debajo del límite de tamaño de subida predeterminado de 5 MB. `--send-http-max-log-lines=0` (ilimitado) puede superar ese límite y devolver HTTP 413. Aumente el límite en Configuración → Claves de API si necesita informes más grandes.

### Versiones de Duplicati más antiguas {#older-duplicati-versions}

Si el servidor de Duplicati es anterior a 2.0.9.106, use la opción de URL heredada y establezca el formato de resultado en JSON:

| Opción avanzada                  | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=500
```

### Líneas de registro y versiones disponibles {#log-lines-and-available-versions}

**Notas importantes sobre los mensajes enviados por Duplicati:**

- Si omite `--send-http-log-level=Information`, no se enviarán mensajes de registro a **duplistatus**, solo estadísticas. Esto evitará que funcione la **lista** de versiones disponibles.
- El valor predeterminado de Duplicati es `--send-http-max-log-lines=100`. El valor recomendado es `500`. Duplicati conserva las **primeras** N líneas de registro. Las líneas utilizadas para la lista de versiones disponibles (`Backups to consider`) suelen estar en esas primeras cientos de líneas; `100` suele ser demasiado poco.
- `--send-http-max-log-lines=0` significa ilimitado. Use eso solo si la lista de versiones sigue sin aparecer y **no** está enviando también informes a [Duplicati Monitoring](https://www.duplicati-monitoring.com/). Los registros ilimitados pueden hacer que ese servicio devuelva un error HTTP 500 en trabajos grandes.
- El **recuento** de versiones disponibles sigue procediendo de las estadísticas JSON (`BackupListCount`) incluso cuando la lista detallada de marcas de tiempo no está disponible. Si el icono de la lista aparece en gris, aumente el límite (o use `0` cuando informe únicamente a **duplistatus**).

:::tip
Después de configurar el servidor **duplistatus**, recopile los logs de backup de todos sus servidores Duplicati usando [Recopilar logs de backup](../user-guide/collect-backup-logs.md).
:::

### Informar a duplistatus y Duplicati Monitoring {#reporting-to-duplistatus-and-duplicati-monitoring}

Puede enviar informes desde el **mismo** servidor de Duplicati a **duplistatus** y [Duplicati Monitoring](https://www.duplicati-monitoring.com/) al mismo tiempo. **duplistatus** debe recibir JSON. Duplicati Monitoring espera informes codificados en formulario. No apunte `--send-http-form-urls` a `/api/upload`.

En ese servidor de Duplicati, establezca las opciones predeterminadas en:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Reemplace `<your-endpoint>` con la URL de su cuenta de Duplicati Monitoring.

- Prefiera estas opciones dedicadas. No mantenga también `--send-http-url` apuntando a los mismos destinos a menos que aún necesite la opción heredada.
- `--send-http-log-level` y `--send-http-max-log-lines` se aplican a **cada** destino HTTP. No puede enviar un registro completo a **duplistatus** y un informe breve a Duplicati Monitoring.
- Use `500`, no `0`. Si Duplicati Monitoring sigue devolviendo HTTP 500 en trabajos grandes, reduzca el límite adicionalmente (o omita `Information`) sabiendo que la **lista** puede faltar. Si la lista falta pero Monitoring está bien, aumente el límite. Alternativamente, informe solo a **duplistatus** para esos trabajos.

:::caution
Si un destino HTTP falla (interrupción o HTTP 500), Duplicati puede no enviar los informes restantes. Las URLs de formulario se envían primero, luego las URLs de JSON. Una interrupción o 500 de Duplicati Monitoring puede bloquear el informe JSON a **duplistatus**.
:::

[Recopilar registros de copias de seguridad](../user-guide/collect-backup-logs.md) no depende de la notificación HTTP. Úselo para rellenar una ejecución que no se recibió.

### Duplicati y duplistatus en el mismo host {#duplicati-and-duplistatus-on-the-same-host}

La URL de carga debe ser accesible **desde el proceso de Duplicati**, no desde tu navegador.

- **Duplicati en el host, duplistatus en Docker con puerto `9666` publicado:** `http://127.0.0.1:9666/api/upload` (o la IP LAN del host).
- **Ambos en Docker en una red compartida:** `http://duplistatus:9666/api/upload` (el nombre del servicio o contenedor Compose). `localhost` dentro del contenedor de Duplicati es ese contenedor, no **duplistatus**.
- **Proxy inverso HTTPS en el mismo host:** usa la URL HTTPS pública como en [Configuración HTTPS](https-setup.md).

Recopilar registros de copias de seguridad es la dirección inversa: desde el contenedor **duplistatus**, `localhost:8200` no es Duplicati en el host. Usa la IP del host, `host.docker.internal` (Docker Desktop, o un host adicional que hayas configurado), o el nombre del contenedor de Duplicati.

2. **Opcional - Permitir acceso a la interfaz remota:** Si desea acceder a la interfaz web de Duplicati directamente desde los enlaces del panel de **duplistatus**, inicie sesión en [Interfaz de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), seleccione `Settings` y permita el acceso remoto, incluyendo una lista de nombres de host (o use `*`). Si omite esto, **duplistatus** seguirá recibiendo informes de copia de seguridad, pero los enlaces directos a la interfaz de Duplicati no funcionarán.

:::info
Si no habilita el acceso remoto en Duplicati, los enlaces en **Duplistatus** para acceder a la __Interfaz de Duplicati__ no funcionarán.
:::

![Configuración de Duplicati](/img/duplicati-settings.png)

:::caution
Solo habilite el acceso remoto si su servidor Duplicati está protegido por una red segura
(por ejemplo, VPN, LAN privada o reglas de firewall). Exponer la interfaz de Duplicati a Internet
público sin las medidas de seguridad adecuadas podría llevar a un acceso no autorizado.

Se recomienda usar Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard o soluciones similares para acceder de forma segura a sus servidores desde fuera de su red local.
:::
