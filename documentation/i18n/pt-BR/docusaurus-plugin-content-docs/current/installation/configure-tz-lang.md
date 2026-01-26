# Fuso horário e Localidade {#timezone-and-locale}

A data e hora da interface do usuário da aplicação serão exibidas de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação usará o valor definido nas variáveis de ambiente `TZ` e `LANG` para usar os fusos horários corretos e para formatar valores de número, data e hora.

Os valores padrão são `TZ=Europe/London` e `LANG=en_GB` se essas variáveis de ambiente não forem definidas.

## Configurando o Fuso horário {#configuring-the-timezone}

A data e hora da interface do usuário da aplicação serão exibidas de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação usará o valor definido na variável de ambiente `TZ` para formatar fusos horários.

O valor padrão é `TZ=Europe/London` se essa variável de ambiente não for definida.

Por exemplo, para alterar o fuso horário para São Paulo, adicione estas linhas ao `compose.yml` no diretório `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou passe a variável de ambiente na linha de comando:

```bash
  --env TZ=America/Sao_Paulo
```

### Usando sua Configuração do Linux {#using-your-linux-configuration}

Para obter a configuração do seu host Linux, você pode executar:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Lista de Fusos horários {#list-of-timezones}

Você pode encontrar uma lista de fusos horários aqui: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Configurando a Localidade {#configuring-the-locale}

As datas e números da interface do usuário da aplicação serão exibidos de acordo com as configurações do navegador. No entanto, para fins de registro e notificações, a aplicação usará o valor definido na variável de ambiente `LANG` para formatar datas e números.

O valor padrão é `LANG=en_GB` se essa variável de ambiente não for definida.

Por exemplo, para alterar a localidade para Português Brasileiro, adicione estas linhas ao `compose.yml` no diretório `duplistatus`:

```yaml
environment:
  - LANG=pt_BR
```

ou passe a variável de ambiente na linha de comando:

```bash
  --env LANG=pt_BR
```

### Usando sua Configuração do Linux {#using-your-linux-configuration}

Para obter a configuração do seu host Linux, você pode executar:

```bash
echo ${LANG%.*}
```

### Lista de Localidades {#list-of-locales}

Você pode encontrar uma lista de localidades aqui: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)

