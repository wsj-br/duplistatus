---
translation_last_updated: '2026-01-31T00:51:30.989Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: 4e8d8de10402b259
translation_language: pt-BR
source_file_path: user-guide/settings/email-settings.md
---
# E-mail {#email}

**duplistatus** suporta o envio de notificações por e-mail via SMTP como uma alternativa ou complemento às notificações NTFY. A configuração de e-mail agora é gerenciada através da interface web com armazenamento criptografado no banco de dados para maior segurança.

![Email Configuration](/assets/screen-settings-email.png)

| Configuração                | Descrição                                                      |
|:------------------------|:-----------------------------------------------------------------|
| **Host do servidor SMTP**    | Servidor SMTP do seu provedor de e-mail (por exemplo, `smtp.gmail.com`).      |
| **Porta do servidor SMTP**    | Número da porta (normalmente `25` para SMTP simples, `587` para STARTTLS ou `465` para SSL/TLS direto). |
| **Tipo de conexão**     | Selecione entre SMTP simples, STARTTLS ou SSL/TLS direto. O padrão é SSL/TLS direto para novas configurações. |
| **Autenticação SMTP** | Alterne para ativar ou desativar a autenticação SMTP. Quando desabilitada, os campos de nome de usuário e senha não são obrigatórios. |
| **Nome de usuário SMTP**       | Seu endereço de e-mail ou nome de usuário (obrigatório quando a autenticação está habilitada). |
| **Senha SMTP**       | Sua senha de e-mail ou senha específica do aplicativo (obrigatória quando a autenticação está habilitada). |
| **Nome do remetente**         | Nome de exibição mostrado como remetente nas notificações por e-mail (opcional, padrão é "duplistatus"). |
| **Endereço do remetente**        | Endereço de e-mail mostrado como remetente. Obrigatório para conexões SMTP simples ou quando a autenticação está desabilitada. Padrão é o nome de usuário SMTP quando a autenticação está habilitada. Observe que alguns provedores de e-mail substituirão o `Endereço do remetente` pelo `Nome de usuário do servidor SMTP`. |
| **E-mail do destinatário**     | O endereço de e-mail para receber notificações. Deve estar em um formato de endereço de e-mail válido. |

Um <IIcon2 icon="lucide:mail" color="green"/> ícone verde ao lado de `Email` na barra lateral significa que suas configurações são válidas. Se o ícone for <IIcon2 icon="lucide:mail" color="yellow"/> amarelo, suas configurações não são válidas ou não estão configuradas.

O ícone fica verde quando todos os campos obrigatórios estão preenchidos: Host do servidor SMTP, Porta do servidor SMTP, E-mail do destinatário, e também (Nome de usuário SMTP + Senha quando a autenticação é obrigatória) ou (Endereço do remetente quando a autenticação não é obrigatória).

Quando a configuração não está totalmente configurada, uma caixa de alerta amarela é exibida informando que nenhum e-mail será enviado até que as configurações de e-mail sejam preenchidas corretamente. As caixas de seleção de E-mail na aba [`Notificações de Backup`](backup-notifications-settings.md) também ficarão acinzentadas e exibirão rótulos "(Desabilitado)".

<br/>

## Ações Disponíveis {#available-actions}

| Botão                                                            | Descrição                                                |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="Salvar configurações" />                      | Salva as alterações feitas nas configurações do NTFY.    |
| <IconButton icon="lucide:mail" label="Enviar e-mail de teste"/>  | Envia uma mensagem de e-mail de teste usando a configuração SMTP. O e-mail de teste exibe nome do host do servidor SMTP, porta, tipo de conexão, status de autenticação, nome de usuário (se aplicável), e-mail do destinatário, endereço do remetente, nome do remetente e data e hora do teste. |
| <IconButton icon="lucide:trash-2" label="Excluir configurações SMTP"/> | Exclui / Limpa a configuração SMTP.                      |

<br/>

:::info[Importante]
  Você deve usar o botão <IconButton icon="lucide:mail" label="Enviar e-mail de teste"/> para garantir que sua configuração de e-mail funcione antes de depender dela para notificações.

 Mesmo que você veja um ícone <IIcon2 icon="lucide:mail" color="green"/> verde e tudo pareça configurado, os e-mails podem não ser enviados.
 
 `duplistatus` apenas verifica se suas configurações de SMTP estão preenchidas, não se os e-mails podem ser realmente entregues.
:::

<br/>

## Provedores SMTP Comuns {#common-smtp-providers}

**Gmail:**

- Host: `smtp.gmail.com`
- Porta: `587` (STARTTLS) ou `465` (SSL/TLS direto)
- Tipo de conexão: STARTTLS para porta 587, SSL/TLS direto para porta 465
- Nome de usuário: Seu endereço Gmail
- Senha: Use uma Senha de Aplicativo (não sua senha regular). Gere uma em https://myaccount.google.com/apppasswords
- Autenticação: Obrigatória

**Outlook/Hotmail:**

- Host: `smtp-mail.outlook.com`
- Porta: `587`
- Tipo de conexão: STARTTLS
- Nome de usuário: Seu endereço de e-mail do Outlook
- Senha: Sua senha da conta
- Autenticação: Obrigatório

**Yahoo Mail:**

- Host: `smtp.mail.yahoo.com`
- Porta: `587`
- Tipo de conexão: STARTTLS
- Nome de usuário: Seu endereço de e-mail do Yahoo
- Senha: Use uma Senha de Aplicativo
- Autenticação: Obrigatória

### Melhores Práticas de Segurança {#security-best-practices}

- Considere usar uma conta de e-mail dedicada para notificações
 - Teste sua configuração usando o botão "Enviar e-mail de teste"
 - As configurações são criptografadas e armazenadas com segurança no banco de dados
 - **Use conexões criptografadas** - STARTTLS e SSL/TLS direto são recomendados para uso em produção
 - Conexões SMTP simples (porta 25) estão disponíveis para redes locais confiáveis, mas não são recomendadas para uso em produção em redes não confiáveis
