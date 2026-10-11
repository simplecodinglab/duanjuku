/**
 * 本地脚本（import-csv / create-admin）共用的 D1 访问层。
 *
 * 通过 Cloudflare D1 REST API + curl 执行 SQL（本机 Node 的 fetch 出站被沙箱
 * 拦截，curl 可用）。drizzle 的 d1 驱动需要 Worker 内的 binding，脚本在
 * Node 里跑不了，所以这里直接用 SQL。
 *
 * 需要环境变量（.env.local 或导出）：
 *   CLOUDFLARE_ACCOUNT_ID  Cloudflare 账号 ID（域名总览页右侧可复制）
 *   D1_DATABASE_ID         D1 数据库 ID（D1 页面点数据库名可复制）
 *   CLOUDFLARE_API_TOKEN   API Token（需 D1 编辑权限），走安全链接填写，不进仓库
 */
import { execFileSync } from "node:child_process";
import * as dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

function creds() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !databaseId || !token) {
    throw new Error(
      "缺少 D1 凭据：请在 .env.local 配置 CLOUDFLARE_ACCOUNT_ID / D1_DATABASE_ID / CLOUDFLARE_API_TOKEN",
    );
  }
  return { accountId, databaseId, token };
}

export interface D1Result {
  results: Record<string, unknown>[];
  meta: {
    last_row_id?: number;
    rows_read?: number;
    rows_written?: number;
  };
}

/** 执行单条 SQL（读或写），返回结果集 + meta */
export function d1(sql: string, params: unknown[] = []): D1Result {
  const { accountId, databaseId, token } = creds();
  const body = JSON.stringify({ sql, params });
  let out: string;
  try {
    out = execFileSync(
      "curl",
      [
        "-sS",
        "--max-time",
        "60",
        "-X",
        "POST",
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        "-H",
        `Authorization: Bearer ${token}`,
        "-H",
        "Content-Type: application/json",
        "--data",
        body,
      ],
      { maxBuffer: 64 * 1024 * 1024 },
    ).toString();
  } catch (e) {
    throw new Error(`D1 请求失败（网络）：${(e as Error).message}`);
  }
  let resp: any;
  try {
    resp = JSON.parse(out);
  } catch {
    throw new Error(`D1 返回非 JSON：${out.slice(0, 200)}`);
  }
  if (!resp.success) {
    throw new Error(`D1 API 失败：${JSON.stringify(resp.errors).slice(0, 300)}`);
  }
  return resp.result[0] as D1Result;
}

/** INSERT 单行，返回自增 id */
export function d1Insert(sql: string, params: unknown[] = []): number {
  const r = d1(sql, params);
  const id = Number(r.meta.last_row_id);
  if (!id) throw new Error("INSERT 成功但未拿到 last_row_id");
  return id;
}
