import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import { loginSchema, type LoginValues } from '../../auth/validation';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthLink, AuthLinks, FormMessage } from '../../components/auth/AuthLinks';
import TextField from '../../components/form/TextField';
import GradientButton from '../../components/auth/GradientButton';
import { dictionary } from '../../i18n';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const t = dictionary.signin;

// Port of live-repo src/components/signin/Signin.tsx + loginForm/LoginForm.jsx.
export default function LoginScreen({ navigation, route }: Props) {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: route.params?.email ?? '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      await signIn({ email: values.email.trim(), password: values.password });
    } catch (e) {
      // Wrong credentials come back as 401 {"message":"Invalid Credentials"}; a plain
      // Error means the response had no token. Either way show the web's wording.
      const isCredentialError =
        !axios.isAxiosError(e) || e.response?.status === 401 || e.response?.status === 422;
      setError(isCredentialError ? t.errors.loginError : getErrorMessage(e, t.errors.loginError));
    }
  };

  // RN press events are not DOM events; call handleSubmit without forwarding the event.
  const submit = () => handleSubmit(onSubmit)();

  return (
    <AuthLayout
      brandTitle={t.welcome}
      brandTagline={t.tagline}
      title={t.title}
      subtitle={t.useAccount}
    >
      <TextField
        control={control}
        name="email"
        label={t.emailLabel}
        icon="account-outline"
        placeholder={t.emailPlaceholder}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="username"
        returnKeyType="next"
      />
      <TextField
        control={control}
        name="password"
        label={t.passwordLabel}
        icon="lock-outline"
        placeholder={t.passwordPlaceholder}
        password
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <FormMessage message={route.params?.notice ?? null} type="success" />
      <FormMessage message={error} type="error" />
      <GradientButton label={t.submit} onPress={submit} loading={isSubmitting} />

      <AuthLinks>
        <AuthLink action={t.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')} />
        <AuthLink
          prompt={t.accountPrompt}
          action={t.accountAction}
          onPress={() => navigation.navigate('Signup')}
        />
      </AuthLinks>
    </AuthLayout>
  );
}
