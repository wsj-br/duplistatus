# Como eu construí esta aplicação usando ferramentas de IA {/* #how-i-build-this-application-using-ai-tools */}

# Motivação {/* #motivation */}

Comecei a usar o Duplicati como ferramenta de backup para meus servidores domésticos. Tentei o [painel do Duplicati](https://app.duplicati.com/) e o [Monitoramento do Duplicati](https://www.duplicati-monitoring.com/), mas tive dois requisitos principais: (1) auto-hospedado; e (2) uma API exposta para integração com [Homepage](https://gethomepage.dev/), pois eu o uso para a página inicial do meu laboratório doméstico.

Também tentei conectar diretamente a cada servidor Duplicati na rede, mas o método de autenticação não era compatível com o Homepage (ou não consegui configurá-lo corretamente).

Como também estava experimentando com ferramentas de código de IA, decidi tentar usar a IA para construir esta ferramenta. Aqui está o processo que usei...

# Ferramentas usadas {/* #tools-used */}

1. Para a interface do usuário: [Firebase Studio da Google](https://firebase.studio/)
2. Para a implementação: Cursor (https://www.cursor.com/)

:::note
Usei o Firebase para a interface do usuário, mas você também pode usar [v0.app](https://v0.app/) ou qualquer outra ferramenta para gerar o protótipo. Usei o Cursor para gerar a implementação, mas você pode usar outras ferramentas, como VS Code/Copilot, Windsurf, ...
:::

# Interface do Usuário {/* #ui */}

Criei um novo projeto no [Firebase Studio](https://studio.firebase.google.com/) e usei este prompt no recurso "Protótipo de um aplicativo com IA":

> Um aplicativo de painel da web usando tailwind/react para consolidar em um banco de dados sqllite3 os resultados do backup enviados pela solução de backup duplicati usando a opção --send-http-url (formato json) de várias máquinas, mantendo o rastreamento do status do backup, tamanho, tamanhos de upload.
> 
> A primeira página do painel deve ter uma tabela com o último backup de cada máquina na primeira página, incluindo o nome da máquina, o número de backups armazenados no banco de dados, o status do último backup, duração (hh:mm:ss), número de avisos e erros.
> 
> Ao clicar em uma linha da máquina, mostrar uma página de detalhes da máquina selecionada com uma lista dos backups armazenados (paginados), incluindo o nome do backup, data e hora do backup, incluindo há quanto tempo foi, o status, número de avisos e erros, número de arquivos, o tamanho dos arquivos, tamanho enviado e o tamanho total do armazenamento. Também inclua na página de detalhes um gráfico usando Tremor com a evolução dos campos: tamanho enviado; duração em minutos, número de arquivos examinados, tamanho dos arquivos examinados. O gráfico deve plotar um campo de cada vez, com uma caixa de seleção para selecionar o campo desejado para plotar. Além disso, o gráfico deve apresentar todos os backups armazenados no banco de dados, não apenas os que estão na tabela paginada.
> 
> O aplicativo deve expor um endpoint de API para receber o post do servidor duplicati e outro endpoint de API para recuperar todos os detalhes do último backup de uma máquina como um json.
> 
> O design deve ser moderno, responsivo e incluir ícones e outras ajudas visuais para facilitar a leitura. O código deve ser limpo, conciso e fácil de manter. Use ferramentas modernas como pnpm para lidar com dependências.
> 
> O aplicativo deve ter um tema claro e escuro selecionável.
> 
> O banco de dados deve armazenar esses campos recebidos pelo json do duplicati:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

Isso gerou um App Blueprint, que eu modifiquei um pouco (como abaixo) antes de clicar em `Prototype this App`:

![appblueprint](/img/app-blueprint.png)

Mais tarde, usei esses prompts para ajustar e refinar o design e o comportamento:

> remover o botão "ver detalhes" da página de visão geral do painel e o link no nome da máquina, se o usuário clicar em qualquer lugar da linha, ele mostrará a página de detalhes.

> ao apresentar tamanhos em bytes, use uma escala automática (KB, MB, GB, TB).

> na página de detalhes, mova o gráfico após a tabela. Mude a cor do gráfico de barras para outra cor compatível com temas claro e escuro.

> na página de detalhes, reduza o número de linhas para apresentar 5 backups por página.

> na visão geral do painel, coloque um resumo no topo com o número de máquinas no banco de dados, o número total de backups de todas as máquinas, o tamanho total enviado de todos os backups e o tamanho total de armazenamento usado por todas as máquinas. Inclua ícones para facilitar a visualização.

> por favor, persista o tema selecionado pelo usuário. Além disso, adicione algumas margens laterais e faça a interface do usuário usar 90% da largura disponível.

> na seção de cabeçalho do detalhe da máquina, inclua um resumo com o total de backups armazenados para essa máquina, uma estatística do status do backup, o número de avisos e erros do último backup, a duração média em hh:mm:ss, o tamanho total carregado de todos os backups e o tamanho de armazenamento usado com base nas informações do último backup recebido.

> torne o resumo menor e mais compacto para reduzir o espaço utilizado.

> ao apresentar a data do último backup, mostre na mesma célula, em uma fonte cinza e menor, o tempo decorrido desde que o backup ocorreu (por exemplo, há x minutos, há x horas, há x dias, há x semanas, há x meses, há x anos).

> no painel de visão geral, coloque a data do último backup antes do status do último backup

Após iterar sobre esses prompts, o Firebase gerou o protótipo conforme mostrado nas capturas de tela abaixo:

![protótipo](/img/screen-prototype.png)

![protótipo-detalhe](/img/screen-prototype-detail.png)

:::note
Um ponto interessante foi que, desde a primeira interação, o Firebase Studio gerou dados aleatórios para preencher as páginas/graficos, tornando o protótipo funcional como um aplicativo em tempo real.
:::

Após concluir o protótipo inicial, acessei o código-fonte clicando no botão `</>` na interface. Em seguida, usei a extensão Git para exportar o código e enviá-lo para um repositório privado no [GitHub](https://www.github.com).

# Backend {/* #backend */}

## Configuração {/* #setup */}

Baixei o código do GitHub (usando o comando `git clone`) para uma pasta local (no meu caso, um Raspberry Pi 5 executando Linux) e instalei as dependências Node.js, npm e pnpm. Veja mais detalhes em [DEVELOPMENT.md](../development/setup.md).

Configurei o Cursor para acessar a pasta de código da minha máquina Windows usando uma conexão SSH.

Copiei uma amostra do JSON enviado pelo Duplicati para um arquivo (veja o documento [sample backup report](../api-reference/database-values)), limpando alguns campos indesejados.

## Implementação {/* #implementation */}

Usei um prompt inicial para começar a implementação, focando em persistência, correções e novos recursos. Foi um processo longo, mas muito interessante.

### Usando a IA para gerar o prompt {/* #using-ai-to-generate-the-prompt */}

Criei um prompt detalhado usando o Cursor Chat (modo `Manual`, modelo `Auto`):

> melhore este texto como um prompt para a ferramenta Cursor AI para gerar a implementação de um protótipo de aplicação:
> 
> por favor, crie um plano para gerar a implementação completa de um protótipo de aplicação Next.js a partir deste código base. Sua implementação deve analisar minuciosamente o código base fornecido para manter exatamente a estética visual, a experiência do usuário e o fluxo de navegação. Para armazenamento de dados, utilize SQLite3. Gere o banco de dados e popule-o usando a estrutura e o conteúdo encontrados no documento [sample backup report](../api-reference/database-values), garantindo que todos os campos do JSON sejam totalmente integrados e persistidos.

A IA gerou o seguinte prompt:

>Crie um plano de implementação abrangente para um protótipo de aplicação Next.js com os seguintes requisitos:
>
>1. Pilha Técnica:
>   - Next.js 14+ com App Router
>   - TypeScript para segurança de tipos
>   - SQLite3 para persistência de dados
>   - TailwindCSS para estilização
>   - Componentes de Servidor React onde apropriado
>   - Componentes de Cliente para elementos interativos
>
>2. Design do Banco de Dados:
>   - Analise o documento de relatório de backup de exemplo para criar um esquema SQLite otimizado
>   - Projete tabelas para armazenar eficientemente todos os dados de backup
>   - Inclua índices para consultas comuns
>   - Implemente validação de dados e segurança de tipos
>
>3. Estrutura da Aplicação:
>   - Implemente a UI/UX exata do código fornecido
>   - Crie componentes reutilizáveis para elementos comuns
>   - Configure roteamento adequado usando App Router
>   - Implemente layouts responsivos
>   - Adicione suporte para temas escuro/claro
>
>4. Recursos Principais:
>   - Painel de visão geral com tabela de status da máquina
>   - Visualização detalhada da máquina com histórico de backup
>   - Visualização de dados usando gráficos
>   - Atualizações em tempo real do status do backup
>   - Tratamento adequado de erros e estados de carregamento
>
>5. Gerenciamento de Dados:
>   - Crie rotas de API para operações de dados
>   - Implemente estratégias eficientes de busca de dados
>   - Adicione validação de dados adequada
>   - Inclua tratamento de erros para operações de banco de dados
>
>Por favor, forneça um plano de implementação detalhado que cubra todos esses aspectos, mantendo o design visual e a experiência do usuário existentes.

Copiei o prompt gerado para a área de transferência.

### Inicie a jornada de implementação {/* #start-the-implementation-journey */}

Criei um novo chat clicando no botão `+`, mudei para o modo `Agent` e colei o prompt usando Ctrl+Shift+V (como texto).

Após o plano ser gerado, digitei `please, implement this plan` no chat para começar a implementação.

:::note
Incluí apenas o ponto de partida, pois não gravei todos os prompts usados. Havia muitos deles.
:::

# Notas {/* #notes */}

- Alguns modelos podem ficar travados ao corrigir bugs. "claude-3.5" e "claude-4" geralmente são melhores, mas às vezes você precisa tentar outro modelo (GPT, Gemini, etc.).
Para bugs ou erros complexos, use um prompt para analisar possíveis causas do erro em vez de simplesmente pedir para corrigi-lo.
- Ao fazer modificações complexas, use um prompt para criar um plano e depois peça ao agente de IA para implementá-lo. Isso sempre funciona melhor.
- Seja específico ao alterar o código-fonte. Se possível, selecione a parte relevante do código no editor e pressione Ctrl+L para incluí-lo no chat como contexto.
- Inclua também uma referência ao arquivo que você está mencionando no chat para ajudar o agente de IA a se concentrar na parte relevante do código e evitar fazer alterações em outras partes do código.
- Tenho a tendência de antropomorfizar o agente de IA, pois ele persistente usa 'nós', 'nosso código' e 'você gostaria que eu...'. Isso também melhora minhas chances de sobrevivência no caso de (ou [quando](https://ai-2027.com/)) o Skynet se tornar consciente e o Terminator for inventado.
- Às vezes, use [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... para gerar prompts com instruções melhores para o agente de IA.
