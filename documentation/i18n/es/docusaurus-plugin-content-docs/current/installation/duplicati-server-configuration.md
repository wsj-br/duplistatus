# Configuración del Servidor Duplicati (Requerido)

Para que esta aplicación funcione correctamente, cada uno de sus servidores Duplicati debe configurarse para enviar informes HTTP de cada ejecución de copia de seguridad al servidor **duplistatus**.

Aplique esta configuración a cada uno de sus servidores Duplicati:

1. **Permitir acceso remoto:** Inicie sesión en la [interfaz de usuario de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), seleccione `Settings` y permita el acceso remoto, incluyendo una lista de nombres de host (o use `*`).

![Configuración de Duplicati](/img/duplicati-settings.png)

    ```
    :::caution
    Solo habilite el acceso remoto si su servidor Duplicati está protegido por una red segura
    (por ejemplo, VPN, LAN privada o reglas de firewall). Exponer la interfaz de Duplicati a Internet pública
    sin las medidas de seguridad adecuadas podría llevar a accesos no autorizados.
    :::
    ```

2. **Configurar informes de resultados de copia de seguridad:** En la página de configuración de Duplicati, seleccione `Settings` y, en la sección `Default Options`, incluya las siguientes opciones. Reemplace 'my.local.server' con el nombre de su servidor o dirección IP donde se está ejecutando **duplistatus**.

    ```
    | Opción avanzada                 | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |
    ```

Alternativamente, puede hacer clic en `Edit as text` y copiar las líneas a continuación, reemplazando `my.local.server` con la dirección real de su servidor.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Configuración de Duplicati](/img/duplicati-options.png)

**Notas importantes sobre los mensajes enviados por Duplicati:**

- Si omite `--send-http-log-level=Information`, no se enviarán mensajes de registro a **duplistatus**, solo estadísticas. Esto evitará que funcione la característica de versiones disponibles.
- La configuración recomendada es `--send-http-max-log-lines=0` para mensajes ilimitados, ya que el valor predeterminado de Duplicati de 100 mensajes puede evitar que las versiones disponibles se reciban en el registro.
- Si limita el número de mensajes, es posible que no se reciban los mensajes de registro necesarios para obtener las versiones de copia de seguridad disponibles. Esto evitará que esas versiones se muestren para esa ejecución de copia de seguridad.

:::tip
Después de configurar el servidor **duplistatus**, recopile los registros de copia de seguridad de todos sus servidores Duplicati usando [Recopilar Registros de Copia de Seguridad](../user-guide/collect-backup-logs.md).
:::

