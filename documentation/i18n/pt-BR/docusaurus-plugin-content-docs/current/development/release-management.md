---
translation_last_updated: '2026-02-16T00:13:40.356Z'
source_file_mtime: '2026-02-01T03:16:19.468Z'
source_file_hash: fae6b911d504b61b
translation_language: pt-BR
source_file_path: development/release-management.md
---
# Gerenciamento de Lançamentos {#release-management}

## Versionamento (Versionamento Semântico) {#versioning-semantic-versioning}

O projeto segue Versionamento Semântico (SemVer) com o formato `MAJOR.MINOR.PATCH`:

- **MAJOR** versão (x.0.0): Quando você faz alterações de API incompatíveis
- **MINOR** versão (0.x.0): Quando você adiciona funcionalidade de forma compatível com versões anteriores
- **PATCH** versão (0.0.x): Quando você faz correções de bugs compatíveis com versões anteriores

## Lista de Verificação Pré-Lançamento {#pre-release-checklist}

Antes de lançar uma nova versão, certifique-se de que você concluiu o seguinte:

- [ ] Todas as alterações foram confirmadas e enviadas para a branch `vMAJOR.MINOR.x`.
- [ ] O número da versão foi atualizado em `package.json` (use `scripts/update-version.sh` para sincronizá-lo entre arquivos).
- [ ] Todos os testes passam (em modo desenvolvimento, local, docker e podman).
- [ ] Inicie um contêiner Docker com `pnpm docker-up` e execute `scripts/compare-versions.sh` para verificar a consistência de versão entre o ambiente de desenvolvimento e o contêiner Docker (requer que o contêiner Docker esteja em execução). Este script compara versões do SQLite apenas pela versão principal (por exemplo, 3.45.1 vs 3.51.1 são consideradas compatíveis) e compara as versões do Node, npm e duplistatus exatamente.
- [ ] A documentação está atualizada, atualize as capturas de tela (use `pnpm take-screenshots`)
- [ ] As notas de lançamento foram preparadas em `documentation/docs/release-notes/VERSION.md`.
- [ ] Execute `scripts/generate-readme-from-intro.sh` para atualizar `README.md` com a nova versão e quaisquer alterações de `documentation/docs/intro.md`. Este script também gera automaticamente `README_dockerhub.md` e `RELEASE_NOTES_github_VERSION.md`.

## Visão Geral do Processo de Lançamento {#release-process-overview}

O processo de lançamento recomendado usa **GitHub Pull Requests e Releases** (veja abaixo). Isso oferece melhor visibilidade, capacidades de revisão e dispara automaticamente compilações de imagens Docker. O método de linha de comando está disponível como uma alternativa.

## Método 1: Pull Request e Release do GitHub (Recomendado) {#method-1-github-pull-request-and-release-recommended}

Este é o método preferido, pois fornece melhor rastreabilidade e dispara automaticamente compilações do Docker.

### Etapa 1: Criar Pull Request {#step-1-create-pull-request}

1. Navegue até o [repositório duplistatus](https://github.com/wsj-br/duplistatus) no GitHub.
2. Clique na aba **"Pull requests"**.
3. Clique em **"New pull request"**.
4. Defina a **base branch** como `master` e a **compare branch** como `vMAJOR.MINOR.x`.
5. Revise a visualização das alterações para garantir que tudo está correto.
6. Clique em **"Create pull request"**.
7. Adicione um título descritivo (por exemplo, "Release v1.2.0") e uma descrição resumindo as alterações.
8. Clique em **"Create pull request"** novamente.

### Etapa 2: Mesclar a Solicitação de Pull {#step-2-merge-the-pull-request}

Após revisar o pull request:

1. Se não houver conflitos, clique no botão verde **"Merge pull request"**.
2. Escolha sua estratégia de merge (normalmente "Create a merge commit").
3. Confirme o merge.

### Etapa 3: Criar Versão no GitHub {#step-3-create-github-release}

Após a conclusão da mesclagem, crie uma versão no GitHub:

1. Navegue até o [repositório duplistatus](https://github.com/wsj-br/duplistatus) no GitHub.
2. Acesse a seção **"Releases"** (ou clique em "Releases" na barra lateral direita).
3. Clique em **"Draft a new release."**
4. No campo **"Choose a tag"**, digite seu novo número de versão no formato `vMAJOR.MINOR.PATCH` (por exemplo, `v1.2.0`). Isso criará uma nova tag.
5. Selecione `master` como a branch de destino.
6. Adicione um **título de release** (por exemplo, "Release v1.2.0").
7. Adicione uma **descrição** documentando as alterações nesta versão. Você pode:
   - Copiar o conteúdo de `RELEASE_NOTES_github_VERSION.md` (gerado por `scripts/generate-readme-from-intro.sh`)
   - Ou referenciar as notas de release de `documentation/docs/release-notes/` (mas observe que links relativos não funcionarão em releases do GitHub)
8. Clique em **"Publish release."**

**O que acontece automaticamente:**
- Uma nova tag Git é criada
- O workflow "Build and Publish Docker Image" é acionado
- Imagens Docker são construídas para arquiteturas AMD64 e ARM64
- As imagens são enviadas para:
  - Docker Hub: `wsjbr/duplistatus:VERSION` e `wsjbr/duplistatus:latest` (se esta for a versão mais recente)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` e `ghcr.io/wsj-br/duplistatus:latest` (se esta for a versão mais recente)

## Método 2: Linha de Comando (Alternativa) {#method-2-command-line-alternative}

Se você preferir usar a linha de comando, siga estas etapas:

### Etapa 1: Atualizar Branch Master Local {#step-1-update-local-master-branch}

Certifique-se de que sua branch local `master` está atualizada:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Etapa 2: Mesclar Ramificação de Desenvolvimento {#step-2-merge-development-branch}

Mescle a branch `vMAJOR.MINOR.x` em `master`:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Se houver **conflitos de mesclagem**, resolva-os manualmente:
1. Edite os arquivos em conflito
2. Prepare os arquivos resolvidos: `git add <file>`
3. Conclua a mesclagem: `git commit`

### Etapa 3: Marcar a Versão {#step-3-tag-the-release}

Criar uma tag anotada para a nova versão:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

A flag `-a` cria uma tag anotada (recomendada para lançamentos), e a flag `-m` adiciona uma mensagem.

### Etapa 4: Enviar para o GitHub {#step-4-push-to-github}

Envie tanto a branch `master` atualizada quanto a nova tag:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativamente, envie todas as tags de uma vez: `git push --tags`

### Etapa 5: Criar Versão do GitHub {#step-5-create-github-release}

Após fazer push da tag, crie uma versão no GitHub (consulte o Método 1, Etapa 3) para disparar o fluxo de trabalho de compilação do Docker.

## Construção Manual de Imagem Docker {#manual-docker-image-build}

Para disparar manualmente o fluxo de trabalho de compilação da imagem Docker sem criar uma versão:

1. Navegue até o [repositório duplistatus](https://github.com/wsj-br/duplistatus) no GitHub.
2. Clique na aba **"Ações"**.
3. Selecione o fluxo de trabalho **"Build and Publish Docker Image"**.
4. Clique em **"Run workflow"**.
5. Selecione a branch para compilar (normalmente `master`).
6. Clique em **"Run workflow"** novamente.

**Nota:** Compilações manuais não marcarão automaticamente imagens como `latest` a menos que o fluxo de trabalho determine que seja a versão mais recente.

## Lançando Documentação {#releasing-documentation}

A documentação está hospedada em [GitHub Pages](https://wsj-br.github.io/duplistatus/) e é implantada separadamente do lançamento da aplicação. Siga estas etapas para lançar a documentação atualizada:

### Pré-requisitos {#prerequisites}

1. Certifique-se de que você tem um Token de Acesso Pessoal do GitHub com o escopo `repo`.
2. Configure as credenciais do Git (configuração única):

```bash
cd documentation
./setup-git-credentials.sh
```

Isso solicitará seu Token de Acesso Pessoal do GitHub e o armazenará com segurança.

### Documentação de Implantação {#deploy-documentation}

1. Navegue até o diretório `documentation`:

```bash
cd documentation
```

2. Certifique-se de que todas as alterações de documentação sejam confirmadas e enviadas para o repositório.

3. Construir e implantar a documentação:

```bash
pnpm run deploy
```

Este comando irá:
- Construir o site de documentação Docusaurus
- Enviar o site construído para o branch `gh-pages`
- Disponibilizar a documentação em [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Quando Implantar Documentação {#when-to-deploy-documentation}

Implante atualizações de documentação:
- Após mesclar alterações de documentação para `master`
- Ao lançar uma nova versão (se a documentação foi atualizada)
- Após melhorias significativas na documentação

**Nota:** A implantação da documentação é independente das versões da aplicação. Você pode implantar a documentação várias vezes entre as versões da aplicação.

### Preparando Notas de Lançamento para GitHub {#preparing-release-notes-for-github}

O script `generate-readme-from-intro.sh` gera automaticamente notas de lançamento do GitHub quando executado. Ele lê as notas de lançamento de `documentation/docs/release-notes/VERSION.md` (onde VERSION é extraído de `package.json`) e cria `RELEASE_NOTES_github_VERSION.md` na raiz do projeto.

**Exemplo:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

O arquivo de notas de lançamento gerado pode ser copiado e colado diretamente na descrição de lançamento do GitHub. Todos os links e imagens funcionarão corretamente no contexto de lançamento do GitHub.

**Nota:** O arquivo gerado é temporário e pode ser deletado após criar a versão no GitHub. É recomendado adicionar `RELEASE_NOTES_github_*.md` ao `.gitignore` se você não quiser fazer commit desses arquivos.

### Atualizar README.md {#update-readmemd}

Se você fez alterações em `documentation/docs/intro.md`, regenere o `README.md` do repositório:

```bash
./scripts/generate-readme-from-intro.sh
```

Este script:
- Extrai a versão de `package.json`
- Gera `README.md` a partir de `documentation/docs/intro.md` (converte admonições do Docusaurus para alertas no estilo GitHub, converte links e imagens)
- Cria `README_dockerhub.md` para Docker Hub (com formatação compatível com Docker Hub)
- Gera `RELEASE_NOTES_github_VERSION.md` a partir de `documentation/docs/release-notes/VERSION.md` (converte links e imagens para URLs absolutas)
- Atualiza a tabela de conteúdos usando `doctoc`

Faça commit e push do `README.md` atualizado junto com seu release.
