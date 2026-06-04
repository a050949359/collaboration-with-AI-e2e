import { test, expect } from '@playwright/test';
import { adminPaths } from '../../src/paths';

/**
 * 權限負向測試 — user 撞 admin-only（見知識圖譜 obs #47）：
 * 一般登入者進入 /app/admin、/app/story-relay 應被 EnsureAdmin 擋下
 * （導走或回 403），不應看到後台內容。
 *
 * 需要 user storageState（由 setup project 產生）；未設定帳密時整個 user project 會 skip。
 */

test.describe('user 撞 admin-only 應被 EnsureAdmin 擋', () => {
  for (const [name, path] of Object.entries(adminPaths)) {
    test(`${name} (${path}) → 被擋`, async ({ page }) => {
      const res = await page.goto(path);
      const status = res?.status() ?? 0;
      const url = page.url();

      const blocked =
        status === 403 || // EnsureAdmin abort(403)
        !url.includes(path); // 或被導離該頁

      expect(
        blocked,
        `預期被擋，但停在 ${url}（status ${status}）`,
      ).toBeTruthy();
    });
  }
});
