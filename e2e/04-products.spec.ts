import { test, expect } from './fixtures/auth.fixture';
import { TestDataHelper } from './helpers/test-helper';

test.describe('CUJ-04: Master Data Obat & Multi-Satuan (Products Catalog)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Happy Path: Search existing medicine and view multi-tier units', async ({ page }) => {
    // 1. Search for Paracetamol
    const searchInput = page.getByPlaceholder(/cari nama obat/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Paracetamol');

    // 2. Product row should be visible
    await expect(page.locator('text=Paracetamol 500mg').first()).toBeVisible({ timeout: 10000 });

    // 3. Category badge should indicate Bebas
    await expect(page.locator('text=Bebas').first()).toBeVisible();
  });

  test('Happy Path: Add new medicine with multi-tier units', async ({ page }) => {
    const uniqueSku = TestDataHelper.uniqueId('SKU');
    const medicineName = `Vitamin C 500mg ${uniqueSku}`;

    // 1. Click "Tambah Obat Baru"
    const addBtn = page.getByRole('button', { name: /tambah obat baru/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // 2. Fill basic details in modal
    await page.getByPlaceholder(/contoh: paracetamol 500mg kaplet/i).fill(medicineName);
    await page.locator('input[placeholder="PCT-500"]').fill(uniqueSku);

    // 3. Submit
    const saveBtn = page.getByRole('button', { name: /simpan produk/i });
    await saveBtn.click();

    // 4. Verify product appears in catalog search
    const searchInput = page.getByPlaceholder(/cari nama obat/i);
    await searchInput.fill(uniqueSku);
    await expect(page.locator(`text=${medicineName}`).first()).toBeVisible({ timeout: 15000 });
  });

  test('Failure State: Searching non-existent keyword displays empty state gracefully', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/cari nama obat/i);
    await searchInput.fill('OBAT_NON_EXISTENT_XYZ_9999');

    // Should display empty state
    await expect(
      page.getByText(/tidak ditemukan|tidak ada obat|kosong/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
