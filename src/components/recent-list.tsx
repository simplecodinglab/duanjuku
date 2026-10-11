import Link from "next/link";
import type { Resource } from "@/lib/db/schema";
import { getAllResource } from "@/lib/db/queries/resource";
import { formatDate } from "@/utils";
import { ChevronRight, Clock, PlayCircle } from "lucide-react";

/** 从标题提取集数 */
function extractEpisodes(title: string): string | null {
  const m = title.match(/[(（](\d+)\s*集[)）]/);
  return m ? `${m[1]}集` : null;
}

function cleanTitle(title: string): string {
  return title.replace(/[(（]\d+\s*集[)）]\s*$/, "").trim();
}

/** 首页"最近更新"：一行一条的列表 */
export async function RecentList() {
  const all = await getAllResource();
  const resources = all.slice(0, 24);

  if (resources.length === 0) return null;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
          最近更新
        </h2>
        <Link
          href="/resource"
          className="text-sm text-muted-foreground hover:text-orange-600 flex items-center gap-1"
        >
          全部短剧 <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {resources.map((resource: Resource) => {
          const episodes = extractEpisodes(resource.title);
          const href = `/resource/${resource.pinyin || resource.id}`;
          return (
            <Link
              key={resource.id}
              href={href}
              title={resource.title}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-card hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <PlayCircle className="h-5 w-5 text-orange-500 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block font-medium text-[15px] truncate">
                  {cleanTitle(resource.title)}
                </span>
              </span>
              {episodes && (
                <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 rounded-full font-medium shrink-0">
                  {episodes}
                </span>
              )}
              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.updatedAt ? formatDate(resource.updatedAt) : ""}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
