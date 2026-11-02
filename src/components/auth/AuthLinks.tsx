import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text } from 'react-native-paper';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

// "Prompt? Action" line under auth forms, e.g. "Don't have an account? Create".
export function AuthLink({
  prompt,
  action,
  onPress,
}: {
  prompt?: string;
  action: string;
  onPress: () => void;
}) {
  const { palette } = useAppTheme();
  return (
    <Text style={[styles.row, { color: palette.textSecondary }]}>
      {prompt ? `${prompt} ` : ''}
      <Text
        style={[styles.action, { color: palette.primary }]}
        onPress={onPress}
        accessibilityRole="link"
      >
        {action}
      </Text>
    </Text>
  );
}

export function AuthLinks({ children }: { children: React.ReactNode }) {
  return <View style={styles.links}>{children}</View>;
}

// Form-level message (server error or success) shown above the submit button.
export function FormMessage({
  message,
  type,
}: {
  message: string | null;
  type: 'error' | 'success';
}) {
  const { palette } = useAppTheme();
  if (!message) return null;
  return (
    <HelperText
      type={type === 'error' ? 'error' : 'info'}
      visible
      style={[styles.message, type === 'success' && { color: palette.success }]}
    >
      {message}
    </HelperText>
  );
}

const styles = StyleSheet.create({
  links: { marginTop: 24, alignItems: 'center', gap: 16 },
  row: { fontFamily: fonts.regular, fontSize: 15, textAlign: 'center' },
  action: { fontFamily: fonts.semiBold },
  message: { marginBottom: 12, fontFamily: fonts.medium },
});
