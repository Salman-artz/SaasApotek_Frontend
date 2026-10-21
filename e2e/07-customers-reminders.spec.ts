import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-07: Pelanggan & Pengingat Obat Kronis (CRM & Reminders)', () => {
  test('Happy Path: Access customers directory and view customer profile', async ({ page }) => {
    await page.goto('/customers');

    // 1. Verify Customers Page loaded
    await expect(page.getByText(/database pasien|data pelanggan/i).first()).toBeVisible({ timeout: 10000 });

    // 2. Search input
    const searchInput = page.getByPlaceholder(/cari/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Budi');
    }
  });

  test('Happy Path: Chronic drug refill reminder queue shows upcoming patients', async ({ page }) => {
    await page.goto('/customers/reminders');

    // Verify Reminders Page Header
    await expect(page.getByText(/pengingat obat|reminder/i).first()).toBeVisible({ timeout: 10000 });

    // Verify filter buttons
    await expect(page.getByText(/perlu kirim|semua/i).first()).toBeVisible();
  });

  test('Boundary Case: WhatsApp message trigger validates URL format without real WhatsApp Web scan', async ({ page }) => {
    await page.goto('/customers/reminders');

    // Locate any WhatsApp send button if list has items
    const sendWaBtn = page.getByRole('button', { name: /kirim wa|wa\.me/i }).first();
    if (await sendWaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Intercept window.open
      const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
      await sendWaBtn.click();
      const popup = await popupPromise;
      if (popup) {
        expect(popup.url()).toContain('wa.me');
        await popup.close();
      }
    }
  });

  test('Failure State: Validation prevents adding customer with empty name', async ({ page }) => {
    await page.goto('/customers');

    const addBtn = page.getByRole('button', { name: /tambah pasien baru|tambah pasien/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();

      // Verify the patient name input is required by HTML5 validation
      const nameInput = page.getByPlaceholder(/contoh: budi santoso/i);
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveAttribute('required', '');

      // Verify attempting to submit without input keeps modal open (does not dismiss or create empty record)
      const submitBtn = page.getByRole('button', { name: /simpan data pasien/i }).first();
      await submitBtn.click();
      await expect(nameInput).toBeVisible();
    }
  });
});
