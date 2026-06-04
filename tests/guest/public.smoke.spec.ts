import { test, expect } from '@playwright/test';
import { publicPaths, apiPaths } from '../../src/paths';

/**
 * Guest 唯讀 smoke：公開頁可正常載入（見知識圖譜 obs #50）。
 * 對部署環境唯讀，不做任何寫入。
 */

test.describe('guest 公開頁 smoke', () => {
  test('登入頁可載入', async ({ page }) => {
    const res = await page.goto(publicPaths.login);
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('註冊頁可載入', async ({ page }) => {
    const res = await page.goto(publicPaths.register);
    expect(res?.ok()).toBeTruthy();
  });

  test('RSA 公鑰 endpoint 回應正常', async ({ request }) => {
    const res = await request.get(apiPaths.authPublicKey);
    expect(res.ok()).toBeTruthy();
  });
});
