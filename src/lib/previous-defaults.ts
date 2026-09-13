// Store the old default templates to automatically migrate to the new default templates.
// The new default templates are in default-config.ts.
 
interface PreviousTemplateMessages {
  version: string;
  sucess: string;
  warning: string;
  overdueBackup: string;
}

export const previousTemplatesMessages: PreviousTemplateMessages[] = [
  {
    version: "1.5.0-en-GB",
    sucess:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "☁️ Uploaded: {uploaded_size}\n" +
      "💾 Store usage: {storage_size}\n" +
      "🔃 Available versions: {available_versions}\n",
    warning:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "⏰ Duration: {duration}\n" +
      "☁️ Uploaded: {uploaded_size}\n\n" +
      "🚨 {warnings_count} warnings\n" +
      "🛑 {errors_count} errors.\n\n" +
      "📄 Log Messages:\n{log_text}\n\n" +
      "⚠️ Check the duplicati server immediately {server_url}\n",
    overdueBackup:
      "The backup {backup_name} is overdue on {server_alias}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "🚨 Last backup received: {last_backup_date} ({last_elapsed})\n" +
      "⏰ Expected backup time: {expected_date} ({expected_elapsed})\n\n" +
      "Expected interval: {backup_interval} / Tolerance: {overdue_tolerance}\n\n" +
      "⚠️ Check the duplicati server immediately {server_url}\n",
  },
  {
    version: "1.5.0-de",
    sucess:
      "Die Sicherung {backup_name} auf {server_alias} wurde mit dem Status '{status}' am {backup_date} in {duration} abgeschlossen.\n\n" +
      "🔍 Hinweis: {server_note}\n" +
      "☁️ Hochgeladen: {uploaded_size}\n" +
      "💾 Speicherverbrauch: {storage_size}\n" +
      "🔃 Verfügbare Versionen: {available_versions}\n",
    warning:
      "Die Sicherung {backup_name} auf {server_alias} wurde mit dem Status '{status}' am {backup_date} abgeschlossen.\n\n" +
      "🔍 Hinweis: {server_note}\n" +
      "⏰ Dauer: {duration}\n" +
      "☁️ Hochgeladen: {uploaded_size}\n\n" +
      "🚨 {warnings_count} Warnungen\n" +
      "🛑 {errors_count} Fehler.\n\n" +
      "📄 Protokollnachrichten:\n{log_text}\n\n" +
      "⚠️ Prüfen Sie den duplicati-Server sofort {server_url}\n",
    overdueBackup:
      "Die Sicherung {backup_name} ist überfällig auf {server_alias}.\n\n" +
      "🔍 Hinweis: {server_note}\n" +
      "🚨 Letzte Sicherung empfangen: {last_backup_date} ({last_elapsed})\n" +
      "⏰ Erwartete Sicherungszeit: {expected_date} ({expected_elapsed})\n\n" +
      "Erwartetes Intervall: {backup_interval} / Toleranz: {overdue_tolerance}\n\n" +
      "⚠️ Prüfen Sie den duplicati-Server sofort {server_url}\n",
  },
  {
    version: "1.5.0-es",
    sucess:
      "La copia de seguridad {backup_name} en {server_alias} se completó con el estado '{status}' el {backup_date} en {duration}.\n\n" +
      "🔍 Nota: {server_note}\n" +
      "☁️ Subido: {uploaded_size}\n" +
      "💾 Uso de almacenamiento: {storage_size}\n" +
      "🔃 Versiones disponibles: {available_versions}\n",
    warning:
      "La copia de seguridad {backup_name} en {server_alias} se completó con el estado '{status}' el {backup_date}.\n\n" +
      "🔍 Nota: {server_note}\n" +
      "⏰ Duración: {duration}\n" +
      "☁️ Subido: {uploaded_size}\n\n" +
      "🚨 {warnings_count} advertencias\n" +
      "🛑 {errors_count} errores.\n\n" +
      "📄 Mensajes del registro:\n{log_text}\n\n" +
      "⚠️ Comprobar el servidor duplicati inmediatamente {server_url}\n",
    overdueBackup:
      "La copia de seguridad {backup_name} está vencida en {server_alias}.\n\n" +
      "🔍 Nota: {server_note}\n" +
      "🚨 Última copia de seguridad recibida: {last_backup_date} ({last_elapsed})\n" +
      "⏰ Hora de copia de seguridad esperada: {expected_date} ({expected_elapsed})\n\n" +
      "Intervalo esperado: {backup_interval} / Tolerancia: {overdue_tolerance}\n\n" +
      "⚠️ Comprobar el servidor duplicati inmediatamente {server_url}\n",
  },
  {
    version: "1.5.0-fr",
    sucess:
      "La sauvegarde {backup_name} sur {server_alias} a été complétée avec l'état '{status}' à {backup_date} en {duration}.\n\n" +
      "🔍 Remarque : {server_note}\n" +
      "☁️ Téléchargé : {uploaded_size}\n" +
      "💾 Utilisation du stockage : {storage_size}\n" +
      "🔃 Versions disponibles : {available_versions}\n",
    warning:
      "La sauvegarde {backup_name} sur {server_alias} a été complétée avec l'état '{status}' à {backup_date}.\n\n" +
      "🔍 Remarque : {server_note}\n" +
      "⏰ Durée : {duration}\n" +
      "☁️ Téléchargé : {uploaded_size}\n\n" +
      "🚨 {warnings_count} avertissements\n" +
      "🛑 {errors_count} erreurs.\n\n" +
      "📄 Messages du journal :\n{log_text}\n\n" +
      "⚠️ Vérifiez immédiatement le serveur duplicati {server_url}\n",
    overdueBackup:
      "La sauvegarde {backup_name} est en retard sur {server_alias}.\n\n" +
      "🔍 Remarque : {server_note}\n" +
      "🚨 Dernière sauvegarde reçue : {last_backup_date} ({last_elapsed})\n" +
      "⏰ Heure de sauvegarde attendue : {expected_date} ({expected_elapsed})\n\n" +
      "Intervalle attendu : {backup_interval} / Tolérance : {overdue_tolerance}\n\n" +
      "⚠️ Vérifiez immédiatement le serveur duplicati {server_url}\n",
  },
  {
    version: "1.5.0-pt-BR",
    sucess:
      "Backup {backup_name} no {server_alias} concluído com status '{status}' em {backup_date} na {duration}.\n\n" +
      "🔍 Nota: {server_note}\n" +
      "☁️ Carregado: {uploaded_size}\n" +
      "💾 Uso de armazenamento: {storage_size}\n" +
      "🔃 Versões disponíveis: {available_versions}\n",
    warning:
      "Backup {backup_name} no {server_alias} concluído com status '{status}' em {backup_date}.\n\n" +
      "🔍 Nota: {server_note}\n" +
      "⏰ Duração: {duration}\n" +
      "☁️ Carregado: {uploaded_size}\n\n" +
      "🚨 {warnings_count} avisos\n" +
      "🛑 {errors_count} erros.\n\n" +
      "📄 Mensagens do log:\n{log_text}\n\n" +
      "⚠️ Verifique o servidor duplicati imediatamente {server_url}\n",
    overdueBackup:
      "O backup {backup_name} está atrasado no {server_alias}.\n\n" +
      "🔍 Nota: {server_note}\n" +
      "🚨 Último backup recebido: {last_backup_date} ({last_elapsed})\n" +
      "⏰ Tempo esperado para o backup: {expected_date} ({expected_elapsed})\n\n" +
      "Intervalo esperado: {backup_interval} / Tolerância: {overdue_tolerance}\n\n" +
      "⚠️ Verifique o servidor duplicati imediatamente {server_url}\n",
  },
  {
    version: "1.5.0-hi",
    sucess:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "☁️ Uploaded: {uploaded_size}\n" +
      "💾 Store usage: {storage_size}\n" +
      "🔃 Upalabdh versions: {available_versions}\n",
    warning:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "⏰ Avadhi: {duration}\n" +
      "☁️ Uploaded: {uploaded_size}\n\n" +
      "🚨 {warnings_count} Chetaavaniyaan\n" +
      "🛑 {errors_count} Trutiyon.\n\n" +
      "📄 Log Sandesh:\n{log_text}\n\n" +
      "⚠️ Janch karein the duplicati server immediately {server_url}\n",
    overdueBackup:
      "The backup {backup_name} is vilambit on {server_alias}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "🚨 Antim backup received: {last_backup_date} ({last_elapsed})\n" +
      "⏰ Apekshit backup time: {expected_date} ({expected_elapsed})\n\n" +
      "Apekshit antaraal: {backup_interval} / Sahansheelta: {overdue_tolerance}\n\n" +
      "⚠️ Janch karein the duplicati server immediately {server_url}\n",
  },
  {
    version: "1.5.0-zh-Hans",
    sucess:
      "备份 {backup_name} 在 {server_alias} 的状态为 '{status}'，完成时间为 {backup_date}，持续时间为 {duration}。\n\n" +
      "🔍 注释: {server_note}\n" +
      "☁️ 已上传: {uploaded_size}\n" +
      "💾 存储使用: {storage_size}\n" +
      "🔃 可用版本: {available_versions}\n",
    warning:
      "备份 {backup_name} 在 {server_alias} 的状态为 '{status}'，完成时间为 {backup_date}。\n\n" +
      "🔍 注释: {server_note}\n" +
      "⏰ 持续时间: {duration}\n" +
      "☁️ 已上传: {uploaded_size}\n\n" +
      "🚨 {warnings_count} 个警告\n" +
      "🛑 {errors_count} 个错误。\n\n" +
      "📄 日志消息:\n{log_text}\n\n" +
      "⚠️ 请立即检查 duplicati 服务器 {server_url}\n",
    overdueBackup:
      "备份 {backup_name} 在 {server_alias} 已过期。\n\n" +
      "🔍 注释: {server_note}\n" +
      "🚨 最近备份时间: {last_backup_date} ({last_elapsed})\n" +
      "⏰ 预期备份时间: {expected_date} ({expected_elapsed})\n\n" +
      "预期间隔: {backup_interval} / 容差: {overdue_tolerance}\n\n" +
      "⚠️ 请立即检查 duplicati 服务器 {server_url}\n",
  },
  {
    version: "1.1.0",
    sucess:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "☁️ Uploaded: {uploaded_size}\n" +
      "💾 Store usage:  {storage_size}\n" +
      "🔃 Available versions:  {available_versions}\n",
    warning:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "⏰ Duration: {duration}\n" +
      "☁️ Uploaded: {uploaded_size}\n\n" +
      "🚨 {warnings_count} warnings\n" +
      "🛑 {errors_count} errors.\n\n" +
      "⚠️ Check the duplicati server immediately {server_url}\n",
    overdueBackup:
      "The backup {backup_name} is overdue on {server_alias}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "🚨 Last backup received: {last_backup_date} ({last_elapsed})\n" +
      "⏰ Expected backup time: {expected_date} ({expected_elapsed})\n\n" +
      "Expected interval: {backup_interval} / Tolerance: {overdue_tolerance}\n\n" +
      "⚠️ Check the duplicati server immediately {server_url}\n",
  },
  {
    version: "0.7.24",
    sucess:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "☁️ Uploaded: {uploaded_size}\n" +
      "💾 Store usage:  {storage_size}\n" +
      "🔃 Available versions:  {available_versions}\n",
    warning:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "⏰ Duration: {duration}\n" +
      "☁️ Uploaded: {uploaded_size}\n\n" +
      "🚨 {warnings_count} warnings\n" +
      "🛑 {errors_count} errors.\n\n" +
      "🔍 Please check the duplicati server {server_url}\n",
    overdueBackup:
      "The backup {backup_name} is overdue on {server_alias}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "🚨 Last backup was {last_backup_date} ({last_elapsed})\n" +
      "⏰ Expected backup was {expected_date} ({expected_elapsed})\n\n" +
      "Expected interval:  {backup_interval_value} {backup_interval_type} / Tolerance:  {overdue_tolerance}\n\n" +
      "🔍 Please check the duplicati server {server_url}\n",
  },
  {
    version: "0.6.1",
    sucess:
      "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      "☁️ Uploaded: {uploaded_size}\n" +
      "💾 Store usage:  {storage_size}\n" +
      "🔃 Available versions:  {available_versions}\n",
    warning:
      "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date}.\n\n" +
      "⏰ Duration: {duration}\n" +
      "☁️ Uploaded: {uploaded_size}\n\n" +
      "🚨 {warnings_count} warnings\n" +
      "🛑 {errors_count} errors.\n\n" +
      "🔍 Please check the duplicati server.\n",
    overdueBackup:
      "The backup {backup_name} is overdue on {machine_name}.\n\n" +
      "🚨 Last backup was {last_backup_date} ({last_elapsed})\n" +
      "⏰ Expected backup was {expected_date} ({expected_elapsed})\n\n" +
      "Expected interval:  {backup_interval_value} {backup_interval_type} / Tolerance:  {overdue_tolerance}\n\n" +
      "🔍 Please check the duplicati server.\n",
  },
];

/** Previous default Daily Summary email subjects. Unmodified stored titles are replaced; customized bodies are kept. */
export const previousDailySummaryEmailTitles: string[] = [
  '📬 duplistatus — Daily backup summary — {summary_date}',
  '📬 duplistatus — Tägliche Sicherungszusammenfassung — {summary_date}',
  '📬 duplistatus — Resumen diario de copias de seguridad — {summary_date}',
  '📬 duplistatus — Résumé quotidien de la sauvegarde — {summary_date}',
  '📬 duplistatus — Resumo diário do backup — {summary_date}',
  '📬 duplistatus — 每日备份摘要 — {summary_date}',
  'duplistatus — Daily backup summary — {summary_date}',
];

/** Previous default Daily Summary email bodies (long overview table). Unmodified stored defaults are replaced. */
export const previousDailySummaryEmailMessages: string[] = [
  "## 📊 Daily backup summary\n\n🕐 Generated: **{generated_at}** ({time_zone})\n\n### 📈 Overview\n\n| Metric | Count |\n| --- | ---: |\n| 🖥️ Servers | {server_count} |\n| 💼 Backup jobs | {job_count} |\n| ✅ Success | {success_count} |\n| ⚠️ Warnings | {warning_count} |\n| 🛑 Errors | {error_count} |\n| 💀 Fatal | {fatal_count} |\n| ❓ Unknown | {unknown_count} |\n| ❓ No report received | {no_report_count} |\n| 🕑 Overdue | {overdue_count} |\n\n### 🚨 Attention required\n\n{problem_table}\n\n### 📋 All latest backup results\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Tägliche Sicherungszusammenfassung\n\n🕐 Generiert: **{generated_at}** ({time_zone})\n\n### 📈 Übersicht\n\n| Metrik | Anzahl |\n| --- | ---: |\n| 🖥️ Server | {server_count} |\n| 💼 Sicherungsjobs | {job_count} |\n| ✅ Erfolgreich | {success_count} |\n| ⚠️ Warnungen | {warning_count} |\n| 🛑 Fehler | {error_count} |\n| 💀 Fatal | {fatal_count} |\n| ❓ Unbekannt | {unknown_count} |\n| ❓ Kein Bericht empfangen | {no_report_count} |\n| 🕑 Überfällig | {overdue_count} |\n\n### 🚨 Aufmerksamkeit erforderlich\n\n{problem_table}\n\n### 📋 Alle neuesten Sicherungsergebnisse\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Resumen diario de copias de seguridad\n\n🕐 Generado: **{generated_at}** ({time_zone})\n\n### 📈 Vista general\n\n| Métrica | Conteo |\n| --- | ---: |\n| 🖥️ Servidores | {server_count} |\n| 💼 Trabajos de copia de seguridad | {job_count} |\n| ✅ Éxito | {success_count} |\n| ⚠️ Advertencias | {warning_count} |\n| 🛑 Errores | {error_count} |\n| 💀 Fatal | {fatal_count} |\n| ❓ Desconocido | {unknown_count} |\n| ❓ No se recibió informe | {no_report_count} |\n| 🕑 Vencida | {overdue_count} |\n\n### 🚨 Atención requerida\n\n{problem_table}\n\n### 📋 Todos los últimos resultados de copias de seguridad\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Résumé quotidien de la sauvegarde\n\n🕐 Généré : **{generated_at}** ({time_zone})\n\n### 📈 Aperçu\n\n| Métrique | Compte |\n| --- | ---: |\n| 🖥️ Serveurs | {server_count} |\n| 💼 Tâches de sauvegarde | {job_count} |\n| ✅ Succès | {success_count} |\n| ⚠️ Avertissements | {warning_count} |\n| 🛑 Erreurs | {error_count} |\n| 💀 Fatal | {fatal_count} |\n| ❓ Inconnu | {unknown_count} |\n| ❓ Aucun rapport reçu | {no_report_count} |\n| 🕑 En retard | {overdue_count} |\n\n### 🚨 Attention requise\n\n{problem_table}\n\n### 📋 Tous les derniers résultats de sauvegarde\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Resumo diário do backup\n\n🕐 Gerado: **{generated_at}** ({time_zone})\n\n### 📈 Visão geral\n\n| Métrica | Contagem |\n| --- | ---: |\n| 🖥️ Servidores | {server_count} |\n| 💼 Trabalhos de backup | {job_count} |\n| ✅ Sucesso | {success_count} |\n| ⚠️ Avisos | {warning_count} |\n| 🛑 Erros | {error_count} |\n| 💀 Fatal | {fatal_count} |\n| ❓ Desconhecido | {unknown_count} |\n| ❓ Nenhum relatório recebido | {no_report_count} |\n| 🕑 Atrasado | {overdue_count} |\n\n### 🚨 Atenção necessária\n\n{problem_table}\n\n### 📋 Todos os últimos resultados de backup\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 दैनिक बैकअप सारांश\n\n🕐 उत्पन्न: **{generated_at}** ({time_zone})\n\n### 📈 अवलोकन\n\n| मैट्रिक | गिनती |\n| --- | ---: |\n| 🖥️ सर्वर | {server_count} |\n| 💼 बैकअप कार्य | {job_count} |\n| ✅ सफलता | {success_count} |\n| ⚠️ चेतावनियाँ | {warning_count} |\n| 🛑 त्रुटियाँ | {error_count} |\n| 💀 गंभीर | {fatal_count} |\n| ❓ अज्ञात | {unknown_count} |\n| ❓ कोई रिपोर्ट प्राप्त नहीं हुई | {no_report_count} |\n| 🕑 विलंबित | {overdue_count} |\n\n### 🚨 ध्यान की आवश्यकता\n\n{problem_table}\n\n### 📋 सभी नवीनतम बैकअप परिणाम\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 每日备份摘要\n\n🕐 生成时间: **{generated_at}** ({time_zone})\n\n### 📈 概览\n\n| 指标 | 数量 |\n| --- | ---: |\n| 🖥️ 服务器 | {server_count} |\n| 💼 备份作业 | {job_count} |\n| ✅ 成功 | {success_count} |\n| ⚠️ 警告 | {warning_count} |\n| 🛑 错误 | {error_count} |\n| 💀 致命 | {fatal_count} |\n| ❓ 未知 | {unknown_count} |\n| ❓ 未收到报告 | {no_report_count} |\n| 🕑 过期 | {overdue_count} |\n\n### 🚨 需要注意\n\n{problem_table}\n\n### 📋 所有最新备份结果\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Daily backup summary\n\n🕐 Generated: **{generated_at}** ({time_zone})\n\n### 📈 Overview\n\n| Metric | Count |\n| --- | ---: |\n| 💼 Backup jobs / ✅ Success | {job_count} / {success_count} |\n| ⚠️ Warnings / 🛑 Errors / 💀 Fatal / ❓ Unknown | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Attention required\n\n{problem_table}\n\n### 📋 All latest backup results\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Tägliche Sicherungszusammenfassung\n\n🕐 Generiert: **{generated_at}** ({time_zone})\n\n### 📈 Übersicht\n\n| Metrik | Anzahl |\n| --- | ---: |\n| 💼 Sicherungsjobs / ✅ Erfolgreich | {job_count} / {success_count} |\n| ⚠️ Warnungen / 🛑 Fehler / 💀 Fatal / ❓ Unbekannt | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Aufmerksamkeit erforderlich\n\n{problem_table}\n\n### 📋 Alle neuesten Sicherungsergebnisse\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Resumen de copia de seguridad diaria\n\n🕐 Generado: **{generated_at}** ({time_zone})\n\n### 📈 Vista general\n\n| Métrica | Cantidad |\n| --- | ---: |\n| 💼 Trabajos de copia de seguridad / ✅ Éxito | {job_count} / {success_count} |\n| ⚠️ Advertencias / 🛑 Errores / 💀 Fatal / ❓ Desconocido | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Atención requerida\n\n{problem_table}\n\n### 📋 Todos los resultados de copia de seguridad más recientes\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Aperçu quotidien des sauvegardes\n\n🕐 Généré : **{generated_at}** ({time_zone})\n\n### 📈 Aperçu\n\n| Métrique | Nombre |\n| --- | ---: |\n| 💼 Tâches de sauvegarde / ✅ Succès | {job_count} / {success_count} |\n| ⚠️ Avertissements / 🛑 Erreurs / 💀 Fatal / ❓ Inconnu | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Attention requise\n\n{problem_table}\n\n### 📋 Tous les résultats de sauvegarde les plus récents\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Resumo diário de backup\n\n🕐 Gerado: **{generated_at}** ({time_zone})\n\n### 📈 Visão geral\n\n| Métrica | Contagem |\n| --- | ---: |\n| 💼 Trabalhos de backup / ✅ Sucesso | {job_count} / {success_count} |\n| ⚠️ Avisos / 🛑 Erros / 💀 Fatal / ❓ Desconhecido | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Atenção necessária\n\n{problem_table}\n\n### 📋 Todos os resultados de backup mais recentes\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 दैनिक बैकअप सारांश\n\n🕐 उत्पन्न: **{generated_at}** ({time_zone})\n\n### 📈 Overview\n\n| Metric | Count |\n| --- | ---: |\n| 💼 बैकअप कार्य / ✅ Safalta | {job_count} / {success_count} |\n| ⚠️ Chetaavaniyaan / 🛑 Trutiyon / 💀 Gambhir / ❓ अज्ञात | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 ध्यान देने की आवश्यकता\n\n{problem_table}\n\n### 📋 सबसे नवीन बैकअप परिणाम\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 每日备份摘要\n\n🕐 生成时间: **{generated_at}** ({time_zone})\n\n### 📈 概览\n\n| 指标 | 数量 |\n| --- | ---: |\n| 💼 备份任务 / ✅ 成功 | {job_count} / {success_count} |\n| ⚠️ 警告 / 🛑 错误 / 💀 致命 / ❓ 未知 | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 需要注意\n\n{problem_table}\n\n### 📋 所有最新备份结果\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Resumen diario de copias de seguridad\n\n🕐 Generado: **{generated_at}** ({time_zone})\n\n### 📈 Vista general\n\n| Métrica | Conteo |\n| --- | ---: |\n| 💼 Trabajos de copia de seguridad / ✅ Éxito | {job_count} / {success_count} |\n| ⚠️ Advertencias / 🛑 Errores / 💀 Fatal / ❓ Desconocido | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Atención requerida\n\n{problem_table}\n\n### 📋 Todos los últimos resultados de copias de seguridad\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Résumé quotidien de la sauvegarde\n\n🕐 Généré : **{generated_at}** ({time_zone})\n\n### 📈 Aperçu\n\n| Métrique | Compte |\n| --- | ---: |\n| 💼 Tâches de sauvegarde / ✅ Succès | {job_count} / {success_count} |\n| ⚠️ Avertissements / 🛑 Erreurs / 💀 Fatal / ❓ Inconnu | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Attention requise\n\n{problem_table}\n\n### 📋 Tous les derniers résultats de sauvegarde\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 Resumo diário do backup\n\n🕐 Gerado: **{generated_at}** ({time_zone})\n\n### 📈 Visão geral\n\n| Métrica | Contagem |\n| --- | ---: |\n| 💼 Trabalhos de backup / ✅ Sucesso | {job_count} / {success_count} |\n| ⚠️ Avisos / 🛑 Erros / 💀 Fatal / ❓ Desconhecido | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 Atenção necessária\n\n{problem_table}\n\n### 📋 Todos os últimos resultados de backup\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 दैनिक बैकअप सारांश\n\n🕐 उत्पन्न: **{generated_at}** ({time_zone})\n\n### 📈 अवलोकन\n\n| मैट्रिक | गिनती |\n| --- | ---: |\n| 💼 बैकअप कार्य / ✅ सफलता | {job_count} / {success_count} |\n| ⚠️ चेतावनियाँ / 🛑 त्रुटियाँ / 💀 गंभीर / ❓ अज्ञात | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 ध्यान की आवश्यकता\n\n{problem_table}\n\n### 📋 सभी नवीनतम बैकअप परिणाम\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
  "## 📊 每日备份摘要\n\n🕐 生成时间: **{generated_at}** ({time_zone})\n\n### 📈 概览\n\n| 指标 | 数量 |\n| --- | ---: |\n| 💼 备份作业 / ✅ 成功 | {job_count} / {success_count} |\n| ⚠️ 警告 / 🛑 错误 / 💀 致命 / ❓ 未知 | {warning_count} / {error_count} / {fatal_count} / {unknown_count} |\n\n### 🚨 需要注意\n\n{problem_table}\n\n### 📋 所有最新备份结果\n\n{all_jobs_table}\n\n{duplistatus_link}\n",
];