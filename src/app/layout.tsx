import type { Metadata } from "next";
import { env } from "@/lib/env";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { StatusBarTheme } from "@/components/status-bar-theme";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: `${env("SITE_NAME")} - 免费短剧资源搜索 | 夸克网盘短剧一站式搜索平台`,
  description: `${env("SITE_NAME")}是免费短剧资源搜索引擎，专注夸克网盘短剧搜索与转存观看。海量热门短剧一键转存，快速精准，完全免费。`,
  keywords: `${env("SITE_NAME")},短剧搜索,短剧网盘,夸克短剧,免费短剧,在线看短剧,短剧资源,短剧下载,短剧搜索引擎`,
  authors: [{ name: `${env("SITE_NAME")}` }],
  robots: "index, follow",
  metadataBase: new URL("https://duanju.neeview.com"),
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: `${env("SITE_NAME")} - 免费短剧资源搜索 | 夸克网盘短剧一站式搜索平台`,
    description: `${env("SITE_NAME")}是免费短剧资源搜索引擎，专注夸克网盘短剧搜索与转存观看。海量热门短剧一键转存，快速精准，完全免费。`,
    type: "website",
    locale: "zh_CN",
    siteName: `${env("SITE_NAME")}`,
    url: "https://duanju.neeview.com",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://duanju.neeview.com",
    creator: "@towelong",
    title: `${env("SITE_NAME")} - 免费短剧资源搜索 | 夸克网盘短剧一站式搜索平台`,
    description: `${env("SITE_NAME")}是免费短剧资源搜索引擎，专注夸克网盘短剧搜索与转存观看。海量热门短剧一键转存，快速精准，完全免费。`,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* next-themes 内联脚本依赖 __name，某些构建下未定义会导致报错，先 polyfill */}
        <script
          dangerouslySetInnerHTML={{
            __html: "window.__name=window.__name||function(f){return f};",
          }}
        />
        <meta name="application-name" content={env("SITE_NAME")} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content={env("SITE_NAME")}
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#ffffff" />

        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="256x256"
          href="/icons/icon-256x256.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="384x384"
          href="/icons/icon-384x384.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/icons/icon-512x512.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="256x256"
          href="/icons/icon-256x256.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="384x384"
          href="/icons/icon-384x384.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/icon-512x512.png"
        />
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
        >
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "um9zi4nqme");
          `}
        </Script>
        {/* Google Analytics 4：Cloudflare Variables 里配 GA_ID=G-XXXXXXXXXX 即生效 */}
        {env("GA_ID") && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${env("GA_ID")}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${env("GA_ID")}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <StatusBarTheme />
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && (
          <Script
            src={env("UMAMI_API")}
            data-website-id={env("UMAMI_ID")}
            defer
          />
        )}
      </body>
    </html>
  );
}
