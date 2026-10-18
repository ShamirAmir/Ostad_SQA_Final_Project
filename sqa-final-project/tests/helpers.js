
const { expect } = require('@playwright/test');

const PASSWORD = 'secret_sauce';

// Shared login function for Q1, Q2 and,  Q3
async function login(page, username) {
  await page.goto('https://www.saucedemo.com/');

  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(PASSWORD);
  await page.locator('[data-test="login-button"]').click();
}

// Open menu  syste m and reset the application process
async function resetAppState(page) {
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="reset-sidebar-link"]').click();
  await page.locator('#react-burger-cross-btn').click();
}

// Fill customer info    during checkout
async function checkoutCustomerDetails(page) {
  await page.locator('[data-test="firstName"]').fill('SQA');
  await page.locator('[data-test="lastName"]').fill('Student');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();

  await expect(page).toHaveURL(/checkout-step-two\.html/);
}

// Verify checkout product names and total price
async function verifyOverviewTotals(page, expectedNames, expectedPrices) {
  const items = page.locator('.cart_item');

  await expect(items).toHaveCount(expectedNames.length);

  const actualNames = (await items.locator('.inventory_item_name')
    .allTextContents()).map(name => name.trim());

  expect(actualNames).toEqual(expectedNames);

  const actualPrices = (await items.locator('.inventory_item_price')
    .allTextContents()).map(price =>
      Number(price.replace('$', '').trim())
    );

  expect(actualPrices).toEqual(expectedPrices);

  //    Calculate subtotal from prices recorded before checkout
  const subtotalExpected = expectedPrices.reduce(
    (sum, price) => sum + price, 0
  );

  const subtotalText = await page
    .locator('[data-test="subtotal-label"]').innerText();

  const taxText = await page
    .locator('[data-test="tax-label"]').innerText();

  const totalText = await page
    .locator('[data-test="total-label"]').innerText();

  const subtotalDisplayed = Number(subtotalText.split('$')[1]);
  const taxDisplayed = Number(taxText.split('$')[1]);
  const totalDisplayed = Number(totalText.split('$')[1]);

  expect(Number.isFinite(subtotalDisplayed)).toBe(true);
  expect(Number.isFinite(taxDisplayed)).toBe(true);
  expect(Number.isFinite(totalDisplayed)).toBe(true);

  expect(subtotalDisplayed).toBeCloseTo(subtotalExpected, 2);
  expect(totalDisplayed).toBeCloseTo(
    subtotalDisplayed + taxDisplayed, 2
  );

  return {
    subtotalDisplayed,
    taxDisplayed,
    totalDisplayed
  };
}

// Reset application state and logout
async function resetAppStateAndLogout(page) {
  await page.locator('#react-burger-menu-btn').click();

  await page.locator('[data-test="reset-sidebar-link"]').click();
  await page.locator('[data-test="logout-sidebar-link"]').click();

  await expect(page.locator('[data-test="login-button"]'))
    .toBeVisible();
}

module.exports = {
  login,
  resetAppState,
  checkoutCustomerDetails,
  verifyOverviewTotals,
  resetAppStateAndLogout
};
