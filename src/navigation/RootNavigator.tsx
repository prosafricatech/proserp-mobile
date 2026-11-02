import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useAuth } from '../auth/AuthProvider';
import HeaderActions from '../components/common/HeaderActions';
import { dictionary } from '../i18n';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import OrganizationFormScreen from '../screens/organizations/OrganizationFormScreen';
import OrganizationsScreen from '../screens/organizations/OrganizationsScreen';
import ChangePasswordScreen from '../screens/shell/ChangePasswordScreen';
import ComingSoonScreen from '../screens/shell/ComingSoonScreen';
import ProfileScreen from '../screens/shell/ProfileScreen';
import AppDrawer, { type DrawerParamList } from './AppDrawer';

export type RootStackParamList = {
  Login: { email?: string; notice?: string } | undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
  VerifyEmail: undefined;
  App: NavigatorScreenParams<DrawerParamList> | undefined; // the drawer (nested navigator)
  Organizations: undefined;
  OrganizationForm: { organizationId?: string } | undefined;
  ComingSoon: { id: string; title: string; path?: string; hatua?: number };
  ChangePassword: undefined;
  ProfileStandalone: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const organizationFormOptions = ({
  route,
}: {
  route: { params?: { organizationId?: string } };
}) => ({
  title: route.params?.organizationId
    ? dictionary.organizationForm.editTitle
    : dictionary.organizationForm.title,
});

// The navigation guard: instead of redirecting like onlyAuthAccessData does on web,
// we only *register* the screens the current auth status allows. When status
// changes, React Navigation swaps the stack automatically.
export default function RootNavigator() {
  const { status, authOrganization, isEmailVerified, retryBoot, signOut } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'bootError') {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium" style={styles.gap}>
          Could not reach ProsERP
        </Text>
        <Button mode="contained" onPress={retryBoot} style={styles.gap}>
          Try again
        </Button>
        <Button onPress={signOut}>Sign out</Button>
      </View>
    );
  }

  return (
    // Every signed-in screen gets web's header actions (theme, notifications, avatar menu
    // with Profile / Switch Organization / Logout), so the user is never stuck.
    <Stack.Navigator screenOptions={{ headerRight: () => <HeaderActions /> }}>
      {status === 'signedOut' ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Group>
      ) : !isEmailVerified ? (
        // Web's authMiddleware redirects unverified users to /auth/verifyEmail.
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{ headerShown: false }}
        />
      ) : !authOrganization ? (
        // Signed in but no active organization (X-OrganizationId unknown): pick or create one.
        <>
          <Stack.Screen
            name="Organizations"
            component={OrganizationsScreen}
            options={{ title: dictionary.organizationsList.title }}
          />
          <Stack.Screen
            name="OrganizationForm"
            component={OrganizationFormScreen}
            options={organizationFormOptions}
          />
          <Stack.Screen
            name="ComingSoon"
            component={ComingSoonScreen}
            options={({ route }) => ({ title: route.params.title })}
          />
          {/* Web lets you open your profile before choosing an organization. */}
          <Stack.Screen
            name="ProfileStandalone"
            component={ProfileScreen}
            options={{ title: dictionary.profile.title }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ title: dictionary.profile.changePassword }}
          />
        </>
      ) : (
        <>
          {/* The drawer has its own headers; the stack only frames full-screen flows above it. */}
          <Stack.Screen name="App" component={AppDrawer} options={{ headerShown: false }} />
          <Stack.Screen
            name="Organizations"
            component={OrganizationsScreen}
            options={{ title: dictionary.organizationsList.title }}
          />
          <Stack.Screen
            name="OrganizationForm"
            component={OrganizationFormScreen}
            options={organizationFormOptions}
          />
          <Stack.Screen
            name="ComingSoon"
            component={ComingSoonScreen}
            options={({ route }) => ({ title: route.params.title })}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ title: dictionary.profile.changePassword }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  gap: { marginBottom: 12 },
});
