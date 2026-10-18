
const { test, expect } = require('@playwright/test');

const {
  login,
  resetAppState,
  checkoutCustomerDetails,
  verifyOverviewTotals,
  resetAppStateAndLogout
} = require('./helpers');

test('Q3 - performance_glitch_user completes Z-A checkout', async ({ page }) => {

  // Q3: Login as performance_glitch_user
  // (Ostad) Account may respond slowly.
  test.setTimeout(120000);

  await login(page, 'performance_glitch_user');

  await expect(page).toHaveURL(/inventory\.html/, {
    timeout: 60000
  });

  console.log('STEP 1 PASSED: Login successful');

  // Q3:    Reset App State.
  await resetAppState(page);

  console.log('STEP 2 PASSED: App State reset');

  // Q3:  Sort products by Name (Z to A  )
  await page.locator('[data-test="product-sort-container"]')
    .selectOption('za');

  await expect(
    page.locator('[data-test="product-sort-container"]')
  ).toHaveValue('za');

  const productNames = (await page
    .locator('.inventory_item_name')
    .allTextContents()).map(name => name.trim());

  const expectedSortedNames = [...productNames].sort(
    (a, b) => b.localeCompare(a)
  );

  expect(productNames).toEqual(expectedSortedNames);

  console.log('STEP 3 PASSED: Products sorted Z to A');

  // Q3: Add first product to cart
  const firstProduct = page.locator('.inventory_item').first();

  const expectedName = (
    await firstProduct.locator('.inventory_item_name')
      .innerText()
  ).trim();

  const priceText = await firstProduct
    .locator('.inventory_item_price')
    .innerText();

  const expectedPrice = Number(
    priceText.replace('$', '').trim()
  );

  await firstProduct.locator('button').click();

  await expect(page.locator('.shopping_cart_badge'))
    .toHaveText('1');

  console.log('STEP 4 PASSED: First product added');
  console.log('Selected Product:', expectedName);
  console.log('Product Price:', expectedPrice);

  // Q3: Verify shopping product.....;
  await page.locator('.shopping_cart_link').click();

  await expect(page).toHaveURL(/cart\.html/);

  await expect(page.locator('.cart_item')).toHaveCount(1);

  await expect(
    page.locator('.cart_item .inventory_item_name')
  ).toHaveText(expectedName);

  await expect(
    page.locator('.cart_item .inventory_item_price')
  ).toHaveText(`$${expectedPrice.toFixed(2)}`);

  console.log('STEP 5 PASSED: Cart verified');

  // Q3: Enter a checkout information....
  await page.locator('[data-test="checkout"]').click();

  await checkoutCustomerDetails(page);

  await expect(page).toHaveURL(/checkout-step-two\.html/);

  console.log('STEP 6 PASSED: Checkout information submitted');

  // Q3: Verify product name and     price...........
  const totals = await verifyOverviewTotals(
    page,
    [expectedName],
    [expectedPrice]
  );

  expect(totals.subtotalDisplayed)
    .toBeCloseTo(expectedPrice, 2);

  expect(totals.totalDisplayed)
    .toBeCloseTo(
      totals.subtotalDisplayed + totals.taxDisplayed,
      2
    );

  console.log('STEP 7 PASSED: Checkout verified');
  console.log('Product:', expectedName);
  console.log('Subtotal:', totals.subtotalDisplayed);
  console.log('Tax:', totals.taxDisplayed);
  console.log('Total:', totals.totalDisplayed);

  // Q3: Final purchase
  await page.locator('[data-test="finish"]').click();

  await expect(page).toHaveURL(/checkout-complete\.html/);

  await expect(
    page.locator('[data-test="complete-header"]')
  ).toHaveText('Thank you for your order!');

  await expect(
    page.locator('[data-test="complete-text"]')
  ).toContainText('Your order has been dispatched');

  console.log('STEP 8 PASSED: Order completed successfully');

  // Q3: Reset App State and logout
  await resetAppStateAndLogout(page);

  console.log('STEP 9 PASSED: App State reset and logged out');

  console.log('Q3 TEST COMPLETED SUCCESSFULLY');
});
