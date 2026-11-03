import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { getErrorMessage } from '../../api/client';
import { applyServerErrors } from '../../auth/serverErrors';
import { changePasswordSchema, type ChangePasswordValues } from '../../auth/validation';
import { FormMessage } from '../../components/auth/AuthLinks';
import GradientButton from '../../components/auth/GradientButton';
import TextField from '../../components/form/TextField';
import { dictionary } from '../../i18n';
import { profileApi } from '../../modules/profile/api';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

const t = dictionary.profile;
const FIELDS = ['current_password', 'password', 'password_confirmation'] as const;

// Port of live-repo src/components/profile/ChangePasswordForm.tsx.
export default function ChangePasswordScreen({ navigation }: Props) {
  const { palette } = useAppTheme();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  const mutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => navigation.goBack(),
    onError: (e) => applyServerErrors(e, setError, FIELDS),
  });

  const submit = () => handleSubmit((values) => mutation.mutate(values))();
  const serverFieldError = Object.values(errors).some((e) => e?.type === 'server');

  return (
    <KeyboardAwareScrollView
      style={[styles.flex, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      <TextField
        control={control}
        name="current_password"
        label={t.currentPassword}
        icon="lock-outline"
        password
        autoComplete="current-password"
        textContentType="password"
      />
      <TextField
        control={control}
        name="password"
        label={t.newPassword}
        icon="lock-outline"
        password
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        control={control}
        name="password_confirmation"
        label={t.confirmPassword}
        icon="lock-outline"
        password
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <FormMessage
        message={mutation.isError && !serverFieldError ? getErrorMessage(mutation.error) : null}
        type="error"
      />
      <GradientButton label={t.changePassword} onPress={submit} loading={mutation.isPending} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16 },
});
