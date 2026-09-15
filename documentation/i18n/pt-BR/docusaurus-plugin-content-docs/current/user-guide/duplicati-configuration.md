# Configuração do Duplicati {/* #duplicati-configuration */}

O botão <SvgButton svgFilename="duplicati_logo.svg" /> na [Barra de Ferramentas do Aplicativo](overview.md#application-toolbar) abre a interface web do servidor Duplicati em uma nova guia.

Você pode selecionar um servidor a partir da lista suspensa. Se você já selecionou um servidor (clicando no seu cartão) ou está visualizando seus detalhes, o botão abrirá a configuração do Duplicati desse servidor específico diretamente.

![Configuração do Duplicati](../assets/screen-duplicati-configuration.png)

- A lista de servidores mostrará o `server name` ou `server alias (server name)`.
- Os endereços do servidor são configurados em [Configurações → Servidor](settings/server-settings.md).
- O aplicativo salva automaticamente a URL de um servidor quando você usa o recurso <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [Coletar Logs de Backup](collect-backup-logs.md).
- Os servidores não aparecerão na lista de servidores se o seu endereço não tiver sido configurado.

## Acessando a Interface Antiga do Duplicati {/* #accessing-the-old-duplicati-ui */}

Se você enfrentar problemas de login com a nova interface web do Duplicati (`/ngclient/`), você pode clicar com o botão direito no botão <SvgButton svgFilename="duplicati_logo.svg" /> ou em qualquer item de servidor no popover de seleção de servidor para abrir a interface antiga do Duplicati (`/ngax/`) em uma nova guia.

<br/><br/>

:::note
 Todos os nomes de produtos, logotipos e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::
