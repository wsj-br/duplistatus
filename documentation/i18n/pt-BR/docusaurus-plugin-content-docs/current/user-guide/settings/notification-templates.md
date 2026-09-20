# Modelos {/* #templates */}

**duplistatus** usa quatro modelos para mensagens de notificação. Os corpos de e-mail são em Markdown (títulos, listas, links e tabelas). O NTFY para Sucesso, Aviso/Erro e Atrasado usa o mesmo corpo em Markdown, enviado com `Markdown: yes` para que os clientes ntfy possam renderizá-lo. Qualquer tabela GFM omite sua linha de cabeçalho e envia o corpo como texto simples, pois o ntfy não renderiza tabelas. O Resumo Diário é exclusivo para e-mail.

A página inclui um seletor de **Idioma do Modelo** que define a localidade dos modelos padrão. Alterar o idioma atualiza a localidade para novos padrões, mas **não** altera o texto dos modelos existentes. Para aplicar um novo idioma aos seus modelos, edite-os manualmente ou utilize **Redefinir este modelo para o padrão** (para a aba atual) ou **Redefinir tudo para padrão** (para todos os modelos).

![modelos de notificação](../../assets/screen-settings-templates.png)

| Modelo             | Descrição                                           |
| :----------------- | :-------------------------------------------------- |
| **Sucesso**        | Usado quando os backups são concluídos com sucesso. |
| **Aviso/Erro**     | Usado quando os backups terminam com avisos ou erros. |
| **Backup Atrasado**| Usado quando os backups estão atrasados.            |
| **Resumo Diário**  | Modelo de e-mail em Markdown para a captura diária opcional. |

<br/>

## Idioma do Modelo {/* #template-language */}

Um seletor de **Idioma do Modelo** na parte superior da página permite escolher o idioma para os modelos padrão (Inglês, Alemão, Francês, Espanhol, Português, Hindi e Chinês Simplificado). Alterar o idioma atualiza a localidade dos padrões, mas os modelos personalizados existentes mantêm seu texto atual até que você os atualize ou use um dos botões de redefinição.

<br/>

## Ações Disponíveis {/* #available-actions */}

| Botão                                                               | Descrição                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Salvar Configurações do Modelo" />                      | Salva as configurações ao alterar o modelo. O botão salva o modelo exibido (Sucesso, Aviso/Erro, Backup Atrasado ou Resumo Diário). |
| <IconButton icon="lucide:send" label="Enviar Notificação de Teste"/>     | Verifica o modelo após atualizá-lo. As variáveis serão substituídas pelos seus nomes no teste. Para notificações por e-mail, o título do modelo torna-se a linha de assunto do e-mail. Não disponível na aba Resumo Diário. |
| <IconButton icon="lucide:rotate-ccw" label="Redefinir este modelo para o padrão"/> | Restaura o modelo padrão para o **modelo selecionado** (aba atual). Lembre-se de salvar após redefinir. |
| <IconButton icon="lucide:rotate-ccw" label="Redefinir tudo para padrão"/> | Restaura todos os modelos (Sucesso, Aviso/Erro, Backup Atrasado e Resumo Diário) para os padrões do Idioma do Modelo selecionado. Lembre-se de salvar após redefinir. |

<br/>

## Variáveis {/* #variables */}

Os corpos de e-mail são em Markdown. Títulos, listas, links e tabelas são suportados. Valores de espaço reservado são inseridos como texto escapado e não podem introduzir Markdown ou HTML. HTML bruto anteriormente embutido em modelos personalizados agora é escapado. O NTFY recebe o mesmo Markdown, exceto tabelas GFM: a linha de cabeçalho é omitida e as linhas do corpo são enviadas como texto simples, para qualquer layout de coluna.

Os modelos padrão de Sucesso, Aviso/Erro e Atrasado usam o mesmo estilo Markdown do Resumo Diário: um título, valores em negrito e uma tabela de visão geral. Padrões armazenados não modificados são atualizados ao carregar; modelos personalizados são mantidos.

Todos os modelos de Sucesso, Aviso/Erro e Atrasado suportam variáveis que serão substituídas por valores reais. A tabela a seguir mostra as variáveis disponíveis:

| Variável               | Descrição                                         | Disponível Em    |
|:-----------------------|:--------------------------------------------------|:-----------------|
| `{server_name}`        | Nome do servidor.                                 | Sucesso, Aviso, Atrasado |
| `{server_alias}`       | Alias do servidor.                                | Sucesso, Aviso, Atrasado |
| `{server_note}`        | Nota para o servidor.                            | Sucesso, Aviso, Atrasado |
| `{server_url}`         | URL da configuração web do Servidor Duplicati   | Sucesso, Aviso, Atrasado |
| `{backup_name}`        | Nome do backup.                             | Sucesso, Aviso, Atrasado |
| `{status}`             | Status do backup (Sucesso, Aviso, Erro, Fatal). | Sucesso, Aviso |
| `{backup_date}`        | Data e hora do backup.                    | Sucesso, Aviso |
| `{duration}`           | Duração do backup.                         | Sucesso, Aviso |
| `{uploaded_size}`      | Quantidade de dados enviados.                        | Sucesso, Aviso |
| `{storage_size}`       | Informações de uso de armazenamento.                      | Sucesso, Aviso |
| `{available_versions}` | Número de versões de backup disponíveis.            | Sucesso, Aviso |
| `{file_count}`         | Número de arquivos processados.                      | Sucesso, Aviso |
| `{file_size}`          | Tamanho total dos arquivos copiados.                  | Sucesso, Aviso |
| `{messages_count}`     | Número de mensagens.                             | Sucesso, Aviso |
| `{warnings_count}`     | Número de avisos.                             | Sucesso, Aviso |
| `{errors_count}`       | Número de erros.                               | Sucesso, Aviso |
| `{log_text}`           | Somente linhas de log de aviso e erro (não logs completos de informações). NTFY usa um resumo breve e pode truncar. | Sucesso, Aviso |
| `{last_backup_date}`   | Data do último backup.                        | Atrasado          |
| `{last_elapsed}`       | Tempo decorrido desde o último backup.             | Atrasado          |
| `{expected_date}`      | Data esperada do backup.                           | Atrasado          |
| `{expected_elapsed}`   | Tempo decorrido desde a data esperada.           | Atrasado          |
| `{backup_interval}`    | String de intervalo (ex: "1D", "2S", "1M").       | Atrasado          |
| `{overdue_tolerance}`  | Configuração de tolerância de atraso.                      | Atrasado          |

Modelos de Resumo Diário usam um conjunto diferente de variáveis para o instantâneo de status atual:

| Variável | Descrição |
|:---------|:------------|
| `{summary_date}` | Data do calendário local do instantâneo |
| `{generated_at}` | Data e hora em que o instantâneo foi gerado |
| `{time_zone}` | Fuso horário IANA salvo |
| `{server_count}` / `{job_count}` | Servidores e trabalhos conhecidos |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | Grupos de status mutuamente exclusivos |
| `{overdue_count}` | Trabalhos atrasados (ortogonal ao status; pode se sobrepor aos grupos acima) |
| `{problem_table}` / `{all_jobs_table}` | Tabelas geradas de trabalhos que requerem atenção e todos os trabalhos. Colunas: Servidor, Backup, Atrasado, Últ. status, Últ. resultado, Duração, Avisos, Erros, Enviado. |
| `{duplistatus_link}` | Link para o painel duplistatus (omitido quando nenhuma URL pública está configurada). Prefira isso em vez de links Markdown construídos manualmente. |
| `{duplistatus_url}` | Mesma URL como texto simples (vazia quando nenhuma URL pública está configurada). |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | Totais do último resultado |

O assunto padrão do e-mail de Resumo Diário é:

```text
Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal
```

Assuntos padrão armazenados não modificados são atualizados para este formato. Assuntos personalizados permanecem inalterados. `{unknown_count}` e `{no_report_count}` permanecem no corpo do e-mail, não no assunto padrão.

Use **Visualização** para renderizar o assunto do e-mail, HTML e texto simples sem enviar. Visualizações de Sucesso, Aviso/Erro e Atrasado também incluem a carga útil Markdown NTFY. A visualização abre em uma caixa de diálogo. Botões de E-mail HTML / texto simples / NTFY ficam acima do assunto. O E-mail HTML segue o tema claro ou escuro atual.
