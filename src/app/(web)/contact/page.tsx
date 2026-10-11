import { env } from "@/lib/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `联系我们 - ${env("SITE_NAME")}`,
  description: `${env("SITE_NAME")}免费短剧搜索。我们仅提供搜索服务，不存储、上传或分发任何网盘内容。`,
};

export default function ContactPage() {
  const siteName = env("SITE_NAME") || "短剧库";
  return (
    <div className="container flex flex-col items-center px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">联系我们</h1>

      <div className="prose prose-lg mx-auto text-center space-y-4">
        <p>
          {siteName}是免费短剧搜索平台。我们仅提供搜索服务，不存储、上传或分发任何网盘内容。
        </p>

        <p>所有资源均来自第三方网盘，请用户自行判断资源的真实性与安全性。</p>

        <p>
          如发现任何侵权内容，或有资源反馈，请发送邮件至{" "}
          <a
            href="mailto:olivershen1215@outlook.com"
            className="text-orange-600 hover:underline break-all"
          >
            olivershen1215@outlook.com
          </a>
          ，我们将及时处理。
        </p>
      </div>
    </div>
  );
}
