# Configuração do Servidor Duplicati (Obrigatório)

Para que esta aplicação funcione corretamente, cada um dos seus servidores Duplicati precisa ser configurado para enviar relatórios HTTP para cada execução de backup ao servidor **duplistatus**.

Aplique esta configuração a cada um dos seus servidores Duplicati:

1. **Permitir acesso remoto:** Faça login na [interface do Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), selecione `Configurações` e permita acesso remoto, incluindo uma lista de nomes de host (ou use `*`).

![Configurações do Duplicati](/img/duplicati-settings.png)

    ```
    :::caution
    Apenas habilite o acesso remoto se o seu servidor Duplicati estiver protegido por uma rede segura
    (por exemplo, VPN, LAN privada ou regras de firewall). Expor a interface do Duplicati à Internet pública
    sem medidas de segurança adequadas pode levar a acesso não autorizado.
    :::
    ```

2. **Configurar relatório de resultados de backup:** Na página de configuração do Duplicati, selecione `Configurações` e, na seção `Opções Padrão`, inclua as seguintes opções. Substitua 'my.local.server' pelo nome do seu servidor ou endereço IP onde o **duplistatus** está sendo executado.

    ```
    | Opção avançada                   | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |
    ```

Alternativamente, você pode clicar em `Editar como texto` e copiar as linhas abaixo, substituindo `my.local.server` pelo endereço real do seu servidor.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Configuração do Duplicati](/img/duplicati-options.png)

**Notas importantes sobre mensagens enviadas pelo Duplicati:**

- Se você omitir `--send-http-log-level=Information`, nenhuma mensagem de log será enviada ao **duplistatus**, apenas estatísticas. Isso impedirá que o recurso de versões disponíveis funcione.
- A configuração recomendada é `--send-http-max-log-lines=0` para mensagens ilimitadas, já que o padrão do Duplicati de 100 mensagens pode impedir que as versões disponíveis sejam recebidas no log.
- Se você limitar o número de mensagens, as mensagens de log necessárias para obter as versões de backup disponíveis podem não ser recebidas. Isso impedirá que essas versões sejam exibidas para aquela execução de backup.

:::tip
Após configurar o servidor **duplistatus**, colete os logs de backup de todos os seus servidores Duplicati usando [Coletar Logs de Backup](../user-guide/collect-backup-logs.md).
:::

