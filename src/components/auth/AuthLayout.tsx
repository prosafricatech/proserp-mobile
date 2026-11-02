import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ThemeToggle from '../common/ThemeToggle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  brandTitle: string;
  brandTagline: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

// Shared frame of live-repo's Signin.tsx / SignupForm.tsx at the xs breakpoint:
// gradient brand panel stacked above the form panel, theme toggle top-right.
export default function AuthLayout({ brandTitle, brandTagline, title, subtitle, children }: Props) {
  const { palette, isDark, brandLight } = useAppTheme();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View
            style={[
              styles.card,
              { backgroundColor: palette.background },
              isDark ? { borderWidth: 1, borderColor: palette.divider } : styles.cardShadow,
            ]}
          >
            <LinearGradient
              colors={[palette.primary, brandLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.brand}
            >
              <Image
                source={require('../../../assets/images/proserp-white.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="ProsERP"
              />
              <View>
                <Text style={[styles.brandTitle, { color: palette.primaryContrast }]}>
                  {brandTitle}
                </Text>
                <Text style={[styles.brandTagline, { color: palette.primaryContrast }]}>
                  {brandTagline}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.form}>
              <View style={styles.themeRow}>
                <ThemeToggle />
              </View>
              <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text>
              ) : null}
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flexGrow: 1, padding: 16, justifyContent: 'center' },
  card: { borderRadius: 16, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  brand: { padding: 20, gap: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  logo: { width: 150, height: 48, alignSelf: 'center' },
  brandTitle: { fontFamily: fonts.bold, fontSize: 22 },
  brandTagline: {
    fontFamily: fonts.regular,
    fontSize: 14,
    opacity: 0.85,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  form: { padding: 24, paddingTop: 8 },
  themeRow: { flexDirection: 'row', justifyContent: 'flex-end', marginRight: -12 },
  title: { fontFamily: fonts.bold, fontSize: 20, marginBottom: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, marginBottom: 24 },
});
