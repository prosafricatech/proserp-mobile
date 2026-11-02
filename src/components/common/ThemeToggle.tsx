import React from 'react';
import { useAppTheme } from '../../theme/ThemeProvider';
import RoundIconButton from './RoundIconButton';

// live-repo header/themeModeOptions/ThemeModeOption.tsx: the icon shows the CURRENT mode
// (sun in light, moon in dark); tapping switches to the other one.
export default function ThemeToggle() {
  const { isDark, setMode } = useAppTheme();
  return (
    <RoundIconButton
      icon={isDark ? 'weather-night' : 'white-balance-sunny'}
      onPress={() => setMode(isDark ? 'light' : 'dark')}
      accessibilityLabel="Toggle theme"
    />
  );
}
