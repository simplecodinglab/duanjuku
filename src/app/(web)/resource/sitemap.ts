import { env } from "@/lib/env";
import {
  getResourceCount,
  getResourceRange,
} from "@/lib/db/queries/resource";
import type { MetadataRoute } from "next";

// 构建时不预渲染（构建机不需要连数据库），请求时按需生成；
// 数据量小（单文件<5万条），单次查询成本可忽略；量大后再改回 ISR。
export const dynamic = "force-dynamic";

const BASE_URL = env("NEXT_PUBLIC_BASE_URL") || "https://duanju.neeview.com";
const SITEMAP_SIZE = 50000; // Google's limit per sitemap 50000

export async function generateSitemaps() {
  // 构建时拿不到 D1（构建机不在请求上下文里），降级为 1 个；
  // 运行时（force-dynamic）每次请求都会重新执行这里，拿到真实数量。
  try {
    const totalResources = await getResourceCount();
    const numberOfSitemaps = Math.ceil(totalResources / SITEMAP_SIZE);
    return Array.from({ length: Math.max(numberOfSitemaps, 1) }, (_, i) => ({ id: i + 1 }));
  } catch {
    return [{ id: 1 }];
  }
}

export default async function sitemap(props: {
  id: Promise<number>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const start = (id - 1) * SITEMAP_SIZE;
  const end = start + SITEMAP_SIZE;

  // 其他 sitemap 只包含资源路由
  const resources = await getResourceRange(start, end);
  const resourceRoutes = resources.map((resource) => ({
    url: `${BASE_URL}/resource/${resource.pinyin}`,
    lastModified: resource.updatedAt || new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return resourceRoutes;
}
