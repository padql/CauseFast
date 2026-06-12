import React, { useState, useMemo } from 'react';
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  if (!str || str === 'Belum ditentukan') return new Date();
  const parts = str.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

export default function EditEventModal({ visible, onClose, onSubmit, event }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [nama, setNama] = useState(event?.nama || '');
  const [targetDana, setTarget] = useState(event?.targetDana ? String(event.targetDana) : '');
  const [htm, setHtm] = useState(event?.htm ? String(event.htm) : '');
  const [tanggal, setTanggal] = useState(event?.tanggal || '');
  const [dateObj, setDateObj] = useState(parseDate(event?.tanggal));
  const [showPicker, setShowPicker] = useState(false);
  const [deadline, setDeadline] = useState(event?.deadlinePembayaran || '');
  const [deadlineDateObj, setDeadlineDateObj] = useState(parseDate(event?.deadlinePembayaran));
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

  React.useEffect(() => {
    if (visible && event) {
      setNama(event.nama || '');
      setTarget(event.targetDana ? String(event.targetDana) : '');
      setHtm(event.htm ? String(event.htm) : '');
      setTanggal(event.tanggal || '');
      setDateObj(parseDate(event.tanggal));
      setDeadline(event.deadlinePembayaran || '');
      setDeadlineDateObj(parseDate(event.deadlinePembayaran));
    }
  }, [visible, event]);

  const handleDateChange = (e, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      setTanggal(formatDate(selectedDate));
    }
  };

  const handleDeadlineChange = (e, selectedDate) => {
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
      Alert.alert('Wajib diisi', 'HTM harus berupa angka lebih dari 0.');
      return;
    }

    setLoading(true);
    await onSubmit({
      nama: nama.trim(),
      targetDana: targetNum,
      htm: htmNum,
      tanggal: tanggal.trim(),
      deadlinePembayaran: deadline.trim(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.container}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'web' ? undefined : 'padding'}
          style={s.keyboardWrap}
        >
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="create-outline" size={20} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={s.title}>Edit Acara</Text>
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

              <Text style={s.label}>HTM (Rp) *</Text>
              <TextInput
                style={s.input}
                placeholder="contoh: 150000"
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

              <TouchableOpacity
                style={[s.btnPrimary, loading && s.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={s.btnPrimaryText}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.btnCancel} onPress={onClose}>
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
    maxHeight: Dimensions.get('window').height * 0.9,
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
