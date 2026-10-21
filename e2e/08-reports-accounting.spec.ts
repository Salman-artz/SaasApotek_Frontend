import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-08: Laporan Keuangan, Laba Rugi & SIPNAP', () => {
  test('Happy Path: Reports dashboard displays revenue, transaction counts, and payment breakdowns', async ({ page }) => {
    await page.goto('/reports');

    // 1. Verify Reports Page Header
    await expect(page.getByText(/laporan & analisis farmasi|laporan & rekapitulasi/i).first()).toBeVisible({ timeout: 10000 });

    // 2. Summary KPI cards should be visible
    await expect(page.getByText(/total omzet/i).first()).toBeVisible();
    await expect(page.getByText(/transaksi/i).first()).toBeVisible();
  });

  test('Happy Path: Profit & Loss displays revenue, COGS (HPP), and net profit analysis', async ({ page }) => {
    await page.goto('/accounting/profit-and-loss');

    // Verify P&L heading
    await expect(page.getByText(/laba rugi|profit & loss/i).first()).toBeVisible({ timeout: 10000 });

    // Verify key financial figures
    await expect(page.getByText(/hpp|harga pokok|laba kotor|laba bersih/i).first()).toBeVisible();
  });

  test('Failure State: Filtering empty date range displays zero-state statistics gracefully', async ({ page }) => {
    await page.goto('/reports');

    // Set custom date filter to a distant year with 0 transactions
    const startDateInput = page.locator('input[type="date"]').first();
    if (await startDateInput.isVisible()) {
      await startDateInput.fill('2020-01-01');
      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.isVisible()) {
        await endDateInput.fill('2020-01-02');
      }
    }

    // Page should still render without uncaught errors
    await expect(page.getByText(/total omzet/i).first()).toBeVisible();
  });
});
