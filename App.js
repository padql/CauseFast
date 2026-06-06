import React, { useState, Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import EventListScreen from './src/screens/EventListScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#1C1C1E' }}>
          <Text style={{ color: '#FF453A', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Aplikasi Crash</Text>
          <ScrollView style={{ maxHeight: 400, width: '100%' }}>
            <Text style={{ color: '#F5F5F7', fontSize: 12, fontFamily: 'monospace' }}>{this.state.error.stack || this.state.error.message}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <Main />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
