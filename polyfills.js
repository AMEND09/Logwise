// Polyfills for React Native Web
import 'react-native-url-polyfill/auto';

// AsyncStorage polyfill for web
if (typeof window !== 'undefined') {
  // Storage polyfill
  if (!window.localStorage) {
    window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0
    };
  }
}
