-- panxiaozi 建表 SQL（Cloudflare D1 用）
-- 用法：Cloudflare 控制台 → D1 → 点数据库 → Console → 粘贴执行
-- 由 drizzle-kit generate 从 src/lib/db/schema.ts 生成

CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL
);

CREATE UNIQUE INDEX `category_key_unique` ON `category` (`key`);
CREATE TABLE `resource` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_key` text NOT NULL,
	`pinyin` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`desc` text NOT NULL,
	`cover` text DEFAULT '' NOT NULL,
	`disk_type` text NOT NULL,
	`url` text NOT NULL,
	`hot_num` integer DEFAULT 0 NOT NULL,
	`is_show_home` integer DEFAULT 0,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX `idx_hot_num` ON `resource` (`hot_num`);
CREATE UNIQUE INDEX `unique_title` ON `resource` (`title`);
CREATE TABLE `resource_disk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`resource_id` integer NOT NULL,
	`disk_type` text NOT NULL,
	`external_url` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX `idx_resource_id` ON `resource_disk` (`resource_id`);
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
