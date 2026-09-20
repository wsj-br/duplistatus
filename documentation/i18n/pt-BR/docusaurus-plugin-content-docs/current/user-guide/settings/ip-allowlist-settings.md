# Lista de permissões de IP {/* #ip-allowlist */}

Os administradores podem restringir quem acessa a interface de administração e as APIs de dados externos. As duas listas são independentes. Ambas estão desativadas por padrão.

![Lista de permissões de IP](../../assets/screen-settings-ip-allowlist.png)

O aplicativo lê o endereço do par TCP a partir de um cabeçalho interno definido pelo `scripts/peer-ip.cjs`. Um cliente não pode falsificar esse cabeçalho. O **IP detectado** mostra o **IP do par** TCP e o **IP permitido** usado para decisões de acesso (eles coincidem, a menos que os cabeçalhos de proxy confiáveis sejam aplicados).

Solicitações negadas retornam HTTP 403 (`IP_NOT_ALLOWED` em caminhos da API). Elas não são gravadas no log de auditoria. Uma linha `console.warn` com limite de taxa é emitida para o stdout do aplicativo (por exemplo, `docker logs`) — no máximo um log por IP de cliente e superfície (admin, externo ou verificação) por minuto e dez por hora — para que scanners não possam inundar os logs.

## Proxies confiáveis {/* #trusted-proxies */}

Ative **Confiar em cabeçalhos de proxy reverso** somente quando o duplistatus não for acessível exceto através de um proxy reverso que **substitua** `X-Forwarded-For` / `X-Real-IP` (não adicione). Adicione cada CIDR de proxy com **Adicionar** (ou cole uma lista separada por vírgulas ou novas linhas). As entradas aparecem como chips removíveis. Quando o par TCP não está nessa lista, os cabeçalhos encaminhados são ignorados.

## Interface de administração {/* #admin-interface */}

Quando ativada, páginas, login, CSRF e APIs de sessão aceitam apenas CIDRs listados. Adicione entradas com **Adicionar**; seu **IP permitido** atual é marcado como **IP atual** quando estiver na lista. **127.0.0.1** e **::1** são incluídos por padrão e não podem ser removidos. **Adicionar IP atual** e **IPs de login de administrador recentes** (do log de auditoria) oferecem sugestões rápidas. Você não pode ativar esta lista a menos que seu IP atual já esteja incluído (ou você esteja conectado a partir do loopback). Um bloqueio pode ser recuperado com:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

ou adicionando seu CIDR ao `ADMIN_IP_ALLOWLIST`. Etapas completas de recuperação (recriação do Docker, depois corrigir Configurações e remover a substituição) estão em [Bloqueado pela lista de permissões de IP](../troubleshooting.md#locked-out-by-ip-allowlist).

## APIs externas {/* #external-apis */}

Quando ativadas, `/api/upload`, `/api/summary` e `/api/lastbackup*` aceitam apenas CIDRs listados.

`/api/health` e `/api/ping` não estão na lista externa sozinhos (o ping do painel vem do IP da interface de administração). Quando **qualquer uma** das listas de permissão está ativada, essas verificações aceitam loopback (`127.0.0.1`, `::1`) e CIDRs da lista **admin ou externa**. IPs não listados recebem HTTP 403. Quando ambas as listas estão desativadas, as verificações permanecem públicas.

Solicitações de verificação não-loopback também têm limite de taxa (HTTP 429, `PROBE_RATE_LIMITED`): `/api/ping` 60 por minuto e 600 por hora; `/api/health` 30 por minuto e 120 por hora. Verificações do Docker em contêineres atingem localhost e nunca são limitadas. Limites no nível do aplicativo não impedem um ataque massivo de conexões; coloque isso no proxy reverso.

Esta lista é a proteção a ser usada quando chaves de API não são necessárias. Adicione CIDRs como chips, semelhante à lista de administração. **127.0.0.1** e **::1** são incluídos por padrão e não podem ser removidos. **IPs de origem de upload recente** do log de auditoria são oferecidos como sugestões rápidas.

Se tanto esta lista de permissão quanto as chaves de API forem exigidas, uma solicitação deve passar **por ambas**.

## Substituições de ambiente {/* #environment-overrides */}

| Variável | Finalidade |
|----------|---------|
| `IP_TRUSTED_PROXIES` | CIDRs de proxy confiáveis separados por vírgula (também implica trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDRs separados por vírgula |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por vírgula |

Os valores de ambiente substituem o banco de dados, então um bloqueio pode ser recuperado sem a interface.
