# Configuração do Duplicati {/* #duplicati-configuration */}

O botão <SvgButton svgFilename="duplicati_logo.svg" /> na [Barra de Ferramentas do Aplicativo](overview.md#application-toolbar) abre a interface web do servidor Duplicati em uma nova aba.

Você pode selecionar um servidor da lista suspensa. Se você já tiver selecionado um servidor (clicando em seu cartão) ou estiver visualizando seus detalhes, o botão abrirá diretamente a configuração do Duplicati daquele servidor específico.

![Configuração do Duplicati](../assets/screen-duplicati-configuration.png)

- A lista de servidores mostrará o `server name` ou `server alias (server name)`.
- Os endereços dos servidores são configurados em [Configurações → Servidor](settings/server-settings.md).
- O aplicativo salva automaticamente a URL de um servidor quando você usa o recurso [Coletar Logs de Backup](collect-backup-logs.md) <IconButton icon="lucide:download" height="16" href="collect-backup-logs" />.
- Os servidores não aparecerão na lista de servidores se seu endereço não tiver sido configurado.

## Acessando a Antiga Interface do Duplicati {/* #accessing-the-old-duplicati-ui */}

Se você enfrentar problemas de login com a nova interface web do Duplicati (`/ngclient/`), você pode clicar com o botão direito no botão <SvgButton svgFilename="duplicati_logo.svg" /> ou em qualquer item de servidor no pop-over de seleção de servidor para abrir a antiga interface do Duplicati (`/ngax/`) em uma nova aba.

<br/><br/>

:::note
 Todos os nomes de produtos, logos e marcas registradas são propriedade de seus respectivos proprietários. Ícones e nomes são usados apenas para fins de identificação e não implicam endosso.
:::
