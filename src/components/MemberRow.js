// src/components/MemberRow.js
// Baris anggota di layar detail — avatar, nama, progress bayar, dan status badge

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from './StatusBadge';
import { hitungStatus, formatRupiah } from '../utils/statusHelper';

/**
 * @param {{ anggota: Object, onPress: Function, onDelete: Function }} props
 */
export default function MemberRow({ anggota, onPress, onDelete }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const status   = hitungStatus(anggota.dibayar, anggota.tagihan);
  const initials = anggota.nama
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const avatarBg  = colors.status[status]?.bg || colors.status.Belum.bg;
  const avatarText = colors.status[status]?.text || colors.status.Belum.text;

  return (
    <View style={s.row}>
      <TouchableOpacity style={s.mainContent} onPress={onPress} activeOpacity={0.7}>
        <View style={[s.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[s.avatarText, { color: avatarText }]}>{initials}</Text>
        </View>

        <View style={s.info}>
          <Text style={s.nama}>{anggota.nama}</Text>
          <Text style={s.nominal}>
            {formatRupiah(anggota.dibayar)}
            <Text style={s.tagihan}> / {formatRupiah(anggota.tagihan)}</Text>
          </Text>
        </View>

        <StatusBadge status={status} />
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => onDelete(anggota)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.red} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (c) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nama: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textPrimary,
    marginBottom: 2,
  },
  nominal: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textPrimary,
  },
  tagihan: {
    fontWeight: '400',
    color: c.textSecondary,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
