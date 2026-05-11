---
translation_last_updated: '2026-05-11T14:27:42.252Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: fae3a81d94023aecc08c2c0b247e071f9990285fb3aa9384cc93cba826f99fe6
translation_language: pt-BR
source_file_path: documentation/docs/installation/configure-tz.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
---
# Fuso horário {#timezone}

A interface do usuário da aplicação exibirá data e hora de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação utilizará o valor definido na variável de ambiente `TZ` para formatar fusos horários.

O valor padrão é `TZ=Europe/London` se esta variável de ambiente não estiver definida.

:::note
As configurações de idioma e localidade (formatos de número e data) para notificações podem ser configuradas em [Configurações → Modelos](../user-guide/settings/notification-templates.md).
:::

## Configurando o Fuso horário {#configuring-the-timezone}

A interface do usuário da aplicação exibirá data e hora de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação utilizará o valor definido na variável de ambiente `TZ` para formatar fusos horários.

O valor padrão é `TZ=Europe/London` se esta variável de ambiente não estiver definida.

Por exemplo, para alterar o fuso horário para São Paulo, adicione estas linhas ao `compose.yml` no diretório `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou passe a variável de ambiente na linha de comando (Docker ou Podman):

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
