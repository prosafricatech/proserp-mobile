import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { dictionary, format } from '../../i18n';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

type Params = { id?: string; title?: string; path?: string; hatua?: number };

// Placeholder for every menu item whose screen isn't built yet. The menu itself is
// complete and gated, so users only see items they'd see on web.
// Used both inside the drawer and on the root stack (e.g. Invitations before an org is loaded).
export default function ComingSoonScreen() {
  const route = useRoute();
  const { palette } = useAppTheme();
  const { hatua, path, title } = (route.params ?? {}) as Params;
  return (
    <View style={[styles.center, { backgroundColor: palette.background }]}>
      {title ? <Text style={[styles.page, { color: palette.textPrimary }]}>{title}</Text> : null}
      <Icon source="hammer-wrench" size={48} color={palette.primary} />
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        {dictionary.shell.comingSoonTitle}
      </Text>
      <Text style={[styles.body, { color: palette.textSecondary }]}>
        {format(dictionary.shell.comingSoonBody, { hatua: hatua ?? '?' })}
      </Text>
      {path ? <Text style={[styles.path, { color: palette.primary }]}>{path}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontFamily: fonts.bold, fontSize: 20 },
  page: { fontFamily: fonts.bold, fontSize: 22, marginBottom: 16, textAlign: 'center' },
  body: { fontFamily: fonts.regular, textAlign: 'center', lineHeight: 21 },
  path: { fontFamily: fonts.semiBold },
});
