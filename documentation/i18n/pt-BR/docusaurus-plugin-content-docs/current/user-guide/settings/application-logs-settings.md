---
translation_last_updated: '2026-05-06T23:22:21.218Z'
source_file_mtime: '2026-05-06T23:18:51.446Z'
source_file_hash: b0db7a6f1e511ae6977971d8b2cdf4eefcdfa3aea287eea9bbbc2e84542c2144
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/settings/application-logs-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Logs da aplicação {#application-logs}

O Visualizador de logs do aplicativo permite que administradores monitorem todos os logs da aplicação em um único lugar, com filtragem, exportação e atualizações em tempo real diretamente da interface web.

![Application Log Viewer](../../assets/screen-settings-application-logs.png)

<br/>

## Ações Disponíveis {#available-actions}

| Botão                                                              | Descrição                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Atualizar" />            | Recarrega manualmente os logs do arquivo selecionado. Exibe um ícone de carregamento durante a atualização e redefine o rastreamento para detecção de novas linhas. |
| <IconButton icon="lucide:copy" label="Copiar para a área de transferência" />         | Copia todas as linhas filtradas de log para sua área de transferência. Respeita o filtro de pesquisa atual. Útil para compartilhamento rápido ou colagem em outras ferramentas. |
| <IconButton icon="lucide:download" label="Exportar" />               | Baixa os logs como um arquivo de texto. Exporta a partir da versão do arquivo atualmente selecionada e aplica o filtro de pesquisa atual (se houver). Formato do nome do arquivo: `duplistatus-logs-YYYY-MM-DD.txt` (data no formato ISO). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Pula rapidamente para o início dos logs exibidos. Útil quando a rolagem automática está desativada ou ao navegar por arquivos de log longos. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Pula rapidamente para o final dos logs exibidos. Útil quando a rolagem automática está desativada ou ao navegar por arquivos de log longos. |

<br/>

## Controles e Filtros {#controls-and-filters}

| Controle | Descrição |
|:--------|:-----------|
| **Versão do arquivo** | Selecione qual arquivo de log visualizar: **Atual** (arquivo ativo) ou arquivos rotacionados (`.1`, `.2`, etc., onde números mais altos indicam arquivos mais antigos). |
| **Linhas para mostrar** | Exibe as **100**, **500**, **1000** (padrão), **5000** ou **10000** linhas mais recentes do arquivo selecionado. |
| **Rolar automaticamente** | Quando habilitado (padrão para o arquivo atual), rola automaticamente para novas entradas de log e atualiza a cada 2 segundos. Funciona apenas para a versão do arquivo **Atual**. |
| **Pesquisar** | Filtra linhas de log por texto (não diferencia maiúsculas de minúsculas). Os filtros são aplicados às linhas atualmente exibidas. |

<br/>

O cabeçalho de exibição do log mostra a contagem de linhas filtradas, linhas totais, tamanho dos arquivos e data e hora da última modificação.

<br/>
