const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./games.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, platform TEXT, status TEXT, device_id TEXT, updated_at TEXT)");

    // Idempotent migrations — only add the columns if missing.
    db.all("PRAGMA table_info(games)", [], (err, cols) => {
        if (err) { console.error("PRAGMA failed:", err); return; }
        const names = cols.map(c => c.name);
        const now = new Date().toISOString();
        if (!names.includes('device_id')) {
            db.run("ALTER TABLE games ADD COLUMN device_id TEXT", [], e => {
                if (e) console.error("migrate device_id:", e.message);
            });
        }
        if (!names.includes('updated_at')) {
            db.run("ALTER TABLE games ADD COLUMN updated_at TEXT", [], e => {
                if (e) console.error("migrate updated_at:", e.message);
                else db.run("UPDATE games SET updated_at = ? WHERE updated_at IS NULL", [now]);
            });
        }
    });
});

module.exports = db;
