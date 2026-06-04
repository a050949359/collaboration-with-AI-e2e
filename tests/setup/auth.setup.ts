import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import { STORAGE } from '../../playwright.config';
import { publicPaths } from '../../src/paths';

/**
 * 產生登入態 storageState 供 user / admin project 使用（見知識圖譜 obs #43）。
 *
 * 登入策略：
 * - 直接驅動網站登入 UI（填 email/password → 送出），由網站前端自己做 RSA-OAEP 加密，
 *   所以這裡不需重做加密邏輯。
 * - 部署環境的 email/password 表單有 Cloudflare Turnstile（obs #45）。自動化送出會被擋；
 *   因此「對部署環境」建議改用互動式擷取：`npm run auth:login`（headed）人工登入一次，
 *   或走 Google OAuth（Turnstile 只守 email/password 表單）。
 * - 本機 dev（app()->isLocal()）會跳過 Turnstile，這支即可全自動。
 *
 * 沒給帳密時直接 skip，不讓 setup 失敗卡住 guest smoke。
 */

type Role = 'user' | 'admin';

const creds: Record<Role, { email?: string; password?: string; file: string }> = {
  user: {
    email: process.env.E2E_USER_EMAIL,
    password: process.env.E2E_USER_PASSWORD,
    file: STORAGE.user,
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
    file: STORAGE.admin,
  },
};

for (const role of ['user', 'admin'] as Role[]) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const { email, password, file } = creds[role];

    setup.skip(
      !email || !password,
      `略過 ${role} 登入：未設定 E2E_${role.toUpperCase()}_EMAIL / _PASSWORD。` +
        `（對部署環境含 Turnstile，請改用 npm run auth:login 互動式擷取）`,
    );

    await page.goto(publicPaths.login);

    // 選擇器為最佳猜測，請依實際登入頁調整
    await page.locator('input[type="email"], input[name="email"]').first().fill(email!);
    await page.locator('input[type="password"], input[name="password"]').first().fill(password!);
    await page.getByRole('button', { name: /登入|login|sign in/i }).click();

    // 登入成功後應離開登入頁
    await expect(page).not.toHaveURL(new RegExp(`${publicPaths.login}$`), { timeout: 15_000 });

    fs.mkdirSync('.auth', { recursive: true });
    await page.context().storageState({ path: file });
  });
}
