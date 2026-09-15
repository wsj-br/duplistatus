# Gerenciamento de Versões {/* #release-management */}

## Versionamento (Semantic Versioning) {/* #versioning-semantic-versioning */}

O projeto segue o Semantic Versioning (SemVer) com o formato `MAJOR.MINOR.PATCH`:

- **MAJOR** versão (x.0.0): Quando você faz alterações incompatíveis na API
- **MINOR** versão (0.x.0): Quando você adiciona funcionalidades de forma compatível com versões anteriores
- **PATCH** versão (0.0.x): Quando você faz correções de bugs compatíveis com versões anteriores

## Lista de Verificação Pré-Lançamento {/* #pre-release-checklist */}

Antes de lançar uma nova versão, certifique-se de ter concluído o seguinte:

- [ ] Todas as alterações foram confirmadas e enviadas para o branch `vMAJOR.MINOR.x`.
- [ ] O número da versão foi atualizado no `package.json` (use `scripts/update-version.sh` para sincronizá-lo em todos os arquivos).
- [ ] Todos os testes passaram (em modo de desenvolvimento, local, docker e podman). 
- [ ] Inicie um contêiner Docker com `pnpm docker:up` e execute `scripts/compare-versions.sh` para verificar a consistência da versão entre o ambiente de desenvolvimento e o contêiner Docker (requer que o contêiner Docker esteja em execução). Este script compara as versões do SQLite apenas pela versão principal (por exemplo, 3.45.1 vs 3.51.1 são considerados compatíveis), e compara as versões do Node, npm e Duplistatus exatamente.
- [ ] A documentação está atualizada, atualize as capturas de tela (use `pnpm take-screenshots`)
- [ ] As notas de lançamento estão preparadas no `documentation/docs/release-notes/VERSION.md`.
- [ ] Execute `scripts/generate-readme-from-intro.sh` para atualizar `README.md` com a nova versão e quaisquer alterações de `documentation/docs/intro.md`. Este script também gera automaticamente `README_dockerhub.md` e `RELEASE_NOTES_github_VERSION.md`.

## Visão Geral do Processo de Lançamento {/* #release-process-overview */}

O processo de lançamento recomendado usa **Pull Requests e Releases do GitHub** (veja abaixo). Isso fornece melhor visibilidade, recursos de revisão e aciona automaticamente a construção de imagens Docker. O método de linha de comando está disponível como alternativa.

## Método 1: Pull Request e Release do GitHub (Recomendado) {/* #method-1-github-pull-request-and-release-recommended */}

Este é o método preferido, pois fornece melhor rastreabilidade e aciona automaticamente a construção de Docker.

### Passo 1: Criar Pull Request {/* #step-1-create-pull-request */}

1. Navegue até o [repositório duplistatus](https://github.com/wsj-br/duplistatus) no GitHub.
2. Clique na aba **"Pull requests"**.
3. Clique em **"New pull request."**
4. Defina o **branch base** como `master` e o **branch de comparação** como `vMAJOR.MINOR.x`.
5. Revise a visualização das alterações para garantir que tudo esteja correto.
6. Clique em **"Create pull request."**
7. Adicione um título descritivo (por exemplo, "Release v1.2.0") e uma descrição resumindo as alterações.
8. Clique em **"Create pull request"** novamente.

### Passo 2: Mesclar o Pull Request {/* #step-2-merge-the-pull-request */}

Após revisar o pull request:

1. Se não houver conflitos, clique no botão verde **"Merge pull request"**.
2. Escolha sua estratégia de mesclagem (tipicamente "Create a merge commit").
3. Confirme a mesclagem.

### Passo 3: Criar Release do GitHub {/* #step-3-create-github-release */}

Depois que a mesclagem estiver completa, crie uma release do GitHub:

1. Navegue até o repositório [duplistatus](https://github.com/wsj-br/duplistatus) no GitHub.
2. Acesse a seção **"Releases"** (ou clique em "Releases" na barra lateral direita).
3. Clique em **"Draft a new release."**
4. No campo **"Choose a tag"**, digite o número da nova versão no formato `vMAJOR.MINOR.PATCH` (por exemplo, `v1.2.0`). Isso criará uma nova tag.
5. Selecione `master` como branch de destino.
6. Adicione um **título de lançamento** (por exemplo, "Release v1.2.0").
7. Adicione uma **descrição** documentando as alterações nesta versão. Você pode:
   - Copiar o conteúdo de `RELEASE_NOTES_github_VERSION.md` (gerado por `scripts/generate-readme-from-intro.sh`)
   - Ou referenciar notas de lançamento de `documentation/docs/release-notes/` (mas observe que links relativos não funcionarão em lançamentos do GitHub)
8. Clique em **"Publish release."**

**O que acontece automaticamente:**
- Uma nova tag Git é criada
- O fluxo de trabalho "Build and Publish Docker Image" é acionado
- Imagens Docker são construídas para arquiteturas AMD64 e ARM64
- As imagens são enviadas para:
  - Docker Hub: `wsjbr/duplistatus:VERSION` e `wsjbr/duplistatus:latest` (se este for o lançamento mais recente)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` e `ghcr.io/wsj-br/duplistatus:latest` (se este for o lançamento mais recente)

## Método 2: Linha de Comando (Alternativo) {/* #method-2-command-line-alternative */}

Se preferir usar a linha de comando, siga estas etapas:

### Passo 1: Atualizar a Branch Local Master {/* #step-1-update-local-master-branch */}

Certifique-se de que sua branch local `master` está atualizada:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Passo 2: Mesclar a Branch de Desenvolvimento {/* #step-2-merge-development-branch */}

Mescle a branch `vMAJOR.MINOR.x` na `master`:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Se houver **conflitos de mesclagem**, resolva-os manualmente:
1. Edite os arquivos conflitantes
2. Adicione os arquivos resolvidos: `git add <file>`
3. Conclua a mesclagem: `git commit`

### Passo 3: Tag da Versão {/* #step-3-tag-the-release */}

Crie uma tag anotada para a nova versão:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

A flag `-a` cria uma tag anotada (recomendado para lançamentos), e a flag `-m` adiciona uma mensagem.

### Passo 4: Enviar para o GitHub {/* #step-4-push-to-github */}

Envie tanto a branch `master` atualizada quanto a nova tag:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Como alternativa, envie todas as tags de uma vez: `git push --tags`

### Passo 5: Criar Lançamento no GitHub {/* #step-5-create-github-release */}

Após enviar a tag, crie um lançamento no GitHub (veja Método 1, Passo 3) para acionar o fluxo de trabalho de construção do Docker.

## Construção Manual da Imagem Docker {/* #manual-docker-image-build */}

Para acionar manualmente o fluxo de trabalho de construção da imagem Docker sem criar uma versão:

1. Navegue até o [repositório duplistatus](https://github.com/wsj-br/duplistatus) no GitHub.
2. Clique na aba **"Ações"**.
3. Selecione o fluxo de trabalho **"Build and Publish Docker Image"**.
4. Clique em **"Run workflow"**.
5. Selecione a branch a partir da qual construir (tipicamente `master`).
6. Clique em **"Run workflow"** novamente.

**Nota:** Construções manuais não marcarão automaticamente as imagens como `latest` a menos que o fluxo determine que é a versão mais recente.

## Lançamento da Documentação {/* #releasing-documentation */}

A documentação é hospedada no [GitHub Pages](https://wsj-br.github.io/duplistatus/) e é implantada separadamente do lançamento da aplicação. Siga estas etapas para lançar a documentação atualizada:

### Pré-requisitos {/* #prerequisites */}

1. Certifique-se de ter um Token de Acesso Pessoal do GitHub com o escopo `repo`.
2. Configure as credenciais do Git (configuração única):

```bash
cd documentation
./setup-git-credentials.sh
```

Isso solicitará seu Token de Acesso Pessoal do GitHub e o armazenará com segurança.

### Implantar Documentação {/* #deploy-documentation */}

1. Navegue até o diretório `documentation`:

```bash
cd documentation
```

2. Certifique-se de que todas as alterações na documentação foram confirmadas e enviadas para o repositório.

3. Construa e implante a documentação:

```bash
pnpm run deploy
```

Este comando fará:
- Construir o site de documentação Docusaurus
- Enviar o site construído para a branch `gh-pages`
- Tornar a documentação disponível em [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Quando Implantar a Documentação {/* #when-to-deploy-documentation */}

Implante atualizações na documentação:
- Após mesclar alterações na documentação para `master`
- Ao lançar uma nova versão (se a documentação foi atualizada)
- Após melhorias significativas na documentação

**Nota:** A implantação da documentação é independente dos lançamentos da aplicação. Você pode implantar a documentação várias vezes entre os lançamentos da aplicação.

### Preparando Notas de Lançamento para o GitHub {/* #preparing-release-notes-for-github */}

O script `generate-readme-from-intro.sh` gera automaticamente as notas de lançamento do GitHub quando executado. Ele lê as notas de lançamento de `documentation/docs/release-notes/VERSION.md` (onde VERSION é extraído de `package.json`) e cria `RELEASE_NOTES_github_VERSION.md` na raiz do projeto.

**Exemplo:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

O arquivo de notas de lançamento gerado pode ser copiado e colado diretamente na descrição do lançamento do GitHub. Todos os links e imagens funcionarão corretamente no contexto do lançamento do GitHub.

**Nota:** O arquivo gerado é temporário e pode ser excluído após a criação da versão no GitHub. É recomendado adicionar `RELEASE_NOTES_github_*.md` a `.gitignore` se você não quiser confirmar esses arquivos.

### Atualizar README.md {/* #update-readmemd */}

Se você fez alterações em `documentation/docs/intro.md`, regenere o `README.md` do repositório:

```bash
./scripts/generate-readme-from-intro.sh
```

Este script:
- Extrai a versão de `package.json`
- Gera `README.md` a partir de `documentation/docs/intro.md` (converte admoções do Docusaurus para alertas no estilo GitHub, converte links e imagens)
- Cria `README_dockerhub.md` para o Docker Hub (com formatação compatível com o Docker Hub)
- Gera `RELEASE_NOTES_github_VERSION.md` a partir de `documentation/docs/release-notes/VERSION.md` (converte links e imagens para URLs absolutos)
- Atualiza o índice usando `doctoc`

Confirme e envie as atualizações de `README.md` junto com sua versão.
