import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getAllMembers, createMember } from './storage';

const isWeb = Platform.OS === 'web';

export async function exportMembers() {
  const members = await getAllMembers();
  const data = JSON.stringify(members.map((m) => m.nama), null, 2);
  const filename = `anggota_kas_acara_${new Date().toISOString().slice(0, 10)}.json`;

  if (isWeb) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    try {
      const uri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, data, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan backup anggota',
        });
      } else {
        Alert.alert('Berhasil', `File backup tersimpan di:\n${uri}`);
      }
    } catch (e) {
      console.error('Export gagal:', e);
      Alert.alert('Gagal', 'Gagal mengekspor data anggota.');
    }
  }
}

export async function importMembers() {
  if (isWeb) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      let resolved = false;

      input.onchange = async (e) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        const file = e.target.files[0];
        if (!file) { resolve(false); return; }
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) throw new Error();
          await processImport(parsed);
          resolve(true);
        } catch {
          Alert.alert('Gagal', 'Format file tidak valid. Pilih file JSON backup anggota.');
          resolve(false);
        }
      };

      const cleanup = () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('focus', onFocus);
        clearTimeout(timeout);
      };

      const onVisibility = () => {
        if (document.visibilityState === 'visible' && !resolved) {
          setTimeout(() => {
            if (!resolved && (!input.files || input.files.length === 0)) {
              resolved = true;
              cleanup();
              resolve(false);
            }
          }, 300);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      const onFocus = () => {
        setTimeout(() => {
          if (!resolved && (!input.files || input.files.length === 0)) {
            resolved = true;
            cleanup();
            resolve(false);
          }
        }, 300);
      };
      window.addEventListener('focus', onFocus);

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(false);
        }
      }, 60000);

      input.click();
    });
  } else {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return false;
      const file = result.assets[0];
      const text = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error();
      await processImport(parsed);
      return true;
    } catch (e) {
      console.error('Import gagal:', e);
      Alert.alert('Gagal', 'Format file tidak valid. Pilih file JSON backup anggota.');
      return false;
    }
  }
}

async function processImport(names) {
  let count = 0;
  const existing = await getAllMembers();
  const existingNames = new Set(existing.map((m) => m.nama.toLowerCase()));

  for (const name of names) {
    if (typeof name !== 'string' || !name.trim()) continue;
    if (existingNames.has(name.trim().toLowerCase())) continue;
    await createMember(name.trim());
    existingNames.add(name.trim().toLowerCase());
    count++;
  }

  if (count === 0) {
    Alert.alert('Tidak Ada Data Baru', 'Semua anggota sudah terdaftar.');
  } else {
    Alert.alert('Berhasil', `${count} anggota berhasil diimpor.`);
  }
}
