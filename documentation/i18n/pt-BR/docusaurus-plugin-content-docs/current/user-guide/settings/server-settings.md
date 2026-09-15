# Servidor {/* #server */}

Você pode configurar um nome alternativo (alias) para seus servidores, uma nota para descrever sua função e os endereços web de seus Servidores Duplicati aqui.

![configurações do servidor](../../assets/screen-settings-server.png)

| Configuração                     | Descrição                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nome do Servidor**            | Nome do servidor configurado no servidor Duplicati. Um <IIcon2 icon="lucide:key-round" color="#42A5F5"/> aparecerá se uma senha for definida para o servidor.                                         |
| **Alias**                       | Um apelido ou nome legível para humanos do seu servidor. Ao passar o mouse sobre um alias, ele mostrará seu nome; em alguns casos, para ficar claro, ele exibirá o alias e o nome entre colchetes. |
| **Nota**                        | Texto livre para descrever a funcionalidade do servidor, local de instalação ou qualquer outra informação. Quando configurado, ele será exibido próximo ao nome ou alias do servidor.                 |
| **Versão**                      | A versão do Duplicati a partir do último log de backup, com a mesma cor e dica de ferramenta que o [painel](../dashboard.md#duplicati-server-version). Texto desativado é atual ou indisponível; amarelo de aviso é desatualizado. |
| **Endereço da Interface Web (URL)** | Configure o URL para acessar a interface do usuário do Servidor Duplicati. Ambos os URLs `HTTP` e `HTTPS` são suportados.                                                                                           |
| **Status**                      | Exibe os resultados do teste ou coleta de logs de backup                                                                                                                                              |
| **Ações**                       | Você pode testar, abrir a interface do Duplicati, coletar logs e definir uma senha, veja abaixo para mais detalhes.                                                                                         |

<br/>

:::note
Se o Endereço da Interface Web (URL) não estiver configurado, o botão <SvgIcon svgFilename="duplicati_logo.svg" /> 
será desativado em todas as páginas e o servidor não será exibido na lista [Configuração do Duplicati](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/> .
:::

<br/>

## Ações Disponíveis para cada servidor {/* #available-actions-for-each-server */}

| Botão                                                                                                      | Descrição                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Testar"/>                                                               | Teste a conexão com o servidor Duplicati.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Abre a interface web do servidor Duplicati em uma nova guia do navegador.         |
| <IconButton icon="lucide:download" />                                                                       | Coleta logs de backup do servidor Duplicati.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; ou <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Altera ou define uma senha para o servidor Duplicati para coletar backups. |

<br/>

:::info[IMPORTANTE]

Para proteger sua segurança, você só pode realizar as seguintes ações:
- Definir uma senha para o servidor
- Remover (excluir) a senha por completo
 
A senha é armazenada criptografada no banco de dados e nunca é exibida na interface do usuário.
:::

<br/>

## Ações Disponíveis para todos os servidores {/* #available-actions-for-all-servers */}

| Botão                                                     | Descrição                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Salvar Alterações" />                        | Salva as alterações feitas nas configurações do servidor.   |
| <IconButton icon="lucide:fast-forward" label="Testar Todos"/>  | Testar a conexão com todos os servidores Duplicati.   |
| <IconButton icon="lucide:import" label="Coletar Tudo (#)"/> | Coletar logs de backup de todos os servidores Duplicati. |

<br/>
