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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getAllMembers } from '../utils/storage';

export default function AddAnggotaModal({ visible, onClose, onSubmit, existingAnggota }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [members, setMembers]     = useState([]);
  const [selectedIds, setSelected] = useState([]);
  const [tagihan, setTagihan]     = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (visible) {
      loadAvailableMembers();
      setSelected([]);
    }
  }, [visible]);

  const loadAvailableMembers = async () => {
    const all = await getAllMembers();
    const existingNames = (existingAnggota || []).map((a) => a.nama.toLowerCase());
    setMembers(all.filter((m) => !existingNames.includes(m.nama.toLowerCase())));
  };

  const toggleMember = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === members.length) {
      setSelected([]);
    } else {
      setSelected(members.map((m) => m.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Pilih Anggota', 'Pilih minimal satu anggota.');
      return;
    }
    const tagihanNum = Number(tagihan.replace(/\D/g, ''));
    if (!tagihanNum || tagihanNum <= 0) {
      Alert.alert('Wajib diisi', 'Nominal tagihan harus lebih dari 0.');
      return;
    }
    setLoading(true);
    for (const id of selectedIds) {
      const m = members.find((x) => x.id === id);
      await onSubmit({ nama: m.nama, tagihan: tagihanNum });
    }
    setLoading(false);
    setSelected([]);
    setTagihan('');
    onClose();
  };

  const handleClose = () => {
    setSelected([]);
    setTagihan('');
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Ionicons name="person-add-outline" size={20} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={s.title}>Tambah Anggota</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {members.length === 0 ? (
                <View style={s.emptyWrap}>
                  <Text style={s.emptyText}>
                    Semua anggota tetap sudah ditambahkan.{'\n'}
                    Tambah anggota baru lewat menu Kelola Anggota.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={s.labelRow}>
                    <Text style={s.label}>
                      Pilih Anggota ({selectedIds.length} dipilih)
                    </Text>
                    <TouchableOpacity onPress={selectAll}>
                      <Text style={s.selectAllText}>
                        {selectedIds.length === members.length ? 'Batalkan Semua' : 'Pilih Semua'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.memberList}>
                    {members.map((m) => {
                      const isSelected = selectedIds.includes(m.id);
                      return (
                        <TouchableOpacity
                          key={m.id}
                          style={[s.memberItem, isSelected && s.memberSelected]}
                          onPress={() => toggleMember(m.id)}
                          activeOpacity={0.7}
                        >
                          <View style={[s.checkbox, isSelected && s.checkboxChecked]}>
                            {isSelected && <Text style={s.checkmark}>✓</Text>}
                          </View>
                          <Text style={s.memberName}>{m.nama}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={s.label}>Nominal Tagihan (Rp) *</Text>
              <TextInput
                style={s.input}
                placeholder="contoh: 500000"
                placeholderTextColor={colors.textTertiary}
                value={tagihan}
                onChangeText={setTagihan}
                keyboardType="numeric"
              />

              <View style={s.shortcuts}>
                {[50000, 100000, 150000, 200000, 500000].map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={s.chip}
                    onPress={() => setTagihan(String(v))}
                  >
                    <Text style={s.chipText}>{v / 1000}rb</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[s.btnPrimary, (loading || members.length === 0) && s.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading || members.length === 0}
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={s.btnPrimaryText}>
                  {loading ? 'Menyimpan...' : 'Tambah Anggota'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.btnCancel} onPress={handleClose}>
                <Text style={s.btnCancelText}>Selesai</Text>
              </TouchableOpacity>
            </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    color: c.textPrimary,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.blue,
  },
  memberList: {
    marginBottom: 14,
    backgroundColor: c.bgSecondary,
    borderRadius: 12,
    padding: 4,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 1,
  },
  memberSelected: {
    backgroundColor: c.bgPrimary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: c.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: c.blue,
    borderColor: c.blue,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 14,
    color: c.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.textPrimary,
    backgroundColor: c.bgSecondary,
    marginBottom: 10,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: c.bgSecondary,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    color: c.textPrimary,
    fontWeight: '500',
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
  btnDisabled: {
    opacity: 0.6,
  },
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
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: c.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
});
