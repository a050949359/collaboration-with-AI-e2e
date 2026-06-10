/**
 * 目標網站 (collaboration-with-AI) 的頁面路徑。
 *
 * 這是「獨立 e2e repo，路徑自維護」的單一來源（見知識圖譜 obs #41）：
 * 主專案的 routes.ts 不會被 import 進來，所以這裡的路徑是手動對齊的。
 * 主站所有 web 路由都掛在 prefix('app') 下（Inertia pages）。
 *
 * ⚠️ 這些路徑是依 CLAUDE.md 的頁面清單推導的「最佳猜測」，
 *    第一次跑 smoke 時若 redirect/404 與預期不符，請以實際部署為準回來修正。
 */

/**
 * 公開頁（guest 可直接瀏覽，無 auth middleware）。
 * /app/login 與 /app/register 在 Laravel 路由是 redirect → /app/，
 * 所以登入入口就是首頁 /app。
 */
export const publicPaths = {
  home: '/app',
  airports: '/app/airports',
  airlines: '/app/airlines',
  countries: '/app/countries',
  about: '/app/about',
  linebot: '/app/linebot',
  tourPlayground: '/app/tour-playground',
  articles: '/app/articles',
  miniOrch: '/app/mini-orch',
  wsLab: '/app/ws-lab',
  gacha: '/app/gacha',
  task: '/app/task',
  memory: '/app/memory',
  computerVision: '/app/computer-vision',
  gesture: '/app/gesture',
  forgotPassword: '/app/forgot-password',
} as const;

/** 需登入頁（auth:sanctum；guest 進入應被導回登入） */
export const authedPaths = {
  articlesGenerate: '/app/articles/generate',
} as const;

/** 僅 admin 頁（auth:sanctum + EnsureAdmin；見 obs #47） */
export const adminPaths = {
  admin: '/app/admin',
  storyRelay: '/app/story-relay',
} as const;

/** API endpoints（唯讀 smoke 會用到的幾個） */
export const apiPaths = {
  authPublicKey: '/api/auth/key',
} as const;

export const paths = {
  public: publicPaths,
  authed: authedPaths,
  admin: adminPaths,
  api: apiPaths,
} as const;

export default paths;
