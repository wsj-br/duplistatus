---
translation_last_updated: '2026-01-31T00:51:29.409Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: da5148730ecb385b
translation_language: pt-BR
source_file_path: installation/duplicati-server-configuration.md
---
# Configuração do Servidor Duplicati (Obrigatório) {#duplicati-server-configuration-required}

Para que este aplicativo funcione corretamente, cada um de seus servidores Duplicati precisa ser configurado para enviar relatórios HTTP para cada execução de backup ao servidor **duplistatus**.

Aplique esta configuração a cada um de seus servidores Duplicati:

1. **Permitir acesso remoto:** Entrar na [interface do Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), selecionar `Settings` e permitir acesso remoto, incluindo uma lista de nomes de host (ou usar `*`).

![Duplicati settings](/img/duplicati-settings.png)

:::caution
    Ative o acesso remoto apenas se seu servidor Duplicati estiver protegido por uma rede segura
    (por exemplo, VPN, LAN privada ou regras de firewall). Expor a interface do Duplicati à Internet pública
    sem medidas de segurança adequadas pode levar a acesso não autorizado.
    :::

2. **Configurar relatório de resultados de backup:** Na página Configuração do Duplicati, selecione `Settings` e, na seção `Default Options`, inclua as seguintes opções. Substitua 'my.local.server' pelo nome do seu servidor ou endereço IP onde **duplistatus** está em execução.

| Opção avançada                   | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Alternativamente, você pode clicar em `Edit as text` e copiar as linhas abaixo, substituindo `my.local.server` pelo seu Endereço do servidor real.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Duplicati configuration](/img/duplicati-options.png)

**Notas importantes sobre mensagens enviadas pelo Duplicati:**

- Se você omitir `--send-http-log-level=Information`, nenhuma mensagem de log será enviada para **duplistatus**, apenas estatísticas. Isso impedirá que o recurso de versões disponíveis funcione.
- A configuração recomendada é `--send-http-max-log-lines=0` para mensagens ilimitadas, já que o padrão do Duplicati de 100 mensagens pode impedir que as versões disponíveis sejam recebidas no log.
- Se você limitar o número de mensagens, as mensagens de log obrigatórias para obter as versões de backup disponíveis podem não ser recebidas. Isso impedirá que essas versões sejam exibidas para essa execução de backup.

:::tip
Após configurar o servidor **duplistatus**, colete os logs de backup para todos os seus servidores Duplicati usando [Coletar logs de backup](../user-guide/collect-backup-logs.md).
:::
