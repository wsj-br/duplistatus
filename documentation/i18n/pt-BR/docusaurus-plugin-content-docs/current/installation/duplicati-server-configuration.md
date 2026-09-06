# Configuração do Servidor Duplicati (Obrigatório) {#duplicati-server-configuration-required}

Para que este aplicativo funcione corretamente, cada um de seus servidores Duplicati precisa ser configurado para enviar relatórios HTTP para cada execução de backup para o servidor **duplistatus**.

Aplique esta configuração a cada um de seus servidores Duplicati:

1. **Configurar relatórios de resultado de backup:** Na página de configuração do Duplicati, selecione `Settings` e, na seção `Default Options`, inclua as seguintes opções.

![Configuração do Duplicati](/img/duplicati-options.png)

Substitua `my.local.server` pelo nome do host ou endereço IP que o servidor Duplicati usa para alcançar **duplistatus**. Veja [Duplicati e duplistatus no mesmo host](#duplicati-and-duplistatus-on-the-same-host) se ambos estiverem em uma mesma máquina.

Veja a documentação de [notificações HTTP](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) do Duplicati para a referência de opções.

### Opções recomendadas (Duplicati 2.0.9.106 e posterior) {#recommended-options-duplicati-209106-and-later}

`--send-http-json-urls` já envia JSON, então `--send-http-result-output-format=Json` não é necessário (e é ignorado para essas URLs).

| Opção avançada           | Valor                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (adicione `?api_key=` quando chaves de API forem necessárias) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Alternativamente, você pode clicar em `Edit as text` e copiar as linhas abaixo, substituindo `my.local.server` pelo endereço do seu servidor.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Quando [chaves de API](../user-guide/settings/api-keys-settings.md) forem necessárias, anexe a chave de escopo de carregamento à URL:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

O Duplicati não pode definir cabeçalhos HTTP personalizados. O parâmetro de consulta é o método suportado para enviar a chave. Os registros de acesso do proxy reverso conterão o segredo, então restrinja quem pode ler esses registros.

`--send-http-max-log-lines=500` mantém o relatório JSON bem abaixo do limite padrão de 5 MB para o tamanho de carregamento. `--send-http-max-log-lines=0` (ilimitado) pode exceder esse limite e retornar HTTP 413. Aumente o limite em Configurações → Chaves de API se você precisar de relatórios maiores.

### Versões mais antigas do Duplicati {#older-duplicati-versions}

Se o servidor Duplicati for mais antigo que 2.0.9.106, use a opção de URL legado e defina o formato do resultado como JSON:

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

### Linhas de log e versões disponíveis {#log-lines-and-available-versions}

**Notas importantes sobre mensagens enviadas pelo Duplicati:**

- Se você omitir `--send-http-log-level=Information`, nenhuma mensagem de log será enviada para **duplistatus**, apenas estatísticas. Isso impedirá que a **lista** de versões disponíveis funcione.
- O padrão do Duplicati é `--send-http-max-log-lines=100`. O valor recomendado é `500`. O Duplicati mantém as **primeiras** N linhas de log. As linhas usadas para a lista de versões disponíveis (`Backups to consider`) geralmente estão nas primeiras centenas de linhas; `100` é frequentemente muito pouco.
- `--send-http-max-log-lines=0` significa ilimitado. Use isso apenas se a lista de versões ainda estiver ausente e você **não** também estiver enviando relatórios para [Monitoramento do Duplicati](https://www.duplicati-monitoring.com/). Logs ilimitados podem fazer esse serviço retornar HTTP 500 em trabalhos grandes.
- A **contagem** de versões disponíveis ainda vem das estatísticas JSON (`BackupListCount`) mesmo quando a lista detalhada de timestamps está ausente. Se o ícone da lista estiver cinza, aumente o limite (ou use `0` ao relatar apenas para **duplistatus**).

:::tip
Após configurar o servidor **duplistatus**, colete os logs de backup para todos os seus servidores Duplicati usando [Coletar logs de backup](../user-guide/collect-backup-logs.md).
:::

### Relatando para duplistatus e Monitoramento do Duplicati {#reporting-to-duplistatus-and-duplicati-monitoring}

Você pode enviar relatórios do **mesmo** servidor Duplicati para **duplistatus** e [Monitoramento do Duplicati](https://www.duplicati-monitoring.com/) ao mesmo tempo. **duplistatus** deve receber JSON. O Monitoramento do Duplicati espera relatórios codificados em formulário. Não aponte `--send-http-form-urls` para `/api/upload`.

Nesse servidor Duplicati, defina as Opções Padrão como:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Substitua `<your-endpoint>` pela URL da sua conta de Monitoramento do Duplicati.

- Prefira essas opções dedicadas. Não mantenha também `--send-http-url` apontando para os mesmos destinos a menos que você ainda precise da opção legado.
- `--send-http-log-level` e `--send-http-max-log-lines` se aplicam a **cada** destino HTTP. Você não pode enviar um log completo para **duplistatus** e um relatório curto para o Monitoramento do Duplicati.
- Use `500`, não `0`. Se o Monitoramento do Duplicati ainda retornar HTTP 500 em trabalhos grandes, diminua o limite ainda mais (ou omita `Information`) sabendo que a **lista** de versões pode estar ausente. Se a lista estiver ausente mas o Monitoramento estiver bem, aumente o limite. Alternativamente, relatar apenas para **duplistatus** para esses trabalhos.

:::caution
Se um destino HTTP falhar (indisponibilidade ou HTTP 500), o Duplicati pode não enviar os relatórios restantes. URLs de formulário são enviados primeiro, depois URLs JSON. Uma indisponibilidade ou 500 do Monitoramento do Duplicati pode, portanto, bloquear o relatório JSON para **duplistatus**.
:::

[Coletar Logs de Backup](../user-guide/collect-backup-logs.md) não depende do relatório HTTP. Use-o para preencher um trabalho que não foi recebido.

### Duplicati e duplistatus no mesmo host {#duplicati-and-duplistatus-on-the-same-host}

A URL de upload deve ser acessível **a partir do processo Duplicati**, não do seu navegador.

- **Duplicati no host, duplistatus no Docker com porta `9666` publicada:** `http://127.0.0.1:9666/api/upload` (ou o IP LAN do host).
- **Ambos no Docker em uma rede compartilhada:** `http://duplistatus:9666/api/upload` (o nome do serviço Compose ou do contêiner). `localhost` dentro do contêiner Duplicati é esse contêiner, não **duplistatus**.
- **Proxy reverso HTTPS no mesmo host:** use a URL HTTPS pública conforme em [Configuração HTTPS](https-setup.md).

Coletar Logs de Backup é na direção oposta: a partir do contêiner **duplistatus**, `localhost:8200` não é o Duplicati no host. Use o IP do host, `host.docker.internal` (Docker Desktop, ou um host extra que você configurou), ou o nome do contêiner Duplicati.

2. **Opcional - Permitir acesso à interface remota:** Se você deseja acessar a interface web do Duplicati diretamente pelos links do painel **duplistatus**, faça login na [Interface do Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), selecione `Settings` e permita o acesso remoto, incluindo uma lista de nomes de host (ou use `*`). Se você pular esta etapa, o **duplistatus** ainda receberá relatórios de backup, mas os links diretos para a interface do Duplicati não funcionarão.

:::info
Se você não habilitar o acesso remoto no Duplicati, os links no **Duplistatus** para acessar a __Interface do Duplicati__ não funcionarão.
:::

![Configurações do Duplicati](/img/duplicati-settings.png)

:::caution
Habilite o acesso remoto apenas se o seu servidor Duplicati estiver protegido por uma rede segura
(por exemplo, VPN, LAN privada ou regras de firewall). Expor a interface do Duplicati à Internet pública
sem medidas de segurança adequadas pode levar a acesso não autorizado.

Recomenda-se usar Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ou soluções similares para acessar seus servidores com segurança de fora da rede local.
:::
