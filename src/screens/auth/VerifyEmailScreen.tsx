import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthLink, AuthLinks, FormMessage } from '../../components/auth/AuthLinks';
import GradientButton from '../../components/auth/GradientButton';
import { dictionary } from '../../i18n';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

const t = dictionary.emailVerification;

// Port of live-repo src/components/emailVerification/EmailVerificationNotice.jsx.
// RootNavigator shows this instead of the app while email_verified_at is null —
// the job web's authMiddleware does with a redirect to /auth/verifyEmail.
export default function VerifyEmailScreen() {
  const { authUser, refreshAuth, signOut } = useAuth();
  const { palette } = useAppTheme();
  const [notice, setNotice] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const email = authUser?.user?.email ?? '';

  const resend = useMutation({
    mutationFn: () => authApi.resendVerificationEmail(email),
    onSuccess: (data) => setNotice({ message: data?.message || t.linkSent, type: 'success' }),
    onError: (error) =>
      setNotice({ message: getErrorMessage(error, t.resendFailed), type: 'error' }),
  });

  // "Already verified?": re-fetch the user. If email_verified_at is now set, RootNavigator
  // moves on by itself; otherwise tell the user to open the link first. Read the fresh
  // response, not isEmailVerified: inside this callback that value is from the old render.
  const recheck = useMutation({
    mutationFn: refreshAuth,
    onSuccess: (data) => {
      if (!data.authUser.user.email_verified_at) {
        setNotice({ message: t.stillUnverified, type: 'error' });
      }
    },
    onError: (error) =>
      setNotice({ message: getErrorMessage(error, t.recheckFailed), type: 'error' }),
  });

  return (
    <AuthLayout
      brandTitle={dictionary.signin.welcome}
      brandTagline={dictionary.signin.tagline}
      title={t.title}
    >
      <Text style={[styles.notice, { color: palette.textSecondary }]}>{t.notice}</Text>

      <Text style={[styles.label, { color: palette.textSecondary }]}>{t.emailLabel}</Text>
      <TextInput
        mode="outlined"
        value={email}
        disabled
        outlineStyle={styles.outline}
        style={[styles.input, { backgroundColor: palette.paper }]}
        left={<TextInput.Icon icon="email-outline" size={20} />}
      />

      <FormMessage message={notice?.message ?? null} type={notice?.type ?? 'error'} />
      <GradientButton label={t.resend} onPress={() => resend.mutate()} loading={resend.isPending} />

      <Button
        mode="outlined"
        textColor={palette.error}
        style={[styles.logout, { borderColor: palette.error }]}
        onPress={signOut}
      >
        {t.logout}
      </Button>

      <AuthLinks>
        <AuthLink
          prompt={t.alreadyVerified}
          action={recheck.isPending ? '…' : t.proceed}
          onPress={() => {
            setNotice(null);
            recheck.mutate();
          }}
        />
      </AuthLinks>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  notice: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, marginBottom: 20 },
  label: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 6 },
  outline: { borderRadius: 10 },
  input: { marginBottom: 16 },
  logout: { marginTop: 16, borderRadius: 10 },
});
