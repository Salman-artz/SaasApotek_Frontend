import { test, expect } from '@playwright/test';
import { TestDataHelper } from './helpers/test-helper';

test.describe('CUJ-01: Authentication, Registration & Onboarding', () => {
  // Test without pre-existing storage state for pure auth flows
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Happy Path: Owner can login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /masuk akun/i })).toBeVisible();

    await page.locator('[data-testid="login-email"]').fill('salman@apoteksehat.com');
    await page.locator('[data-testid="login-password"]').fill('password123');
    await page.click('[data-testid="login-submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('Happy Path: Register new pharmacy tenant directs to onboarding', async ({ page }) => {
    await page.goto('/register');

    const uniqueId = TestDataHelper.uniqueId('APOTEK');
    const uniqueEmail = `test.${Date.now()}@pharmacye2e.test`;

    // Fill pharmacy & owner details
    await page.getByLabel(/nama apotek/i).fill(`Apotek Sehat ${uniqueId}`);
    await page.getByLabel(/nama pemilik/i).fill('Dr. Salman E2E');
    await page.getByLabel(/email akun/i).fill(uniqueEmail);
    await page.getByLabel(/nomor whatsapp|no\. whatsapp/i).fill('081234567890');
    await page.getByLabel(/^kata sandi/i).fill('password123');
    await page.getByLabel(/konfirmasi kata sandi/i).fill('password123');

    await page.getByRole('button', { name: /daftar & lanjutkan/i }).click();

    // Should redirect to onboarding
    await expect(page).toHaveURL(/.*onboarding/, { timeout: 15000 });
    await expect(page.getByText(/setup|selamat datang|konfigurasi/i).first()).toBeVisible();
  });

  test('Failure State: Login with incorrect password displays error alert', async ({ page }) => {
    await page.goto('/login');

    await page.locator('[data-testid="login-email"]').fill('salman@apoteksehat.com');
    
    // Select and replace password with wrong password
    const passwordInput = page.locator('[data-testid="login-password"]');
    await passwordInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('wrongpassword999');

    await page.click('[data-testid="login-submit"]');

    // Expect error alert
    const errorAlert = page.locator('[data-testid="login-error"]');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
    await expect(errorAlert).toContainText(/tidak sesuai|gagal/i);
  });

  test('Failure State: Validation fails when password confirmation does not match on register', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/nama apotek/i).fill('Apotek Mismatch Test');
    await page.getByLabel(/nama pemilik/i).fill('Tester');
    await page.getByLabel(/email akun/i).fill('mismatch@test.com');
    await page.getByLabel(/^kata sandi/i).fill('password123');
    await page.getByLabel(/konfirmasi kata sandi/i).fill('different123');

    await page.getByRole('button', { name: /daftar & lanjutkan/i }).click();

    await expect(page.getByText(/konfirmasi password tidak cocok/i)).toBeVisible();
  });

  test('Failure State: Direct access to protected /dashboard without token redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('Failure State: Session expiration / invalid token triggers redirect to /login', async ({ page }) => {
    await page.goto('/login');
    // Set expired or malformed token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid_expired_jwt_token');
    });

    await page.goto('/dashboard');
    // On 401 response from /api/auth/me, page redirects or clears auth
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });
});
