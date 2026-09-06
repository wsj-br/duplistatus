# Resumo Diário {#daily-summary}

O Resumo Diário é um modo de notificação opcional que envia **um** snapshot localizado de cada job de backup conhecido em um horário local exato. Enquanto estiver habilitado, as mensagens de **e-mail** individuais de backup e de atraso são pausadas, incluindo destinos de e-mail adicionais por job. As Notificações NTFY por job continuam. Essas Configurações permanecem armazenadas e tornam-se ativas novamente assim que o Resumo Diário é desativado.

O instantâneo é o **status atual** no momento do envio (o último resultado para cada trabalho). Não é um histórico das execuções do dia anterior.

![Configurações do Resumo Diário](../../assets/screen-settings-left-panel-admin.png)

## Requisitos {#requirements}

- O SMTP deve ser configurado. O E-mail é sempre enviado uma vez para o Destinatário SMTP.
- A entrega agendada requer o serviço cron. O despachante verifica a cada minuto em UTC quando está em execução.

## O que está incluído {#what-is-included}

Os trabalhos conhecidos são a união de:

- o último backup observado para cada servidor e nome de backup
- configurações explícitas por trabalho cujos servidores ainda existem

Um trabalho configurado que nunca enviou um relatório é rotulado como **Nenhum relatório recebido**. Os buckets de status (Sucesso, Aviso, Erro, Fatal, Desconhecido, Nenhum relatório recebido) são mutuamente exclusivos e somam ao número de trabalhos. **Atrasado** é contado separadamente: um trabalho bem-sucedido atrasado ainda é Sucesso e também está atrasado.

## Agendamento {#schedule}

Escolha um horário exato `HH:mm` na sua **fuso horário do navegador**. duplistatus armazena a programação como UTC e mostra ambos os valores na Página (mesmo padrão que **Versões do Duplicati**). As alterações nesta Página são salvas automaticamente.

- Habilitar ou alterar o agendamento começa na **próxima ocorrência futura**, nunca um envio surpresa imediato.
- Reiniciar mais tarde no mesmo dia local ainda captura após o horário configurado.
- Dias completamente perdidos não são reproduzidos.
- Horários perdidos no horário de verão são executados no primeiro minuto válido após o intervalo. Horas repetidas no horário de inverno são enviadas uma vez.

## URL do painel público {#public-dashboard-url}

A **URL do painel público** opcional nesta página alimenta o placeholder `{duplistatus_link}` nos e-mails de Resumo Diário. Use uma URL `http://` ou `https://` sem barra no final. Deixe em branco para omitir o link.

Quando `DUPLISTATUS_PUBLIC_URL` está definido no ambiente, ele substitui a configuração salva (veja [Variáveis de Ambiente](/installation/environment-variables)).

## Comportamento de substituição {#replacement-behaviour}

Quando o Resumo Diário está ativado:

- e-mail de carregamento e atrasado não são enviados
- notificações NTFY por trabalho continuam
- os carimbos de data/hora de atraso não avançam, então os alertas de atraso podem ser retomados imediatamente quando o modo for desativado
- a visualização do modelo, testes de transporte e **Enviar resumo agora** ainda funcionam

**Enviar resumo agora** é uma entrega extra. Ele não consome a próxima ocorrência agendada.

## Modelos {#templates}

Edite o modelo de e-mail de resumo diário (Markdown) em [Configurações → Modelos](/user-guide/settings/notification-templates). Os corpos dos e-mails para Sucesso, Aviso/Erro, Atrasado e Resumo Diário usam Markdown. O modelo padrão inclui `{duplistatus_link}` no final quando uma URL do painel público está configurada nesta página ou via `DUPLISTATUS_PUBLIC_URL`.

**Gerar visualização** nesta página abre uma caixa de diálogo com a captura atual. O E-mail HTML segue o tema claro ou escuro atual.
