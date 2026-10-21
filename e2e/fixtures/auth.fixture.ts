import { test as base, Page } from '@playwright/test';
import path from 'path';

export const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

type AuthFixtures = {
  authedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  // Override page to use saved storageState by default
  storageState: authFile,

  authedPage: async ({ page }, use) => {
    // Navigate to authenticated root
    await page.goto('/dashboard');
    await use(page);
  },
});

export { expect } from '@playwright/test';
