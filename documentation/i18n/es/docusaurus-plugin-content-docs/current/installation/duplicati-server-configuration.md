---
translation_last_updated: '2026-02-15T20:57:39.973Z'
source_file_mtime: '2026-02-14T22:17:03.416Z'
source_file_hash: da5148730ecb385b
translation_language: es
source_file_path: installation/duplicati-server-configuration.md
---
# Configuración del Servidor Duplicati (Requerido) {#duplicati-server-configuration-required}

Para que esta aplicación funcione correctamente, cada uno de sus servidores Duplicati debe configurarse para enviar informes HTTP para cada ejecución de backup al servidor **duplistatus**.

Aplique esta configuración a cada uno de sus servidores Duplicati:

1. **Permitir acceso remoto:** Inicie sesión en [la interfaz de usuario de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), seleccione `Settings`, y permita acceso remoto, incluyendo una lista de nombres de host (o utilice `*`).

![Duplicati settings](/img/duplicati-settings.png)

:::caution
    Solo activa el acceso remoto si tu servidor Duplicati está protegido por una red segura
    (por ejemplo, VPN, LAN privada o reglas de firewall). Exponer la interfaz de Duplicati a Internet público
    sin medidas de seguridad adecuadas podría provocar acceso no autorizado.
    :::

2. **Configurar la notificación de resultados de backup:** En la página Configuración de Duplicati, seleccione `Settings` y, en la sección `Default Options`, incluya las siguientes opciones. Reemplace 'my.local.server' con el nombre del servidor o dirección IP donde **duplistatus** se está ejecutando.

| Opción avanzada                  | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Alternativamente, puedes hacer clic en `Edit as text` y copiar las líneas a continuación, reemplazando `my.local.server` con tu dirección de servidor real.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Duplicati configuration](/img/duplicati-options.png)

**Notas importantes sobre los mensajes enviados por Duplicati:**

- Si omite `--send-http-log-level=Information`, no se enviarán mensajes de registro a **duplistatus**, solo Estadísticas. Esto evitará que la función de Versiones disponibles funcione.
- La configuración recomendada es `--send-http-max-log-lines=0` para Mensajes ilimitados, ya que el valor por defecto de Duplicati de 100 Mensajes puede evitar que las Versiones disponibles se reciban en el registro.
- Si limita el Número de mensajes, es posible que no se reciban los Mensajes de registro requeridos para obtener las Versiones de backup disponibles. Esto evitará que esas Versiones se muestren para esa ejecución de backup.

:::tip
Después de configurar el servidor **duplistatus**, recopile los logs de backup de todos sus servidores Duplicati usando [Recopilar logs de backup](../user-guide/collect-backup-logs.md).
:::
