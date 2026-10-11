import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * 统一读取环境变量。
 *
 * Cloudflare Workers 里，控制台配置的变量不在 process.env 里，
 * 要走 getCloudflareContext().env 拿；本地开发时降级读 process.env。
 */
export function env(key: string): string | undefined {
  try {
    const v = (getCloudflareContext().env as Record<string, unknown> | undefined)?.[key];
    if (typeof v === "string" && v) return v;
  } catch {
    // 非 Worker 请求上下文（本地脚本等），忽略
  }
  return process.env[key];
}
