import * as SQLite from 'expo-sqlite';

let db = null;

export function getDb() {
  if (!db) {
    try {
      db = SQLite.openDatabaseSync('patungan.db');
      initTables();
    } catch (e) {
      console.error('[database] init error:', e);
      throw e;
    }
  }
  return db;
}

function initTables() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      targetDana INTEGER NOT NULL,
      htm INTEGER NOT NULL DEFAULT 0,
      tanggal TEXT DEFAULT '',
      deadlinePembayaran TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_anggota (
      id TEXT PRIMARY KEY,
      eventId TEXT NOT NULL,
      nama TEXT NOT NULL,
      tagihan INTEGER NOT NULL,
      dibayar INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Belum',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_event_anggota_eventId ON event_anggota(eventId);
  `);
}
