# Chaves de API {/* #api-keys */}

Administradores podem criar chaves de API com escopo para as APIs HTTP externas que o Duplicati e o Homepage utilizam. As chaves são opcionais por padrão, então os trabalhos existentes do Duplicati continuarão funcionando.

![Chaves de API](../../assets/screen-settings-api-keys.png)

## Escopos {/* #scopes */}

| Escopo | Endpoints |
|-------|-----------|
| Carregar | `POST /api/upload` |
| Leitura | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Uma chave de upload não pode chamar as APIs de leitura, e uma chave de leitura não pode carregar relatórios.

## Criando uma chave {/* #creating-a-key */}

1. Abra **Configurações → Chaves de API**.
2. Clique em **Criar chave de API** na parte inferior do cartão Chaves de API.
3. Digite um nome, escolha um escopo e, opcionalmente, defina uma data de expiração (`YYYY-MM-DD`).
4. Gere a chave e copie imediatamente o segredo. Ele é mostrado apenas uma vez na caixa de diálogo.
5. A lista posterior mostra uma impressão digital como `Qk7v…3xTa` (primeiros e últimos quatro caracteres), a data de expiração e o status. A mesma impressão digital aparece no log de auditoria.

### Desativar ou excluir {/* #disable-or-delete */}

Use a caixa de seleção na coluna **Ações** para desativar uma chave sem excluí-la. Chaves desativadas não podem autenticar. Marque novamente a caixa de seleção para reativar a chave. Chaves expiradas não podem ser ativadas; crie uma nova chave. Excluir remove a chave permanentemente.

### Expiração {/* #expiry */}

Uma data opcional de expiração é o último dia do calendário em que a chave permanece válida. Ela expira às **23:59:59 daquele dia no fuso horário local do navegador**, e não à meia-noite no início do dia.

Escolher `2026-12-01` compila `2026-12-01T23:59:59` localmente e, em seguida, armazena esse instante como UTC. Para um navegador em UTC+1, isso será `2026-12-01T22:59:59.000Z`. A chave permanece válida até 1º de dezembro e é considerada expirada a partir das 23:59:59 locais (`expires_at <= now`). A tabela Chaves de API mostra a data de expiração (ou **Nunca**, se nenhuma foi definida). Após esse momento, o selo de Status muda para **Expirado** (cinza); chaves expiradas não podem autenticar, mesmo que tenham sido deixadas habilitadas.

## Usando uma chave {/* #using-a-key */}

O Duplicati não pode definir cabeçalhos personalizados. Coloque a chave na URL do relatório:

```bash
--send-http-json-urls=https://your-host/api/upload?api_key=YOUR_KEY
```

Widgets do Homepage podem usar o mesmo parâmetro de consulta:

```yaml
url: http://your-host/api/summary?api_key=YOUR_READ_KEY
```

Clientes que podem enviar cabeçalhos podem usar `X-Api-Key` ou `Authorization: Bearer`. Chaves de string de consulta aparecem nos logs de acesso de proxy reverso.

## Exigir chaves {/* #require-keys */}

O interruptor **Exigir chaves de API para APIs externas** está desativado por padrão. Enquanto estiver desativado, solicitações sem uma chave são permitidas. Se um cliente ainda enviar uma chave, uma chave válida com escopo correspondente será aceita e registrada; uma chave inválida, desativada, expirada ou com escopo incorreto será ignorada e a solicitação ainda será permitida. Quando você ativa o interruptor, as quatro APIs externas de dados retornam `401` sem uma chave válida (e rejeitam chaves inválidas). Habilite pelo menos uma chave de upload e uma chave de leitura primeiro, ou os uploads do Duplicati e os widgets do Homepage serão interrompidos. As alterações são salvas automaticamente.

## Proteção de API externa {/* #external-api-protection */}

A mesma página pode exigir chaves de API para os uploads públicos e APIs de leitura e configurar um tamanho máximo de corpo (padrão de 5 MB) e limites de taxa por IP para `/api/upload`. Os limites de tamanho e taxa se aplicam mesmo quando as chaves são opcionais e constituem a principal defesa contra floods. As opções e campos de limite são salvos automaticamente; não há um botão Salvar separado.

Consulte também [Lista de permissões de IP](ip-allowlist-settings.md). A lista de permissões de IP e as chaves de API são recursos independentes; você pode usar um ou ambos juntos. Habilitar ambos aumenta a segurança ao restringir o acesso com base no endereço IP e exigir uma chave de API.
