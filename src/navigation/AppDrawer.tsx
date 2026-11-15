import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import DrawerHeaderLeft from '../components/common/DrawerHeaderLeft';
import HeaderActions from '../components/common/HeaderActions';
import { dictionary } from '../i18n';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ComingSoonScreen from '../screens/shell/ComingSoonScreen';
import NotificationsScreen from '../screens/shell/NotificationsScreen';
import ProfileScreen from '../screens/shell/ProfileScreen';
import {
  BanksScreen,
  CostCentersScreen,
  CurrenciesScreen,
  MeasurementUnitsScreen,
  StakeholderGroupsScreen,
  StakeholdersScreen,
} from '../screens/masters/MasterScreens';
import { fonts } from '../theme/palette';
import { useAppTheme } from '../theme/ThemeProvider';
import AppDrawerContent from './AppDrawerContent';

export type DrawerParamList = {
  Dashboard: undefined;
  ComingSoon: { id: string; title: string; path?: string };
  Notifications: undefined;
  Profile: undefined;
  Currencies: undefined;
  MeasurementUnits: undefined;
  Banks: undefined;
  Stakeholders: undefined;
  StakeholderGroups: undefined;
  CostCenters: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

// The signed-in app: a drawer (live-repo's sidebar) around the module screens.
export default function AppDrawer() {
  const { palette } = useAppTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      // Back walks through the screens you opened, like the browser history web relies on.
      backBehavior="history"
      screenOptions={{
        // Web's mobile header has no page title: toggle/back/refresh left, actions right.
        headerTitle: () => null,
        headerLeft: () => <DrawerHeaderLeft />,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        headerTintColor: palette.textPrimary,
        drawerStyle: { backgroundColor: palette.paper, width: 300 },
        // live-repo Header.tsx: theme mode, notifications and the user avatar menu.
        headerRight: () => <HeaderActions />,
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: dictionary.dashboard.title }}
      />
      {/* The drawer computes options for every screen up front, before ComingSoon has been
          opened with params — hence initialParams and the optional chaining. */}
      <Drawer.Screen
        name="ComingSoon"
        component={ComingSoonScreen}
        initialParams={{ id: '', title: '' }}
        options={({ route }) => ({ title: route.params?.title ?? '' })}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: dictionary.notifications.title }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: dictionary.profile.title }}
      />
      <Drawer.Screen
        name="Currencies"
        component={CurrenciesScreen}
        options={{ title: dictionary.masters.currencies.title }}
      />
      <Drawer.Screen
        name="MeasurementUnits"
        component={MeasurementUnitsScreen}
        options={{ title: dictionary.masters.measurementUnits.title }}
      />
      <Drawer.Screen
        name="Banks"
        component={BanksScreen}
        options={{ title: dictionary.masters.banks.title }}
      />
      <Drawer.Screen
        name="Stakeholders"
        component={StakeholdersScreen}
        options={{ title: dictionary.masters.stakeholders.title }}
      />
      <Drawer.Screen
        name="StakeholderGroups"
        component={StakeholderGroupsScreen}
        options={{ title: dictionary.masters.stakeholderGroups.title }}
      />
      <Drawer.Screen
        name="CostCenters"
        component={CostCentersScreen}
        options={{ title: dictionary.masters.costCenters.title }}
      />
    </Drawer.Navigator>
  );
}
