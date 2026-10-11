"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSafeSearchParams } from "@/hooks/use-safe-search-params";

export default function SearchForm({ initialQuery = "", path = "" }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  let pathname = usePathname();
  const searchParams = useSafeSearchParams();

  // 确保组件已挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    // 创建新的URLSearchParams对象
    const params = new URLSearchParams(mounted ? searchParams.toString() : "");

    // 设置搜索查询参数
    params.set("q", searchQuery);

    // 如果存在page参数，删除它（让系统重置到第一页）
    if (params.has("page")) {
      params.delete("page");
    }

    if (path !== "") {
      pathname = path;
    }

    // 使用当前路径和更新后的参数进行导航
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 当URL参数变化时更新搜索框
  useEffect(() => {
    if (mounted) {
      const query = searchParams.get("q") || "";
      setSearchQuery(query);
    }
  }, [searchParams, mounted]);

  // 监听URL变化
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q") || "";
      setSearchQuery(query);
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  return (
    <div className="flex gap-2 justify-center">
      <div className="relative flex-1">
        <Input
          placeholder="搜索短剧名称，如：重生、霸总、甜宠…"
          className="rounded-full pl-11 pr-4 py-6 w-full text-base shadow-sm border-orange-200 focus-visible:ring-orange-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
            <title>Search icon</title>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>
      <Button
        onClick={handleSearch}
        className="rounded-full px-8 py-6 text-base bg-orange-600 hover:bg-orange-700 dark:text-white shrink-0"
      >
        搜索
      </Button>
    </div>
  );
}
