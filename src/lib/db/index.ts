import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

/**
 * D1 数据库（Cloudflare Workers 原生）。
 *
 * D1 是以 binding 方式挂到 Worker 上的（wrangler.jsonc 里配 d1_databases，
 * binding 名为 DB），只能在请求上下文里拿到，所以这里是 async 工厂函数，
 * 不能再像以前那样 export 一个全局 db 单例。
 *
 * 用法（在 Server Component / Route Handler / unstable_cache 回调里）：
 *   const db = await getDb();
 *   await db.select().from(resource)...
 */
type Db = ReturnType<typeof drizzle>;

let _db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (_db) return _db;
  const { env } = await getCloudflareContext();
  const d1 = (env as Record<string, unknown>).DB;
  if (!d1) {
    throw new Error(
      "缺少 D1 绑定 DB：请检查 wrangler.jsonc 的 d1_databases 配置",
    );
  }
  _db = drizzle(d1 as never, { schema });
  return _db;
}
