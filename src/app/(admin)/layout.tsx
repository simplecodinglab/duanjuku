import type { Metadata } from "next";
import { env } from "@/lib/env";
import "@/app/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { TitleProvider } from "@/contexts/title-context";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: `${env("SITE_NAME")} - 后台管理`,
  description: "短剧库后台管理",
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 验证用户是否已登录
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <TitleProvider defaultTitle="管理后台">
        <AppSidebar variant="inset" siteName={env("SITE_NAME")} />
        <SidebarInset>
          <SiteHeader />
          {children}
        </SidebarInset>
      </TitleProvider>
    </SidebarProvider>
  );
}
