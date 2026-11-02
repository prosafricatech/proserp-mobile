import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import { applyServerErrors } from '../../auth/serverErrors';
import { signupSchema, type SignupValues } from '../../auth/validation';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthLink, AuthLinks, FormMessage } from '../../components/auth/AuthLinks';
import TextField from '../../components/form/TextField';
import GradientButton from '../../components/auth/GradientButton';
import { dictionary } from '../../i18n';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const t = dictionary.signup;
const FIELDS = ['name', 'email', 'phone', 'password', 'password_confirmation'] as const;

// Port of live-repo src/components/signupForm/SignupForm.tsx.
export default function SignupScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { isSubmitting },
  } = useForm<SignupValues>({
    resolver: yupResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', password: '', password_confirmation: '' },
  });

  const onSubmit = async (values: SignupValues) => {
    setError(null);
    try {
      const signedIn = await signUp({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
      });
      // Signed in: RootNavigator swaps to the verify-email screen on its own.
      if (!signedIn) {
        navigation.replace('Login', { email: values.email.trim(), notice: t.createdSignIn });
      }
    } catch (e) {
      if (!applyServerErrors(e, setFieldError, FIELDS)) {
        setError(getErrorMessage(e, t.failed));
      }
    }
  };

  const submit = () => handleSubmit(onSubmit)();

  return (
    <AuthLayout
      brandTitle={t.getStarted}
      brandTagline={t.tagline}
      title={t.title}
      subtitle={t.fillDetails}
    >
      <TextField
        control={control}
        name="name"
        label={t.nameLabel}
        icon="account-outline"
        placeholder={t.namePlaceholder}
        autoComplete="name"
        textContentType="name"
      />
      <TextField
        control={control}
        name="email"
        label={t.emailLabel}
        icon="email-outline"
        placeholder={t.emailPlaceholder}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        control={control}
        name="phone"
        label={t.phoneLabel}
        icon="phone-outline"
        placeholder={t.phonePlaceholder}
        autoComplete="tel"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />
      <TextField
        control={control}
        name="password"
        label={t.passwordLabel}
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

      <FormMessage message={error} type="error" />
      <GradientButton label={t.submit} onPress={submit} loading={isSubmitting} />

      <AuthLinks>
        <AuthLink
          prompt={t.alreadyHaveAccount}
          action={t.signIn}
          onPress={() => navigation.navigate('Login')}
        />
      </AuthLinks>
    </AuthLayout>
  );
}
