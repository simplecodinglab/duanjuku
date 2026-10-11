import { defineConfig } from "drizzle-kit";

/**
 * 仅用于 `pnpm db:generate` 生成建表 SQL，合并成 d1-setup.sql 后
 * 拿到 Cloudflare 控制台 D1 的 Console 里执行（或走 API）。
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
});
