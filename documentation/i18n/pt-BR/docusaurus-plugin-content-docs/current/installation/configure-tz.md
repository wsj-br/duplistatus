---
translation_last_updated: '2026-02-06T22:33:41.255Z'
source_file_mtime: '2026-02-06T21:13:34.856Z'
source_file_hash: d6bdf0e9f9ddb899
translation_language: pt-BR
source_file_path: installation/configure-tz.md
---
# Fuso horário {#timezone}

A interface do usuário da aplicação exibirá data e hora de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação utilizará o valor definido na variável de ambiente `TZ` para formatar fusos horários.

O valor padrão é `TZ=Europe/London` se esta variável de ambiente não estiver definida.

:::note
Localidade (formato de número e data) para notificações é configurada em [Configurações → Modelos de notificação](../user-guide/settings/notification-templates.md).
:::

## Configurando o Fuso horário {#configuring-the-timezone}

A interface do usuário da aplicação exibirá data e hora de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação utilizará o valor definido na variável de ambiente `TZ` para formatar fusos horários.

O valor padrão é `TZ=Europe/London` se esta variável de ambiente não estiver definida.

Por exemplo, para alterar o fuso horário para São Paulo, adicione estas linhas ao `compose.yml` no diretório `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou passe a variável de ambiente na linha de comando:

```bash
  --env TZ=America/Sao_Paulo
```

### Usando sua Configuração Linux {#using-your-linux-configuration}

Para obter a configuração do seu host Linux, você pode executar:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Lista de Fusos Horários {#list-of-timezones}

Você pode encontrar uma lista de fusos horários aqui: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
