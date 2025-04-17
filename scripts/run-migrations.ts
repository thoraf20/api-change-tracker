// scripts/run-migrations.ts
import fs from "fs";
import path from "path";
import db from "../src/config/db";

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort(); // Ensure files run in order

  console.log(`🛠 Running ${files.length} migrations...\n`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    try {
      console.log(`⬆ Running: ${file}`);
      await db.query(sql);
      console.log(`✅ Done: ${file}\n`);
    } catch (err) {
      console.error(`❌ Failed on ${file}:`, err);
      process.exit(1);
    }
  }

  console.log("🎉 All migrations completed!");
  process.exit(0);
}

runMigrations();
