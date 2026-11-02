import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { applyServerErrors } from '../../auth/serverErrors';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../../auth/validation';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthLink, AuthLinks, FormMessage } from '../../components/auth/AuthLinks';
import TextField from '../../components/form/TextField';
import GradientButton from '../../components/auth/GradientButton';
import { dictionary } from '../../i18n';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const t = dictionary.forgotPassword;

// Port of live-repo src/components/resetPassword/ResetPassword.tsx (the no-token branch).
// Note: web's /auth/forgot-password page is leftover Jumbo template with no submit; the
// real flow is /auth/reset-password, which POSTs /recover-password like this screen.
export default function ForgotPasswordScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // useMutation: React Query's tool for writes. It tracks isPending/isSuccess/error for us.
  const mutation = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onError: (error) => applyServerErrors(error, setError, ['email']),
  });

  const submit = () => handleSubmit(({ email }) => mutation.mutate(email.trim()))();

  const serverMessage = mutation.isSuccess ? mutation.data?.message || t.success : null;
  // When the server error landed on the email field (e.g. "We can't find a user with that
  // email address."), don't repeat it as a form-level message.
  const errorMessage =
    mutation.isError && errors.email?.type !== 'server'
      ? getErrorMessage(mutation.error, t.failed)
      : null;

  return (
    <AuthLayout
      brandTitle={dictionary.signin.welcome}
      brandTagline={dictionary.signin.tagline}
      title={t.title}
      subtitle={t.subtitle}
    >
      <TextField
        control={control}
        name="email"
        label={t.emailLabel}
        icon="email-outline"
        placeholder={dictionary.signin.emailPlaceholder}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
      />

      <FormMessage message={serverMessage} type="success" />
      <FormMessage message={errorMessage} type="error" />
      <GradientButton label={t.submit} onPress={submit} loading={mutation.isPending} />

      <AuthLinks>
        <AuthLink
          prompt={t.haveLink}
          action={t.enterLink}
          onPress={() =>
            navigation.navigate('ResetPassword', { email: getValues('email').trim() || undefined })
          }
        />
        <AuthLink
          prompt={dictionary.links.havePassword}
          action={dictionary.links.proceedToSignIn}
          onPress={() => navigation.navigate('Login')}
        />
      </AuthLinks>
    </AuthLayout>
  );
}
