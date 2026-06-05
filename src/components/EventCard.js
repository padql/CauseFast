// src/components/EventCard.js
// Kartu acara di layar daftar — menampilkan progres dan ringkasan status

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from './ProgressBar';
import {
  hitungTotalTerkumpul,
  hitungPersentase,
  hitungRingkasanStatus,
  formatRupiah,
} from '../utils/statusHelper';

/** @param {{ event: Object, onPress: Function }} */
export default function EventCard({ event, onPress }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const terkumpul = hitungTotalTerkumpul(event.anggota);
  const persen    = hitungPersentase(terkumpul, event.targetDana);
  const ringkasan = hitungRingkasanStatus(event.anggota);
  const persenPct = Math.round(persen * 100);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.row}>
        <Text style={s.nama} numberOfLines={1}>{event.nama}</Text>
        <Text style={s.persen}>{persenPct}%</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 10 }}>
        <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
        <Text style={s.sub}>
          {event.tanggal}
          {event.deadlinePembayaran && event.deadlinePembayaran !== 'Belum ditentukan' ? `  ·  Deadline: ${event.deadlinePembayaran}` : ''}
          {' · '}{event.anggota.length} anggota
        </Text>
      </View>

      <View style={s.progressWrap}>
        <ProgressBar persen={persen} height={7} />
      </View>

      <View style={s.row}>
        <Text style={s.terkumpul}>{formatRupiah(terkumpul)}</Text>
        <Text style={s.target}>/ {formatRupiah(event.targetDana)}</Text>
      </View>

      <View style={s.badges}>
        {ringkasan.lunas > 0 && (
          <View style={[s.chip, { backgroundColor: colors.status.Lunas.bg }]}>
            <Ionicons name="checkmark-circle" size={11} color={colors.status.Lunas.text} style={{ marginRight: 3 }} />
            <Text style={[s.chipText, { color: colors.status.Lunas.text }]}>
              {ringkasan.lunas} Lunas
            </Text>
          </View>
        )}
        {ringkasan.nyicil > 0 && (
          <View style={[s.chip, { backgroundColor: colors.status.Nyicil.bg }]}>
            <Ionicons name="time-outline" size={11} color={colors.status.Nyicil.text} style={{ marginRight: 3 }} />
            <Text style={[s.chipText, { color: colors.status.Nyicil.text }]}>
              {ringkasan.nyicil} Nyicil
            </Text>
          </View>
        )}
        {ringkasan.belum > 0 && (
          <View style={[s.chip, { backgroundColor: colors.status.Belum.bg }]}>
            <Ionicons name="ellipse-outline" size={11} color={colors.status.Belum.text} style={{ marginRight: 3 }} />
            <Text style={[s.chipText, { color: colors.status.Belum.text }]}>
              {ringkasan.belum} Belum
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (c) => StyleSheet.create({
  card: {
    backgroundColor: c.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: c.textPrimary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  nama: {
    fontSize: 16,
    fontWeight: '700',
    color: c.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  persen: {
    fontSize: 14,
    fontWeight: '700',
    color: c.blue,
  },
  sub: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  progressWrap: {
    marginBottom: 8,
  },
  terkumpul: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textPrimary,
  },
  target: {
    fontSize: 12,
    color: c.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
