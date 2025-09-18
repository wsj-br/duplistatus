// Removed unused imports: CronServiceStatus, TaskExecutionResult

// Use relative path to ensure requests go through our Next.js API route
const CRON_SERVICE_URL = '/api/cron';

export class CronServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string = CRON_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

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