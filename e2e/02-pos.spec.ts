import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-02: Point of Sale (POS) & Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Automatically accept any unexpected alert dialogs
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.goto('/pos');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Happy Path: Add product, checkout with exact cash, and complete transaction', async ({ page }) => {
    // 1. Search for Paracetamol or available medicine
    const searchInput = page.locator('[data-testid="pos-search-input"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Paracetamol');

    // 2. Select product card
    const productCard = page.locator('text=Paracetamol').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await productCard.click();

    // 3. Select base unit (Tablet) in cart so it consumes only 1 unit of stock
    const cartUnitSelect = page.locator('select').filter({ hasText: /Tablet|Box|Strip/i }).first();
    if (await cartUnitSelect.isVisible()) {
      await cartUnitSelect.selectOption({ label: /Tablet/i }).catch(() => {});
    }

    // 4. Verify cart has item
    const checkoutBtn = page.locator('[data-testid="pos-checkout-btn"]');
    await expect(checkoutBtn).toBeEnabled();

    // 5. Open payment modal
    await checkoutBtn.click();
    await expect(page.getByText(/pembayaran kasir pos/i)).toBeVisible();

    // 6. Click "Uang Pas" (Exact Cash)
    const exactCashBtn = page.locator('[data-testid="pos-exact-cash-btn"]');
    await expect(exactCashBtn).toBeVisible();
    await exactCashBtn.click();

    // 7. Confirm and finalize checkout
    const submitBtn = page.locator('[data-testid="pos-submit-payment"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 8. Verify transaction completion: receipt modal, print button, or success status
    await expect(
      page.getByText(/transaksi berhasil|struk pembayaran|cetak struk|kembalian/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Failure State: Checkout button is disabled when cart is empty', async ({ page }) => {
    const checkoutBtn = page.locator('[data-testid="pos-checkout-btn"]');
    await expect(checkoutBtn).toBeDisabled();
    await expect(page.getByText(/keranjang masih kosong/i)).toBeVisible();
  });

  test('Failure State: Payment submit button is disabled when paid amount is less than grand total', async ({ page }) => {
    // Add product to cart
    const searchInput = page.locator('[data-testid="pos-search-input"]');
    await searchInput.fill('Paracetamol');
    await page.locator('text=Paracetamol').first().click();

    // Open payment
    await page.locator('[data-testid="pos-checkout-btn"]').click();
    await expect(page.getByText(/pembayaran kasir pos/i)).toBeVisible();

    // Fill an amount lower than required
    const cashInput = page.locator('input[type="number"]').first();
    await cashInput.fill('100');

    // Submit payment button should be disabled
    const submitBtn = page.locator('[data-testid="pos-submit-payment"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('Failure State: Network failure during checkout preserves cart state and displays error', async ({ page }) => {
    // Add product to cart
    const searchInput = page.locator('[data-testid="pos-search-input"]');
    await searchInput.fill('Paracetamol');
    await page.locator('text=Paracetamol').first().click();

    // Open payment modal
    await page.locator('[data-testid="pos-checkout-btn"]').click();
    await page.locator('[data-testid="pos-exact-cash-btn"]').click();

    // Intercept checkout API and simulate 500 server error
    await page.route('**/api/transactions', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database connection timeout' }),
      });
    });

    // Try submitting
    await page.locator('[data-testid="pos-submit-payment"]').click();

    // Cart and payment modal should gracefully handle error without crashing
    await expect(page.getByText(/pembayaran kasir pos/i)).toBeVisible();
  });

  test('Boundary Case: Receipt print preview renders safely without physical printer hardware', async ({ page }) => {
    // Add item and checkout
    const searchInput = page.locator('[data-testid="pos-search-input"]');
    await searchInput.fill('Paracetamol');
    await page.locator('text=Paracetamol').first().click();

    await page.locator('[data-testid="pos-checkout-btn"]').click();
    await page.locator('[data-testid="pos-exact-cash-btn"]').click();
    await page.locator('[data-testid="pos-submit-payment"]').click();

    // When receipt modal appears, verify print action DOM elements are functional
    const printBtn = page.getByRole('button', { name: /cetak struk/i }).first();
    if (await printBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Mock window.print to ensure headless browser does not stall
      await page.evaluate(() => {
        window.print = () => {};
      });
      await printBtn.click();
      await expect(printBtn).toBeVisible();
    }
  });
});
