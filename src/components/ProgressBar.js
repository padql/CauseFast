// src/components/ProgressBar.js
// Progress bar visual dengan warna dinamis berdasarkan persentase

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * @param {number}  persen  - Nilai 0.0 sampai 1.0
 * @param {number}  height  - Tinggi bar dalam px (default 8)
 */
export default function ProgressBar({ persen = 0, height = 8 }) {
  const { colors } = useTheme();
  const clampedPersen = Math.max(0, Math.min(persen, 1));
  const fillColor = colors.progressColor(clampedPersen);

  return (
    <View style={[s.track, { height, borderRadius: height / 2, backgroundColor: colors.progressTrack }]}>
      <View
        style={[
          s.fill,
          {
            width: `${clampedPersen * 100}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    minWidth: 4,
  },
});
