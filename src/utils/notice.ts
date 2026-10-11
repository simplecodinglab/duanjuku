import dayjs from "dayjs";
import { env } from "@/lib/env";

import "dayjs/locale/zh-cn"; // 导入本地化语言
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.locale("zh-cn");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Shanghai");

export const notice = async (msg: string) => {
  const noticeApi = env("NOTICE_API");
  if (!noticeApi) {
    return;
  }
  const timeStr = dayjs().tz().format("YYYY-MM-DD HH:mm:ss");
  // Server酱（sct.ftqq.com）：POST 表单 title + desp，微信推送
  if (noticeApi.includes("sctapi.ftqq.com")) {
    const form = new URLSearchParams();
    form.set("title", "短剧库告警");
    form.set("desp", `${msg}\n\n时间：${timeStr}`);
    await fetch(noticeApi, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    return;
  }
  // Bark 兼容（原逻辑）
  await fetch(noticeApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "转存失败",
      subtitle: "转存失败",
      body: `${msg}\n时间：${timeStr}`,
    }),
  });
};
