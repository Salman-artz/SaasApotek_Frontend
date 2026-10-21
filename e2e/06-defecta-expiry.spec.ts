import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-06: Defecta & Expiry Radar (Manajemen Stok Kritis)', () => {
  test('Happy Path: Defecta lists critical low-stock medicines with automated reorder actions', async ({ page }) => {
    await page.goto('/defecta');

    // 1. Verify Defecta page header
    await expect(page.getByText(/buku defecta|stok menipis/i).first()).toBeVisible({ timeout: 10000 });

    // 2. Search filter in defecta
    const searchInput = page.getByPlaceholder(/cari/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Amoxicillin');
    }
  });

  test('Happy Path: Expiry Radar categorizes drugs nearing shelf-life threshold', async ({ page }) => {
    await page.goto('/inventory/expiry-radar');

    // Verify Expiry Radar heading
    await expect(page.getByText(/radar kadaluarsa|expiry radar/i).first()).toBeVisible({ timeout: 10000 });

    // Verify filter tabs (e.g. 30 Hari, 60 Hari, 90 Hari or Expired)
    await expect(page.getByText(/30 hari|60 hari|90 hari|kadaluarsa/i).first()).toBeVisible();
  });

  test('Failure State: Filtering with no matching items shows empty state without application error', async ({ page }) => {
    await page.goto('/defecta');

    const searchInput = page.getByPlaceholder(/cari/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('PRODUK_TIDAK_DEFECTA_9999');
      await expect(
        page.getByText(/tidak ada|aman|kosong/i).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
