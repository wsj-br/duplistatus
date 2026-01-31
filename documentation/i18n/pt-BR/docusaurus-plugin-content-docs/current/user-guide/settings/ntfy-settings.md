---
translation_last_updated: '2026-01-31T00:51:31.015Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: 07586afae4356ecc
translation_language: pt-BR
source_file_path: user-guide/settings/ntfy-settings.md
---
# NTFY {#ntfy}

NTFY é um serviço de [notificações de código aberto](https://github.com/binwiederhier/ntfy) simples que pode enviar notificações push para seu telefone ou desktop. Esta seção permite que você configure sua conexão com o servidor de notificações e autenticação.

![Ntfy settings](/assets/screen-settings-ntfy.png)

| Configuração          | Descrição                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **URL NTFY**          | A URL do seu servidor NTFY (padrão para o público `https://ntfy.sh/`).                                                                      |
| **Tópico NTFY**        | Um identificador único para suas notificações. O sistema gerará automaticamente um tópico aleatório se deixado em branco, ou você pode especificar o seu próprio. |
| **Token de Acesso NTFY** | Um token de acesso opcional para servidores NTFY autenticados. Deixe este campo em branco se seu servidor não exigir autenticação.               |

<br/>

A <IIcon2 icon="lucide:message-square" color="green"/> ícone verde ao lado de `NTFY` na barra lateral significa que suas configurações são válidas. Se o ícone for <IIcon2 icon="lucide:message-square" color="yellow"/> amarelo, suas configurações não são válidas.
Quando a configuração não é válida, as caixas de seleção NTFY na aba [`Notificações de Backup`](backup-notifications-settings.md) também ficarão desativadas.

## Ações Disponíveis {#available-actions}

| Botão                                                                 | Descrição                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Salvar configurações" />                                  | Salvar qualquer alteração feita nas configurações do NTFY.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Enviar mensagem de teste"/> | Enviar uma mensagem de teste para seu servidor NTFY para verificar sua configuração.                                         |
| <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/>          | Exibir um código QR que permite configurar rapidamente seu dispositivo móvel ou desktop para notificações NTFY. |

## Configuração do Dispositivo {#device-configuration}

Você deve instalar a aplicação NTFY em seu dispositivo antes de configurá-la ([veja aqui](https://ntfy.sh/)). Clicando no botão <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/> ou clicando com o botão direito no ícone <SvgButton svgFilename="ntfy.svg" /> na barra de ferramentas da aplicação, será exibido um código QR. Digitalizando este código QR configurará automaticamente seu dispositivo com o tópico NTFY correto para notificações.

<br/>

<br/>

:::caution
Se você usar o servidor público `ntfy.sh` sem um token de acesso, qualquer pessoa com o nome do seu tópico poderá visualizar suas
notificações. 
 
Para fornecer um grau de privacidade, um tópico aleatório de 12 caracteres é gerado, oferecendo mais de
3 sextilhões (3.000.000.000.000.000.000.000) de combinações possíveis, tornando difícil adivinhar.

Para melhor segurança, considere usar [autenticação por token de acesso](https://docs.ntfy.sh/config/#access-tokens) e [listas de controle de acesso](https://docs.ntfy.sh/config/#access-control-list-acl) para proteger seus tópicos, ou [auto-hospedar NTFY](https://docs.ntfy.sh/install/#docker) para controle total.

⚠️ **Você é responsável por proteger seus tópicos NTFY. Por favor, use este serviço por sua conta e risco.**
:::

```markdown
<br/>
<br/>
```

:::note
Todos os nomes de produtos, marcas registradas e marcas comerciais são propriedade de seus respectivos proprietários. Ícones e nomes são utilizados apenas para fins de identificação e não implicam endosso.
:::
