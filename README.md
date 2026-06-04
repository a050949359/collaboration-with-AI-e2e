# collaboration-with-AI-e2e

[collaboration-with-AI](https://ohya.vip) 的 Playwright E2E smoke 測試（獨立 repo）。

- 對**部署環境唯讀** smoke 為主，`BASE_URL` 走 env 可切本機。
- 三角色 **guest / user / admin**，各自 Playwright project 與 storageState。
- 測試在 **Docker 容器**內跑（官方 Playwright image），程式碼用 volume 掛入。

## 結構

```
src/paths.ts          # 目標站頁面路徑（自維護，不 import 主專案）
playwright.config.ts  # guest/user/admin 三 project + storageState
tests/
  setup/auth.setup.ts        # 產生 user/admin 登入態 storageState
  guest/public.smoke.spec.ts # 公開頁可載入
  guest/auth-redirect.spec.ts# guest 撞受保護頁 → 導回登入（負向）
  user/admin-guard.spec.ts   # user 撞 admin-only → 被 EnsureAdmin 擋（負向）
  admin/admin-access.smoke.spec.ts # admin 可進後台（正向）
docker-compose.yaml   # 容器內跑測試
```

## 快速開始

```bash
# 1) host 裝依賴一次（容器與本機共用 node_modules；不下載瀏覽器，瀏覽器在 image 裡）
npm install

# 2)（可選）先抓 image，約 2GB
docker compose pull

# 3) 跑 guest 唯讀 smoke（不需登入）
docker compose run --rm e2e npx playwright test --project=guest

# 跑全部
docker compose run --rm e2e

# 切本機目標
BASE_URL=http://localhost docker compose run --rm e2e
```

## 登入態（user / admin）

`user` / `admin` project 需要 storageState。

- **本機 dev**（`app()->isLocal()` 跳過 Turnstile）：把帳密填進 `.env`（複製 `.env.example`），
  `setup` project 會自動 email/password 登入並存 storageState。
- **部署環境**（email/password 表單有 Cloudflare Turnstile）：自動送出會被擋，請改用
  Google OAuth（Turnstile 只守 email/password 表單）或人工互動式登入一次擷取 storageState。
- 沒給帳密時 `user` / `admin` 相關測試會自動 **skip**，不影響 guest smoke。

> ⚠️ `src/paths.ts` 的頁面路徑是依主站 CLAUDE.md 推導的最佳猜測，第一次跑若與實際 redirect/404
> 不符，以實際部署為準回來修正。
