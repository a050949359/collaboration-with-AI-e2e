import { defineConfig, devices } from '@playwright/test';

/**
 * BASE_URL 走 env，預設指向部署環境（見知識圖譜 obs #50）。
 * 本機切換：BASE_URL=http://localhost docker compose run --rm e2e
 */
const baseURL = process.env.BASE_URL ?? 'https://ohya.vip';

/** storageState 檔案位置（由 setup project 產生，已 gitignore） */
export const STORAGE = {
  user: '.auth/user.json',
  admin: '.auth/admin.json',
} as const;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 對部署環境唯讀 smoke：保守的逾時
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // 取得登入態 storageState（需在 .env 提供帳密；沒提供就跳過 user/admin）
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // guest：無登入態
    {
      name: 'guest',
      testMatch: /guest\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // user：一般登入態
    {
      name: 'user',
      testMatch: /user\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE.user },
    },

    // admin：管理者登入態
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE.admin },
    },
  ],
});
