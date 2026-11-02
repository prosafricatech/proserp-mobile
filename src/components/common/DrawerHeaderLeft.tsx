import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';
import RoundIconButton from './RoundIconButton';

// Left side of live-repo's Header.tsx on small screens: sidebar toggle, then back (only when
// there is history) and refresh. Web also has "forward"; a phone's navigation has no forward.
export default function DrawerHeaderLeft() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { palette } = useAppTheme();
  const open = useDrawerStatus() === 'open';

  return (
    <View style={styles.row}>
      <RoundIconButton
        icon={open ? 'menu-open' : 'menu'}
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        accessibilityLabel="Show navigation menu"
      />
      {navigation.canGoBack() ? (
        <IconButton
          icon="arrow-left"
          size={22}
          iconColor={palette.textPrimary}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        />
      ) : null}
      {/* Web's refresh re-renders the page with fresh data: here, refetch every visible query. */}
      <IconButton
        icon="refresh"
        size={22}
        iconColor={palette.textPrimary}
        onPress={() => queryClient.invalidateQueries()}
        accessibilityLabel="Refresh"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 8 },
});
