# Configuração do Servidor Duplicati (obrigatório) {/* #duplicati-server-configuration-required */}

Para que este aplicativo funcione corretamente, cada um de seus servidores Duplicati precisa ser configurado para enviar relatórios HTTP para cada execução de backup para o servidor **duplistatus**.

Aplique esta configuração a cada um de seus servidores Duplicati:

1. **Configurar relatório de resultado de backup:** Na página de configuração do Duplicati, selecione `Settings` e, na seção `Default Options`, inclua as opções a seguir.

![Configuração do Duplicati](/img/duplicati-options.png)

Substitua `my.local.server` pelo nome do host ou endereço IP que o servidor Duplicati usa para alcançar **duplistatus**. Consulte [Duplicati e duplistatus no mesmo host](#duplicati-and-duplistatus-on-the-same-host) se ambos forem executados em uma máquina.

Consulte a documentação de [notificações HTTP](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) do Duplicati para a referência de opções.

### Opções recomendadas (Duplicati 2.0.9.106 e posterior) {/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` já envia JSON, portanto `--send-http-result-output-format=Json` não é obrigatório (e é ignorado para essas URLs).

| Opção avançada            | Valor                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (adicione `?api_key=` quando chaves de API forem obrigatórias) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Alternativamente, você pode clicar em `Edit as text` e copiar as linhas abaixo, substituindo `my.local.server` pelo endereço do seu servidor.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Quando [chaves de API](../user-guide/settings/api-keys-settings.md) forem obrigatórias, acrescente a chave de escopo de carregamento à URL:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

O Duplicati não pode definir cabeçalhos HTTP personalizados. O parâmetro de consulta é a forma suportada de enviar a chave. Os logs de acesso do proxy reverso conterão o segredo, portanto restrinja quem pode ler esses logs.

`--send-http-max-log-lines=500` mantém o relatório JSON bem abaixo do limite de tamanho de carregamento padrão de 5 MB. `--send-http-max-log-lines=0` (ilimitado) pode exceder esse limite e retornar HTTP 413. Aumente o limite em Configurações → Chaves de API se precisar de relatórios maiores.

### Versões antigas do Duplicati {/* #older-duplicati-versions */}

Se seu servidor Duplicati for anterior à versão 2.0.9.106, use a opção de URL herdada e defina o formato de resultado como JSON:

| Opção avançada                  | Valor                                    |
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

### Linhas de log e versões disponíveis {/* #log-lines-and-available-versions */}

**Notas importantes sobre mensagens enviadas pelo Duplicati:**

- Se você omitir `--send-http-log-level=Information`, nenhuma mensagem de log será enviada para **duplistatus**, apenas estatísticas. Isso impedirá que a lista de **versões disponíveis** funcione.
- O padrão do Duplicati é `--send-http-max-log-lines=100`. O valor recomendado é `500`. O Duplicati mantém as **primeiras** N linhas de log. As linhas usadas para a lista de versões disponíveis (`Backups to consider`) geralmente estão nessas primeiras centenas de linhas; `100` geralmente é muito pouco.
- `--send-http-max-log-lines=0` significa ilimitado. Use isso apenas se a lista de versões ainda estiver faltando e você **não** estiver também enviando relatórios para [Duplicati Monitoring](https://www.duplicati-monitoring.com/). Logs ilimitados podem fazer com que esse serviço retorne HTTP 500 em trabalhos grandes.
- A **contagem** de versões disponíveis ainda vem das estatísticas JSON (`BackupListCount`) mesmo quando a lista de timestamp detalhada está faltando. Se o ícone da lista estiver esmaecido, aumente o limite (ou use `0` ao relatar apenas para **duplistatus**).

:::tip
Após configurar o servidor **duplistatus**, colete os logs de backup de todos os seus servidores Duplicati usando [Coletar Logs de Backup](../user-guide/collect-backup-logs.md).
:::

### Relatórios para duplistatus e Duplicati Monitoring {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

Você pode enviar relatórios do **mesmo** servidor Duplicati para **duplistatus** e [Duplicati Monitoring](https://www.duplicati-monitoring.com/) ao mesmo tempo. **duplistatus** deve receber JSON. Duplicati Monitoring espera relatórios codificados em formulário. Não aponte `--send-http-form-urls` para `/api/upload`.

Nesse servidor Duplicati, defina as Opções Padrão para:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Substitua `<your-endpoint>` pela URL da sua conta Duplicati Monitoring.

- Prefira essas opções dedicadas. Não mantenha também `--send-http-url` apontando para os mesmos destinos a menos que você ainda precise da opção legada.
- `--send-http-log-level` e `--send-http-max-log-lines` se aplicam a **todos** os destinos HTTP. Você não pode enviar um log completo para **duplistatus** e um relatório curto para Duplicati Monitoring.
- Use `500`, não `0`. Se Duplicati Monitoring ainda retornar HTTP 500 em trabalhos grandes, diminua o limite ainda mais (ou omita `Information`) sabendo que a **lista** de versões pode estar faltando. Se a lista estiver faltando mas Monitoring estiver bem, aumente o limite. Alternativamente, relate apenas para **duplistatus** nesses trabalhos.

:::caution
Se um destino HTTP falhar (indisponibilidade ou HTTP 500), o Duplicati pode não enviar os relatórios restantes. URLs de formulário são enviadas primeiro, depois URLs JSON. Uma indisponibilidade ou 500 do Duplicati Monitoring pode, portanto, bloquear o relatório JSON para **duplistatus**.
:::

[Coletar Logs de Backup](../user-guide/collect-backup-logs.md) não depende de relatórios HTTP. Use-o para preencher uma execução que não foi recebida.

### Duplicati e duplistatus no mesmo host {/* #duplicati-and-duplistatus-on-the-same-host */}

A URL de carregamento deve ser acessível **a partir do processo Duplicati**, não do seu navegador.

- **Duplicati no host, duplistatus em Docker com porta `9666` publicada:** `http://127.0.0.1:9666/api/upload` (ou o IP LAN do host).
- **Ambos em Docker em uma rede compartilhada:** `http://duplistatus:9666/api/upload` (o nome do serviço Compose ou container). `localhost` dentro do container Duplicati é esse container, não **duplistatus**.
- **Proxy reverso HTTPS no mesmo host:** use a URL HTTPS pública como em [Endurecimento de Segurança](security-hardening.md).

Coletar Logs de Backup é a direção inversa: a partir do container **duplistatus**, `localhost:8200` não é Duplicati no host. Use o IP do host, `host.docker.internal` (Docker Desktop, ou um host extra que você configurou), ou o nome do container Duplicati.

2. **Opcional - Permitir acesso remoto à UI:** Se você quiser acessar a interface web do Duplicati diretamente dos links do painel **duplistatus**, entre em [UI do Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), selecione `Settings` e permita acesso remoto, incluindo uma lista de nomes de host (ou use `*`). Se você pular isso, **duplistatus** ainda receberá relatórios de backup, mas os links diretos para a UI do Duplicati não funcionarão.

:::info
Se você não ativar acesso remoto no Duplicati, os links em **Duplistatus** para acessar a __UI do Duplicati__ não funcionarão.
:::

![Configurações do Duplicati](/img/duplicati-settings.png)

:::caution
Ative o acesso remoto apenas se seu servidor Duplicati estiver protegido por uma rede segura
(por exemplo, VPN, LAN privada ou regras de firewall). Expor a interface do Duplicati à Internet pública
sem medidas de segurança adequadas pode levar a acesso não autorizado.

Recomenda-se usar Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ou soluções semelhantes para acessar com segurança seus servidores de fora de sua rede local.
:::
