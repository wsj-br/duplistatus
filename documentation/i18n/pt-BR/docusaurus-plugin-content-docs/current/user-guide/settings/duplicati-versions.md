# Versões do Duplicati {#duplicati-versions}

Esta página mostra as últimas versões do Duplicati armazenadas no cache **duplistatus** e permite que os administradores configurem a frequência com que essas versões são atualizadas do GitHub.

![Versões do Duplicati](../../assets/screen-settings-duplicati-versions.png)

O cache é usado pelo [painel](../dashboard.md#duplicati-server-version) e pela página [Servidores](server-settings.md) para colorir a versão de cada servidor e mostrar se ela está atualizada ou desatualizada.

## Versões do canal mais recente {#latest-channel-versions}

A tabela lista a versão mais recente em cache para cada canal do Duplicati:

| Canal          | Descrição                                      |
|:---------------|:-------------------------------------------------|
| **Estável**     | Última versão estável                            |
| **Beta**       | Última versão beta                              |
| **Experimental** | Última versão experimental                    |
| **Canário**     | Última versão canário                            |

O último horário de atualização bem-sucedida do GitHub é mostrado acima da tabela. Se um canal ainda não foi encontrado, ou se o cache nunca foi atualizado, a página mostra que a versão está indisponível.

Administradores podem clicar em **Atualizar agora** para buscar as últimas versões imediatamente. Isso não requer que o serviço cron esteja em execução. Se o GitHub não puder ser acessado, **duplistatus** mantém o cache anterior.

## Agendamento de verificação de versão {#version-check-schedule}

**Mostrar versão no painel** ativa ou desativa o emblema de versão no [painel](../dashboard.md#duplicati-server-version) na visualização de cartão. A tabela do painel sempre mostra a coluna **Versão**. Ela está ativada por padrão e também está disponível em [Configurações de Exibição](display-settings.md). Isso é uma preferência de exibição por usuário.

Administradores podem escolher com que frequência **duplistatus** verifica o GitHub para novas versões do Duplicati:

| Intervalo          | Executa                                                      |
|:-------------------|:-------------------------------------------------------------|
| **Uma vez por dia**     | Uma vez no horário de início configurado                            |
| **A cada 12 horas** | No horário de início e 12 horas depois                         |
| **A cada 6 horas**  | No horário de início e a cada 6 horas depois disso               |

O horário de início é selecionado e exibido no fuso horário do navegador. **duplistatus** armazena essa hora em UTC e o serviço cron executa a verificação em UTC.

Exemplos:

- Diariamente com horário de início às 06:00 executa às 06:00.
- A cada 12 horas com horário de início às 08:00 executa às 08:00 e 20:00.
- A cada 6 horas com horário de início às 02:00 executa às 02:00, 08:00, 14:00 e 20:00.

Na inicialização, **duplistatus** também atualiza o cache se ele tiver mais de 24 horas, 12 horas ou 6 horas. Atualizações falhas mantêm as últimas versões em cache.

Usuários regulares podem visualizar as versões em cache e o agendamento, e podem ativar ou desativar **Mostrar versão no painel**. Apenas administradores podem alterar o intervalo, horário de início ou forçar uma atualização.

:::note
Alterar o agendamento escreve uma entrada `duplicati_version_check_updated` no [log de auditoria](audit-logs-viewer.md). Atualizações bem-sucedidas e falhas do GitHub são registradas como `duplicati_version_refresh` com um gatilho de `startup`, `cron` ou `manual`.
:::
