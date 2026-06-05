import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from '../components/ProgressBar';
import MemberRow from '../components/MemberRow';
import AddAnggotaModal from '../modals/AddAnggotaModal';
import UpdatePayModal from '../modals/UpdatePayModal';
import EditEventModal from '../modals/EditEventModal';
import { addAnggota, updatePembayaran, deleteAnggota, deleteEvent, updateEvent } from '../utils/storage';
import { shareKeWhatsApp } from '../utils/shareHelper';
import {
  hitungTotalTerkumpul,
  hitungPersentase,
  hitungRingkasanStatus,
  hitungStatus,
  formatRupiah,
} from '../utils/statusHelper';

export default function EventDetailScreen({ event, onBack, onUpdate }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [localEvent, setLocalEvent]       = useState(event);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedAnggota, setSelected]    = useState(null);
  const [filterStatus, setFilterStatus]   = useState('Semua');

  const filteredAnggota = filterStatus === 'Semua'
    ? localEvent.anggota
    : localEvent.anggota.filter((a) => hitungStatus(a.dibayar, a.tagihan) === filterStatus);

  const terkumpul = hitungTotalTerkumpul(localEvent.anggota);
  const persen    = hitungPersentase(terkumpul, localEvent.targetDana);
  const sisa      = localEvent.targetDana - terkumpul;
  const ringkasan = hitungRingkasanStatus(localEvent.anggota);

  const anggotaCount = localEvent.anggota.length;

  const syncEvent = (updated) => {
    setLocalEvent(updated);
    onUpdate(updated);
  };

  const handleAddAnggota = async ({ nama, tagihan }) => {
    const updated = await addAnggota(localEvent.id, { nama, tagihan });
    if (updated) syncEvent(updated);
  };

  const handleUpdatePay = async (anggotaId, dibayarBaru) => {
    const updated = await updatePembayaran(localEvent.id, anggotaId, dibayarBaru);
    if (updated) syncEvent(updated);
    setSelected(null);
  };

  const handleUpdateEvent = async (data) => {
    const updated = await updateEvent(localEvent.id, data);
    if (updated) syncEvent(updated);
  };

  const handleDeleteAnggota = (anggota) => {
    Alert.alert(
      'Hapus Anggota',
      `Hapus "${anggota.nama}" dari daftar?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteAnggota(localEvent.id, anggota.id);
            if (updated) syncEvent(updated);
          },
        },
      ]
    );
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Hapus Acara',
      `Yakin ingin menghapus "${localEvent.nama}"?\nSemua data anggota akan ikut terhapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(localEvent.id);
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.headerTitle} numberOfLines={1}>{localEvent.nama}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleDeleteEvent} style={s.editEventBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={18} color={colors.red} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEditEventModal(true)} style={s.editEventBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="create-outline" size={18} color={colors.blue} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={s.headerSub}>
          {localEvent.tanggal}
          {localEvent.deadlinePembayaran && localEvent.deadlinePembayaran !== 'Belum ditentukan' ? `  ·  Deadline: ${localEvent.deadlinePembayaran}` : ''}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── SECTION: PROGRES DANA ── */}
        <View style={s.progressSection}>
          <View style={s.amountRow}>
            <Text style={s.amountMain}>{formatRupiah(terkumpul)}</Text>
            <Text style={s.amountSub}>/ {formatRupiah(localEvent.targetDana)}</Text>
          </View>

          <ProgressBar persen={persen} height={12} />

          <View style={s.progressMeta}>
            <Text style={s.progressLabel}>
              Terkumpul {Math.round(persen * 100)}%
            </Text>
            <Text style={[s.sisaLabel, sisa > 0 ? { color: colors.red } : { color: colors.green }]}>
              {sisa > 0 ? `Sisa ${formatRupiah(sisa)}` : 'Target tercapai!'}
            </Text>
          </View>

          <View style={s.badgesRow}>
            <View style={[s.summaryChip, { backgroundColor: colors.status.Lunas.bg }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.status.Lunas.text} style={{ marginRight: 4 }} />
              <Text style={[s.summaryChipText, { color: colors.status.Lunas.text }]}>
                {ringkasan.lunas} Lunas
              </Text>
            </View>
            <View style={[s.summaryChip, { backgroundColor: colors.status.Nyicil.bg }]}>
              <Ionicons name="time-outline" size={12} color={colors.status.Nyicil.text} style={{ marginRight: 4 }} />
              <Text style={[s.summaryChipText, { color: colors.status.Nyicil.text }]}>
                {ringkasan.nyicil} Nyicil
              </Text>
            </View>
            <View style={[s.summaryChip, { backgroundColor: colors.status.Belum.bg }]}>
              <Ionicons name="ellipse-outline" size={12} color={colors.status.Belum.text} style={{ marginRight: 4 }} />
              <Text style={[s.summaryChipText, { color: colors.status.Belum.text }]}>
                {ringkasan.belum} Belum
              </Text>
            </View>
          </View>
        </View>

        {/* ── SECTION: DAFTAR ANGGOTA ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              Anggota ({localEvent.anggota.length})
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={s.addBtn}>
              <Text style={s.addBtnText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>

          {anggotaCount > 0 && (
            <View style={s.filterRow}>
              {['Semua', 'Lunas', 'Nyicil', 'Belum'].map((f) => {
                const isActive = filterStatus === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[s.filterChip, isActive && s.filterChipActive]}
                    onPress={() => setFilterStatus(f)}
                  >
                    <Text style={[s.filterChipText, isActive && s.filterChipTextActive]}>
                      {f === 'Semua' ? `Semua (${anggotaCount})` : f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {anggotaCount === 0 ? (
            <View style={s.emptyAnggota}>
              <Text style={s.emptyAnggotaText}>
                Belum ada anggota.{'\n'}Tap "+ Tambah" untuk menambah.
              </Text>
            </View>
          ) : filteredAnggota.length === 0 ? (
            <View style={s.emptyAnggota}>
              <Text style={s.emptyAnggotaText}>
                Tidak ada anggota dengan status "{filterStatus}".
              </Text>
            </View>
          ) : (
            <ScrollView
              style={s.memberScrollView}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {filteredAnggota.map((a) => (
                <MemberRow
                  key={a.id}
                  anggota={a}
                  onPress={() => setSelected(a)}
                  onDelete={handleDeleteAnggota}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ── FOOTER: BACK + SHARE ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.shareBtn}
          onPress={() => shareKeWhatsApp(localEvent)}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <EditEventModal
        visible={showEditEventModal}
        event={localEvent}
        onClose={() => setShowEditEventModal(false)}
        onSubmit={handleUpdateEvent}
      />

      <AddAnggotaModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAnggota}
        existingAnggota={localEvent.anggota}
      />

      <UpdatePayModal
        visible={!!selectedAnggota}
        anggota={selectedAnggota}
        onClose={() => setSelected(null)}
        onSimpan={handleUpdatePay}
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
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: c.textPrimary,
    flex: 1,
  },
  editEventBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  headerSub: {
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 2,
  },

  // Progress section
  progressSection: {
    backgroundColor: c.bgPrimary,
    padding: 20,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  amountMain: {
    fontSize: 30,
    fontWeight: '800',
    color: c.textPrimary,
  },
  amountSub: {
    fontSize: 15,
    color: c.textSecondary,
    marginLeft: 8,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 14,
  },
  progressLabel: {
    fontSize: 13,
    color: c.textSecondary,
  },
  sisaLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Member section
  section: {
    backgroundColor: c.bgPrimary,
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  addBtn: {
    backgroundColor: c.blue,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: c.bgSecondary,
    borderWidth: 1,
    borderColor: c.border,
  },
  filterChipActive: {
    backgroundColor: c.blue,
    borderColor: c.blue,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  memberScrollView: {
    maxHeight: 710,
  },
  emptyAnggota: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyAnggotaText: {
    color: c.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.bgPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 0.5,
    borderTopColor: c.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 78,
    height: 48,
    borderRadius: 14,
    backgroundColor: c.bgSecondary,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: c.whatsapp,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: c.whatsapp,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },
});
