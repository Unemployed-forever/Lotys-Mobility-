import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db";

let migration: Promise<void> | null = null;

/**
 * Applies the SQL migrations in /drizzle once per server process.
 * The initial migration uses IF NOT EXISTS, so it is safe on databases that were
 * previously prepared with `drizzle-kit push`.
 */
export function runMigrations() {
  if (!migration) {
    migration = migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") })
      .then(() => console.log("[lotys] Datenbank-Migrationen geprüft."))
      .catch((error) => {
        console.error("[lotys] Datenbank-Migration fehlgeschlagen", error);
        migration = null;
      });
  }
  return migration;
}
