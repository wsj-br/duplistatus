/**
 * Duplicati 2.4+ leaves machine-id / machine-name DefaultValue empty on
 * `/api/v1/systeminfo` Options. The configured machine-id is exposed on
 * `/api/v1/serversettings` as `--machine-id`.
 */

export const DUPLICATI_SERVERSETTINGS_ENDPOINT = '/api/v1/serversettings';

export interface DuplicatiCommandLineOption {
  Name?: string;
  name?: string;
  DefaultValue?: string | null;
  defaultValue?: string | null;
}

export interface DuplicatiSystemInfoIdentity {
  MachineName?: string;
  machineName?: string;
  Options?: DuplicatiCommandLineOption[];
  ServerOnlyOptions?: DuplicatiCommandLineOption[];
}

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function getDuplicatiOptionValue(
  options: DuplicatiCommandLineOption[] | undefined,
  optionName: string
): string | undefined {
  if (!options) {
    return undefined;
  }
  const option = options.find((opt) => (opt.Name ?? opt.name) === optionName);
  if (!option) {
    return undefined;
  }
  return nonEmptyString(option.DefaultValue) ?? nonEmptyString(option.defaultValue);
}

export function getDuplicatiMachineIdFromSystemInfo(
  systemInfo: DuplicatiSystemInfoIdentity
): string | undefined {
  return (
    getDuplicatiOptionValue(systemInfo.Options, 'machine-id') ??
    getDuplicatiOptionValue(systemInfo.ServerOnlyOptions, 'machine-id')
  );
}

export function getDuplicatiMachineNameFromSystemInfo(
  systemInfo: DuplicatiSystemInfoIdentity
): string | undefined {
  return (
    nonEmptyString(systemInfo.MachineName) ??
    nonEmptyString(systemInfo.machineName) ??
    getDuplicatiOptionValue(systemInfo.Options, 'machine-name') ??
    getDuplicatiOptionValue(systemInfo.ServerOnlyOptions, 'machine-name')
  );
}

export function getDuplicatiMachineIdFromServerSettings(
  settings: unknown
): string | undefined {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return undefined;
  }
  const record = settings as Record<string, unknown>;
  return nonEmptyString(record['--machine-id']) ?? nonEmptyString(record['machine-id']);
}

export async function resolveDuplicatiMachineId(
  systemInfo: DuplicatiSystemInfoIdentity,
  loadServerSettings: () => Promise<unknown>
): Promise<string | undefined> {
  const fromSystemInfo = getDuplicatiMachineIdFromSystemInfo(systemInfo);
  if (fromSystemInfo) {
    return fromSystemInfo;
  }

  try {
    return getDuplicatiMachineIdFromServerSettings(await loadServerSettings());
  } catch (error) {
    console.error(
      'Failed to read Duplicati server settings for machine-id:',
      error instanceof Error ? error.message : String(error)
    );
    return undefined;
  }
}
