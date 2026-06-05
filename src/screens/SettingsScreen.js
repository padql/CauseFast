import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { exportMembers, importMembers } from '../utils/backup';
import * as Linking from 'expo-linking';

const SAWERIA_URL = 'https://saweria.co/qudalautt';

export default function SettingsScreen({ onBack }) {
  const { themeName, setThemeName, colors, allThemes } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportMembers();
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      await importMembers();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSaweria = () => {
    Linking.openURL(SAWERIA_URL);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[s.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="settings-outline" size={22} color={colors.textPrimary} style={{ marginRight: 6 }} />
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Pengaturan</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>TEMA TAMPILAN</Text>
        <Text style={[s.sectionDesc, { color: colors.textTertiary }]}>
          Pilih tema yang sesuai dengan selera kamu
        </Text>

        {Object.entries(allThemes).map(([key, theme]) => {
          const isActive = themeName === key;
          const tc = theme.colors;
          return (
            <TouchableOpacity
              key={key}
              style={[
                s.themeCard,
                {
                  backgroundColor: tc.bgCard,
                  borderColor: isActive ? colors.blue : colors.border,
                },
              ]}
              onPress={() => setThemeName(key)}
              activeOpacity={0.7}
            >
              <View style={s.themeLeft}>
                <View style={[s.radio, { borderColor: isActive ? colors.blue : colors.borderStrong }]}>
                  {isActive && <View style={[s.radioDot, { backgroundColor: colors.blue }]} />}
                </View>
                <View style={s.themeInfo}>
                  <Text style={[s.themeName, { color: colors.textPrimary }]}>{theme.name}</Text>
                  <Text style={[s.themeDesc, { color: colors.textTertiary }]}>{theme.description}</Text>
                </View>
              </View>

              <View style={s.swatches}>
                <View style={[s.swatch, { backgroundColor: tc.blue }]} />
                <View style={[s.swatch, { backgroundColor: tc.green }]} />
                <View style={[s.swatch, { backgroundColor: tc.orange }]} />
                {key === 'gelap' ? (
                  <View style={[s.swatch, { backgroundColor: tc.textPrimary }]} />
                ) : (
                  <View style={[s.swatch, { backgroundColor: tc.textPrimary }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>DATA ANGGOTA</Text>
        <Text style={[s.sectionDesc, { color: colors.textTertiary }]}>
          Backup atau pulihkan daftar anggota tetap
        </Text>

        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: colors.bgPrimary, borderColor: colors.border }]}
          onPress={handleExport}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="download-outline" size={20} color={colors.blue} style={{ marginRight: 12 }} />
          <View style={s.actionInfo}>
            <Text style={[s.actionTitle, { color: colors.textPrimary }]}>Backup Anggota</Text>
            <Text style={[s.actionDesc, { color: colors.textTertiary }]}>Download daftar anggota sebagai file JSON</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: colors.bgPrimary, borderColor: colors.border }]}
          onPress={handleImport}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={colors.blue} style={{ marginRight: 12 }} />
          <View style={s.actionInfo}>
            <Text style={[s.actionTitle, { color: colors.textPrimary }]}>Import Anggota</Text>
            <Text style={[s.actionDesc, { color: colors.textTertiary }]}>Pilih file JSON untuk mengimpor anggota</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        <View style={[s.infoBox, { backgroundColor: colors.bgPrimary, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
          <Text style={[s.infoText, { color: colors.textTertiary }]}>
            File backup berformat JSON. Import hanya menambahkan anggota baru yang belum terdaftar.
          </Text>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>DUKUNG APLIKASI</Text>
        <Text style={[s.sectionDesc, { color: colors.textTertiary }]}>
          Dukung pengembang lewat Saweria
        </Text>

        <TouchableOpacity
          style={[s.saweriaCard, { backgroundColor: colors.bgPrimary, borderColor: colors.orange }]}
          onPress={handleOpenSaweria}
          activeOpacity={0.7}
        >
          <View style={[s.saweriaIconWrap, { backgroundColor: colors.orange }]}>
            <Ionicons name="cafe" size={20} color="#fff" />
          </View>
          <View style={s.saweriaInfo}>
            <Text style={[s.saweriaTitle, { color: colors.textPrimary }]}>Saweria</Text>
            <Text style={[s.saweriaDesc, { color: colors.textTertiary }]}>saweria.co/qudalautt</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 16,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  swatches: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  saweriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  saweriaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  saweriaInfo: {
    flex: 1,
  },
  saweriaTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  saweriaDesc: {
    fontSize: 12,
  },
});
