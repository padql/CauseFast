import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import EventListScreen from './src/screens/EventListScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function Main() {
  const [screen, setScreen] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { colors } = useTheme();

  if (screen === 'settings') {
    return (
      <>
        <StatusBar style={colors.statusBarStyle || 'dark'} />
        <SettingsScreen onBack={() => setScreen('events')} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={colors.statusBarStyle || 'dark'} />
      {selectedEvent === null ? (
        <EventListScreen
          onSelectEvent={setSelectedEvent}
          onOpenSettings={() => setScreen('settings')}
        />
      ) : (
        <EventDetailScreen
          event={selectedEvent}
          onBack={() => setSelectedEvent(null)}
          onUpdate={(updatedEvent) => setSelectedEvent(updatedEvent)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
