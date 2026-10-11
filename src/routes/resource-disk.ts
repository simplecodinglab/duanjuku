import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  getResourceDiskUrl,
  updateResourceDiskUrl,
} from "@/lib/db/queries/resource-disk";
import { getCategoryByKey } from "@/lib/db/queries/category";
import { notice } from "@/utils/notice";

// 定义请求体验证模式
const updateSchema = z.object({
  id: z.number(),
  title: z.string(),
  categoryKey: z.string(),
  externalUrl: z.string(),
});

const app = new Hono();

// 把错误信息以 JSON 返回给前端，用户能看到失败原因
app.onError((err, c) => {
  console.error("resource-disk error:", err);
  return c.json({ message: err.message || "转存失败，请稍后重试" }, 500);
});

// 更新资源磁盘URL的路由
app.post("/update", zValidator("json", updateSchema), async (c) => {
  const { id, title, categoryKey, externalUrl } = c.req.valid("json");
  const url = await getResourceDiskUrl(id);
  if (url) {
    return c.json({
      message: "获取成功",
      url: url,
    });
  }
  const category = await getCategoryByKey(categoryKey);
  // 与 getDb() 同一套拿法：await getCloudflareContext()
  const { env: cfEnv } = await getCloudflareContext();
  const quarkApi = (cfEnv as Record<string, string>).QUARK_API || process.env.QUARK_API;
  if (!quarkApi) {
    throw new Error("缺少 QUARK_API 配置");
  }
  const response = await fetch(`${quarkApi}/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      share_url: externalUrl,
      save_path: `/${category.name}`,
      gen_passcode: false,
      // expire_days: 0 = 永久有效（运营策略：懒转存的分享链接必须长期有效，
      // 不能用默认的 1 天，否则缓存的链接会失效）。转存服务需将 0 视为永久。
      expire_days: 0,
      title, // 分享页标题用资源标题
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    await notice(
      `告警：资源磁盘转存失败\nhttp状态码：${response.status}\n响应体：${errorText}`,
    );
    // 把转存服务的具体报错透传给前端，用户能看到真实原因
    let detail = "";
    try {
      const errData = JSON.parse(errorText);
      detail = errData.message || "";
    } catch {}
    // 去掉内部错误码前缀，文案给用户看
    detail = detail.replace(/^[A-Z_]+:/, "");
    throw new Error(detail || "转存失败，请稍后重试");
  }

  const data = await response.json();
  console.log(data);
  if (data.message?.includes("capacity limit")) {
    await notice("告警：资源磁盘容量不足，请及时清理");
  }

  const newUrl = data.share_url; // 获取转存后的URL
  await updateResourceDiskUrl(id, newUrl);
  return c.json({
    message: "获取成功",
    url: newUrl,
  });
});

export default app;
