import { test, expect } from '@playwright/test';
import { authedPaths, adminPaths } from '../../src/paths';

/**
 * 權限負向測試 — guest（見知識圖譜 obs #47）：
 * 未登入撞需登入頁，應被導回登入頁（不應停在原頁、也不應看到內容）。
 */

const guarded = { ...authedPaths, ...adminPaths };

test.describe('guest 撞受保護頁應導回登入', () => {
  for (const [name, path] of Object.entries(guarded)) {
    test(`${name} (${path}) → 導回登入`, async ({ page }) => {
      await page.goto(path);
      // /app/login 是 Laravel named route，會再 redirect 到 /app/
      // 所以最終落腳是首頁 /app
      await expect(page).toHaveURL(/\/app\/?$/, { timeout: 15_000 });
    });
  }
});
