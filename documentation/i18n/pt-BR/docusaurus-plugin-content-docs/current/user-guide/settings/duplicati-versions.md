# Versões do Duplicati {/* #duplicati-versions */}

Esta página mostra as versões mais recentes do Duplicati armazenadas no cache **duplistatus** e permite que os administradores configurem com que frequência essas versões são atualizadas a partir do GitHub.

![Versões do Duplicati](../../assets/screen-settings-duplicati-versions.png)

O cache é utilizado pelo [painel](../dashboard.md#duplicati-server-version) e pela página [Servidores](server-settings.md) para colorir cada versão do servidor e mostrar se está atualizada ou desatualizada.

## Versões do canal mais recente {/* #latest-channel-versions */}

A tabela lista a versão mais recente em cache para cada canal do Duplicati:

| Canal          | Descrição                                        |
|:---------------|:-------------------------------------------------|
| **Estável**    | Última versão estável                            |
| **Beta**       | Última versão beta                               |
| **Experimental** | Última versão experimental                     |
| **Canário**    | Última versão canário                            |

O horário da última atualização bem-sucedida do GitHub é mostrado acima da tabela. Se um canal ainda não foi encontrado ou o cache nunca foi atualizado, a página mostra que a versão está indisponível.

Os administradores podem clicar em **Atualizar agora** para buscar as versões mais recentes imediatamente. Isso não exige que o serviço cron esteja em execução. Se o GitHub não puder ser acessado, o **duplistatus** mantém o cache anterior.

## Programação da verificação de versão {/* #version-check-schedule */}

**Mostrar versão no painel** ativa ou desativa o selo de versão na visualização em cartões do [painel](../dashboard.md#duplicati-server-version). A tabela do painel sempre mostra a coluna **Versão**. Está ativada por padrão e também está disponível nas [Configurações de Exibição](display-settings.md). Esta é uma preferência de exibição por usuário.

Os administradores podem escolher com que frequência o **duplistatus** verifica o GitHub por novos lançamentos do Duplicati:

| Intervalo          | Execuções                                                      |
|:-------------------|:---------------------------------------------------------------|
| **Uma vez por dia**| Uma vez no horário de início configurado                       |
| **A cada 12 horas**| No horário de início e 12 horas depois                         |
| **A cada 6 horas** | No horário de início e a cada 6 horas após isso                |

O horário de início é escolhido no fuso horário do seu navegador usando o mesmo controle compacto de hora do Resumo Diário. Escolha qualquer hora `HH:mm`. O **duplistatus** armazena esse valor em UTC e o serviço cron executa a verificação em UTC.

Exemplos:

- Diário com horário de início às 06:00 executa às 06:00.
- Diário com horário de início às 06:30 executa às 06:30.
- A cada 12 horas com horário de início às 08:15 executa às 08:15 e 20:15.
- A cada 6 horas com horário de início às 02:45 executa às 02:45, 08:45, 14:45 e 20:45.

Na inicialização, o **duplistatus** também atualiza o cache se ele for mais antigo que o intervalo selecionado (24 horas, 12 horas ou 6 horas), inclusive em um novo banco de dados vazio. Falhas transitórias do GitHub, como HTTP 504, são repetidas. Atualizações com falha mantêm as últimas versões armazenadas em cache.

Usuários regulares podem visualizar as versões em cache e o agendamento, e podem ativar ou desativar **Mostrar versão no painel**. Apenas administradores podem alterar o intervalo, horário de início ou forçar uma atualização.

:::note
Alterar o agendamento grava uma entrada `duplicati_version_check_updated` no [log de auditoria](audit-logs-viewer.md). Atualizações bem-sucedidas e com falha do GitHub são registradas como `duplicati_version_refresh` com um gatilho de `startup`, `cron` ou `manual`.
:::
