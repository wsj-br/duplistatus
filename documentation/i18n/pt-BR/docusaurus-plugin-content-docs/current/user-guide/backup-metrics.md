---
translation_last_updated: '2026-05-11T14:27:46.110Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: c4dde05981ada21800990adcdda2efbb6881d3b1d7ae4921922c4c12ca813552
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/backup-metrics.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Métricas de Backup {#backup-metrics}

Um gráfico de métricas de backup ao longo do tempo é mostrado tanto no Painel (visualização de tabela) quanto na página de Detalhes do Servidor.

- **Painel**, o gráfico mostra o número total de backups registrados no banco de dados **duplistatus**. Se você usar o layout de Cards, pode selecionar um servidor para ver suas métricas consolidadas (quando o painel lateral está exibindo métricas).
- **Página de Detalhes do Servidor**, o gráfico mostra métricas para o servidor selecionado (para todos os seus backups) ou para um backup específico individual.

![Backup Metrics](../assets/screen-metrics.png)

- **Tamanho Enviado**: Quantidade total de dados enviados/transmitidos durante os backups do servidor Duplicati para o destino (armazenamento local, FTP, provedor de nuvem, ...) por dia.
- **Duração**: Duração total de todos os backups recebidos por dia no formato HH:MM.
- **Contagem de Arquivos**: Soma do contador de quantidade de arquivos recebido para todos os backups por dia.
- **Tamanho do Arquivo**: Soma do tamanho do arquivo informado pelo servidor Duplicati para todos os backups recebidos por dia.
- **Tamanho do Armazenamento**: Soma do espaço de armazenamento utilizado no destino de backup informado pelo servidor Duplicati por dia.
- **Versões Disponíveis**: Soma de todas as versões disponíveis para todos os backups por dia.

:::note
Você pode usar o controle [Configurações de exibição](settings/display-settings.md) para configurar o intervalo de tempo do gráfico.
:::
