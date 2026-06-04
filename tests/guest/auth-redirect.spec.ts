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
      // 落腳 URL 應是登入頁（或帶 redirect query 的登入頁）
      await expect(page).toHaveURL(/\/app\/login/, { timeout: 15_000 });
    });
  }
});
