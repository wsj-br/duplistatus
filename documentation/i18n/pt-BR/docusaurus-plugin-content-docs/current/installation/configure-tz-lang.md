---
translation_last_updated: '2026-02-05T00:21:09.884Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 67bb94741185f3d9
translation_language: pt-BR
source_file_path: installation/configure-tz-lang.md
---
# Fuso horário e Localidade {#timezone-and-locale}

A interface do usuário da aplicação exibirá data e hora de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação utilizará o valor definido nas variáveis de ambiente `TZ` e `LANG` para usar os fusos horários corretos e para formatar valores de número, data e hora.

Os valores padrão são `TZ=Europe/London` e `LANG=en_GB` se estas variáveis de ambiente não estiverem definidas.

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

## Configurando a Localidade {#configuring-the-locale}

A interface do usuário da aplicação exibirá datas e números de acordo com as configurações do navegador. Porém, para fins de registro e notificações, a aplicação utilizará o valor definido na variável de ambiente `LANG` para formatar datas e números.

O valor padrão é `LANG=en_GB` se esta variável de ambiente não estiver definida.

Por exemplo, para alterar a localidade para Português Brasileiro, adicione estas linhas ao `compose.yml` no diretório `duplistatus`:

```yaml
environment:
  - LANG=pt_BR
```

ou passe a variável de ambiente na linha de comando:

```bash
  --env LANG=pt_BR
```

### Usando sua Configuração Linux {#using-your-linux-configuration}

Para obter a configuração do seu host Linux, você pode executar:

```bash
echo ${LANG%.*}
```

### Lista de Locales {#list-of-locales}

Você pode encontrar uma lista de locales aqui: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)
