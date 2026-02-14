---
translation_last_updated: '2026-02-14T04:57:48.743Z'
source_file_mtime: '2026-01-25T02:45:42.745Z'
source_file_hash: 841b30d8ee97e362
translation_language: pt-BR
source_file_path: development/podman-testing.md
---
# Testes do Podman {#podman-testing}

Copiar e executar os scripts localizados em `scripts/podman_testing` no servidor de teste Podman.

## Configuração Inicial e Gerenciamento {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`: Copia a imagem Docker do daemon Docker local para Podman (para testes locais).
2. `copy.docker.duplistatus.remote`: Copia a imagem Docker de um servidor de desenvolvimento remoto para Podman (requer acesso SSH).
   - Crie a imagem no servidor de desenvolvimento usando: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Inicia o container em modo rootless.
4. `pod.testing`: Testa o container dentro de um pod Podman (com privilégios de root).
5. `stop.duplistatus`: Para o pod e remove o container.
6. `clean.duplistatus`: Para containers, remove pods e limpa imagens antigas.

## Configuração de DNS {#dns-configuration}

Os scripts detectam e configuram automaticamente as configurações de DNS do sistema host:

- **Detecção Automática**: Usa `resolvectl status` (systemd-resolved) para extrair servidores DNS e domínios de pesquisa
- **Suporte de Fallback**: Retorna à análise de `/etc/resolv.conf` em sistemas não-systemd
- **Filtragem Inteligente**: Filtra automaticamente endereços localhost e nameservers IPv6
- **Funciona com**:
  - Tailscale MagicDNS (100.100.100.100)
  - Servidores DNS corporativos
  - Configurações de rede padrão
  - Configurações DNS Personalizadas

Nenhuma configuração manual de DNS é necessária - os scripts lidam com isso automaticamente!

## Monitoramento e Verificações de Saúde {#monitoring-and-health-checks}

- `check.duplistatus`: Verifica os logs, conectividade e saúde da aplicação.

## Comandos de Depuração {#debugging-commands}

- `logs.duplistatus`: Mostra os logs do pod.
- `exec.shell.duplistatus`: Abre um shell no container.
- `restart.duplistatus`: Para o pod, remove o container, copia a imagem, cria o container e inicia o pod.

## Fluxo de Uso {#usage-workflow}

### Servidor de Desenvolvimento {#development-server}

Criar a imagem do Docker no servidor de desenvolvimento:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Servidor Podman {#podman-server}

1. Transferir a imagem Docker:
   - Use `./copy.docker.duplistatus.local` se Docker e Podman estiverem na mesma máquina
   - Use `./copy.docker.duplistatus.remote` se copiar de um servidor de desenvolvimento remoto (requer arquivo `.env` com `REMOTE_USER` e `REMOTE_HOST`)
2. Inicie o container com `./start.duplistatus` (independente, sem privilégios de root)
   - Ou use `./pod.testing` para testar em modo pod (com root)
3. Monitore com `./check.duplistatus` e `./logs.duplistatus`
4. Pare com `./stop.duplistatus` quando terminar
5. Use `./restart.duplistatus` para um ciclo de reinicialização completo (parar, copiar imagem, iniciar)
   - **Nota**: Este script atualmente referencia `copy.docker.duplistatus` que deve ser substituído por uma das variantes `.local` ou `.remote`
6. Use `./clean.duplistatus` para remover containers, pods e imagens antigas

# Testando a Aplicação {#testing-the-application}

Se você estiver executando o servidor Podman na mesma máquina, use `http://localhost:9666`.

Se você estiver em outro servidor, obtenha a URL com:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Notas Importantes {#important-notes}

### Rede de Pod do Podman {#podman-pod-networking}

Quando executado em pods Podman, a aplicação requer:
- Configuração explícita de DNS (manipulada automaticamente pelo script `pod.testing`)
- Vinculação de porta a todas as interfaces (`0.0.0.0:9666`)

Os scripts lidam com esses requisitos automaticamente - nenhuma configuração manual necessária.

### Modo sem Root vs Modo Root {#rootless-vs-root-mode}

- **Modo autônomo** (`start.duplistatus`): Executa sem privilégios com `--userns=keep-id`
- **Modo pod** (`pod.testing`): Executa como root dentro do pod para fins de teste

Ambos os modos funcionam corretamente com a detecção automática de DNS.

## Configuração de Ambiente {#environment-configuration}

Tanto `copy.docker.duplistatus.local` quanto `copy.docker.duplistatus.remote` exigem um arquivo `.env` no diretório `scripts/podman_testing`:

**Para cópia local** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**Para cópia remota** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

O script `start.duplistatus` requer um arquivo `.env` com pelo menos a variável `IMAGE`:

```
IMAGE=wsj-br/duplistatus:devel
```

**Nota**: A mensagem de erro do script menciona `REMOTE_USER` e `REMOTE_HOST`, mas estes não são realmente utilizados por `start.duplistatus`—apenas `IMAGE` é obrigatório.
