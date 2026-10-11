import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { ClientSideNavigation } from "./client-side-navigation";
import { getCategoryList } from "@/lib/db/queries/category";
import type { Category, Resource } from "@/lib/db/schema";
import { getHomeResource } from "@/lib/db/queries/resource";
import { formatDate } from "@/utils";

/** 从标题提取集数，如 "xxx（94集）" → "94集" */
function extractEpisodes(title: string): string | null {
  const m = title.match(/[(（](\d+)\s*集[)）]/);
  return m ? `${m[1]}集` : null;
}

/** 去掉标题里的集数后缀，显示更干净 */
function cleanTitle(title: string): string {
  return title.replace(/[(（]\d+\s*集[)）]\s*$/, "").trim();
}

type ResourcesMap = {
  [categoryId: string]: Resource[];
};

// 生成模拟资源数据 - 服务端函数
function generateServerResources(
  categories: Category[],
  resources: Resource[],
): ResourcesMap {
  const allResources: ResourcesMap = {};
  const resourceMap = new Map<string, Resource[]>();

  for (const item of resources) {
    const existingResources = resourceMap.get(item.categoryKey) || [];
    resourceMap.set(item.categoryKey, [...existingResources, item]);
  }

  for (const category of categories) {
    // 为每个分类获取资源，如果不存在则提供空数组作为默认值
    allResources[category.key] = resourceMap.get(category.key) || [];
  }

  return allResources;
}

export async function ResourceList() {
  // 在服务端生成资源数据
  const categories = await getCategoryList();
  const homeResources = await getHomeResource();

  const resources = generateServerResources(categories, homeResources);

  return (
    <div className="py-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="max-w-32 hidden md:sticky md:top-20 md:block h-fit w-full md:w-32 flex-shrink-0">
            <div className="border rounded-lg p-2">
              <ul className="flex flex-col">
                {categories.map((category) => (
                  <li key={category.id}>
                    {/* 使用客户端组件处理交互 */}
                    <ClientSideNavigation
                      categoryId={category.key}
                      title={category.name}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex-1 min-w-0 mx-1" id="resources-container">
            {/* 添加一个隐藏的锚点用于"全部"分类 */}
            <div id="all" className="scroll-mt-20"></div>

            {/* 只渲染非"全部"分类的内容 */}
            {categories
              .filter((category) => category.key !== "all")
              .map((category) => (
                <div
                  key={category.id}
                  id={category.key}
                  className="scroll-mt-20"
                >
                  <div className="mb-4 mt-8 flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                      {category.name}
                    </h2>
                    {resources[category.key]?.length > 12 && (
                      <Link
                        href={`/resource?category=${category.key}`}
                        title={category.name}
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        查看更多
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
                    {resources[category.key]?.slice(0, 12).map((resource) => {
                      const episodes = extractEpisodes(resource.title);
                      return (
                        <Link
                          href={`/resource/${resource.pinyin || resource.id}`}
                          title={resource.title}
                          key={resource.id}
                        >
                          <Card className="overflow-hidden hover:shadow-md hover:border-orange-200 transition-all duration-200 h-full">
                            <CardContent className="p-4 flex flex-col gap-2 h-full">
                              <h3 className="font-medium text-[15px] leading-snug line-clamp-2 min-h-[42px]">
                                {cleanTitle(resource.title)}
                              </h3>
                              <div className="flex items-center gap-2 mt-auto pt-1">
                                {episodes && (
                                  <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 rounded-full font-medium shrink-0">
                                    {episodes}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground truncate">
                                  {resource.updatedAt
                                    ? formatDate(resource.updatedAt)
                                    : ""}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 在ResourceItem组件中添加链接
interface ResourceItemProps {
  resource: {
    title: string;
    description?: string;
  };
}

export function ResourceItem({ resource }: ResourceItemProps) {
  return (
    <Link
      href={`/resource/${encodeURIComponent(resource.title)}`}
      className="block hover:bg-accent p-4 rounded-lg transition-colors"
    >
      {/* 现有的资源项内容 */}
      <h3 className="font-medium">{resource.title}</h3>
      {resource.description && (
        <p className="text-sm text-muted-foreground">{resource.description}</p>
      )}
    </Link>
  );
}
