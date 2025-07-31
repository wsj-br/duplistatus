import { CronInterval } from './types';

// Map of interval values to cron expressions
export const cronIntervalMap: Record<CronInterval, { expression: string; enabled: boolean; label: string }> = {
  //                         minute hour day-of-month month day-of-week
  'disabled': { expression: '0      0    1            1     0',            enabled: false, label: 'Disabled'   },
  '1min':     { expression: '*/1    *    *            *     *',            enabled: true,  label: '1 minute'   },
  '5min':     { expression: '*/5    *    *            *     *',            enabled: true,  label: '5 minutes'  },
  '10min':    { expression: '*/10   *    *            *     *',            enabled: true,  label: '10 minutes' },
  '15min':    { expression: '*/15   *    *            *     *',            enabled: true,  label: '15 minutes' },
  '20min':    { expression: '*/20   *    *            *     *',            enabled: true,  label: '20 minutes' },
  '30min':    { expression: '*/30   *    *            *     *',            enabled: true,  label: '30 minutes' },
  '1hour':    { expression: '0      *    *            *     *',            enabled: true,  label: '1 hour'     },
  '2hours':   { expression: '0      */2  *            *     *',            enabled: true,  label: '2 hours'    },
};  