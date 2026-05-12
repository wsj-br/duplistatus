# Configuração do Servidor Duplicati (Obrigatório) {#duplicati-server-configuration-required}

Para que este aplicativo funcione corretamente, cada um de seus servidores Duplicati precisa ser configurado para enviar relatórios HTTP para cada execução de backup para o servidor **duplistatus**.

Aplique esta configuração a cada um de seus servidores Duplicati:

1. **Configurar relatórios de resultado de backup:** Na página de configuração do Duplicati, selecione `Settings` e, na seção `Default Options`, inclua as seguintes opções.

![Duplicati configuration](/img/duplicati-options.png)

Substitua 'my.local.server' pelo nome do seu servidor ou endereço IP onde o **duplistatus** está em execução.

| Opção avançada                  | Valor                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Alternativamente, você pode clicar em `Edit as text` e copiar as linhas abaixo, substituindo `my.local.server` pelo endereço do seu servidor.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

**Notas importantes sobre mensagens enviadas pelo Duplicati:**

- Se você omitir `--send-http-log-level=Information`, nenhuma mensagem de log será enviada para **duplistatus**, apenas estatísticas. Isso impedirá que o recurso de versões disponíveis funcione.
- A configuração recomendada é `--send-http-max-log-lines=0` para mensagens ilimitadas, já que o padrão do Duplicati de 100 mensagens pode impedir que as versões disponíveis sejam recebidas no log.
- Se você limitar o número de mensagens, as mensagens de log obrigatórias para obter as versões de backup disponíveis podem não ser recebidas. Isso impedirá que essas versões sejam exibidas para essa execução de backup.

:::tip
Após configurar o servidor **duplistatus**, colete os logs de backup para todos os seus servidores Duplicati usando [Coletar logs de backup](../user-guide/collect-backup-logs.md).
:::

2. **Opcional - Permitir acesso à interface remota:** Se você deseja acessar a interface web do Duplicati diretamente pelos links do painel **duplistatus**, faça login na [Interface do Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), selecione `Settings` e permita o acesso remoto, incluindo uma lista de nomes de host (ou use `*`). Se você pular esta etapa, o **duplistatus** ainda receberá relatórios de backup, mas os links diretos para a interface do Duplicati não funcionarão.

:::info
Se você não habilitar o acesso remoto no Duplicati, os links no **Duplistatus** para acessar a __Interface do Duplicati__ não funcionarão.
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
Habilite o acesso remoto apenas se o seu servidor Duplicati estiver protegido por uma rede segura
(por exemplo, VPN, LAN privada ou regras de firewall). Expor a interface do Duplicati à Internet pública
sem medidas de segurança adequadas pode levar a acesso não autorizado.

Recomenda-se usar Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ou soluções similares para acessar seus servidores com segurança de fora da rede local.
:::
