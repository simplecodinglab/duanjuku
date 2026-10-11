import { env } from "@/lib/env";
import { getResourceCount } from "@/lib/db/queries/resource";
import type { MetadataRoute } from "next";

// 构建时不预渲染（构建机不需要连数据库），请求时按需生成；
// 数据量小（单文件<5万条），单次查询成本可忽略；量大后再改回 ISR。
export const dynamic = "force-dynamic";

const BASE_URL = env("NEXT_PUBLIC_BASE_URL") || "https://duanju.neeview.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const totalResources = await getResourceCount();
  const SITEMAP_SIZE = 50000;
  const numberOfResourceSitemaps = Math.ceil(totalResources / SITEMAP_SIZE);

  // 静态路由
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/main/sitemap.xml`,
    },
  ];

  // 生成 resource sitemap 引用
  const resourceSitemaps: MetadataRoute.Sitemap = Array.from(
    { length: numberOfResourceSitemaps },
    (_, i) => ({
      url: `${BASE_URL}/resource/sitemap/${i + 1}.xml`,
    }),
  );

  return [...staticRoutes, ...resourceSitemaps];
}
