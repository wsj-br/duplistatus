---
translation_last_updated: '2026-04-18T00:02:18.378Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: 3bd58d9cbad231e20c93f90d5f2904a572e10982cc151b37c80613510401bb52
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/settings/ntfy-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - 'stepfun/step-3.5-flash:free'
---
# NTFY {#ntfy}

[NTFY](https://github.com/binwiederhier/ntfy) é um serviço de notificação simples que pode enviar notificações push para seu telefone ou desktop. Esta seção permite que você configure sua conexão com o servidor de notificações e autenticação.

![Ntfy settings](../../assets/screen-settings-ntfy.png)

| Configuração          | Descrição                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **URL NTFY**          | A URL do seu servidor NTFY (padrão é o público `https://ntfy.sh/`).                                                                      |
| **Tópico NTFY**        | Um identificador único para suas notificações. O sistema gerará automaticamente um tópico aleatório se deixado em branco, ou você pode especificar o seu próprio. |
| **Token de Acesso NTFY** | Um token de acesso opcional para servidores NTFY autenticados. Deixe este campo em branco se seu servidor não exigir autenticação.               |

<br/>

Um ícone <IIcon2 icon="lucide:message-square" color="green"/> verde ao lado de **NTFY** na barra lateral significa que suas configurações são válidas. Se o ícone for <IIcon2 icon="lucide:message-square" color="yellow"/> amarelo, suas configurações não são válidas.
Quando a configuração não é válida, as caixas de seleção NTFY na aba [`Notificações de Backup`](backup-notifications-settings.md) também ficarão desativadas.

## Ações Disponíveis {#available-actions}

| Botão                                                                | Descrição                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Salvar configurações" />                                  | Salve as alterações feitas nas configurações NTFY.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Enviar mensagem de teste"/> | Envie uma mensagem de teste para seu servidor NTFY para verificar sua configuração.                                         |
| <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/>          | Exiba um código QR que permite configurar rapidamente seu dispositivo móvel ou desktop para notificações NTFY. |

## Configuração de Dispositivo {#device-configuration}

Você deve instalar o aplicativo NTFY em seu dispositivo antes de configurá-lo ([veja aqui](https://ntfy.sh/)). Clicar no botão <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/> ou clicar com o botão direito no ícone <SvgButton svgFilename="ntfy.svg" /> na barra de ferramentas do aplicativo exibirá um código QR. Escanear este código QR configurará automaticamente seu dispositivo com o tópico NTFY correto para notificações.

<br/>

<br/>

:::caution
Se você usar o servidor público **ntfy.sh** sem um token de acesso, qualquer pessoa com o nome do seu tópico poderá visualizar suas notificações.

Para fornecer um grau de privacidade, um tópico aleatório de 12 caracteres é gerado, oferecendo mais de 3 sextilhões (3.000.000.000.000.000.000.000) de combinações possíveis, dificultando a adivinhação.

Para melhor segurança, considere usar [autenticação por token de acesso](https://docs.ntfy.sh/config/#access-tokens) e [listas de controle de acesso](https://docs.ntfy.sh/config/#access-control-list-acl) para proteger seus tópicos, ou [auto-hospedar NTFY](https://docs.ntfy.sh/install/#docker) para controle total.

⚠️ **Você é responsável por proteger seus tópicos NTFY. Use este serviço por sua conta e risco.**
:::

<br/>
<br/>

:::note
Todos os nomes de produtos, logotipos e marcas registradas são de propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::
