import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import {
  hitungTotalTerkumpul,
  hitungPersentase,
  hitungStatus,
  formatRupiah,
} from './statusHelper';

function formatTanggal(str) {
  if (!str || str === 'Belum ditentukan') return str || 'Belum ditentukan';
  const [y, m, d] = str.split('-');
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${parseInt(d)} ${bulan[parseInt(m) - 1]} ${y}`;
}

export async function shareKeWhatsApp(event) {
  const { nama, targetDana, tanggal, anggota } = event;

  const terkumpul = hitungTotalTerkumpul(anggota);
  const persen = Math.round(hitungPersentase(terkumpul, targetDana) * 100);
  const sisa = targetDana - terkumpul;

  const lunas  = anggota.filter((a) => hitungStatus(a.dibayar, a.tagihan) === 'Lunas');
  const nyicil = anggota.filter((a) => hitungStatus(a.dibayar, a.tagihan) === 'Nyicil');
  const belum  = anggota.filter((a) => hitungStatus(a.dibayar, a.tagihan) === 'Belum');

  const padding = 18;

  const renderDaftar = (arr, renderBaris) =>
    arr.length > 0
      ? arr.map((a, i) => {
          const baris = renderBaris(a);
          const dots = '.'.repeat(Math.max(2, padding - a.nama.length - baris.length));
          return `  ${i + 1}. ${a.nama} ${dots} ${baris}`;
        }).join('\n')
      : '  (tidak ada)';

  const garis = '────────────────────────────';

  const laporan = [
    'LAPORAN KAS ACARA',
    garis,
    '',
    `Acara        : ${nama}`,
    `Tanggal      : ${formatTanggal(tanggal)}`,
    ...(event.deadlinePembayaran && event.deadlinePembayaran !== 'Belum ditentukan'
      ? [`Deadline     : ${formatTanggal(event.deadlinePembayaran)}`]
      : []),
    `Target       : ${formatRupiah(targetDana)}`,
    `Terkumpul    : ${formatRupiah(terkumpul)} (${persen}%)`,
    `Sisa tagihan : ${formatRupiah(sisa)}`,
    '',
    ...(lunas.length > 0
      ? [`LUNAS (${lunas.length}):`, renderDaftar(lunas, (a) => formatRupiah(a.tagihan)), '']
      : []),
    ...(nyicil.length > 0
      ? [`NYICIL (${nyicil.length}):`, renderDaftar(nyicil, (a) => `${formatRupiah(a.dibayar)}/${formatRupiah(a.tagihan)}`), '']
      : []),
    ...(belum.length > 0
      ? [`BELUM BAYAR (${belum.length}):`, renderDaftar(belum, (a) => formatRupiah(a.tagihan)), '']
      : []),
    `Total partisipan: ${anggota.length} orang`,
    
    '',
    'Dikirim via CauseFast',
  ].join('\n');

  const encoded = encodeURIComponent(laporan);
  const url = Platform.OS === 'web'
    ? `https://wa.me/?text=${encoded}`
    : `whatsapp://send?text=${encoded}`;

  try {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      const bisaBuka = await Linking.canOpenURL(url);
      await Linking.openURL(bisaBuka ? url : `https://wa.me/?text=${encoded}`);
    }
  } catch {
    Alert.alert(
      'Gagal Membuka WhatsApp',
      'Pastikan WhatsApp sudah terinstal di HP kamu.',
      [{ text: 'OK' }]
    );
  }
}
