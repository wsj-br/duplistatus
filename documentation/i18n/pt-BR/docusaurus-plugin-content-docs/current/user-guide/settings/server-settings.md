# Servidor {/* #server */}

Você pode configurar um nome alternativo (alias) para seus servidores, uma nota para descrever sua função e os endereços web dos seus servidores Duplicati aqui.

![configurações do servidor](../../assets/screen-settings-server.png)

| Configuração                    | Descrição                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nome do Servidor**            | Nome do servidor configurado no servidor Duplicati. Um <IIcon2 icon="lucide:key-round" color="#42A5F5"/> aparecerá se uma senha estiver definida para o servidor.                                         |
| **Alias**                       | Um apelido ou nome legível para seu servidor. Ao passar o mouse sobre um alias, ele mostrará seu nome; em alguns casos, para deixar claro, exibirá o alias e o nome entre colchetes. |
| **Nota**                        | Texto livre para descrever a funcionalidade do servidor, local de instalação ou qualquer outra informação. Quando configurado, será exibido ao lado do nome ou alias do servidor.                 |
| **Versão**                      | A versão do Duplicati a partir do último log de backup, com a mesma cor e dica de ferramenta que o [painel](../dashboard.md#duplicati-server-version). Texto atenuado é atual ou indisponível; amarelo de aviso está desatualizado. |
| **Endereço da Interface Web (URL)** | Configure a URL para acessar a interface do servidor Duplicati. Ambas as URLs `HTTP` e `HTTPS` são suportadas.                                                                                           |
| **Status**                      | Exibe os resultados do teste ou da coleta de logs de backup                                                                                                                                              |
| **Ações**                       | Você pode testar, abrir a interface do Duplicati, coletar logs e definir uma senha; veja abaixo para mais detalhes.                                                                                         |

<br/>

:::note
Se o Endereço da Interface Web (URL) não estiver configurado, o botão <SvgIcon svgFilename="duplicati_logo.svg" /> 
será desativado em todas as páginas e o servidor não será mostrado na lista [Configuração do Duplicati](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/> .
:::

<br/>

## Ações disponíveis para cada servidor {/* #available-actions-for-each-server */}

| Botão                                                                                                       | Descrição                                                               |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Testar"/>                                                               | Testa a conexão com o servidor Duplicati.                               |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Abre a interface web do servidor Duplicati em uma nova aba do navegador.|
| <IconButton icon="lucide:download" />                                                                       | Coleta logs de backup do servidor Duplicati.                            |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; ou <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Altera ou define uma senha para o servidor Duplicati para backups coletados. |

<br/>

:::info[IMPORTANTE]

Para proteger sua segurança, você só pode executar as seguintes ações:
- Definir uma senha para o servidor
- Remover (excluir) totalmente a senha
 
A senha é armazenada criptografada no banco de dados e nunca é exibida na interface do usuário.
:::

<br/>

## Ações disponíveis para todos os servidores {/* #available-actions-for-all-servers */}

| Botão                                                    | Descrição                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Salvar Alterações" />                        | Salva as alterações feitas nas configurações do servidor.   |
| <IconButton icon="lucide:fast-forward" label="Testar Todos"/>  | Testar a conexão com todos os servidores Duplicati.   |
| <IconButton icon="lucide:import" label="Coletar Tudo (#)"/> | Coletar logs de backup de todos os servidores Duplicati. |

<br/>
