import { APIRequestContext } from '@playwright/test';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class TestDataHelper {
  private request: APIRequestContext;
  private token: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAuthToken(): Promise<string> {
    if (this.token) return this.token;

    const res = await this.request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: 'salman@apoteksehat.com',
        password: 'password123',
      },
    });

    if (!res.ok()) {
      throw new Error(`Auth failed during test setup: ${res.statusText()}`);
    }

    const json = await res.json();
    this.token = json.token;
    return this.token as string;
  }

  /**
   * Cleans up test transactions created with a specific prefix/identifier
   */
  async cleanupTestTransactions(invoicePrefix = 'TEST-') {
    const token = await this.getAuthToken();
    try {
      // Fetch transactions and delete or cancel test entities if API supports deletion
      await this.request.post(`${API_BASE}/api/test/cleanup`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { prefix: invoicePrefix },
      });
    } catch {
      // Graceful fallback if test route is not available
    }
  }

  /**
   * Helper to generate unique identifier for isolated test data
   */
  static uniqueId(prefix = 'TEST'): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
