import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Divider, IconButton, List, Searchbar, Text } from 'react-native-paper';
import { dictionary, language } from '../i18n';
import { fonts } from '../theme/palette';
import { useAppTheme } from '../theme/ThemeProvider';
import type { MenuNode } from './moduleRegistry';
import { useMenu } from './useMenu';

const t = dictionary.userMenu;

export const initials = (name?: string) =>
  (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

// live-repo Sidebar.js filterMenuItems(): a node matches on its label or its path; a group
// stays when it, or any child, matches.
const filterMenu = (nodes: MenuNode[], term: string): MenuNode[] => {
  const q = term.trim().toLowerCase();
  if (!q) return nodes;
  return nodes.flatMap((node) => {
    const matchesSelf = `${node.label[language]} ${node.path ?? ''}`.toLowerCase().includes(q);
    const children = node.children ? filterMenu(node.children, q) : [];
    if (matchesSelf || children.length)
      return [{ ...node, children: children.length ? children : node.children }];
    return [];
  });
};

// Mobile drawer = live-repo's sidebar: logo + close button, "Search Menu", then the gated menu.
// User, organization, profile and logout live in the header avatar menu (UserMenu), as on web.
export default function AppDrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const { palette, isDark } = useAppTheme();
  const menu = useMenu();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const searching = search.trim().length > 0;

  const currentRoute = state.routes[state.index];
  const activeId =
    currentRoute.name === 'ComingSoon'
      ? (currentRoute.params as { id?: string } | undefined)?.id
      : currentRoute.name;

  // The Home section is flattened on web: Dashboard is a top-level item.
  const items = useMemo(
    () =>
      filterMenu(
        menu.flatMap((section) => (section.id === 'home' ? (section.children ?? []) : [section])),
        search
      ),
    [menu, search]
  );

  const open = (node: MenuNode) => {
    if (node.screen === 'Dashboard') navigation.navigate('Dashboard');
    else if (node.screen === 'Organizations') navigation.getParent()?.navigate('Organizations');
    else
      navigation.navigate('ComingSoon', {
        id: node.id,
        title: node.label[language],
        path: node.path,
        hatua: node.hatua,
      });
  };

  const renderNode = (node: MenuNode, depth: number): React.ReactNode => {
    const title = node.label[language];
    if (node.children) {
      return (
        <List.Accordion
          key={node.id}
          title={title}
          titleStyle={styles.itemTitle}
          left={(p) => (node.icon ? <List.Icon {...p} icon={node.icon} /> : null)}
          // While searching every matching group is open, like web's isSearchActive.
          expanded={searching || !!expanded[node.id]}
          onPress={() => setExpanded((e) => ({ ...e, [node.id]: !e[node.id] }))}
          style={{ paddingLeft: depth * 12, backgroundColor: 'transparent' }}
          // Paper wraps the accordion in a View painted with theme.colors.background;
          // make it transparent so rows sit on the drawer's paper colour.
          theme={{ colors: { background: 'transparent' } }}
        >
          {node.children.map((child) => renderNode(child, depth + 1))}
        </List.Accordion>
      );
    }
    const active = activeId === (node.screen ?? node.id);
    return (
      <List.Item
        key={node.id}
        title={title}
        titleStyle={[
          styles.itemTitle,
          active && { color: palette.primary, fontFamily: fonts.semiBold },
        ]}
        onPress={() => open(node)}
        left={(p) => (
          <List.Icon
            {...p}
            icon={node.icon ?? 'circle-small'}
            color={active ? palette.primary : p.color}
          />
        )}
        style={[{ paddingLeft: depth * 12 + 8 }, active && { backgroundColor: palette.background }]}
      />
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: palette.paper }]}>
      <View style={styles.header}>
        <Image
          source={
            isDark
              ? require('../../assets/images/proserp-white.png')
              : require('../../assets/images/logo.png')
          }
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="ProsERP"
        />
        <IconButton
          icon="menu-open"
          onPress={() => navigation.closeDrawer()}
          accessibilityLabel="Close drawer"
        />
      </View>
      <Searchbar
        placeholder={t.searchMenu}
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: palette.background }]}
        inputStyle={styles.searchInput}
      />
      <Divider />
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {searching && !items.length ? (
          <Text style={[styles.noMatch, { color: palette.textSecondary }]}>{t.noMenuMatch}</Text>
        ) : (
          items.map((node) => renderNode(node, 0))
        )}
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
    minHeight: 80,
    paddingTop: 16,
  },
  logo: { width: 110, height: 35 },
  search: { marginHorizontal: 16, marginBottom: 8, elevation: 0, height: 44 },
  searchInput: { fontFamily: fonts.regular, minHeight: 0 },
  scroll: { paddingTop: 0 },
  itemTitle: { fontFamily: fonts.regular, fontSize: 14 },
  noMatch: { paddingHorizontal: 24, paddingVertical: 16, fontSize: 14 },
});
