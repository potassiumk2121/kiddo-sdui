import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useActiveTheme } from './src/store/campaignStore';
import { HomeScreen } from './src/screens/HomeScreen';

/**
 * The theme is read FROM the campaign store and pushed INTO the
 * ThemeProvider. Switching campaign → new theme object → ThemeProvider
 * re-renders → every `useTheme()` consumer updates instantly (OTA theming).
 */
const ThemedApp: React.FC = () => {
  const theme = useActiveTheme();
  return (
    <ThemeProvider theme={theme}>
      <HomeScreen />
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemedApp />
    </SafeAreaProvider>
  );
}
