import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  unique,
} from "drizzle-orm/sqlite-core";

/**
 * D1（SQLite）表结构。由 drizzle-kit generate 生成建表 SQL，
 * 拿到 Cloudflare 控制台 D1 的 Console 里执行。
 *
 * 注意：SQLite 没有 datetime 类型，时间字段用 integer（unix 秒）+
 * mode: "timestamp"，drizzle 会自动转成 Date 对象。
 */
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  );

// 分类表定义
export const category = sqliteTable("category", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
});

export const resource = sqliteTable(
  "resource",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    categoryKey: text("category_key").notNull(),
    pinyin: text("pinyin").notNull().default(""),
    title: text("title").notNull(),
    desc: text("desc").notNull(),
    cover: text("cover").notNull().default(""),
    diskType: text("disk_type").notNull(), // 网盘类型
    url: text("url").notNull(), // 资源地址
    hotNum: integer("hot_num").notNull().default(0), // 热度，添加索引
    isShowHome: integer("is_show_home").default(0),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("idx_hot_num").on(table.hotNum),
    unique("unique_title").on(table.title),
  ],
);

export const user = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const resourceDisk = sqliteTable(
  "resource_disk",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    resourceId: integer("resource_id").notNull(),
    diskType: text("disk_type").notNull(),
    externalUrl: text("external_url").notNull(),
    url: text("url").notNull().default(""),
    updatedAt: updatedAt(),
  },
  (table) => [index("idx_resource_id").on(table.resourceId)],
);

// 导出类型定义，方便在应用中使用
export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export type Resource = typeof resource.$inferSelect;
export type User = typeof user.$inferSelect;

export type ResourceDisk = typeof resourceDisk.$inferSelect;
export type NewResourceDisk = typeof resourceDisk.$inferInsert;
