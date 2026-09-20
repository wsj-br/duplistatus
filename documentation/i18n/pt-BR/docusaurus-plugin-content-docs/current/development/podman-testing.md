# Teste do Podman {/* #podman-testing */}

Copie e execute os scripts localizados em `scripts/podman_testing` no servidor de teste do Podman.

## Configuração Inicial e Gerenciamento {/* #initial-setup-and-management */}

1. `copy.docker.duplistatus.local`: Copia a imagem do Docker do daemon Docker local para o Podman (para teste local).
2. `copy.docker.duplistatus.remote`: Copia a imagem do Docker de um servidor de desenvolvimento remoto para o Podman (requer acesso SSH).
   - Crie a imagem no servidor de desenvolvimento usando: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Inicia o contêiner em modo rootless.
4. `pod.testing`: Testa o contêiner dentro de um pod do Podman (com privilégios de root).
5. `stop.duplistatus`: Para o pod e remove o contêiner.
6. `clean.duplistatus`: Para contêineres, remove pods e limpa imagens antigas.

## Configuração de DNS {/* #dns-configuration */}

Os scripts detectam e configuram automaticamente as configurações de DNS do sistema host:

- **Detecção Automática**: Usa `resolvectl status` (systemd-resolved) para extrair servidores DNS e domínios de pesquisa
- **Suporte de Fallback**: Volta a analisar `/etc/resolv.conf` em sistemas não-systemd
- **Filtragem Inteligente**: Filtra automaticamente endereços localhost e nameservers IPv6
- **Funciona com**:
  - Tailscale MagicDNS (100.100.100.100)
  - Servidores DNS corporativos
  - Configurações de rede padrão
  - Configurações de DNS personalizadas

Nenhuma configuração manual de DNS é necessária - os scripts lidam com isso automaticamente!

## Monitoramento e Verificações de Saúde {/* #monitoring-and-health-checks */}

- `check.duplistatus`: Verifica os logs, conectividade e saúde da aplicação.

## Comandos de Depuração {/* #debugging-commands */}

- `logs.duplistatus`: Mostra os logs do pod.
- `exec.shell.duplistatus`: Abre um shell no contêiner.
- `restart.duplistatus`: Para o pod, remove o contêiner, copia a imagem, cria o contêiner e inicia o pod.

## Fluxo de Trabalho de Uso {/* #usage-workflow */}

### Servidor de Desenvolvimento {/* #development-server */}

Crie a imagem do Docker no servidor de desenvolvimento:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Servidor Podman {/* #podman-server */}

1. Transfira a imagem do Docker:
   - Use `./copy.docker.duplistatus.local` se Docker e Podman estiverem na mesma máquina
   - Use `./copy.docker.duplistatus.remote` se copiar de um servidor de desenvolvimento remoto (requer arquivo `.env` com `REMOTE_USER` e `REMOTE_HOST`)
2. Inicie o contêiner com `./start.duplistatus` (autônomo, rootless)
   - Ou use `./pod.testing` para testar em modo pod (com root)
3. Monitore com `./check.duplistatus` e `./logs.duplistatus`
4. Pare com `./stop.duplistatus` quando terminar
5. Use `./restart.duplistatus` para um ciclo de reinicialização completo (parar, copiar imagem, iniciar)
   - **Nota**: Este script atualmente faz referência a `copy.docker.duplistatus` que deve ser substituído por `.local` ou pela variante `.remote`
6. Use `./clean.duplistatus` para remover contêineres, pods e imagens antigas

# Testando a Aplicação {/* #testing-the-application */}

Se você está executando o servidor Podman na mesma máquina, use `http://localhost:9666`.

Se você está em outro servidor, obtenha a URL com:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Notas Importantes {/* #important-notes */}

### Rede de Pod Podman {/* #podman-pod-networking */}

Ao executar em pods Podman, a aplicação requer:
- Configuração explícita de DNS (manipulada automaticamente pelo script `pod.testing`)
- Vinculação de porta para todas as interfaces (`0.0.0.0:9666`)

Os scripts lidam com esses requisitos automaticamente - nenhuma configuração manual necessária.

### Modo Rootless vs Modo Root {/* #rootless-vs-root-mode */}

- **Modo autônomo** (`start.duplistatus`): Executa rootless com `--userns=keep-id`
- **Modo pod** (`pod.testing`): Executa como root dentro do pod para fins de teste

Ambos os modos funcionam corretamente com a detecção automática de DNS.

## Configuração de Ambiente {/* #environment-configuration */}

Tanto `copy.docker.duplistatus.local` quanto `copy.docker.duplistatus.remote` requerem um arquivo `.env` no diretório `scripts/podman_testing`:

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

**Nota**: A mensagem de erro do script menciona `REMOTE_USER` e `REMOTE_HOST`, mas estes não são realmente usados por `start.duplistatus`—apenas `IMAGE` é necessário.
