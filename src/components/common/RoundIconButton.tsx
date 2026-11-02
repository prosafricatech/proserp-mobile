import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';

// Web's JumboIconButton / SidebarToggleButton: a round button raised with a shadow.
export default function RoundIconButton(props: {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { palette } = useAppTheme();
  return (
    <IconButton
      {...props}
      size={22}
      iconColor={palette.textPrimary}
      style={[styles.button, { backgroundColor: palette.paper }]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
