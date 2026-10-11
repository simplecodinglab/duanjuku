import Link from "next/link";
import { env } from "@/lib/env";

export function Footer() {
  const siteName = env("SITE_NAME") || "短剧库";
  return (
    <footer className="bg-muted/40 border-t mt-12">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="font-bold text-foreground">{siteName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              免费短剧搜索，一键转存夸克网盘观看。本站仅提供搜索服务，不存储、上传或分发任何内容，所有资源均来自第三方。如有侵权，请邮件联系我们及时处理。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-orange-600"
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/resource"
                  className="text-sm text-muted-foreground hover:text-orange-600"
                >
                  短剧列表
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-orange-600"
                >
                  联系我们
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">联系方式</h3>
            <p className="text-sm text-muted-foreground">
              侵权投诉 / 资源反馈：
              <br />
              <a
                href="mailto:olivershen1215@outlook.com"
                className="text-orange-600 hover:underline break-all"
              >
                olivershen1215@outlook.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteName} · 免费短剧搜索
        </div>
      </div>
    </footer>
  );
}
