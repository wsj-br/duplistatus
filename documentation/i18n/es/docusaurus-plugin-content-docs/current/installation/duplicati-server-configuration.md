---
translation_last_updated: '2026-01-31T00:51:26.601Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: da5148730ecb385b
translation_language: es
source_file_path: installation/duplicati-server-configuration.md
---
# Configuración del Servidor Duplicati (Requerido) {#duplicati-server-configuration-required}

Para que esta aplicación funcione correctamente, cada uno de sus servidores de Duplicati debe estar configurado para enviar reportes HTTP para cada ejecución de backup al servidor de **duplistatus**.

Aplique esta configuración a cada uno de sus servidores de Duplicati:

1. **Permitir acceso remoto:** Inicie sesión en [la interfaz de usuario de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), seleccione `Settings`, y permita el acceso remoto, incluyendo una lista de nombres de host (o utilice `*`).

![Duplicati settings](/img/duplicati-settings.png)

:::caution
    Solo active el acceso remoto si su servidor Duplicati está protegido por una red segura
    (por ejemplo, VPN, LAN privada o reglas de firewall). Exponer la interfaz de Duplicati a Internet público
    sin medidas de seguridad adecuadas podría dar lugar a acceso no autorizado.
    :::

2. **Configurar la notificación de resultados de backup:** En la página de Configuración de Duplicati, seleccione `Settings` y, en la sección `Default Options`, incluya las siguientes opciones. Reemplace 'my.local.server' con su Nombre del servidor o Dirección IP donde **duplistatus** está en ejecución.

| Opción avanzada                  | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Alternativamente, puede hacer clic en `Edit as text` y copiar las líneas a continuación, reemplazando `my.local.server` con su Dirección del servidor real.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Duplicati configuration](/img/duplicati-options.png)

**Notas importantes sobre los mensajes enviados por Duplicati:**

- Si omite `--send-http-log-level=Information`, no se enviarán mensajes de registro a **duplistatus**, solo estadísticas. Esto evitará que la característica de versiones disponibles funcione.
- La configuración recomendada es `--send-http-max-log-lines=0` para un número ilimitado de mensajes, ya que el valor por defecto de Duplicati de 100 mensajes puede evitar que las versiones disponibles se reciban en el registro.
- Si limita el número de mensajes, es posible que no se reciban los mensajes de registro requeridos para obtener las versiones de backup disponibles. Esto evitará que esas versiones se muestren para esa ejecución de backup.

:::tip
Después de configurar el servidor **duplistatus**, recopile los logs de backup para todos sus servidores Duplicati usando [Recopilar logs de backup](../user-guide/collect-backup-logs.md).
:::
