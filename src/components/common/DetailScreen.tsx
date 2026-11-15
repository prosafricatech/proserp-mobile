import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  actions?: React.ReactNode;
};

export default function DetailScreen({ title, children, onBack, actions }: Props) {
  const { palette } = useAppTheme();
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['bottom']}
    >
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: palette.paper }}>
        {onBack ? <Appbar.BackAction onPress={onBack} /> : null}
        <Appbar.Content title={title} />
        {actions}
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12 },
});
