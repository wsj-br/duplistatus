# Configuración del Servidor Duplicati (Requerido) {#duplicati-server-configuration-required}

Para que esta aplicación funcione correctamente, cada uno de sus servidores Duplicati debe configurarse para enviar informes HTTP para cada ejecución de backup al servidor **duplistatus**.

Aplique esta configuración a cada uno de sus servidores Duplicati:

1. **Configurar la notificación de resultados de copia de seguridad:** En la página de configuración de Duplicati, seleccione `Settings` y, en la sección `Default Options`, incluya las siguientes opciones.

![Duplicati configuration](/img/duplicati-options.png)

Reemplace 'my.local.server' con el nombre de su servidor o dirección IP donde se está ejecutando **duplistatus**.

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

**Notas importantes sobre los mensajes enviados por Duplicati:**

- Si omite `--send-http-log-level=Information`, no se enviarán mensajes de registro a **duplistatus**, solo Estadísticas. Esto evitará que la función de Versiones disponibles funcione.
- La configuración recomendada es `--send-http-max-log-lines=0` para Mensajes ilimitados, ya que el valor por defecto de Duplicati de 100 Mensajes puede evitar que las Versiones disponibles se reciban en el registro.
- Si limita el Número de mensajes, es posible que no se reciban los Mensajes de registro requeridos para obtener las Versiones de backup disponibles. Esto evitará que esas Versiones se muestren para esa ejecución de backup.

:::tip
Después de configurar el servidor **duplistatus**, recopile los logs de backup de todos sus servidores Duplicati usando [Recopilar logs de backup](../user-guide/collect-backup-logs.md).
:::

2. **Opcional - Permitir acceso a la interfaz remota:** Si desea acceder a la interfaz web de Duplicati directamente desde los enlaces del panel de **duplistatus**, inicie sesión en [Interfaz de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), seleccione `Settings` y permita el acceso remoto, incluyendo una lista de nombres de host (o use `*`). Si omite esto, **duplistatus** seguirá recibiendo informes de copia de seguridad, pero los enlaces directos a la interfaz de Duplicati no funcionarán.

:::info
Si no habilita el acceso remoto en Duplicati, los enlaces en **Duplistatus** para acceder a la __Interfaz de Duplicati__ no funcionarán.
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
Solo habilite el acceso remoto si su servidor Duplicati está protegido por una red segura
(por ejemplo, VPN, LAN privada o reglas de firewall). Exponer la interfaz de Duplicati a Internet
público sin las medidas de seguridad adecuadas podría llevar a un acceso no autorizado.

Se recomienda usar Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard o soluciones similares para acceder de forma segura a sus servidores desde fuera de su red local.
:::
