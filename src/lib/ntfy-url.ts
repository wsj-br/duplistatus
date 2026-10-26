/** Public ntfy server used when no server URL is configured. */
export const DEFAULT_NTFY_SERVER_URL = 'https://ntfy.sh/';

/**
 * Browser URL for a topic on the configured ntfy server.
 * The access token is omitted so it is not shown in the page or browser history.
 */
export function buildNtfyTopicWebUrl(serverUrl: string, topic: string): string {
  const trimmedServer = serverUrl.trim();
  const base = (trimmedServer || DEFAULT_NTFY_SERVER_URL).replace(/\/$/, '');
  const trimmedTopic = topic.trim().replace(/^\/+/, '');
  return `${base}/${trimmedTopic}`;
}
