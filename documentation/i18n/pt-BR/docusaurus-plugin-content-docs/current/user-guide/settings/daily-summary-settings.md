# Resumo Diário {/* #daily-summary */}

O Resumo Diário é um modo de notificação opcional que envia **um** instantâneo localizado de todos os trabalhos de backup conhecidos em um horário local exato. Enquanto estiver habilitado, os e-mails de backup e atrasados para o destinatário de E-mail padrão (Configurações → E-mail → E-mail do Destinatário) são pausados. Destinos de e-mail adicionais configurados em [Notificações de Backup](backup-notifications-settings.md) continuam a receber eventos correspondentes. As notificações NTFY por trabalho continuam. Essas configurações permanecem armazenadas e se tornam ativas novamente assim que o Resumo Diário for desativado.

O instantâneo é o **status atual** no momento do envio (o último resultado para cada trabalho). Não é um histórico das execuções do dia anterior.

![Configurações do Resumo Diário](../../assets/screen-settings-daily-summary.png)

## Requisitos {/* #requirements */}

- O SMTP deve estar configurado. O e-mail é enviado uma vez, para o **Destinatário SMTP substituído** se um estiver salvo, caso contrário, para o destinatário SMTP nas [Configurações de E-mail](/user-guide/settings/email-settings).
- Verifique sua configuração SMTP e certifique-se de que ela está funcionando antes de confiar no Resumo Diário.
- A entrega agendada requer o serviço cron. O despachante é acionado uma vez por dia na hora de envio UTC armazenada.

## O que está incluído {/* #what-is-included */}

Os trabalhos conhecidos são os **últimos backups observados** para cada servidor e nome de backup — o mesmo conjunto que o painel e Configurações → Monitoramento de Backup.

Os buckets de status (Sucesso, Aviso, Erro, Fatal, Desconhecido) são mutuamente exclusivos e somam-se ao número de trabalhos. **Atrasado** é contado separadamente: um trabalho bem-sucedido atrasado ainda é Sucesso e também está atrasado.

## Cronograma {/* #schedule */}

Escolha um horário exato `HH:mm` no **fuso horário do navegador**. O duplistatus armazena o agendamento como UTC e mostra ambos os valores na página (mesmo padrão que as **Versões do Duplicati**). As alterações nesta página são salvas automaticamente. O horário padrão de envio para novas instalações é **01:00 UTC**.

- Habilitar ou alterar o agendamento começa na **próxima ocorrência futura**, nunca um envio surpresa imediato.
- O horário do cronograma sempre envia quando o trabalho do cron é acionado. **Enviar resumo agora**, uma tentativa novamente, ou um envio anterior no mesmo dia não o pula.

## URL do painel público {/* #public-dashboard-url */}

A **URL do painel público** opcional nesta página alimenta o placeholder `{duplistatus_link}` nos e-mails de Resumo Diário. Use uma URL `http://` ou `https://` sem barra no final. Deixe em branco para omitir o link.

Quando `DUPLISTATUS_PUBLIC_URL` está definido no ambiente, ele substitui a configuração salva (veja [Variáveis de Ambiente](/installation/environment-variables)).

## Substituir destinatário SMTP {/* #override-smtp-recipient */}

O **Destinatário SMTP substituído** opcional envia o Resumo Diário para um endereço diferente do destinatário nas Configurações de E-mail. Deixe-o vazio para continuar usando o padrão. O valor é armazenado na chave de configuração `daily_summary` (`smtpRecipient`) e é usado para envios agendados, **Enviar resumo agora** e tentativas novamente. As APIs de envio ainda não aceitam um destinatário na solicitação.

## Comportamento de substituição {/* #replacement-behaviour */}

Quando o Resumo Diário está ativado:

- e-mail de upload e atrasado para o destinatário de E-mail padrão não são enviados
- destinos de e-mail adicionais em Notificações de Backup ainda recebem eventos correspondentes (atrasado conta como um Aviso para esse filtro)
- notificações NTFY por trabalho continuam
- carimbos de data/hora de atraso não avançam quando nada foi enviado, então alertas de atraso podem retomar imediatamente quando o modo for desativado
- visualização do modelo, testes de transporte e **Enviar resumo agora** ainda funcionam

**Enviar resumo agora** é uma entrega extra. Ele não consome a próxima ocorrência agendada.

Entregas agendadas, **Enviar resumo agora** e novas tentativas são registradas no [log de auditoria](audit-logs-viewer.md) como `daily_summary_sent` (Operações do Sistema). Salvar configurações é `daily_summary_updated` (Configuração).

## Modelos {/* #templates */}

Edite o modelo de e-mail de resumo diário (Markdown) em [Configurações → Modelos](/user-guide/settings/notification-templates). O assunto padrão inclui `{summary_date}` mais as contagens de Sucesso, Aviso, Atrasado, Erro e Fatal para que a linha da caixa de entrada resuma o instantâneo. Atrasado pode se sobrepor às contagens de status. Os corpos de e-mail para Sucesso, Aviso/Erro, Atrasado e Resumo Diário todos usam Markdown. O modelo padrão inclui `{duplistatus_link}` no final quando uma URL de painel público é configurada nesta página ou via `DUPLISTATUS_PUBLIC_URL`.

**Gerar visualização** nesta página abre o mesmo diálogo de visualização que [Configurações → Modelos](/user-guide/settings/notification-templates): assunto do e-mail mais E-mail HTML e texto simples. O E-mail HTML segue o tema claro ou escuro atual.
