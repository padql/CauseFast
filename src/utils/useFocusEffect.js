// src/utils/useFocusEffect.js
// Hook sederhana pengganti useFocusEffect dari react-navigation.
// Menjalankan callback setiap kali komponen di-mount (re-render pertama).
// Karena navigasi berbasis state di App.js, komponen di-unmount saat tidak aktif,
// sehingga useEffect biasa sudah cukup berfungsi seperti useFocusEffect.

import { useEffect } from 'react';

/**
 * Jalankan callback saat komponen pertama kali tampil (mount).
 * @param {Function} callback - Fungsi yang dijalankan, bisa berupa useCallback
 */
export function useFocusEffect(callback) {
  useEffect(() => {
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
