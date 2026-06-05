import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from '../components/ProgressBar';
import { formatRupiah, hitungPersentase, hitungStatus } from '../utils/statusHelper';

const SHORTCUTS = [50000, 100000, 200000];

export default function UpdatePayModal({ visible, anggota, onClose, onSimpan }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [inputNominal, setInputNominal] = useState('');
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (visible) setInputNominal('');
  }, [visible, anggota?.id]);

  if (!anggota) return null;

  const dibayarSekarang = Number(anggota.dibayar) || 0;
  const tagihan         = Number(anggota.tagihan) || 0;
  const sisa            = tagihan - dibayarSekarang;
  const persen          = hitungPersentase(dibayarSekarang, tagihan);

  const handleSimpan = async () => {
    const tambah = Number(inputNominal.replace(/\D/g, ''));
    if (!tambah || tambah <= 0) {
      Alert.alert('Input tidak valid', 'Masukkan jumlah pembayaran yang valid.');
      return;
    }
    if (tambah > sisa) {
      Alert.alert(
        'Melebihi tagihan',
        `Maksimal yang bisa dibayar adalah ${formatRupiah(sisa)}.`
      );
      return;
    }
    setLoading(true);
    await onSimpan(anggota.id, dibayarSekarang + tambah);
    setLoading(false);
    setInputNominal('');
  };

  const handleLunas = () => {
    setInputNominal(String(sisa));
  };

  const handleClose = () => {
    setInputNominal('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.container}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.keyboardWrap}
        >
          <View style={s.sheet}>
            <View style={s.handle} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="card-outline" size={20} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={s.title}>Update Pembayaran</Text>
            </View>
            <Text style={s.anggotaNama}>{anggota.nama}</Text>

            <View style={s.summaryBox}>
              <View style={s.summaryCol}>
                <Text style={s.summaryLabel}>Sudah Dibayar</Text>
                <Text style={[s.summaryValue, { color: colors.green }]}>
                  {formatRupiah(dibayarSekarang)}
                </Text>
              </View>
              <View style={s.divider} />
              <View style={[s.summaryCol, { alignItems: 'flex-end' }]}>
                <Text style={s.summaryLabel}>Sisa Tagihan</Text>
                <Text style={[s.summaryValue, { color: colors.red }]}>
                  {formatRupiah(sisa)}
                </Text>
              </View>
            </View>

            <ProgressBar persen={persen} height={8} />
            <Text style={s.persenText}>
              {Math.round(persen * 100)}% dari {formatRupiah(tagihan)}
            </Text>

            <Text style={s.label}>Tambah Cicilan (Rp)</Text>
            <TextInput
              style={s.input}
              placeholder="Masukkan nominal..."
              placeholderTextColor={colors.textTertiary}
              value={inputNominal}
              onChangeText={setInputNominal}
              keyboardType="numeric"
              autoFocus
            />

            <View style={s.shortcuts}>
              {SHORTCUTS.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={s.chip}
                  onPress={() => setInputNominal(String(v))}
                >
                  <Text style={s.chipText}>+{v / 1000}rb</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[s.chip, { backgroundColor: colors.status.Lunas.bg, borderColor: colors.status.Lunas.dot }]}
                onPress={handleLunas}
                disabled={sisa <= 0}
              >
                <Ionicons name="checkmark-circle" size={16} color={colors.status.Lunas.text} style={{ marginRight: 4 }} />
                <Text style={[s.chipText, { color: colors.status.Lunas.text }]}>Lunas</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.btnPrimary, (loading || sisa <= 0) && s.btnDisabled]}
              onPress={handleSimpan}
              disabled={loading || sisa <= 0}
            >
              {sisa <= 0 ? (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={s.btnPrimaryText}>Sudah Lunas</Text>
                </>
              ) : loading ? (
                <Text style={s.btnPrimaryText}>Menyimpan...</Text>
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={s.btnPrimaryText}>Simpan Pembayaran</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={s.btnCancel} onPress={handleClose}>
              <Text style={s.btnCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (c) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  keyboardWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: c.bgPrimary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: c.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: c.textPrimary,
  },
  anggotaNama: {
    fontSize: 14,
    color: c.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: c.bgSecondary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  summaryCol: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: c.border,
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 11,
    color: c.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  persenText: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: c.blue,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    color: c.textPrimary,
    backgroundColor: c.bgSecondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: c.bgSecondary,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: c.textPrimary,
  },
  btnPrimary: {
    backgroundColor: c.blue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  btnCancel: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCancelText: {
    color: c.textSecondary,
    fontSize: 15,
  },
});
