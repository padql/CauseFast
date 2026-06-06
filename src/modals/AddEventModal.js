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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { getAllMembers } from '../utils/storage';

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AddEventModal({ visible, onClose, onSubmit }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [nama, setNama]           = useState('');
  const [targetDana, setTarget]   = useState('');
  const [htm, setHtm]             = useState('');
  const [tanggal, setTanggal]       = useState('');
  const [dateObj, setDateObj]       = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [deadline, setDeadline]     = useState('');
  const [deadlineDateObj, setDeadlineDateObj] = useState(new Date());
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [members, setMembers]     = useState([]);
  const [selectedIds, setSelected] = useState([]);
  const [loading, setLoading]     = useState(false);

  const webInput = Platform.OS === 'web' ? {
    width: '100%',
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgSecondary,
    marginBottom: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  } : {};

  useEffect(() => {
    if (visible) {
      loadMembers();
      setSelected([]);
      setDateObj(new Date());
    }
  }, [visible]);

  const loadMembers = async () => {
    const data = await getAllMembers();
    setMembers(data);
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

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      setTanggal(formatDate(selectedDate));
    }
  };

  const handleDeadlineChange = (event, selectedDate) => {
    setShowDeadlinePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeadlineDateObj(selectedDate);
      setDeadline(formatDate(selectedDate));
    }
  };

  const handleSubmit = async () => {
    if (!nama.trim()) {
      Alert.alert('Wajib diisi', 'Nama acara tidak boleh kosong.');
      return;
    }
    const targetNum = Number(targetDana.replace(/\D/g, ''));
    if (!targetNum || targetNum <= 0) {
      Alert.alert('Wajib diisi', 'Target dana harus berupa angka lebih dari 0.');
      return;
    }
    const htmNum = Number(htm.replace(/\D/g, ''));
    if (!htmNum || htmNum <= 0) {
      Alert.alert('Wajib diisi', 'HTM (iuran per orang) harus lebih dari 0.');
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert('Pilih Anggota', 'Pilih minimal satu anggota untuk acara ini.');
      return;
    }

    const anggota = selectedIds.map((id) => {
      const m = members.find((x) => x.id === id);
      return {
        id: `ang_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        nama: m.nama,
        tagihan: htmNum,
        dibayar: 0,
        status: 'Belum',
        createdAt: new Date().toISOString(),
      };
    });

    setLoading(true);
    await onSubmit({
      nama: nama.trim(),
      targetDana: targetNum,
      htm: htmNum,
      tanggal: tanggal.trim(),
      deadlinePembayaran: deadline.trim(),
      anggota,
    });
    setLoading(false);
    setNama(''); setTarget(''); setHtm(''); setTanggal(''); setDeadline(''); setSelected([]);
  };

  const handleClose = () => {
    setNama(''); setTarget(''); setHtm(''); setTanggal(''); setDeadline(''); setSelected([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.container}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.keyboardWrap}
        >
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="sparkles-outline" size={20} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={s.title}>Buat Acara Baru</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Nama Acara *</Text>
              <TextInput
                style={s.input}
                placeholder="contoh: Outing Karyawan 2025"
                placeholderTextColor={colors.textTertiary}
                value={nama}
                onChangeText={setNama}
                autoFocus
              />

              <Text style={s.label}>Target Dana (Rp) *</Text>
              <TextInput
                style={s.input}
                placeholder="contoh: 5000000"
                placeholderTextColor={colors.textTertiary}
                value={targetDana}
                onChangeText={setTarget}
                keyboardType="numeric"
              />

              <Text style={s.label}>HTM / Iuran per Orang (Rp) *</Text>
              <TextInput
                style={s.input}
                placeholder="contoh: 500000"
                placeholderTextColor={colors.textTertiary}
                value={htm}
                onChangeText={setHtm}
                keyboardType="numeric"
              />

              <Text style={s.label}>Tanggal Acara</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => {
                    setTanggal(e.target.value);
                    if (e.target.value) setDateObj(new Date(e.target.value + 'T00:00:00'));
                  }}
                  style={webInput}
                />
              ) : (
                <>
                  <TouchableOpacity onPress={() => setShowPicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        style={s.input}
                        placeholder="Pilih tanggal"
                        placeholderTextColor={colors.textTertiary}
                        value={tanggal}
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>
                  {showPicker && (
                    <DateTimePicker
                      value={dateObj}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                    />
                  )}
                </>
              )}

              <Text style={s.label}>Deadline Pembayaran</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    if (e.target.value) setDeadlineDateObj(new Date(e.target.value + 'T00:00:00'));
                  }}
                  style={webInput}
                />
              ) : (
                <>
                  <TouchableOpacity onPress={() => setShowDeadlinePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        style={s.input}
                        placeholder="Pilih deadline"
                        placeholderTextColor={colors.textTertiary}
                        value={deadline}
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>
                  {showDeadlinePicker && (
                    <DateTimePicker
                      value={deadlineDateObj}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDeadlineChange}
                    />
                  )}
                </>
              )}

              <View style={s.labelRow}>
                <Text style={s.label}>
                  Pilih Anggota * ({selectedIds.length} dipilih)
                </Text>
                {members.length > 0 && (
                  <TouchableOpacity onPress={selectAll}>
                    <Text style={s.selectAllText}>
                      {selectedIds.length === members.length ? 'Batalkan Semua' : 'Pilih Semua'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {members.length === 0 ? (
                <View style={s.emptyMembers}>
                  <Text style={s.emptyMembersText}>
                    Belum ada anggota tetap.{'\n'}Tambahkan anggota dulu lewat tombol Kelola Anggota.
                  </Text>
                </View>
              ) : (
                <ScrollView style={s.memberList} nestedScrollEnabled>
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
                        <View style={s.memberAvatar}>
                          <Text style={s.memberAvatarText}>
                            {m.nama.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={s.memberName}>{m.nama}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <TouchableOpacity
                style={[s.btnPrimary, loading && s.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={s.btnPrimaryText}>
                  {loading ? 'Menyimpan...' : 'Buat Acara'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.btnCancel} onPress={handleClose}>
                <Text style={s.btnCancelText}>Batal</Text>
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
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.textPrimary,
    backgroundColor: c.bgSecondary,
    marginBottom: 14,
  },
  emptyMembers: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyMembersText: {
    color: c.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
  },
  memberList: {
    maxHeight: 320,
    marginBottom: 16,
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
    overflow: 'scroll',
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
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textSecondary,
  },
  memberName: {
    fontSize: 14,
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
    marginTop: 8,
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
});
