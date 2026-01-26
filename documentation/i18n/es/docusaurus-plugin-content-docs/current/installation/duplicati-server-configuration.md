# Configuración del servidor Duplicati (requerido) {#duplicati-server-configuration-required}

Para que esta aplicación funcione correctamente, cada uno de sus Servidores de Duplicati debe estar configurado para enviar reportes HTTP para cada ejecución de backup al servidor **duplistatus**.

Aplique esta configuración a cada uno de sus Servidores de Duplicati:

1. **Permitir acceso remoto:** Inicie sesión en [la interfaz de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), seleccione `Configuración` y permita acceso remoto, incluyendo una lista de nombres de host (o use `*`).

![Configuración de Duplicati](/img/duplicati-settings.png)

    ```
    :::caution
    Solo Activar el acceso remoto si su servidor Duplicati está protegido por una red segura
    (por ejemplo, VPN, LAN privada o reglas de firewall). Exponer la interfaz de Duplicati a Internet público
    sin medidas de Seguridad adecuadas podría llevar a acceso no autorizado.
    :::
    ```

2. **Configurar reporte de resultados de backup:** En la Configuración de Duplicati, seleccione `Configuración` y, en la sección `Por defecto`, incluya las siguientes opciones. Reemplace 'my.local.server' con su Nombre del servidor o Dirección IP donde **duplistatus** está en ejecución.

    ```
    | Opción avanzada                  | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |
    ```

Alternativamente, puede hacer clic en `Editar como texto` y copiar las líneas a continuación, reemplazando `my.local.server` con su dirección de servidor real.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Configuración de Duplicati](/img/duplicati-options.png)

**Notas importantes sobre Mensajes enviados por Duplicati:**

- Si omite `--send-http-log-level=Information`, ningún Mensajes de Logs serán enviados a **duplistatus**, solo Estadísticas. Esto evitará que la característica de Versiones disponibles funcione.
- La configuración recomendada es `--send-http-max-log-lines=0` para Mensajes ilimitados, ya que el Por defecto de Duplicati de 100 Mensajes puede evitar que las Versiones disponibles se reciban en el Logs.
- Si limita el Número de mensajes, los Mensajes de Logs requeridos para obtener las Versiones de backup disponibles pueden no ser recibidos. Esto evitará que esas Versiones se muestren para esa ejecución de backup.

:::tip
Después de configurar el servidor **duplistatus**, recopile los Logs de backup para todos sus Servidores de Duplicati usando [Recopilar logs de backup](../user-guide/collect-backup-logs.md).
:::

