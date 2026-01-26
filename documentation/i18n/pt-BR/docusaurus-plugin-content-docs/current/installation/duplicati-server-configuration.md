# Configuração do Servidor Duplicati (obrigatório) {#duplicati-server-configuration-required}

Para que este aplicativo funcione corretamente, cada um de seus Servidores Duplicati precisa ser configurado para enviar relatórios HTTP para cada execução de backup para o servidor **duplistatus**.

Aplique esta configuração a cada um de seus Servidores Duplicati:

1. **Permitir acesso remoto:** Entrar na [Interface do Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), Selecionar `Configurações` e permitir acesso remoto, incluindo uma lista de nomes de host (ou use `*`).

![Configurações do Duplicati](/img/duplicati-settings.png)

    ```
    :::caution
    Ativar acesso remoto apenas se seu servidor Duplicati estiver protegido por uma rede segura
    (por exemplo, VPN, LAN privada ou regras de firewall). Expor a interface do Duplicati à Internet pública
    sem medidas de Segurança adequadas pode levar a acesso não autorizado.
    :::
    ```

2. **Configurar relatório de resultados de backup:** Na página de Configuração do Duplicati, Selecionar `Configurações` e, na seção `Opções Padrão`, incluir as opções a seguir. Substitua 'my.local.server' pelo Nome do servidor ou Endereço IP onde **duplistatus** está em execução.

    ```
    | Opção avançada                   | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |
    ```

Alternativamente, você pode clicar em `Editar como texto` e Copiar as linhas abaixo, substituindo `my.local.server` pelo Endereço do servidor real.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Configuração do Duplicati](/img/duplicati-options.png)

**Notas importantes sobre Mensagens enviadas pelo Duplicati:**

- Se você omitir `--send-http-log-level=Information`, nenhuma Mensagem de Logs será enviada para **duplistatus**, apenas Estatísticas. Isso impedirá que o recurso de Versões disponíveis funcione.
- A configuração recomendada é `--send-http-max-log-lines=0` para Mensagens ilimitadas, pois o Padrão do Duplicati de 100 Mensagens pode impedir que as Versões disponíveis sejam recebidas no Log.
- Se você limitar o Número de mensagens, as Mensagens de Logs necessárias para obter as Versões de backup disponíveis podem não ser recebidas. Isso impedirá que essas Versões sejam exibidas para essa execução de backup.

:::tip
Após configurar o servidor **duplistatus**, Coletar os Logs de backup para Todos os seus Servidores Duplicati usando [Coletar logs de backup](../user-guide/collect-backup-logs.md).
:::

