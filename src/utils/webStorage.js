import AsyncStorage from '@react-native-async-storage/async-storage';
import { isWeb } from './platform';

const webStorage = {
  getItem: async (key) => {
    try {
      if (isWeb) return localStorage.getItem(key);
      return await AsyncStorage.getItem(key);
    } catch { return null; }
  },
  setItem: async (key, value) => {
    try {
      if (isWeb) localStorage.setItem(key, value);
      else await AsyncStorage.setItem(key, value);
    } catch (e) { console.error('[webStorage] setItem error:', e); }
  },
  removeItem: async (key) => {
    try {
      if (isWeb) localStorage.removeItem(key);
      else await AsyncStorage.removeItem(key);
    } catch (e) { console.error('[webStorage] removeItem error:', e); }
  },
};

export default webStorage;
