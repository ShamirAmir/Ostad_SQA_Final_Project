
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

test('Q1 - locked_out_user is blocked and the error is shown', async ({ page }) => {

    await login(page, 'locked_out_user');

    const error = page.locator('[data-test="error"]');

    await expect(error).toBeVisible();

    await expect(error).toContainText(
        'Sorry, this user has been locked out.'
    );

    await expect(page.locator('[data-test="login-button"]'))
        .toBeVisible();

});
