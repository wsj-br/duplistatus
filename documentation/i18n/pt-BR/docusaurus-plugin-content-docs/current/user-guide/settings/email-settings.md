# E-mail {/* #email */}

**duplistatus** suporta o envio de notificações por e-mail via SMTP como alternativa ou complemento às notificações NTFY. A configuração de e-mail agora é gerenciada por meio da interface web com armazenamento criptografado no banco de dados para maior segurança.

![Configuração de E-mail](../../assets/screen-settings-email.png)

| Configuração                 | Descrição                                                      |
|:------------------------|:-----------------------------------------------------------------|
| **Servidor SMTP**    | O servidor SMTP do seu provedor de e-mail (ex.: `smtp.gmail.com`).      |
| **Porta do Servidor SMTP**    | Número da porta (geralmente `25` para SMTP Simples, `587` para STARTTLS ou `465` para SSL/TLS Direto). |
| **Tipo de Conexão**     | Selecione entre SMTP Simples, STARTTLS ou SSL/TLS Direto. Padrão para SSL/TLS Direto em novas configurações. |
| **Autenticação SMTP** | Ative ou desative a autenticação SMTP. Quando desativada, os campos de nome de usuário e senha não são necessários. |
| **Nome de usuário SMTP**       | Seu endereço de e-mail ou nome de usuário (necessário quando a autenticação está ativada). |
| **Senha SMTP**       | Sua senha de e-mail ou senha específica do aplicativo (necessária quando a autenticação está ativada). |
| **Nome do Remetente**         | Nome exibido como remetente nas notificações por e-mail (opcional, padrão "duplistatus"). |
| **Endereço de Origem**        | Endereço de e-mail exibido como remetente. Necessário para conexões SMTP Simples ou quando a autenticação está desativada. Padrão para o nome de usuário SMTP quando a autenticação está ativada. Observe que alguns provedores de e-mail podem substituir o `From Address` pelo `SMTP Server Username`. |
| **E-mail do Destinatário**     | O endereço de e-mail para receber notificações. Deve estar no formato de endereço de e-mail válido. |

Um ícone verde <IIcon2 icon="lucide:mail" color="green"/> ao lado de **E-mail** na barra lateral significa que suas configurações são válidas. Se o ícone for <IIcon2 icon="lucide:mail" color="yellow"/> amarelo, suas configurações não são válidas ou não estão configuradas.

O ícone mostra verde quando todos os campos obrigatórios estão definidos: Servidor SMTP, Porta do Servidor SMTP, E-mail do Destinatário e (Nome de usuário SMTP + Senha quando a autenticação é necessária) ou (Endereço de Origem quando a autenticação não é necessária).

Quando a configuração não está completamente configurada, uma caixa de alerta amarela é exibida informando que nenhum e-mail será enviado até que as configurações de e-mail sejam preenchidas corretamente. As caixas de seleção de E-mail na guia [Notificações de Backup](backup-notifications-settings.md) também serão cinzas e mostrarão "(desativado)".

<br/>

## Ações Disponíveis {/* #available-actions */}

| Botão                                                           | Descrição                                              |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="Salvar Configurações" />                             | Salva as alterações feitas nas configurações de NTFY.              |
| <IconButton icon="lucide:mail" label="Enviar E-mail de Teste"/>         | Envia uma mensagem de e-mail de teste usando a configuração SMTP. O e-mail de teste exibe o nome do servidor SMTP, porta, tipo de conexão, status de autenticação, nome de usuário (se aplicável), e-mail do destinatário, endereço de origem, nome do remetente e timestamp de teste. |
| <IconButton icon="lucide:trash-2" label="Excluir Configurações SMTP"/> | Excluir / Limpar a configuração SMTP. Desativado enquanto o [Resumo Diário](daily-summary-settings.md) está ativado, pois esse modo requer e-mail. |

<br/>

:::info[IMPORTANTE]
  Você deve usar o botão <IconButton icon="lucide:mail" label="Enviar E-mail de Teste"/> para garantir que sua configuração de e-mail funcione antes de depender dela para notificações.

 Mesmo que você veja um ícone <IIcon2 icon="lucide:mail" color="green"/> verde e tudo pareça configurado, os e-mails podem não ser enviados.
 
 **duplistatus** apenas verifica se suas configurações SMTP estão preenchidas, não se os e-mails podem ser realmente entregues.
:::

<br/>

## Provedores SMTP Comuns {/* #common-smtp-providers */}

**Gmail:**

- Host: `smtp.gmail.com`
- Port: `587` (STARTTLS) ou `465` (SSL/TLS Direto)
- Tipo de Conexão: STARTTLS para a porta 587, SSL/TLS Direto para a porta 465
- Nome de usuário: Seu endereço de e-mail do Gmail
- Senha: Use uma Senha de Aplicativo (não sua senha regular). Gere uma em https://myaccount.google.com/apppasswords
- Autenticação: Obrigatória

**Outlook/Hotmail:**

- Host: `smtp-mail.outlook.com`
- Port: `587`
- Tipo de Conexão: STARTTLS
- Nome de usuário: Seu endereço de e-mail do Outlook
- Senha: Sua senha de conta
- Autenticação: Obrigatória

**Yahoo Mail:**

- Host: `smtp.mail.yahoo.com`
- Port: `587`
- Tipo de Conexão: STARTTLS
- Nome de usuário: Seu endereço de e-mail do Yahoo
- Senha: Use uma Senha de Aplicativo
- Autenticação: Obrigatória

### Práticas Recomendadas de Segurança {/* #security-best-practices */}

- Considere usar uma conta de e-mail dedicada para notificações
 - Teste sua configuração usando o botão "Enviar E-mail de Teste"
 - As configurações são criptografadas e armazenadas com segurança no banco de dados
 - **Use conexões criptografadas** - STARTTLS e SSL/TLS Direto são recomendados para uso em produção
 - Conexões SMTP Simples (porta 25) estão disponíveis para redes locais confiáveis, mas não são recomendadas para uso em produção sobre redes não confiáveis
