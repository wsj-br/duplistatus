# Lista de permissões de IP {/* #ip-allowlist */}

Administradores podem restringir quem acessa a interface de administração e as APIs de dados externas. As duas listas são independentes. Ambas estão desativadas por padrão.

![Lista de permissões de IP](../../assets/screen-settings-ip-allowlist.png)

A aplicação lê o endereço TCP do par de um cabeçalho interno definido por `scripts/peer-ip.cjs`. Um cliente não pode falsificar esse cabeçalho. **Detected IP** mostra o **Peer IP** TCP e o **Allowlist IP** usado para decisões de acesso (eles correspondem, a menos que os cabeçalhos de proxy confiáveis se apliquem).

Solicitações negadas retornam HTTP 403 (`IP_NOT_ALLOWED` em caminhos de API). Elas não são gravadas no log de auditoria. Uma linha de `console.warn` limitada pela taxa é emitida para o stdout da aplicação (por exemplo, `docker logs`) — no máximo um log por IP do cliente e superfície (admin, externa ou de teste) por minuto, e dez por hora — para que os scanners não possam inundar os logs.

## Proxies confiáveis {/* #trusted-proxies */}

Ative **Trust reverse proxy headers** apenas quando duplistatus não estiver acessível, exceto por meio de um proxy reverso que **sobrescreve** `X-Forwarded-For` / `X-Real-IP` (não anexe). Adicione cada CIDR de proxy com **Adicionar** (ou cole uma lista separada por vírgulas ou novas linhas). As entradas aparecem como chips removíveis. Quando o par TCP não estiver nessa lista, os cabeçalhos encaminhados são ignorados.

## Interface de administração {/* #admin-interface */}

Quando habilitado, as páginas, login, CSRF e APIs de sessão aceitam apenas CIDRs listados. Adicione entradas com **Adicionar**; seu **IP Permitido** atual é marcado como **IP atual** quando estiver na lista. **127.0.0.1** e **::1** são incluídos por padrão e não podem ser removidos. **Adicionar IP atual** e **IPs de login de administrador recentes** (do log de auditoria) oferecem sugestões rápidas. Você não pode habilitar esta lista a menos que seu IP atual já esteja incluído (ou você esteja se conectando do loopback). Um bloqueio pode ser recuperado com:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

ou adicionando seu CIDR a `ADMIN_IP_ALLOWLIST`. Os passos completos para recuperação (recriar o Docker, corrigir as Configurações e remover a substituição) estão em [Bloqueado pela Lista de permissões de IP](../troubleshooting.md#locked-out-by-ip-allowlist).

## APIs externas {/* #external-apis */}

Quando habilitado, `/api/upload`, `/api/summary` e `/api/lastbackup*` aceitam apenas CIDRs listados.

`/api/health` e `/api/ping` não estão na lista externa sozinhos (o ping do painel vem do IP da interface de administração). Quando **qualquer** lista de permissões é habilitada, esses testes aceitam loopback (`127.0.0.1`, `::1`) e CIDRs da lista **admin ou externa**. IPs não listados recebem HTTP 403. Quando ambas as listas estão desativadas, os testes permanecem públicos.

Solicitações de teste não loopback também são limitadas pela taxa (HTTP 429, `PROBE_RATE_LIMITED`): `/api/ping` 60/minuto e 600/hora; `/api/health` 30/minuto e 120/hora. Verificações Docker em contêineres atingem o localhost e nunca são limitadas. Limites de nível de aplicativo não param uma inundação de conexões volumétricas; coloque isso no proxy reverso.

Esta lista é a proteção a ser usada quando as chaves de API não são necessárias. Adicione CIDRs como chips como a lista de administradores. **127.0.0.1** e **::1** são incluídos por padrão e não podem ser removidos. **IPs de origem de upload recente** do log de auditoria são oferecidos como sugestões de adição rápida.

Se ambas esta lista de permissões e as chaves de API forem necessárias, uma solicitação deve passar **ambas**.

## Substituições de ambiente {/* #environment-overrides */}

| Variável | Propósito |
|----------|---------|
| `IP_TRUSTED_PROXIES` | CIDRs confiáveis de proxy separados por vírgula (também implica trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDRs separados por vírgula |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por vírgula |

Os valores do ambiente sobrescrevem o banco de dados, então um bloqueio pode ser recuperado sem a interface do usuário.
