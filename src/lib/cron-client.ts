import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';

// Use relative path so browser requests go through the Next.js cron proxy
const CRON_SERVICE_URL = '/api/cron';

export class CronServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string = CRON_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await authenticatedRequestWithRecovery(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Reload the service configuration from the database
   */
  async reloadConfig(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/reload-config', {
      method: 'POST',
    });
  }
}

// Export a singleton instance
export const cronClient = new CronServiceClient();
