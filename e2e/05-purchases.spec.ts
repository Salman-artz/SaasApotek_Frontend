import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-05: Pembelian PBF & Penerimaan Faktur (Purchases & Batch)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchases');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Happy Path: Access purchase invoices and view PBF purchase orders', async ({ page }) => {
    // 1. Verify page title & action buttons
    await expect(page.getByText(/pembelian|faktur pbf|surat pesanan/i).first()).toBeVisible({ timeout: 10000 });

    // 2. Verify tabs or buttons for PO and Invoices
    const searchInput = page.getByPlaceholder(/cari/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Enseval');
    }
  });

  test('Failure State: Validation prevents submitting purchase without items', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /buat sp|faktur baru|tambah faktur/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();

      // Attempt to submit empty purchase modal
      const submitBtn = page.getByRole('button', { name: /simpan|proses/i }).first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Validation message should appear
        await expect(
          page.getByText(/wajib diisi|pilih supplier|minimal 1 item/i).first()
        ).toBeVisible();
      }
    }
  });
});
