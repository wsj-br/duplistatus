---
translation_last_updated: '2026-05-06T23:22:23.281Z'
source_file_mtime: '2026-05-06T23:18:51.446Z'
source_file_hash: 80141305b3c0238b589afcd457332db981c79b94ea2f13640c56b2203599bbd7
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/settings/notification-templates.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Modelos {#templates}

**duplistatus** usa três modelos para mensagens de notificação. Esses modelos são usados tanto para notificações NTFY quanto para notificações por e-mail.

A página inclui um seletor de **Idioma dos Modelos** que define a localidade para os modelos padrão. Alterar o idioma atualiza a localidade para novos padrões, mas **não** altera o texto dos modelos existentes. Para aplicar um novo idioma aos seus modelos, edite-os manualmente ou use **Redefinir este modelo para o padrão** (para a aba atual) ou **Redefinir tudo para o padrão** (para todos os três modelos).

![notification templates](../../assets/screen-settings-templates.png)

| Modelo               | Descrição                                         |
| :----------------- | :-------------------------------------------------- |
| **Sucesso**        | Usado quando os backups são concluídos com sucesso.            |
| **Aviso/Erro**  | Usado quando os backups são concluídos com avisos ou erros. |
| **Backup Atrasado** | Usado quando os backups estão atrasados.                      |

<br/>

## Idioma do Modelo {#template-language}

Um seletor de **Idioma dos Modelos** no topo da página permite que você escolha o idioma para os modelos padrão (Inglês, Alemão, Francês, Espanhol, Português). Alterar o idioma atualiza a localidade dos padrões, mas os modelos personalizados existentes mantêm seu texto atual até que você os atualize ou use um dos botões de redefinição.

<br/>

## Ações Disponíveis {#available-actions}

| Botão                                                              | Descrição                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Salvar Configurações do Modelo" />                      | Salva as configurações ao alterar o modelo. O botão salva o modelo exibido (Sucesso, Aviso/Erro ou Backup Atrasado). |
| <IconButton icon="lucide:send" label="Enviar Notificação de Teste"/>     | Verifica o modelo após atualizá-lo. As variáveis serão substituídas por seus nomes no teste. Para notificações por e-mail, o título do modelo torna-se a linha de assunto do e-mail. |
| <IconButton icon="lucide:rotate-ccw" label="Redefinir este modelo para o padrão"/> | Restaura o modelo padrão para o **modelo selecionado** (a aba atual). Lembre-se de salvar após redefinir. |
| <IconButton icon="lucide:rotate-ccw" label="Redefinir todos para o padrão"/> | Restaura os três modelos (Sucesso, Aviso/Erro, Backup Atrasado) para os padrões do Idioma do Modelo selecionado. Lembre-se de salvar após redefinir. |

<br/>

## Variáveis {#variables}

Todos os modelos suportam variáveis que serão substituídas por valores reais. A tabela a seguir mostra as variáveis disponíveis:

| Variável               | Descrição                                     | Disponível em     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Nome do servidor.                             | Todos os modelos    |
| `{server_alias}`       | Apelido do servidor.                            | Todos os modelos    |
| `{server_note}`        | Observação para o servidor.                            | Todos os modelos    |
| `{server_url}`         | URL da configuração web do servidor Duplicati   | Todos os modelos    |
| `{backup_name}`        | Nome do backup.                             | Todos os modelos    |
| `{status}`             | Status do backup (Sucesso, Aviso, Erro, Grave). | Sucesso, Aviso |
| `{backup_date}`        | Data e hora do backup.                    | Sucesso, Aviso |
| `{duration}`           | Duração do backup.                         | Sucesso, Aviso |
| `{uploaded_size}`      | Quantidade de dados enviados.                        | Sucesso, Aviso |
| `{storage_size}`       | Informações sobre o uso de armazenamento.                      | Sucesso, Aviso |
| `{available_versions}` | Número de versões de backup disponíveis.            | Sucesso, Aviso |
| `{file_count}`         | Número de arquivos processados.                      | Sucesso, Aviso |
| `{file_size}`          | Tamanho total dos arquivos copiados.                  | Sucesso, Aviso |
| `{messages_count}`     | Número de mensagens.                             | Sucesso, Aviso |
| `{warnings_count}`     | Número de avisos.                             | Sucesso, Aviso |
| `{errors_count}`       | Número de erros.                               | Sucesso, Aviso |
| `{log_text}`           | Mensagens de log (avisos e erros)              | Sucesso, Aviso |
| `{last_backup_date}`   | Data do último backup.                        | Atrasado          |
| `{last_elapsed}`       | Tempo decorrido desde o último backup.             | Atrasado          |
| `{expected_date}`      | Data esperada do backup.                           | Atrasado          |
| `{expected_elapsed}`   | Tempo decorrido desde a data esperada.           | Atrasado          |
| `{backup_interval}`    | String de intervalo (por exemplo, "1D", "2S", "1M").       | Atrasado          |
| `{overdue_tolerance}`  | Configuração de tolerância de atraso.                      | Atrasado          |
