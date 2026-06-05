import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';

export default function useUpdateChecker() {
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    (async () => {
      if (!Updates.isEnabled || Platform.OS === 'web') return;
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          Alert.alert(
            'Update Tersedia',
            'Versi baru aplikasi tersedia. Download dan update sekarang?',
            [
              { text: 'Nanti', style: 'cancel' },
              {
                text: 'Update',
                onPress: async () => {
                  try {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  } catch {
                    Alert.alert('Gagal', 'Gagal mengunduh update.');
                  }
                },
              },
            ]
          );
        }
      } catch {
        /* silent — expo-updates tidak aktif di dev / Expo Go */
      }
    })();
  }, []);
}
