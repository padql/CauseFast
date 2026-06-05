import { getDb } from './database';
import { hitungStatus } from './statusHelper';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString();
}

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────

export async function getAllEvents() {
  const db = getDb();
  const events = db.getAllSync('SELECT * FROM events ORDER BY createdAt DESC');
  for (const event of events) {
    event.anggota = db.getAllSync(
      'SELECT * FROM event_anggota WHERE eventId = ? ORDER BY createdAt ASC',
      [event.id]
    );
  }
  return events;
}

export async function getEventById(eventId) {
  const db = getDb();
  const event = db.getFirstSync('SELECT * FROM events WHERE id = ?', [eventId]);
  if (!event) return null;
  event.anggota = db.getAllSync(
    'SELECT * FROM event_anggota WHERE eventId = ? ORDER BY createdAt ASC',
    [eventId]
  );
  return event;
}

export async function createEvent({ nama, targetDana, htm, tanggal, deadlinePembayaran, anggota }) {
  const db = getDb();
  const id = newId('evt');
  const createdAt = now();
  const eventData = {
    id,
    nama: nama.trim(),
    targetDana: Number(targetDana),
    htm: htm ? Number(htm) : 0,
    tanggal: tanggal?.trim() || 'Belum ditentukan',
    deadlinePembayaran: deadlinePembayaran?.trim() || 'Belum ditentukan',
    createdAt,
  };

  db.runSync(
    'INSERT INTO events (id, nama, targetDana, htm, tanggal, deadlinePembayaran, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [eventData.id, eventData.nama, eventData.targetDana, eventData.htm, eventData.tanggal, eventData.deadlinePembayaran, eventData.createdAt]
  );

  const anggotaList = (anggota || []).map((a) => ({
    id: newId('ang'),
    eventId: id,
    nama: a.nama,
    tagihan: Number(a.tagihan),
    dibayar: Number(a.dibayar) || 0,
    status: 'Belum',
    createdAt: now(),
  }));

  for (const a of anggotaList) {
    db.runSync(
      'INSERT INTO event_anggota (id, eventId, nama, tagihan, dibayar, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [a.id, a.eventId, a.nama, a.tagihan, a.dibayar, a.status, a.createdAt]
    );
  }

  return { ...eventData, anggota: anggotaList };
}

export async function updateEvent(eventId, data) {
  const db = getDb();
  const existing = db.getFirstSync('SELECT * FROM events WHERE id = ?', [eventId]);
  if (!existing) return null;

  const updated = {
    ...existing,
    nama: data.nama?.trim() ?? existing.nama,
    targetDana: data.targetDana != null ? Number(data.targetDana) : existing.targetDana,
    htm: data.htm != null ? Number(data.htm) : existing.htm,
    tanggal: data.tanggal?.trim() ?? existing.tanggal,
    deadlinePembayaran: data.deadlinePembayaran?.trim() ?? existing.deadlinePembayaran,
  };

  db.runSync(
    'UPDATE events SET nama = ?, targetDana = ?, htm = ?, tanggal = ?, deadlinePembayaran = ? WHERE id = ?',
    [updated.nama, updated.targetDana, updated.htm, updated.tanggal, updated.deadlinePembayaran, eventId]
  );

  updated.anggota = db.getAllSync(
    'SELECT * FROM event_anggota WHERE eventId = ? ORDER BY createdAt ASC',
    [eventId]
  );
  return updated;
}

export async function deleteEvent(eventId) {
  const db = getDb();
  db.runSync('DELETE FROM event_anggota WHERE eventId = ?', [eventId]);
  db.runSync('DELETE FROM events WHERE id = ?', [eventId]);
}

// ─── ANGGOTA ──────────────────────────────────────────────────────────────────

export async function addAnggota(eventId, { nama, tagihan }) {
  const db = getDb();
  const event = db.getFirstSync('SELECT id FROM events WHERE id = ?', [eventId]);
  if (!event) return null;

  const anggotaBaru = {
    id: newId('ang'),
    eventId,
    nama: nama.trim(),
    tagihan: Number(tagihan),
    dibayar: 0,
    status: 'Belum',
    createdAt: now(),
  };

  db.runSync(
    'INSERT INTO event_anggota (id, eventId, nama, tagihan, dibayar, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [anggotaBaru.id, anggotaBaru.eventId, anggotaBaru.nama, anggotaBaru.tagihan, anggotaBaru.dibayar, anggotaBaru.status, anggotaBaru.createdAt]
  );

  const updated = db.getFirstSync('SELECT * FROM events WHERE id = ?', [eventId]);
  updated.anggota = db.getAllSync(
    'SELECT * FROM event_anggota WHERE eventId = ? ORDER BY createdAt ASC',
    [eventId]
  );
  return updated;
}

export async function deleteAnggota(eventId, anggotaId) {
  const db = getDb();
  db.runSync('DELETE FROM event_anggota WHERE id = ? AND eventId = ?', [anggotaId, eventId]);
  const updated = db.getFirstSync('SELECT * FROM events WHERE id = ?', [eventId]);
  if (!updated) return null;
  updated.anggota = db.getAllSync(
    'SELECT * FROM event_anggota WHERE eventId = ? ORDER BY createdAt ASC',
    [eventId]
  );
  return updated;
}

export async function updatePembayaran(eventId, anggotaId, dibayarBaru) {
  const db = getDb();
  const anggota = db.getFirstSync(
    'SELECT * FROM event_anggota WHERE id = ? AND eventId = ?',
    [anggotaId, eventId]
  );
  if (!anggota) return null;

  const validated = Math.max(0, Math.min(Number(dibayarBaru), anggota.tagihan));
  const status = hitungStatus(validated, anggota.tagihan);

  db.runSync(
    'UPDATE event_anggota SET dibayar = ?, status = ? WHERE id = ?',
    [validated, status, anggotaId]
  );

  const updated = db.getFirstSync('SELECT * FROM events WHERE id = ?', [eventId]);
  updated.anggota = db.getAllSync(
    'SELECT * FROM event_anggota WHERE eventId = ? ORDER BY createdAt ASC',
    [eventId]
  );
  return updated;
}

export async function updateAnggota(eventId, anggotaId, data) {
  const db = getDb();
  const existing = db.getFirstSync(
    'SELECT * FROM event_anggota WHERE id = ? AND eventId = ?',
    [anggotaId, eventId]
  );
  if (!existing) return null;

  const nama = data.nama != null ? data.nama.trim() : existing.nama;
  const tagihan = data.tagihan != null ? Number(data.tagihan) : existing.tagihan;

  db.runSync(
    'UPDATE event_anggota SET nama = ?, tagihan = ? WHERE id = ?',
    [nama, tagihan, anggotaId]
  );

  const updated = db.getFirstSync('SELECT * FROM events WHERE id = ?', [eventId]);
  updated.anggota = db.getAllSync(
    'SELECT * FROM event_anggota WHERE eventId = ? ORDER BY createdAt ASC',
    [eventId]
  );
  return updated;
}

// ─── GLOBAL MEMBERS ──────────────────────────────────────────────────────────

export async function getAllMembers() {
  const db = getDb();
  return db.getAllSync('SELECT * FROM members ORDER BY createdAt ASC');
}

export async function createMember(nama) {
  const db = getDb();
  const member = {
    id: newId('mbr'),
    nama: nama.trim(),
    createdAt: now(),
  };
  db.runSync('INSERT INTO members (id, nama, createdAt) VALUES (?, ?, ?)', [member.id, member.nama, member.createdAt]);
  return member;
}

export async function updateMember(memberId, namaBaru) {
  const db = getDb();
  db.runSync('UPDATE members SET nama = ? WHERE id = ?', [namaBaru.trim(), memberId]);
  return db.getFirstSync('SELECT * FROM members WHERE id = ?', [memberId]);
}

export async function deleteMember(memberId) {
  const db = getDb();
  db.runSync('DELETE FROM members WHERE id = ?', [memberId]);
}

// ─── DEV ──────────────────────────────────────────────────────────────────────

export async function clearAllData() {
  const db = getDb();
  db.execSync('DELETE FROM event_anggota; DELETE FROM events; DELETE FROM members;');
}
