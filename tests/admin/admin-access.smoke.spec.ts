import { test, expect } from '@playwright/test';
import { adminPaths } from '../../src/paths';

/**
 * 正向 smoke — admin 可進入後台（見知識圖譜 obs #43）。
 * 需要 admin storageState；未設定帳密時整個 admin project 會 skip。
 */

test.describe('admin 可存取後台', () => {
  for (const [name, path] of Object.entries(adminPaths)) {
    test(`${name} (${path}) 可載入`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} 不應回 403`).not.toBe(403);
      await expect(page).toHaveURL(new RegExp(path));
    });
  }
});
