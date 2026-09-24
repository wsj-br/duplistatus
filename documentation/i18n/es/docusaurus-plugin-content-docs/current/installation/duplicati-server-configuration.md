# Configuración del servidor Duplicati (obligatoria) {/* #duplicati-server-configuration-required */}

Para que esta aplicación funcione correctamente, cada uno de sus servidores Duplicati debe configurarse para enviar informes HTTP para cada ejecución de copia de seguridad al servidor **duplistatus**.

Aplique esta configuración a cada uno de sus servidores Duplicati:

1. **Configurar la notificación de resultados de copia de seguridad:** En la página de configuración de Duplicati, seleccione `Settings` y, en la sección `Default Options`, incluya las siguientes opciones.

![Configuración de Duplicati](/img/duplicati-options.png)

Reemplace `my.local.server` con el nombre de host o dirección IP que el servidor Duplicati utiliza para acceder a **duplistatus**. Consulte [Duplicati y duplistatus en el mismo host](#duplicati-and-duplistatus-on-the-same-host) si ambos se ejecutan en una sola máquina.

Consulte la documentación de [notificaciones HTTP](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) de Duplicati para obtener la referencia de opciones.

### Opciones recomendadas (Duplicati 2.0.9.106 y posteriores) {/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` ya envía JSON, por lo tanto `--send-http-result-output-format=Json` no es obligatorio (y se ignora para estas URLs).

| Opción avanzada           | Valor                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (añadir `?api_key=` cuando se requieran claves de API) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Alternativamente, puede hacer clic en `Edit as text` y copiar las líneas siguientes, reemplazando `my.local.server` con su dirección de servidor real.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Cuando se requieren [claves de API](../user-guide/settings/api-keys-settings.md), añada la clave de ámbito de subida a la URL:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati no puede establecer encabezados HTTP personalizados. El parámetro de consulta es la forma admitida de enviar la clave. Los registros de acceso del proxy inverso contendrán el secreto, así que limite quién puede leer esos registros.

`--send-http-max-log-lines=500` mantiene el informe JSON bien por debajo del límite predeterminado de 5 MB para el tamaño de subida. `--send-http-max-log-lines=0` (ilimitado) puede exceder ese límite y devolver HTTP 413. Aumente el límite en Configuración → Claves de API si necesita informes más grandes.

### Versiones antiguas de Duplicati {/* #older-duplicati-versions */}

Si su servidor Duplicati es anterior a la versión 2.0.9.106, utilice la opción de URL heredada y configure el formato de resultado como JSON:

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

### Líneas de registro y versiones disponibles {/* #log-lines-and-available-versions */}

**Notas importantes sobre los mensajes enviados por Duplicati:**

- Si omite `--send-http-log-level=Information`, ningún mensaje de registro se enviará a **duplistatus**, solo estadísticas. Esto evitará que funcione la **lista** de versiones disponibles.
- El valor predeterminado de Duplicati es `--send-http-max-log-lines=100`. El valor recomendado es `500`. Duplicati mantiene las **primeras** N líneas de registro. Las líneas utilizadas para la lista de versiones disponibles (`Backups to consider`) generalmente están entre esas primeras centenas de líneas; `100` suele ser muy poco.
- `--send-http-max-log-lines=0` significa ilimitado. Utilice eso solo si la lista de versiones aún falta y **no** está enviando informes también a [Duplicati Monitoring](https://www.duplicati-monitoring.com/). Los registros ilimitados pueden hacer que ese servicio devuelva HTTP 500 en trabajos grandes.
- La **cuenta** de versiones disponibles aún proviene de las estadísticas JSON (`BackupListCount`) incluso cuando falta la lista detallada de marcas de tiempo. Si el icono de lista está deshabilitado, aumente el límite (o use `0` cuando solo informe a **duplistatus**).

:::tip
Después de configurar el servidor **duplistatus**, recopile los registros de copia de seguridad para todos sus servidores Duplicati usando [Recopilar registros de copias de seguridad](../user-guide/collect-backup-logs.md).
:::

### Informar a duplistatus y Duplicati Monitoring {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

Puede enviar informes desde el **mismo** servidor Duplicati a **duplistatus** y [Duplicati Monitoring](https://www.duplicati-monitoring.com/) al mismo tiempo. **duplistatus** debe recibir JSON. Duplicati Monitoring espera informes codificados como formulario. No apunte `--send-http-form-urls` a `/api/upload`.

En ese servidor Duplicati, establezca las Opciones Predeterminadas en:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Reemplace `<your-endpoint>` con la URL de su cuenta Duplicati Monitoring.

- Prefiera estas opciones dedicadas. No mantenga también `--send-http-url` apuntando a los mismos destinos a menos que aún necesite la opción heredada.
- `--send-http-log-level` y `--send-http-max-log-lines` se aplican a **todos** los destinos HTTP. No puede enviar un registro completo a **duplistatus** y un informe corto a Duplicati Monitoring.
- Use `500`, no `0`. Si Duplicati Monitoring aún devuelve HTTP 500 en trabajos grandes, reduzca aún más el límite (u omita `Information`) sabiendo que la **lista** de versiones puede faltar. Si falta la lista pero Monitoring funciona bien, aumente el límite. Alternativamente, informe solo a **duplistatus** para esos trabajos.

:::caution
Si falla un destino HTTP (interrupción o HTTP 500), Duplicati puede no enviar los informes restantes. Primero se envían las URLs de formulario, luego las URLs JSON. Por lo tanto, una interrupción o error 500 de Duplicati Monitoring puede bloquear el informe JSON a **duplistatus**.
:::

[Recopilar registros de copias de seguridad](../user-guide/collect-backup-logs.md) no depende del informe HTTP. Úselo para completar una ejecución que no fue recibida.

### Duplicati y duplistatus en el mismo host {/* #duplicati-and-duplistatus-on-the-same-host */}

La URL de subida debe ser accesible **desde el proceso Duplicati**, no desde su navegador.

- **Duplicati en el host, duplistatus en Docker con el puerto `9666` publicado:** `http://127.0.0.1:9666/api/upload` (o la IP de LAN del host).
- **Ambos en Docker en una red compartida:** `http://duplistatus:9666/api/upload` (el nombre del servicio de Compose o del contenedor). `localhost` dentro del contenedor de Duplicati es ese contenedor, no **duplistatus**.
- **Proxy inverso HTTPS en el mismo host:** use la URL HTTPS pública como en [Configuración de seguridad](security-configuration.md).

Recopilar Registros de Copia de Seguridad es la dirección inversa: desde el contenedor **duplistatus**, `localhost:8200` no es Duplicati en el host. Use la IP del host, `host.docker.internal` (Docker Desktop, o un host adicional que haya configurado), o el nombre del contenedor Duplicati.

2. **Opcional - Permitir acceso remoto a la interfaz de usuario:** Si desea acceder directamente a la interfaz web de Duplicati desde los enlaces del panel de **duplistatus**, inicie sesión en [Interfaz de usuario de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), seleccione `Settings`, y permita el acceso remoto, incluyendo una lista de nombres de host (o use `*`). Si omite esto, **duplistatus** seguirá recibiendo informes de copia de seguridad, pero los enlaces directos a la interfaz de usuario de Duplicati no funcionarán.

:::info
Si no activa el acceso remoto en Duplicati, los enlaces en **Duplistatus** para acceder a la __interfaz de usuario de Duplicati__ no funcionarán.
:::

![Configuración de Duplicati](/img/duplicati-settings.png)

:::caution
Solo activar el acceso remoto si su servidor Duplicati está protegido por una red segura
(p. ej., VPN, LAN privada o reglas de cortafuegos). Exponer la interfaz de Duplicati a Internet público
sin las medidas de seguridad adecuadas podría dar lugar a accesos no autorizados.

Se recomienda utilizar soluciones como Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard o similares para acceder de forma segura a sus servidores desde fuera de su red local.
:::
