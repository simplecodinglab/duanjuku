import bcrypt from "bcryptjs";
import { d1 } from "./db-helper";

async function createAdmin() {
  try {
    console.log("连接 D1（Cloudflare REST API）...");

    const username = "admin@qq.com";
    const plainPassword = "test123";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const existing = d1("SELECT id FROM user WHERE username = ?", [username]).results;

    if (existing.length > 0) {
      console.log("用户名已存在，将更新密码");
      d1("UPDATE user SET password = ? WHERE username = ?", [hashedPassword, username]);
    } else {
      console.log("创建新管理员用户");
      d1("INSERT INTO user (username, password) VALUES (?, ?)", [username, hashedPassword]);
    }

    console.log("管理员用户创建/更新成功！");
    console.log("用户名:", username);
    console.log("密码:", plainPassword);
    console.log("注意：上线后请立即在后台修改默认密码。");

    process.exit(0);
  } catch (error) {
    console.error("创建管理员用户失败:", error);
    process.exit(1);
  }
}

createAdmin();
