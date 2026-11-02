import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

// The web's gradient submit button (LoginForm / SignupForm). RN has no CSS
// gradients, so the gradient is a view inside the Pressable.
export default function GradientButton({ label, onPress, loading, disabled }: Props) {
  const { palette, brandLight } = useAppTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.shadow,
        { shadowColor: palette.primary, opacity: pressed || disabled ? 0.85 : 1 },
      ]}
    >
      <LinearGradient
        colors={[palette.primary, brandLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 10,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: 16 },
});
