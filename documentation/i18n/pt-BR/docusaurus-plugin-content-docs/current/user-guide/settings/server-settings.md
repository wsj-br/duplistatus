---
translation_last_updated: '2026-03-01T00:45:20.944Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: d44a1138f5ac3300
translation_language: pt-BR
source_file_path: user-guide/settings/server-settings.md
---
# Servidor {#server}

Você pode configurar um nome alternativo (alias) para seus servidores, uma nota para descrever sua função e os endereços web de seus Servidores Duplicati aqui.

![server settings](../../assets/screen-settings-server.png)

| Configuração                      | Descrição                                                                                                                                                                                    |
|:----------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nome do servidor**              | Nome do servidor configurado no servidor Duplicati. Um <IIcon2 icon="lucide:key-round" color="#42A5F5"/> aparecerá se uma senha estiver definida para o servidor.                          |
| **Alias**                         | Um apelido ou nome legível por humanos do seu servidor. Ao passar o mouse sobre um alias, ele mostrará seu nome; em alguns casos, para deixar claro, exibirá o alias e o nome entre colchetes. |
| **Nota**                          | Texto livre para descrever a funcionalidade do servidor, local de instalação ou qualquer outra informação. Quando configurado, será exibido ao lado do nome ou alias do servidor.            |
| **Endereço da interface web (URL)** | Configure a URL para acessar a interface do usuário do servidor Duplicati. URLs `HTTP` e `HTTPS` são suportadas.                                                                          |
| **Status**                        | Exibe os resultados dos logs de teste ou coleta de backup                                                                                                                                   |
| **Ações**                         | Você pode testar, abrir a interface Duplicati, coletar logs e definir uma senha, veja abaixo para mais detalhes.                                                                          |

<br/>

:::note
Se o Endereço da interface web (URL) não estiver configurado, o botão <SvgIcon svgFilename="duplicati_logo.svg" /> 
será desabilitado em todas as páginas e o servidor não será exibido na lista de [Configuração do Duplicati](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/>.
:::

<br/>

## Ações disponíveis para cada servidor {#available-actions-for-each-server}

| Botão                                                                                                       | Descrição                                                                    |
|:------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>                                                               | Testar a conexão com o servidor Duplicati.                                |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Abrir a interface web do servidor Duplicati em uma nova aba do navegador.  |
| <IconButton icon="lucide:download" />                                                                       | Coletar logs de backup do servidor Duplicati.                             |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; or <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Alterar ou definir uma senha para o servidor Duplicati para backups coletados. |

<br/>

:::info[IMPORTANTE]

Para proteger sua segurança, você pode realizar apenas as seguintes ações:
- Definir uma senha para o servidor
- Remover (excluir) a senha completamente
 
A senha é armazenada criptografada no banco de dados e nunca é exibida na interface do usuário.
:::

<br/>

## Ações disponíveis para todos os servidores {#available-actions-for-all-servers}

| Botão                                                      | Descrição                                                    |
|:-----------------------------------------------------------|:-------------------------------------------------------------|
| <IconButton label="Salvar alterações" />                   | Salvar as alterações feitas nas configurações do servidor.   |
| <IconButton icon="lucide:fast-forward" label="Testar todos"/>  | Testar a conexão com todos os servidores Duplicati.          |
| <IconButton icon="lucide:import" label="Coletar todos (#)"/> | Coletar logs de backup de todos os servidores Duplicati.     |

<br/>
