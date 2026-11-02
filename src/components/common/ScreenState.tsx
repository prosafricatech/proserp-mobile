import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { getErrorMessage } from '../../api/client';
import { dictionary } from '../../i18n';
import { useAppTheme } from '../../theme/ThemeProvider';

// The three non-data states every screen has: loading, error (with retry) and empty.
export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.center}>
      <Text style={[styles.text, { color: palette.textSecondary }]}>{getErrorMessage(error)}</Text>
      {onRetry ? (
        <Button mode="contained" onPress={onRetry}>
          {dictionary.shell.retry}
        </Button>
      ) : null}
    </View>
  );
}

export function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.center}>
      <Text style={[styles.text, { color: palette.textSecondary }]}>{message}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  text: { textAlign: 'center' },
});
