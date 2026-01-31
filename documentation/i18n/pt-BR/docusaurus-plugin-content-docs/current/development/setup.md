---
translation_last_updated: '2026-01-31T00:51:29.361Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 722ad34b5346ffbb
translation_language: pt-BR
source_file_path: development/setup.md
---
# Configuração de Desenvolvimento {#development-setup}

## Pré-requisitos {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0
- SQLite3

## Etapas {#steps}

1. Clone o repositório:

```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Instale as dependências (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install sqlite3 git -y
```

3. Remova instalações antigas do Node.js (se você já o tinha instalado)

```bash
sudo apt-get purge nodejs npm -y
sudo apt-get autoremove -y
sudo rm -rf /usr/local/bin/npm 
sudo rm -rf /usr/local/share/man/man1/node* 
sudo rm -rf /usr/local/lib/dtrace/node.d
rm -rf ~/.npm
rm -rf ~/.node-gyp
sudo rm -rf /opt/local/bin/node
sudo rm -rf /opt/local/include/node
sudo rm -rf /opt/local/lib/node_modules
sudo rm -rf /usr/local/lib/node*
sudo rm -rf /usr/local/include/node*
sudo rm -rf /usr/local/bin/node*
```

4. Instale Node.js e pnpm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
npm install -g pnpm npm-check-updates doctoc
```

5. Iniciar o servidor de desenvolvimento:

Para a porta TCP padrão (8666):

```bash
pnpm dev
```

## Scripts Disponíveis {#available-scripts}

O projeto inclui vários scripts npm para diferentes tarefas de desenvolvimento:

### Scripts de Desenvolvimento {#development-scripts}
- `pnpm dev` - Iniciar servidor de desenvolvimento na porta 8666 (inclui verificações prévias)
- `pnpm build` - Compilar a aplicação para produção (inclui verificações prévias)
- `pnpm lint` - Executar ESLint para verificar a qualidade do código
- `pnpm typecheck` - Executar verificação de tipos TypeScript
- `scripts/upgrade-dependencies.sh` - Atualizar todos os pacotes para a versão mais recente, verificar vulnerabilidades e corrigi-las automaticamente
- `scripts/clean-workspace.sh` - Limpar o workspace

**Nota:** O script `preinstall` aplica automaticamente o pnpm como gerenciador de pacotes.

### Scripts de Produção {#production-scripts}
- `pnpm build-local` - Compilar e preparar para produção local (inclui pré-verificações, copia arquivos estáticos para diretório standalone)
- `pnpm start-local` - Iniciar servidor de produção localmente (porta 8666, inclui pré-verificações). **Nota:** Execute `pnpm build-local` primeiro.
- `pnpm start` - Iniciar servidor de produção (porta 9666)

### Scripts Docker {#docker-scripts}
- `pnpm docker-up` - Iniciar pilha Docker Compose
- `pnpm docker-down` - Parar pilha Docker Compose
- `pnpm docker-clean` - Limpar ambiente Docker e cache
- `pnpm docker-devel` - Construir uma imagem Docker de desenvolvimento marcada como `wsj-br/duplistatus:devel`

### Scripts de Serviço Cron {#cron-service-scripts}
- `pnpm cron:start` - Iniciar serviço cron em modo de produção
- `pnpm cron:dev` - Iniciar serviço cron em modo de desenvolvimento com monitoramento de arquivos (porta 8667)
- `pnpm cron:start-local` - Iniciar serviço cron localmente para testes (porta 8667)

### Test Scripts {#test-scripts}
- `pnpm generate-test-data` - Gerar dados de backup de teste (requer parâmetro --servers=N)
- `pnpm show-overdue-notifications` - Mostrar conteúdo de notificações atrasadas
- `pnpm run-overdue-check` - Executar verificação de atraso em data/hora específica
- `pnpm test-cron-port` - Testar conectividade da porta do serviço cron
- `pnpm test-overdue-detection` - Testar lógica de detecção de backup atrasado
- `pnpm validate-csv-export` - Validar funcionalidade de exportação CSV
- `pnpm set-smtp-test-config` - Definir configuração de teste SMTP a partir de variáveis de ambiente (veja [Test Scripts](test-scripts))
- `pnpm test-smtp-connections` - Testar compatibilidade cruzada de tipo de conexão SMTP (veja [Test Scripts](test-scripts))
- `pnpm test-entrypoint` - Testar script de entrypoint Docker em desenvolvimento local (veja [Test Scripts](test-scripts))
- `pnpm take-screenshots` - Capturar screenshots para documentação (veja [Documentation Tools](documentation-tools))
