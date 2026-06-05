// src/utils/statusHelper.js
// Logika kalkulasi status, progres, dan format rupiah

/**
 * Tentukan status bayar anggota secara otomatis.
 * @param {number} dibayar - Jumlah yang telah dibayar
 * @param {number} tagihan - Total tagihan
 * @returns {'Belum' | 'Nyicil' | 'Lunas'}
 */
export function hitungStatus(dibayar, tagihan) {
  if (!dibayar || dibayar <= 0) return 'Belum';
  if (dibayar >= tagihan) return 'Lunas';
  return 'Nyicil';
}

/**
 * Total dana terkumpul dari seluruh anggota.
 * @param {Array} anggota
 * @returns {number}
 */
export function hitungTotalTerkumpul(anggota) {
  return anggota.reduce((sum, a) => sum + (Number(a.dibayar) || 0), 0);
}

/**
 * Persentase progres dana (0.0 – 1.0).
 * Dibatasi maksimal 1 agar tidak melebihi 100%.
 * @param {number} terkumpul
 * @param {number} target
 * @returns {number}
 */
export function hitungPersentase(terkumpul, target) {
  if (!target || target <= 0) return 0;
  return Math.min(terkumpul / target, 1);
}

/**
 * Format angka ke string Rupiah.
 * Contoh: 500000 → "Rp 500.000"
 * @param {number} angka
 * @returns {string}
 */
export function formatRupiah(angka) {
  const num = Number(angka) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Hitung ringkasan status seluruh anggota untuk tampilan badge.
 * @param {Array} anggota
 * @returns {{ lunas: number, nyicil: number, belum: number }}
 */
export function hitungRingkasanStatus(anggota) {
  return anggota.reduce(
    (acc, a) => {
      const st = hitungStatus(a.dibayar, a.tagihan);
      acc[st === 'Lunas' ? 'lunas' : st === 'Nyicil' ? 'nyicil' : 'belum']++;
      return acc;
    },
    { lunas: 0, nyicil: 0, belum: 0 }
  );
}
