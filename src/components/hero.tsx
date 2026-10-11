import { env } from "@/lib/env";
import SearchForm from "./search-form";
import { getResourceCount } from "@/lib/db/queries/resource";
import Link from "next/link";
import { Flame } from "lucide-react";

// 热门搜索标签（短剧题材关键词）
const HOT_TAGS = [
  "娇妻", "阿姨", "夫人", "女友", "老婆", "前妻", "千金", "公主",
  "宠妻", "女王", "女神", "甜妻", "都市", "穿越", "隐龙", "绝世",
  "战神", "归来", "至尊", "神医", "总裁", "首富", "亿万", "少爷",
  "王爷", "大佬", "神豪", "天尊", "狂少", "老公", "逆袭", "保安",
  "赘婿", "离婚", "闪婚", "爱恨", "老师", "前夫", "龙帅", "萌宝",
];

export async function Hero() {
  const count = await getResourceCount();
  const siteName = env("SITE_NAME") || "短剧库";

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
      <div className="container py-10 md:py-14">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {siteName}
            <span className="block mt-2 text-base md:text-lg font-normal text-muted-foreground">
              免费短剧搜索 · 已收录{" "}
              <span className="text-orange-600 font-semibold">{count}</span>{" "}
              部夸克网盘短剧
            </span>
          </h1>

          <SearchForm path="/resource" />

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 text-muted-foreground shrink-0">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              热门：
            </span>
            {HOT_TAGS.slice(0, 16).map((item) => (
              <Link
                key={item}
                href={`/resource?q=${encodeURIComponent(item)}`}
                title={`${item}短剧`}
                className="px-3 py-1 rounded-full bg-white dark:bg-muted border text-muted-foreground hover:text-orange-600 hover:border-orange-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
