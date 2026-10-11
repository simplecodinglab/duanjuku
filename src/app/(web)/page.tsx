import { Hero } from "@/components/hero";
import { RecentList } from "@/components/recent-list";

// 构建不预渲染（构建机不需要连数据库），请求时按需渲染；
// 数据量小，单次查询成本可忽略；流量大了再改回 ISR（revalidate=60）。
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <RecentList />
    </>
  );
}
