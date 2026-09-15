# Versões do Duplicati {/* #duplicati-versions */}

Esta página mostra as versões mais recentes do Duplicati armazenadas no cache **duplistatus** e permite que os administradores configurem com que frequência essas versões são atualizadas do GitHub.

![Versões do Duplicati](../../assets/screen-settings-duplicati-versions.png)

O cache é usado pelo [painel](../dashboard.md#duplicati-server-version) e pela página [Servidores](server-settings.md) para colorir a versão de cada servidor e mostrar se ela está atualizada ou desatualizada.

## Versões do canal mais recente {/* #latest-channel-versions */}

A tabela lista a versão mais recente em cache para cada canal do Duplicati:

| Canal        | Descrição                                      |
|:---------------|:-------------------------------------------------|
| **Estável**     | Versão estável mais recente                            |
| **Beta**       | Versão beta mais recente                              |
| **Experimental** | Versão experimental mais recente                    |
| **Canário**     | Versão canário mais recente                            |

O horário da última atualização bem-sucedida do GitHub é mostrado acima da tabela. Se um canal ainda não foi encontrado, ou se o cache nunca foi atualizado, a página mostra que a versão está indisponível.

Administradores podem clicar em **Atualizar agora** para buscar as versões mais recentes imediatamente. Isso não requer que o serviço cron esteja em execução. Se o GitHub não puder ser acessado, **duplistatus** mantém o cache anterior.

## Agendamento da verificação de versão {/* #version-check-schedule */}

**Mostrar versão no painel** ativa ou desativa o emblema de versão no [painel](../dashboard.md#duplicati-server-version) na visualização de cartão. A tabela do painel sempre mostra a coluna **Versão**. Ela está ativada por padrão e também está disponível em [Configurações de Exibição](display-settings.md). Isso é uma preferência de exibição por usuário.

Administradores podem escolher com que frequência **duplistatus** verifica o GitHub para novas versões do Duplicati:

| Intervalo           | Executa                                                         |
|:-------------------|:-------------------------------------------------------------|
| **Uma vez por dia**     | Uma vez no horário de início configurado                            |
| **A cada 12 horas** | No horário de início e 12 horas depois                         |
| **A cada 6 horas**  | No horário de início e a cada 6 horas depois disso               |

O horário de início é escolhido no fuso horário do seu navegador usando o mesmo controle de tempo compacto que o Resumo Diário. Escolha qualquer `HH:mm` horário. **duplistatus** armazena esse valor em UTC e o serviço cron executa a verificação em UTC.

Exemplos:

- Diariamente com horário de início às 06:00 executa às 06:00.
- Diariamente com horário de início às 06:30 executa às 06:30.
- A cada 12 horas com horário de início às 08:15 executa às 08:15 e 20:15.
- A cada 6 horas com horário de início às 02:45 executa às 02:45, 08:45, 14:45 e 20:45.

Na inicialização, **duplistatus** também atualiza o cache se ele tiver mais de 24 horas, 12 horas ou 6 horas, incluindo em um novo banco de dados vazio. Falhas transitórias do GitHub, como HTTP 504, são repetidas. Atualizações falhas mantêm as últimas versões em cache.

Usuários regulares podem visualizar as versões em cache e o agendamento, e podem ativar ou desativar **Mostrar versão no painel**. Apenas administradores podem alterar o intervalo, horário de início ou forçar uma atualização.

:::note
Alterar o agendamento escreve uma entrada `duplicati_version_check_updated` no [log de auditoria](audit-logs-viewer.md). Atualizações bem-sucedidas e falhas do GitHub são registradas como `duplicati_version_refresh` com um gatilho de `startup`, `cron` ou `manual`.
:::
