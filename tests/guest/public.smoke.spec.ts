import { test, expect } from '@playwright/test';
import { publicPaths, apiPaths } from '../../src/paths';

/**
 * Guest 公開頁 smoke：所有無 auth middleware 的頁面應回 200。
 * 循序跑（workers: 1），避免對部署環境造成過大壓力。
 */

test.describe('guest 公開頁 smoke', () => {
  for (const [name, path] of Object.entries(publicPaths)) {
    test(`${name} (${path}) 回 200`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok(), `${path} 應回 200，實際 status: ${res?.status()}`).toBeTruthy();
    });
  }

  test('RSA 公鑰 endpoint 回應正常', async ({ request }) => {
    const res = await request.get(apiPaths.authPublicKey);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('key');
  });
});
