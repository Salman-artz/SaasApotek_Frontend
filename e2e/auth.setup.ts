import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as owner', async ({ page, request }) => {
  // Pre-seed or perform API login to obtain session token & user data
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  let token = '';
  let userData: any = null;
  let tenantData: any = null;
  let outletData: any = null;

  try {
    const res = await request.post(`${apiBase}/api/auth/login`, {
      data: {
        email: 'salman@apoteksehat.com',
        password: 'password123',
      },
    });

    if (res.ok()) {
      const data = await res.json();
      token = data.token;
      userData = data.user;
      tenantData = data.tenant;
      outletData = data.outlet;
    }
  } catch (err) {
    console.warn('API login setup fallback to UI login:', err);
  }

  // Navigate to login page
  await page.goto('/login');

  if (token && userData) {
    // Inject localStorage directly for fastest, most reliable auth state
    await page.evaluate(
      ({ token, user, tenant, outlet }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tenant', JSON.stringify(tenant));
        if (outlet) {
          localStorage.setItem('activeOutlet', JSON.stringify(outlet));
        }
      },
      { token, user: userData, tenant: tenantData, outlet: outletData }
    );
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  } else {
    // Fallback: Perform UI login
    await page.getByLabel(/email/i).fill('salman@apoteksehat.com');
    await page.getByLabel(/kata sandi|password/i).fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  // Save authenticated storage state
  await page.context().storageState({ path: authFile });
});
