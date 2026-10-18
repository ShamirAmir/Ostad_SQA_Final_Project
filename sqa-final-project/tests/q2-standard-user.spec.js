
const { test, expect } = require('@playwright/test');

const {
  login,
  resetAppState,
  checkoutCustomerDetails,
  verifyOverviewTotals,
  resetAppStateAndLogout
} = require('./helpers');

test('Q2 - standard_user completes checkout with 3 items', async ({ page }) => {

  // q2: Login using standard_user
  await login(page, 'standard_user');

  await expect(page).toHaveURL(/inventory\.html/);

  console.log('STEP 1 PASSED: Login successful');

  // q2: Reset App State
  await resetAppState(page);

  console.log('STEP 2 PASSED: App State reset');

  // q3: Add first three products to cart
  const products = page.locator('.inventory_item');

  await expect(products).toHaveCount(6);

  const expectedNames = [];
  const expectedPrices = [];

  for (let i = 0; i < 3; i++) {
    const product = products.nth(i);

    const name = await product
      .locator('.inventory_item_name').innerText();

    const priceText = await product
      .locator('.inventory_item_price').innerText();

    expectedNames.push(name.trim());
    expectedPrices.push(
      Number(priceText.replace('$', '').trim())
    );

    await product.locator('button').click();
  }

  await expect(page.locator('.shopping_cart_badge'))
    .toHaveText('3');

  console.log('STEP 3 PASSED: Three products added');

  // q2:    Verify shopping cart
  await page.locator('.shopping_cart_link').click();

  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.locator('.cart_item')).toHaveCount(3);

  const cartNames = (await page
    .locator('.cart_item .inventory_item_name')
    .allTextContents()).map(name => name.trim());

  expect(cartNames).toEqual(expectedNames);

  console.log('STEP 4 PASSED: Cart verified');

  // q2:     Enter checkout information
  await page.locator('[data-test="checkout"]').click();

  await checkoutCustomerDetails(page);

  console.log('STEP 5 PASSED: Checkout details submitted');

  // q2: Verify checkout names and total price
  const totals = await verifyOverviewTotals(
    page,
    expectedNames,
    expectedPrices
  );

  console.log('Products:', expectedNames);
  console.log('Subtotal:', totals.subtotalDisplayed);
  console.log('Tax:', totals.taxDisplayed);
  console.log('Total:', totals.totalDisplayed);

  console.log('STEP 6 PASSED: Checkout totals verified');

  // q2: Complete purchase
  await page.locator('[data-test="finish"]').click();

  await expect(page).toHaveURL(/checkout-complete\.html/);

  await expect(page.locator('[data-test="complete-header"]'))
    .toHaveText('Thank you for your order!');

  await expect(page.locator('[data-test="complete-text"]'))
    .toContainText('Your order has been dispatched');

  console.log('STEP 7 PASSED: Order completed');

  // q2: Reset App State and logout
  await resetAppStateAndLogout(page);

  console.log('STEP 8 PASSED: App State reset and logged out');

  console.log('Q2 TEST COMPLETED SUCCESSFULLY');
});
