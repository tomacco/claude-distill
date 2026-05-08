import Database, { type Database as DatabaseType } from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const DISTILL_DIR = join(homedir(), ".claude", "distill");
const DB_PATH = join(DISTILL_DIR, "distill.db");

if (!existsSync(DISTILL_DIR)) {
  mkdirSync(DISTILL_DIR, { recursive: true });
}

const db: DatabaseType = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at TEXT,
    recalls_fired INTEGER DEFAULT 0,
    recalls_useful INTEGER DEFAULT 0,
    distill_run INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS access_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    session_id TEXT NOT NULL,
    query TEXT NOT NULL,
    action_type TEXT,
    files_returned TEXT,
    confidence REAL,
    retrieval_method TEXT,
    recall_id TEXT UNIQUE,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  CREATE TABLE IF NOT EXISTS usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    recall_id TEXT,
    files_used TEXT,
    files_ignored TEXT,
    decision TEXT,
    FOREIGN KEY (recall_id) REFERENCES access_log(recall_id)
  );

  CREATE TABLE IF NOT EXISTS retrieval_fixes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    file_path TEXT NOT NULL,
    fix_type TEXT,
    before_state TEXT,
    after_state TEXT,
    triggered_by TEXT
  );
`);

export default db;
export { DISTILL_DIR, DB_PATH };
