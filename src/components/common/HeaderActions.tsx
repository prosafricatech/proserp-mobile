import React from 'react';
import { StyleSheet, View } from 'react-native';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

// Right side of live-repo's Header.tsx: theme mode, notifications, user avatar menu.
export default function HeaderActions({ before }: { before?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      {before}
      <ThemeToggle />
      <NotificationBell />
      <UserMenu />
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });
