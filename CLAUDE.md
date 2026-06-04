# CLAUDE.md — collaboration-with-AI-e2e

> 此檔供 AI 助手快速理解**這個 e2e 測試專案**。
> 注意：這是獨立 repo，**不** import 主站（collaboration-with-AI）程式碼。

## 這個專案是什麼

[collaboration-with-AI](https://ohya.vip) 的 Playwright E2E smoke 測試。

- 對**部署環境唯讀** smoke 為主，`BASE_URL` 走 env 可切本機。
- 三角色 **guest / user / admin**，各自 Playwright project 與 storageState。
- 測試在 **Docker 容器**（官方 Playwright image `v1.60.0-noble`）內跑，程式碼用 volume 掛入。
- 只依賴 `@playwright/test`；頁面路徑在 `src/paths.ts` **自維護**（不讀主站 routes.ts）。

## 結構

```
src/paths.ts          # 目標站頁面路徑（單一來源，手動對齊主站）
playwright.config.ts  # guest/user/admin 三 project + setup + storageState
tests/
  setup/auth.setup.ts        # 產生 user/admin 登入態 storageState（無帳密自動 skip）
  guest/public.smoke.spec.ts # 公開頁 + RSA 公鑰 endpoint 唯讀 smoke
  guest/auth-redirect.spec.ts# guest 撞受保護頁 → 導回登入（負向）
  user/admin-guard.spec.ts   # user 撞 admin-only → 被 EnsureAdmin 擋（負向）
  admin/admin-access.smoke.spec.ts # admin 可進後台（正向）
docker-compose.yaml   # 容器內跑測試（bind-mount repo）
```

## 常用指令

```bash
npm install                                                    # host 裝依賴一次（容器共用，不下載瀏覽器）
docker compose pull                                            # 抓 image（~2GB）
docker compose run --rm e2e                                    # 跑全部
docker compose run --rm e2e npx playwright test --project=guest # 只跑 guest 唯讀 smoke
BASE_URL=http://localhost docker compose run --rm e2e          # 切本機目標
```

---

## 目標站（撰寫測試需要知道的事）

主站是 Laravel 13 + Vue 3 / Inertia SPA，部署在 **ohya.vip**。寫測試會用到下列幾點：

### 路由
- 所有 web 頁面掛在 `prefix('app')` 下（Inertia pages），例如 `/app/login`。
- REST API 在 `/api/...`。
- ⚠️ `src/paths.ts` 的路徑是依主站推導的**最佳猜測**，與實際 redirect/404 不符時以實際部署為準回來修。

### Auth 流程
- 登入/註冊：前端以 RSA-OAEP 加密 password 再送出 → 由網站前端自己加密，
  **測試只要驅動登入 UI、不需重做加密**。
- Token 存 SameSite:Lax cookie（Sanctum），**不需要** CSRF round-trip。
- 公鑰 endpoint：`GET /api/auth/key`（smoke 會打）。

### Cloudflare Turnstile
- 只守 **email/password 表單**；**Google OAuth 路徑可繞過** Turnstile。
- 本地 dev（`app()->isLocal()`）跳過驗證 → 本機 email/password 可全自動登入。
- 部署環境含 Turnstile → 自動送出會被擋，需走 Google OAuth 或互動式擷取 storageState。

### 權限
- admin-only 路由（如 `/app/admin`、`/app/story-relay`）由 `EnsureAdmin` middleware 守護。
- 負向測試預期：guest 撞受保護頁 → 導回登入；user 撞 admin-only → 被擋（403 或導離）。

---

## MCP 知識圖譜

本 repo 的 `.vscode/mcp.json`（**含 Bearer token，已 gitignore，勿提交**）連到主站的
知識圖譜 / task server（`https://ohya.vip/api/mcp/{memory,task}`）。

本專案的測試約定（獨立 repo、paths.ts 自維護、三角色、BASE_URL env、唯讀 smoke）
記在知識圖譜的 `collaboration-with-AI-e2e` 節點，並有 `e2e_tests → collaboration-with-AI` 關係。
跨專案 / 主機環境的持久知識存圖譜；本對話暫時脈絡存本機 file memory。
