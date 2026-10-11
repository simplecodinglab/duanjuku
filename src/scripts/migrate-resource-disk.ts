import { d1 } from "./db-helper";

/**
 * 一次性迁移脚本：把旧版 resource 表的 url 拆成 resource_disk 行。
 * 当前库已经是新结构，一般不需要再跑。
 */
async function migrateResourceDisk() {
  try {
    console.log("开始迁移网盘数据...");
    console.log("连接 D1（Cloudflare REST API）...");

    const resources = d1("SELECT id, disk_type, url, updated_at FROM resource").results;
    console.log(`找到 ${resources.length} 条资源数据`);

    let successCount = 0;
    let errorCount = 0;

    for (const res of resources) {
      try {
        d1(
          "INSERT INTO resource_disk (resource_id, disk_type, external_url, url) VALUES (?, ?, ?, ?)",
          [res.id, res.disk_type, res.url, res.url],
        );
        successCount++;
      } catch (error) {
        console.error(`迁移资源 ID ${res.id} 失败:`, error);
        errorCount++;
      }
    }

    console.log("迁移完成！");
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);

    process.exit(0);
  } catch (error) {
    console.error("迁移失败:", error);
    process.exit(1);
  }
}

migrateResourceDisk();
