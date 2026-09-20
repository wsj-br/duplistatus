# Resumo Diário {/* #daily-summary */}

Resumo Diário é um modo opcional de notificação que envia **um** instantâneo localizado de todos os trabalhos de backup conhecidos em um horário local exato. Enquanto estiver habilitado, e-mails de backup e atrasados para o destinatário padrão de E-mail (Configurações → E-mail → E-mail do Destinatário) são pausados. Destinos adicionais de e-mail configurados em [Notificações de Backup](backup-notifications-settings.md) continuam recebendo eventos correspondentes. Notificações NTFY por trabalho continuam. Essas configurações permanecem armazenadas e se tornam ativas novamente assim que o Resumo Diário for desativado.

O instantâneo é o status **atual** no momento do envio (o resultado mais recente para cada trabalho). Não é um histórico das execuções do dia anterior.

![Configurações do Resumo Diário](../../assets/screen-settings-daily-summary.png)

## Requisitos {/* #requirements */}

- O SMTP deve estar configurado. O e-mail é enviado uma vez, para o **Substituir destinatário SMTP** se um estiver salvo, caso contrário para o destinatário SMTP das [Configurações de E-mail](/user-guide/settings/email-settings).
- Verifique sua configuração SMTP e certifique-se de que está funcionando antes de confiar no Resumo Diário.
- A entrega agendada requer o serviço cron. O despachante dispara uma vez por dia no horário de envio UTC armazenado.

## O que está incluído {/* #what-is-included */}

Trabalhos conhecidos são o **backup observado mais recente** para cada servidor e nome de backup — o mesmo conjunto do painel e Configurações → Monitoramento de Backup.

Baldes de status (Sucesso, Aviso, Erro, Fatal, Desconhecido) são mutuamente exclusivos e somam-se à contagem de trabalhos. **Atrasado** é contado separadamente: um trabalho bem-sucedido atrasado ainda é Sucesso e também atrasado.

## Agendamento {/* #schedule */}

Escolha um horário `HH:mm` exato em seu **fuso horário do navegador**. O duplistatus armazena o agendamento como UTC e mostra ambos os valores na página (mesmo padrão que **Versões do Duplicati**). Alterações nesta página são salvas automaticamente. O horário padrão de envio para novas instalações é **01:00 UTC**.

- Habilitar ou alterar o agendamento começa na **próxima ocorrência futura**, nunca um envio surpresa imediato.
- O horário agendado sempre envia quando o trabalho cron dispara. **Enviar resumo agora**, uma nova tentativa ou um envio anterior no mesmo dia não o ignora.

## URL do painel público {/* #public-dashboard-url */}

URL opcional do **painel público** nesta página alimenta o espaço reservado `{duplistatus_link}` nos e-mails de Resumo Diário. Use uma URL `http://` ou `https://` sem barra final. Deixe vazio para omitir o link.

Quando `DUPLISTATUS_PUBLIC_URL` está definido no ambiente, substitui a configuração salva (veja [Variáveis de Ambiente](/installation/environment-variables)).

## Substituir destinatário SMTP {/* #override-smtp-recipient */}

**Substituir destinatário SMTP** opcional envia o Resumo Diário para um endereço diferente do destinatário nas configurações de E-mail. Deixe vazio para continuar usando o padrão. O valor é armazenado na chave de configuração `daily_summary` (`smtpRecipient`) e é usado para envios agendados, **Enviar resumo agora** e novas tentativas. As APIs de envio ainda não aceitam um destinatário na solicitação.

## Comportamento de substituição {/* #replacement-behaviour */}

Quando o Resumo Diário está ativado:

- upload e e-mail atrasado para o destinatário padrão de E-mail não são enviados
- destinos adicionais de e-mail em Notificações de Backup ainda recebem eventos correspondentes (atrasado conta como Aviso para esse filtro)
- notificações NTFY por trabalho continuam
- carimbos de data/hora atrasados não são avançados quando nada foi enviado, então alertas atrasados podem retomar imediatamente quando o modo for desativado
- visualização do modelo, testes de transporte e **Enviar resumo agora** ainda funcionam

**Enviar resumo agora** é uma entrega adicional. Isso não consome a próxima ocorrência agendada.

Entregas agendadas, **Enviar resumo agora** e novas tentativas são registradas no [log de auditoria](audit-logs-viewer.md) como `daily_summary_sent` (Operações do Sistema). Salvar configurações é `daily_summary_updated` (Configuração).

## Modelos {/* #templates */}

Edite o modelo de e-mail do Resumo Diário (Markdown) em [Configurações → Modelos](/user-guide/settings/notification-templates). O assunto padrão inclui `{summary_date}` mais contagens de Sucesso, Aviso, Atrasado, Erro e Fatal para que a linha da caixa de entrada resuma o instantâneo. Atrasados podem se sobrepor às contagens de status. Corpos de e-mail para Sucesso, Aviso/Erro, Atrasado e Resumo Diário usam todos Markdown. O modelo padrão inclui `{duplistatus_link}` no final quando uma URL de painel público está configurada nesta página ou via `DUPLISTATUS_PUBLIC_URL`.

**Gerar visualização** nesta página abre o mesmo diálogo de visualização que [Configurações → Modelos](/user-guide/settings/notification-templates): assunto do e-mail mais E-mail HTML e texto simples. O E-mail HTML segue o tema claro ou escuro atual.
