import type { DailySummaryTemplateSet } from '@/lib/types';

const EMAIL_BODY_EN = `## Daily backup summary

Generated: **{generated_at}** ({time_zone})

### Overview

| Metric | Count |
| --- | ---: |
| Servers | {server_count} |
| Backup jobs | {job_count} |
| Success | {success_count} |
| Warnings | {warning_count} |
| Errors | {error_count} |
| Fatal | {fatal_count} |
| Unknown | {unknown_count} |
| No report received | {no_report_count} |
| Overdue | {overdue_count} |

### Attention required

{problem_table}

### All latest backup results

{all_jobs_table}

### Latest-result totals

| Metric | Value |
| --- | ---: |
| Uploaded | {latest_uploaded_size} |
| Source data | {latest_source_size} |
| Storage used | {latest_storage_size} |
| Files examined | {latest_file_count} |
| Warnings | {total_warnings} |
| Errors | {total_errors} |
`;

const NTFY_BODY_EN =
  '{server_count} servers, {job_count} jobs\n' +
  'Success {success_count} · Warnings {warning_count} · Errors {error_count} · Fatal {fatal_count} · Unknown {unknown_count} · No report {no_report_count} · Overdue {overdue_count}\n\n' +
  'Attention required:\n{problem_table}\n\n' +
  'Open duplistatus for the full report.';

export const defaultDailySummaryEn: DailySummaryTemplateSet = {
  email: {
    title: 'duplistatus — Daily backup summary — {summary_date}',
    message: EMAIL_BODY_EN,
  },
  ntfy: {
    title: 'duplistatus — Daily backup summary — {summary_date}',
    message: NTFY_BODY_EN,
    priority: 'default',
    tags: 'duplicati, duplistatus, daily-summary',
  },
};

export const defaultDailySummaryDe: DailySummaryTemplateSet = {
  email: {
    title: 'duplistatus — Tägliche Backup-Zusammenfassung — {summary_date}',
    message: `## Tägliche Backup-Zusammenfassung

Erstellt: **{generated_at}** ({time_zone})

### Übersicht

| Kennzahl | Anzahl |
| --- | ---: |
| Server | {server_count} |
| Backup-Aufträge | {job_count} |
| Erfolg | {success_count} |
| Warnungen | {warning_count} |
| Fehler | {error_count} |
| Fatal | {fatal_count} |
| Unbekannt | {unknown_count} |
| Kein Bericht empfangen | {no_report_count} |
| Überfällig | {overdue_count} |

### Aufmerksamkeit erforderlich

{problem_table}

### Alle neuesten Backup-Ergebnisse

{all_jobs_table}

### Summen der neuesten Ergebnisse

| Kennzahl | Wert |
| --- | ---: |
| Hochgeladen | {latest_uploaded_size} |
| Quelldaten | {latest_source_size} |
| Speicherverbrauch | {latest_storage_size} |
| Geprüfte Dateien | {latest_file_count} |
| Warnungen | {total_warnings} |
| Fehler | {total_errors} |
`,
  },
  ntfy: {
    title: 'duplistatus — Tägliche Backup-Zusammenfassung — {summary_date}',
    message:
      '{server_count} Server, {job_count} Aufträge\n' +
      'Erfolg {success_count} · Warnungen {warning_count} · Fehler {error_count} · Fatal {fatal_count} · Unbekannt {unknown_count} · Kein Bericht {no_report_count} · Überfällig {overdue_count}\n\n' +
      'Aufmerksamkeit erforderlich:\n{problem_table}\n\n' +
      'Öffnen Sie duplistatus für den vollständigen Bericht.',
    priority: 'default',
    tags: 'duplicati, duplistatus, daily-summary',
  },
};

export const defaultDailySummaryFr: DailySummaryTemplateSet = {
  email: {
    title: 'duplistatus — Résumé quotidien des sauvegardes — {summary_date}',
    message: `## Résumé quotidien des sauvegardes

Généré : **{generated_at}** ({time_zone})

### Vue d'ensemble

| Indicateur | Nombre |
| --- | ---: |
| Serveurs | {server_count} |
| Tâches de sauvegarde | {job_count} |
| Succès | {success_count} |
| Avertissements | {warning_count} |
| Erreurs | {error_count} |
| Fatal | {fatal_count} |
| Inconnu | {unknown_count} |
| Aucun rapport reçu | {no_report_count} |
| En retard | {overdue_count} |

### Attention requise

{problem_table}

### Tous les derniers résultats de sauvegarde

{all_jobs_table}

### Totaux des derniers résultats

| Indicateur | Valeur |
| --- | ---: |
| Téléversé | {latest_uploaded_size} |
| Données source | {latest_source_size} |
| Stockage utilisé | {latest_storage_size} |
| Fichiers examinés | {latest_file_count} |
| Avertissements | {total_warnings} |
| Erreurs | {total_errors} |
`,
  },
  ntfy: {
    title: 'duplistatus — Résumé quotidien des sauvegardes — {summary_date}',
    message:
      '{server_count} serveurs, {job_count} tâches\n' +
      'Succès {success_count} · Avertissements {warning_count} · Erreurs {error_count} · Fatal {fatal_count} · Inconnu {unknown_count} · Aucun rapport {no_report_count} · En retard {overdue_count}\n\n' +
      'Attention requise :\n{problem_table}\n\n' +
      'Ouvrez duplistatus pour le rapport complet.',
    priority: 'default',
    tags: 'duplicati, duplistatus, daily-summary',
  },
};

export const defaultDailySummaryEs: DailySummaryTemplateSet = {
  email: {
    title: 'duplistatus — Resumen diario de copias de seguridad — {summary_date}',
    message: `## Resumen diario de copias de seguridad

Generado: **{generated_at}** ({time_zone})

### Resumen

| Métrica | Cantidad |
| --- | ---: |
| Servidores | {server_count} |
| Trabajos de copia | {job_count} |
| Correcto | {success_count} |
| Advertencias | {warning_count} |
| Errores | {error_count} |
| Fatal | {fatal_count} |
| Desconocido | {unknown_count} |
| Sin informe recibido | {no_report_count} |
| Atrasado | {overdue_count} |

### Atención requerida

{problem_table}

### Todos los últimos resultados

{all_jobs_table}

### Totales del último resultado

| Métrica | Valor |
| --- | ---: |
| Subido | {latest_uploaded_size} |
| Datos de origen | {latest_source_size} |
| Almacenamiento usado | {latest_storage_size} |
| Archivos examinados | {latest_file_count} |
| Advertencias | {total_warnings} |
| Errores | {total_errors} |
`,
  },
  ntfy: {
    title: 'duplistatus — Resumen diario de copias de seguridad — {summary_date}',
    message:
      '{server_count} servidores, {job_count} trabajos\n' +
      'Correcto {success_count} · Advertencias {warning_count} · Errores {error_count} · Fatal {fatal_count} · Desconocido {unknown_count} · Sin informe {no_report_count} · Atrasado {overdue_count}\n\n' +
      'Atención requerida:\n{problem_table}\n\n' +
      'Abra duplistatus para el informe completo.',
    priority: 'default',
    tags: 'duplicati, duplistatus, daily-summary',
  },
};

export const defaultDailySummaryPtBR: DailySummaryTemplateSet = {
  email: {
    title: 'duplistatus — Resumo diário de backups — {summary_date}',
    message: `## Resumo diário de backups

Gerado: **{generated_at}** ({time_zone})

### Visão geral

| Métrica | Contagem |
| --- | ---: |
| Servidores | {server_count} |
| Tarefas de backup | {job_count} |
| Sucesso | {success_count} |
| Avisos | {warning_count} |
| Erros | {error_count} |
| Fatal | {fatal_count} |
| Desconhecido | {unknown_count} |
| Nenhum relatório recebido | {no_report_count} |
| Atrasado | {overdue_count} |

### Atenção necessária

{problem_table}

### Todos os últimos resultados de backup

{all_jobs_table}

### Totais do último resultado

| Métrica | Valor |
| --- | ---: |
| Enviado | {latest_uploaded_size} |
| Dados de origem | {latest_source_size} |
| Armazenamento usado | {latest_storage_size} |
| Arquivos examinados | {latest_file_count} |
| Avisos | {total_warnings} |
| Erros | {total_errors} |
`,
  },
  ntfy: {
    title: 'duplistatus — Resumo diário de backups — {summary_date}',
    message:
      '{server_count} servidores, {job_count} tarefas\n' +
      'Sucesso {success_count} · Avisos {warning_count} · Erros {error_count} · Fatal {fatal_count} · Desconhecido {unknown_count} · Sem relatório {no_report_count} · Atrasado {overdue_count}\n\n' +
      'Atenção necessária:\n{problem_table}\n\n' +
      'Abra o duplistatus para o relatório completo.',
    priority: 'default',
    tags: 'duplicati, duplistatus, daily-summary',
  },
};

export const defaultDailySummaryHi: DailySummaryTemplateSet = {
  email: {
    title: 'duplistatus — दैनिक बैकअप सारांश — {summary_date}',
    message: `## दैनिक बैकअप सारांश

निर्मित: **{generated_at}** ({time_zone})

### अवलोकन

| माप | संख्या |
| --- | ---: |
| सर्वर | {server_count} |
| बैकअप कार्य | {job_count} |
| सफल | {success_count} |
| चेतावनियाँ | {warning_count} |
| त्रुटियाँ | {error_count} |
| गंभीर | {fatal_count} |
| अज्ञात | {unknown_count} |
| कोई रिपोर्ट नहीं मिली | {no_report_count} |
| अतिदेय | {overdue_count} |

### ध्यान आवश्यक

{problem_table}

### सभी नवीनतम बैकअप परिणाम

{all_jobs_table}

### नवीनतम परिणाम योग

| माप | मान |
| --- | ---: |
| अपलोड | {latest_uploaded_size} |
| स्रोत डेटा | {latest_source_size} |
| प्रयुक्त संग्रहण | {latest_storage_size} |
| जाँची गई फ़ाइलें | {latest_file_count} |
| चेतावनियाँ | {total_warnings} |
| त्रुटियाँ | {total_errors} |
`,
  },
  ntfy: {
    title: 'duplistatus — दैनिक बैकअप सारांश — {summary_date}',
    message:
      '{server_count} सर्वर, {job_count} कार्य\n' +
      'सफल {success_count} · चेतावनियाँ {warning_count} · त्रुटियाँ {error_count} · गंभीर {fatal_count} · अज्ञात {unknown_count} · कोई रिपोर्ट नहीं {no_report_count} · अतिदेय {overdue_count}\n\n' +
      'ध्यान आवश्यक:\n{problem_table}\n\n' +
      'पूर्ण रिपोर्ट के लिए duplistatus खोलें।',
    priority: 'default',
    tags: 'duplicati, duplistatus, daily-summary',
  },
};

export const defaultDailySummaryZhHans: DailySummaryTemplateSet = {
  email: {
    title: 'duplistatus — 每日备份摘要 — {summary_date}',
    message: `## 每日备份摘要

生成时间：**{generated_at}**（{time_zone}）

### 概览

| 指标 | 数量 |
| --- | ---: |
| 服务器 | {server_count} |
| 备份任务 | {job_count} |
| 成功 | {success_count} |
| 警告 | {warning_count} |
| 错误 | {error_count} |
| 致命 | {fatal_count} |
| 未知 | {unknown_count} |
| 未收到报告 | {no_report_count} |
| 逾期 | {overdue_count} |

### 需要关注

{problem_table}

### 全部最新备份结果

{all_jobs_table}

### 最新结果合计

| 指标 | 值 |
| --- | ---: |
| 已上传 | {latest_uploaded_size} |
| 源数据 | {latest_source_size} |
| 已用存储 | {latest_storage_size} |
| 已检查文件 | {latest_file_count} |
| 警告 | {total_warnings} |
| 错误 | {total_errors} |
`,
  },
  ntfy: {
    title: 'duplistatus — 每日备份摘要 — {summary_date}',
    message:
      '{server_count} 台服务器，{job_count} 个任务\n' +
      '成功 {success_count} · 警告 {warning_count} · 错误 {error_count} · 致命 {fatal_count} · 未知 {unknown_count} · 无报告 {no_report_count} · 逾期 {overdue_count}\n\n' +
      '需要关注：\n{problem_table}\n\n' +
      '请在 duplistatus 中查看完整报告。',
    priority: 'default',
    tags: 'duplicati, duplistatus, daily-summary',
  },
};
