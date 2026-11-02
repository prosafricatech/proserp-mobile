import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { applyServerErrors } from '../../auth/serverErrors';
import {
  parseResetLink,
  resetPasswordSchema,
  type ResetPasswordValues,
} from '../../auth/validation';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthLink, AuthLinks, FormMessage } from '../../components/auth/AuthLinks';
import TextField from '../../components/form/TextField';
import GradientButton from '../../components/auth/GradientButton';
import { dictionary } from '../../i18n';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const t = dictionary.resetPassword;

// Port of live-repo src/components/forgotPassword/ResetPasswordForm.tsx. On web the token
// arrives in the URL; here the user pastes the link (or token) from the email.
export default function ResetPasswordScreen({ navigation, route }: Props) {
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      link: '',
      email: route.params?.email ?? '',
      password: '',
      password_confirmation: '',
    },
  });

  // If the pasted link also carries ?email=…, fill the email field for the user.
  const link = useWatch({ control, name: 'link' });
  useEffect(() => {
    const { email } = parseResetLink(link ?? '');
    if (email && !getValues('email')) setValue('email', email);
  }, [link, getValues, setValue]);

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (_data, values) =>
      navigation.replace('Login', { email: values.email, notice: t.success }),
    onError: (error) => {
      // The backend reports a bad token under "token"; show it on the link field.
      applyServerErrors(error, setError, ['email', 'password', 'password_confirmation']);
      const tokenError = (error as any)?.response?.data?.errors?.token?.[0];
      if (tokenError) setError('link', { type: 'server', message: tokenError });
    },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    const { token } = parseResetLink(values.link);
    if (!token) {
      setError('link', { type: 'validate', message: t.errors.tokenRequired });
      return;
    }
    mutation.mutate({
      token,
      email: values.email.trim(),
      password: values.password,
      password_confirmation: values.password_confirmation,
    });
  };

  const submit = () => handleSubmit(onSubmit)();

  return (
    <AuthLayout
      brandTitle={dictionary.signin.welcome}
      brandTagline={dictionary.signin.tagline}
      title={t.title}
      subtitle={t.subtitle}
    >
      <TextField
        control={control}
        name="link"
        label={t.linkLabel}
        icon="link-variant"
        placeholder={t.linkPlaceholder}
        autoCapitalize="none"
        autoComplete="off"
      />
      <TextField
        control={control}
        name="email"
        label={t.emailLabel}
        icon="email-outline"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        control={control}
        name="password"
        label={t.newPasswordLabel}
        icon="lock-outline"
        password
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        control={control}
        name="password_confirmation"
        label={t.confirmPasswordLabel}
        icon="lock-outline"
        password
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <FormMessage
        message={
          mutation.isError && !Object.values(errors).some((e) => e?.type === 'server')
            ? getErrorMessage(mutation.error, t.genericError)
            : null
        }
        type="error"
      />
      <GradientButton label={t.submit} onPress={submit} loading={mutation.isPending} />

      <AuthLinks>
        <AuthLink
          prompt={dictionary.links.havePassword}
          action={dictionary.links.proceedToSignIn}
          onPress={() => navigation.navigate('Login')}
        />
      </AuthLinks>
    </AuthLayout>
  );
}
