// src/screens/EventListScreen.js
// Layar utama: daftar semua acara patungan

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '../utils/useFocusEffect';
import { useTheme } from '../context/ThemeContext';
import EventCard from '../components/EventCard';
import AddEventModal from '../modals/AddEventModal';
import ManageAnggotaModal from '../modals/ManageAnggotaModal';
import { getAllEvents, createEvent, deleteEvent } from '../utils/storage';

/** @param {{ onSelectEvent: Function, onOpenSettings: Function }} props */
export default function EventListScreen({ onSelectEvent, onOpenSettings }) {
  const { colors } = useTheme();
  const [events, setEvents]            = useState([]);
  const [showModal, setShowModal]      = useState(false);
  const [showManageAnggota, setShowManageAnggota] = useState(false);
  const s = useMemo(() => createStyles(colors), [colors]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    const data = await getAllEvents();
    setEvents(data);
  };

  const handleCreateEvent = async (formData) => {
    await createEvent(formData);
    setShowModal(false);
    loadEvents();
  };

  const handleDeleteEvent = (eventId, eventNama) => {
    Alert.alert(
      'Hapus Acara',
      `Yakin ingin menghapus "${eventNama}"?\nSemua data anggota akan ikut terhapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(eventId);
            loadEvents();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <EventCard
      event={item}
      onPress={() => onSelectEvent(item)}
      onLongPress={() => handleDeleteEvent(item.id, item.nama)}
    />
  );

  const renderEmpty = () => (
    <View style={s.emptyWrap}>
      <Ionicons name="wallet-outline" size={56} color={colors.textTertiary} style={{ marginBottom: 12 }} />
      <Text style={s.emptyTitle}>Belum ada acara</Text>
      <Text style={s.emptySub}>
        Tap tombol + di bawah untuk membuat{'\n'}acara patungan pertamamu!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="wallet-outline" size={24} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={s.headerTitle}>CauseFast</Text>
          </View>
          <Text style={s.headerSub}>
            {events.length === 0
              ? 'Belum ada acara'
              : `${events.length} acara aktif`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={s.btnManageAnggota}
            onPress={() => setShowManageAnggota(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={16} color={colors.textPrimary} style={{ marginRight: 4 }} />
            <Text style={s.btnManageAnggotaText}>Anggota</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnSettings}
            onPress={onOpenSettings}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          s.listContent,
          events.length === 0 && s.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={s.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <Text style={s.fabText}>＋</Text>
      </TouchableOpacity>

      <AddEventModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateEvent}
      />

      <ManageAnggotaModal
        visible={showManageAnggota}
        onClose={() => setShowManageAnggota(false)}
      />

    </SafeAreaView>
  );
}

const createStyles = (c) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bgSecondary,
  },
  header: {
    backgroundColor: c.bgPrimary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: c.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: c.textPrimary,
    marginBottom: 6,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySub: {
    fontSize: 14,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.blue,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '300',
  },
  btnManageAnggota: {
    backgroundColor: c.bgSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnManageAnggotaText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textPrimary,
  },
  btnSettings: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.bgSecondary,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
