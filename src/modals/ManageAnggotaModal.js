import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getAllMembers, createMember, updateMember, deleteMember } from '../utils/storage';

export default function ManageAnggotaModal({ visible, onClose }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [members, setMembers] = useState([]);
  const [inputNama, setInputNama] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (visible) loadMembers();
  }, [visible]);

  const loadMembers = async () => {
    const data = await getAllMembers();
    setMembers(data);
  };

  const handleAdd = async () => {
    if (!inputNama.trim()) {
      Alert.alert('Wajib diisi', 'Nama anggota tidak boleh kosong.');
      return;
    }
    await createMember(inputNama.trim());
    setInputNama('');
    loadMembers();
  };

  const handleStartEdit = (member) => {
    setEditingId(member.id);
    setEditValue(member.nama);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      Alert.alert('Wajib diisi', 'Nama anggota tidak boleh kosong.');
      return;
    }
    await updateMember(editingId, editValue.trim());
    setEditingId(null);
    setEditValue('');
    loadMembers();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (member) => {
    Alert.alert('Hapus Anggota', `Hapus "${member.nama}" dari daftar?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteMember(member.id);
          loadMembers();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <View style={s.memberRow}>
          <View style={s.avatarSmall}>
            <Text style={s.avatarText}>
              {item.nama.charAt(0).toUpperCase()}
            </Text>
          </View>
          <TextInput
            style={s.editInput}
            value={editValue}
            onChangeText={setEditValue}
            autoCapitalize="words"
            autoFocus
          />
          <TouchableOpacity onPress={handleSaveEdit} style={s.saveBtn}>
            <Ionicons name="checkmark-circle" size={22} color={colors.green} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancelEdit} style={s.cancelBtn}>
            <Ionicons name="close-circle" size={22} color={colors.red} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={s.memberRow}>
        <View style={s.avatarSmall}>
          <Text style={s.avatarText}>
            {item.nama.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={s.memberNama}>{item.nama}</Text>
        <TouchableOpacity onPress={() => handleStartEdit(item)} style={s.editBtn}>
          <Ionicons name="create-outline" size={18} color={colors.blue} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={s.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.red} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.container}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.keyboardWrap}
        >
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="people-outline" size={20} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={s.title}>Kelola Anggota</Text>
            </View>
            <Text style={s.subtitle}>
              Anggota tetap yang bisa dipilih saat membuat acara
            </Text>

            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Nama anggota baru"
                placeholderTextColor={colors.textTertiary}
                value={inputNama}
                onChangeText={setInputNama}
                autoCapitalize="words"
              />
              <TouchableOpacity style={s.addBtn} onPress={handleAdd}>
                <Text style={s.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              style={s.list}
              ListEmptyComponent={
                <Text style={s.empty}>Belum ada anggota tetap.{'\n'}Tambah di atas.</Text>
              }
              renderItem={renderItem}
            />

            <TouchableOpacity style={s.btnDone} onPress={onClose}>
              <Text style={s.btnDoneText}>Selesai</Text>
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
    maxHeight: 640,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.textPrimary,
    backgroundColor: c.bgSecondary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: c.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
  },
  list: {
    maxHeight: 300,
    marginBottom: 18,
  },
  empty: {
    textAlign: 'center',
    color: c.textTertiary,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 20,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.textPrimary,
  },
  memberNama: {
    flex: 1,
    fontSize: 15,
    color: c.textPrimary,
    fontWeight: '500',
  },
  editInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: c.blue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    color: c.textPrimary,
    backgroundColor: c.bgSecondary,
    marginRight: 6,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  saveBtn: {
    paddingHorizontal: 4,
  },
  cancelBtn: {
    paddingHorizontal: 4,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteText: {
    color: c.red,
    fontSize: 13,
    fontWeight: '600',
  },
  btnDone: {
    backgroundColor: c.blue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDoneText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
