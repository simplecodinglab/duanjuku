import { env } from "@/lib/env";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 放函数体内：每次请求时在 Cloudflare 运行时上下文里求值，才能读到最新域名；
  // 放模块顶层会在构建时预渲染求值，读不到运行时变量导致旧域名被内联进缓存。
  const BASE_URL = env("NEXT_PUBLIC_BASE_URL") || "https://duanju.neeview.com";
  // 静态路由
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/resource`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  return [...staticRoutes];
}
