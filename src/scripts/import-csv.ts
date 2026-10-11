/**
 * 资源批量导入脚本
 *
 * 用法：
 *   npx tsx src/scripts/import-csv.ts <csv路径> [--write] [--self-test]
 *
 * - 默认是 dry-run：只校验 CSV 并打印报告，不写数据库
 * - 加 --write 才真正写入数据库
 * - --self-test：不连数据库，只跑纯函数自检（CSV 解析 / 校验 / 拼音 slug）
 *
 * CSV 列（与《资源批量导入模板.csv》一致）：
 *   0 标题, 1 分类key, 2 网盘类型, 3 第三方链接, 4 简介, 5 拼音slug, 6 首页展示(0/1)
 *
 * 写入逻辑（双表）：
 *   resource 表：标题/分类/简介/拼音/网盘类型/首页展示（url 字段沿用旧习惯填第三方链接）
 *   resource_disk 表：resourceId + diskType + externalUrl=第三方链接 + url=""（留空）
 *   url 留空是关键：访客首次点击时 /api/resource-disk/update 会触发 QUARK_API
 *   自动转存，把转存后的链接回填到 url 字段。
 *
 * 导入后缓存：首页是 ISR（60 秒自动刷新），热门榜 unstable_cache 30 分钟，
 * 新数据无需手动清缓存。
 */
import fs from "node:fs";
import path from "node:path";
import { titleToPinyinSlug } from "./pinyin-map";

const DISK_TYPES = ["夸克", "百度", "阿里云盘"] as const;
const URL_RE = /^https?:\/\//i;

/* ---------------- 纯函数：CSV 解析 / 校验（可独立测试） ---------------- */

export function parseCSV(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // 去 BOM
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // 等待 \n
    } else if (c === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

export interface PreparedRow {
  line: number;
  title: string;
  categoryKey: string;
  diskType: string;
  externalUrl: string;
  desc: string;
  pinyin: string;
  isShowHome: 0 | 1;
}

export interface SkippedRow {
  line: number;
  title: string;
  reason: string;
}

export interface PrepareResult {
  valid: PreparedRow[];
  skipped: SkippedRow[];
}

/**
 * 校验并整理数据行（跳过第 1 行表头）。
 * existingTitles / existingPinyins：库中已有；categoryKeys：分类表 key 集合。
 */
export function prepareRows(
  rows: string[][],
  existingTitles: Set<string>,
  existingPinyins: Set<string>,
  categoryKeys: Set<string>,
): PrepareResult {
  const valid: PreparedRow[] = [];
  const skipped: SkippedRow[] = [];
  const seenTitles = new Set<string>();
  const seenPinyins = new Set<string>(existingPinyins);

  const uniquePinyin = (base: string): string => {
    let slug = base;
    let n = 2;
    while (seenPinyins.has(slug)) {
      slug = `${base}-${n}`;
      n++;
    }
    seenPinyins.add(slug);
    return slug;
  };

  for (let i = 1; i < rows.length; i++) {
    const line = i + 1;
    const cells = rows[i].map((c) => c.trim());
    while (cells.length < 7) cells.push("");
    const [title, categoryKey, diskType, externalUrl, desc, pinyinRaw, showHomeRaw] =
      cells;
    const skip = (reason: string): void => {
      skipped.push({ line, title: title || "(空标题)", reason });
    };

    if (cells.slice(0, 4).every((c) => c === "")) continue; // 全空行跳过
    if (!title) {
      skip("标题为空");
      continue;
    }
    if (existingTitles.has(title) || seenTitles.has(title)) {
      skip("标题已存在（库中或本文件内重复），跳过");
      continue;
    }
    if (!categoryKeys.has(categoryKey)) {
      skip(`分类key「${categoryKey}」在后台分类管理中不存在`);
      continue;
    }
    if (!(DISK_TYPES as readonly string[]).includes(diskType)) {
      skip(`网盘类型「${diskType}」非法，只能填：${DISK_TYPES.join(" / ")}`);
      continue;
    }
    if (!externalUrl || !URL_RE.test(externalUrl)) {
      skip("第三方链接为空或不是 http(s) 链接");
      continue;
    }
    if (/x{3,}/i.test(externalUrl)) {
      skip("疑似模板示例行（链接含 xxxx），跳过");
      continue;
    }

    let slug = pinyinRaw
      ? pinyinRaw.toLowerCase().replace(/\s+/g, "-")
      : titleToPinyinSlug(title);
    if (!slug) slug = `r-${line}`;
    slug = uniquePinyin(slug);

    seenTitles.add(title);
    valid.push({
      line,
      title,
      categoryKey,
      diskType,
      externalUrl,
      desc,
      pinyin: slug,
      isShowHome: showHomeRaw === "1" ? 1 : 0,
    });
  }
  return { valid, skipped };
}

/* ---------------- 自检（不连数据库） ---------------- */

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error(`自检失败：${msg}`);
    process.exit(1);
  }
}

export function runSelfTest(): void {
  // CSV 解析
  const t1 = parseCSV('a,"b,c","d""e"\r\n1,2,3\n');
  assert(t1.length === 2, "parseCSV 行数");
  assert(t1[0][1] === "b,c", "parseCSV 引号内逗号");
  assert(t1[0][2] === 'd"e', "parseCSV 转义引号");
  const t2 = parseCSV("﻿标题,分类key\nx,y\n"); // BOM
  assert(t2[0][0] === "标题", "parseCSV 去 BOM");
  const t3 = parseCSV('a,"多\n行"\n');
  assert(t3[0][1] === "多\n行", "parseCSV 引号内换行");

  // 拼音 slug
  assert(
    titleToPinyinSlug("赘婿之王归来") === "zhui-xu-zhi-wang-gui-lai",
    "拼音 slug 基本",
  );
  assert(titleToPinyinSlug("斗罗大陆 2") === "dou-luo-da-lu-2", "拼音 slug 数字");
  assert(titleToPinyinSlug("ABC") === "abc", "拼音 slug 纯英文");
  assert(titleToPinyinSlug("重生之我在2024") === "zhong-sheng-zhi-wo-zai-2024", "拼音 slug 混合");

  // 行校验
  const rows = parseCSV(
    "标题,分类key,网盘类型,第三方链接,简介,拼音slug,首页展示(0/1)\n" +
      "赘婿之王归来,duanju,夸克,https://pan.quark.cn/s/abcd,简介,,1\n" +
      "赘婿之王归来,duanju,夸克,https://pan.quark.cn/s/efgh,,,\n" +
      "已存在的剧,duanju,夸克,https://pan.quark.cn/s/ijkl,,,\n" +
      "错分类的剧,badkey,夸克,https://pan.quark.cn/s/mnop,,,\n" +
      "错网盘的剧,duanju,迅雷,https://pan.quark.cn/s/qrst,,,\n" +
      "示例行,duanju,夸克,https://pan.quark.cn/s/xxxxxxxxxxxx,,,\n" +
      "同拼音剧,duanju,百度,https://pan.baidu.com/s/uvwx,,zhui-xu-zhi-wang-gui-lai,\n",
  );
  const r = prepareRows(
    rows,
    new Set(["已存在的剧"]),
    new Set(),
    new Set(["duanju"]),
  );
  assert(r.valid.length === 2, `valid 行数=${r.valid.length}`);
  assert(r.valid[0].pinyin === "zhui-xu-zhi-wang-gui-lai", "自动拼音");
  assert(r.valid[0].isShowHome === 1, "首页展示=1");
  assert(r.valid[1].pinyin === "zhui-xu-zhi-wang-gui-lai-2", "拼音去重");
  assert(r.valid[1].isShowHome === 0, "首页展示默认 0");
  assert(r.skipped.length === 5, `skipped 行数=${r.skipped.length}`);

  console.log("全部自检通过 ✓");
}

/* ---------------- 数据库（D1 REST API，见 db-helper.ts） ---------------- */

async function runImport(csvPath: string, write: boolean): Promise<void> {
  const text = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(text);
  if (rows.length < 2) {
    console.log("CSV 没有数据行（只有表头或空文件）。");
    return;
  }

  const { d1, d1Insert } = await import("./db-helper");
  try {
    const titleRows = d1("SELECT title FROM resource").results;
    const pinyinRows = d1("SELECT pinyin FROM resource").results;
    const catRows = d1("SELECT `key` FROM category").results;

    const { valid, skipped } = prepareRows(
      rows,
      new Set(titleRows.map((r) => String(r.title))),
      new Set(pinyinRows.map((r) => String(r.pinyin))),
      new Set(catRows.map((r) => String(r.key))),
    );

    console.log(`共 ${rows.length - 1} 行数据：可导入 ${valid.length} 行，跳过 ${skipped.length} 行。`);
    for (const s of skipped) {
      console.log(`  [跳过] 第 ${s.line} 行「${s.title}」：${s.reason}`);
    }
    if (valid.length > 0) {
      console.log("将导入：");
      for (const v of valid) {
        console.log(
          `  [${v.line}] ${v.title} ｜ ${v.categoryKey} ｜ ${v.diskType} ｜ slug=${v.pinyin} ｜ 首页=${v.isShowHome}`,
        );
      }
    }

    if (!write) {
      console.log("\n dry-run 模式，未写入数据库。确认无误后加 --write 执行。");
      return;
    }

    let ok = 0;
    for (const v of valid) {
      const resourceId = d1Insert(
        `INSERT INTO resource
           (category_key, pinyin, title, \`desc\`, cover, disk_type, url, hot_num, is_show_home)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [v.categoryKey, v.pinyin, v.title, v.desc, "", v.diskType, v.externalUrl, v.isShowHome],
      );
      d1(
        `INSERT INTO resource_disk (resource_id, disk_type, external_url, url)
         VALUES (?, ?, ?, '')`,
        [resourceId, v.diskType, v.externalUrl],
      );
      ok++;
      if (ok % 100 === 0) console.log(`  已导入 ${ok}/${valid.length} ...`);
    }
    console.log(`\n导入完成：成功 ${ok} 行。`);
    console.log("提示：新数据即时生效，无需手动清缓存。");
  } finally {
    // REST API 无连接可关
  }
}

/* ---------------- 入口 ---------------- */

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) {
    runSelfTest();
    return;
  }
  const csvPath = args.find((a: string) => !a.startsWith("--"));
  if (!csvPath) {
    console.log("用法：npx tsx src/scripts/import-csv.ts <csv路径> [--write] [--self-test]");
    process.exit(1);
  }
  await runImport(path.resolve(csvPath), args.includes("--write"));
}

main().catch((e) => {
  console.error("执行失败：", e);
  process.exit(1);
});
