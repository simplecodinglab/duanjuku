// @opennextjs/cloudflare 构建配置
// 文档：https://opennext.js.org/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	// ISR / unstable_cache 的增量缓存存到 R2（wrangler.jsonc 里配了同名 bucket）
	incrementalCache: r2IncrementalCache,
});
