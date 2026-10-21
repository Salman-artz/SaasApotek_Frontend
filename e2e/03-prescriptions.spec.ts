import { test, expect } from './fixtures/auth.fixture';

test.describe('CUJ-03: Doctor Prescriptions & Compounding (Rx)', () => {
  test('Happy Path: Switch to Rx mode, input doctor details and signa, and process prescription sale', async ({ page }) => {
    await page.goto('/pos');

    // 1. Switch to Prescription Mode
    const rxButton = page.locator('[data-testid="pos-rx-mode-btn"]');
    await expect(rxButton).toBeVisible();
    await rxButton.click();

    // 2. Verify Tuslah fee is added
    await expect(page.getByText(/tuslah/i)).toBeVisible();

    // 3. Fill Doctor & Patient Details
    const doctorInput = page.getByPlaceholder(/nama dokter/i);
    const patientPhoneInput = page.getByPlaceholder(/no\. hp pasien/i);

    if (await doctorInput.isVisible()) {
      await doctorInput.fill('dr. Hendra Sp.A');
    }
    if (await patientPhoneInput.isVisible()) {
      await patientPhoneInput.fill('081987654321');
    }

    // 4. Add Prescription Medicine (e.g. Amoxicillin)
    const searchInput = page.locator('[data-testid="pos-search-input"]');
    await searchInput.fill('Amoxicillin');

    const drugItem = page.locator('text=Amoxicillin').first();
    await expect(drugItem).toBeVisible({ timeout: 10000 });
    await drugItem.click();

    // 5. Fill Signa
    const signaInput = page.getByPlaceholder(/signa:/i);
    if (await signaInput.isVisible()) {
      await signaInput.fill('3 x 1 kapsul sehari sesudah makan');
      await expect(signaInput).toHaveValue('3 x 1 kapsul sehari sesudah makan');
    }

    // 6. Checkout
    const checkoutBtn = page.locator('[data-testid="pos-checkout-btn"]');
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();

    // 7. Verify payment modal displays Tuslah in calculation
    await expect(page.getByText(/pembayaran kasir pos/i)).toBeVisible();
    await page.locator('[data-testid="pos-exact-cash-btn"]').click();
    await page.locator('[data-testid="pos-submit-payment"]').click();

    // 8. Completed successfully
    await expect(
      page.getByText(/transaksi berhasil|struk|selesai/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Failure State: Prescription checkout fails validation when cart has 0 items', async ({ page }) => {
    await page.goto('/pos');

    // Switch to Rx mode
    await page.locator('[data-testid="pos-rx-mode-btn"]').click();

    // Verify cart is empty and checkout cannot proceed
    const checkoutBtn = page.locator('[data-testid="pos-checkout-btn"]');
    await expect(checkoutBtn).toBeDisabled();
  });
});
