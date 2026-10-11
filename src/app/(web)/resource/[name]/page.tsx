import Link from "next/link";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Copy, Download, ChevronRight, TriangleAlert, Clock, FolderOpen } from "lucide-react";
import {
  getRelatedResources,
  getResourceByPinyin,
} from "@/lib/db/queries/resource";
import { ClientLink } from "@/components/client-link";
import ClickboardButton from "@/components/clickboard-button";
import type { Metadata } from "next";
import { formatDate } from "@/utils";
import type { Resource } from "@/lib/db/schema";
import Image from "next/image";
import { ImagePreview } from "@/components/image-preview";
import { getCategoryByKey } from "@/lib/db/queries/category";

/** 从标题提取集数 */
function extractEpisodes(title: string): string | null {
  const m = title.match(/[(（](\d+)\s*集[)）]/);
  return m ? `${m[1]}集` : null;
}

function cleanTitle(title: string): string {
  return title.replace(/[(（]\d+\s*集[)）]\s*$/, "").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const name = (await params).name;
  const resource = await getResourceByPinyin(name);
  const siteName = env("SITE_NAME") || "短剧库";
  return {
    title: `${resource?.title || ""} - 夸克网盘免费观看 - ${siteName}`,
    description:
      resource?.desc ||
      `${siteName}免费短剧搜索，一键转存夸克网盘观看${resource?.title || ""}`,
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const name = (await params).name;
  const resource = await getResourceByPinyin(name);
  let relatedResources: Resource[] = [];
  if (resource?.title) {
    relatedResources = await getRelatedResources(
      resource.title,
      resource.categoryKey,
      resource.id,
    );
  }

  if (!resource) {
    return (
      <div className="container flex justify-center items-center mt-60">
        短剧不存在或已下架
      </div>
    );
  }
  const category = await getCategoryByKey(resource.categoryKey);
  const episodes = extractEpisodes(resource.title);
  const siteName = env("SITE_NAME") || "短剧库";
  const baseUrl = env("NEXT_PUBLIC_BASE_URL") || "https://duanju.neeview.com";

  // JSON-LD 结构化数据：SEO + GEO（AI 搜索引用）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: cleanTitle(resource.title),
    description: `${cleanTitle(resource.title)}${episodes ? `（${episodes}）` : ""}，夸克网盘免费观看，一键转存。`,
    url: `${baseUrl}/resource/${resource.pinyin || resource.id}`,
    ...(episodes ? { numberOfEpisodes: episodes.replace("集", "") } : {}),
    dateModified: resource.updatedAt,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
    },
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 面包屑 */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-hidden">
        <Link href="/" className="hover:text-orange-600 whitespace-nowrap shrink-0">
          首页
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
        <Link
          href={`/resource?category=${resource.categoryKey}`}
          className="hover:text-orange-600 whitespace-nowrap shrink-0"
        >
          {category?.name || "短剧"}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
        <span className="text-foreground truncate">{cleanTitle(resource.title)}</span>
      </nav>

      {/* 标题区 */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {episodes && (
            <span className="text-sm px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 rounded-full font-medium">
              {episodes}
            </span>
          )}
          <span className="text-sm px-2.5 py-1 bg-muted rounded-full text-muted-foreground inline-flex items-center gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            夸克网盘
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {cleanTitle(resource.title)}
        </h1>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {resource.updatedAt ? formatDate(resource.updatedAt) : ""} 更新
          </span>
        </div>
        {resource.desc && (
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            {resource.desc}
          </p>
        )}
      </div>

      {/* 获取链接卡片 */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 border border-orange-200 dark:border-orange-900/30 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Download className="h-4 w-4 text-orange-600" />
          获取观看链接
        </h2>
        <div className="space-y-3">
          {resource.diskList.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-2">
              <ClientLink
                id={item.id}
                title={resource.title}
                categoryKey={resource.categoryKey}
                url={item.url}
                externalUrl={item.externalUrl}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-full text-base transition-colors"
              >
                <Download className="h-4 w-4" />
                点击获取夸克链接
              </ClientLink>
              {item.url && (
                <ClickboardButton
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-white dark:bg-background"
                  text={item.url}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  复制链接
                </ClickboardButton>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-500"
              >
                <TriangleAlert className="h-4 w-4 mr-1" />
                链接失效？
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
          首次点击会自动转存为本站专属永久链接并缓存，之后打开即得。建议转存到自己的夸克网盘后观看全部剧集。
        </p>
      </div>

      {/* 同类推荐 */}
      {relatedResources.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
              猜你喜欢
            </h2>
            <Link
              href={`/resource?q=${encodeURIComponent(cleanTitle(resource.title).slice(0, 4))}`}
              className="text-sm text-muted-foreground hover:text-orange-600 flex items-center"
            >
              更多 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedResources.slice(0, 8).map((item, index) => {
              const ep = extractEpisodes(item.title);
              return (
                <Link
                  key={item.id}
                  href={`/resource/${item.pinyin || item.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors group"
                >
                  <span className="text-sm font-medium text-muted-foreground w-6 shrink-0 text-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate text-[15px] group-hover:text-orange-600 transition-colors">
                    {cleanTitle(item.title)}
                  </span>
                  {ep && (
                    <span className="text-xs text-muted-foreground shrink-0">{ep}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
