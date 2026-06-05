// src/components/StatusBadge.js
// Badge kecil yang menampilkan status: Lunas / Nyicil / Belum

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ICON = {
  Lunas:  { name: 'checkmark-circle', size: 12 },
  Nyicil: { name: 'time-outline', size: 12 },
  Belum:  { name: 'ellipse-outline', size: 12 },
};

const LABEL = {
  Lunas:  'Lunas',
  Nyicil: 'Nyicil',
  Belum:  'Belum',
};

export default function StatusBadge({ status }) {
  const { colors } = useTheme();
  const theme = colors.status[status] || colors.status.Belum;
  const icon = ICON[status] || ICON.Belum;
  return (
    <View style={[s.badge, { backgroundColor: theme.bg }]}>
      <Ionicons name={icon.name} size={icon.size} color={theme.text} style={{ marginRight: 3 }} />
      <Text style={[s.text, { color: theme.text }]}>{LABEL[status] ?? status}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
