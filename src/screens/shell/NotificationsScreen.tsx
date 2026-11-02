import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Badge,
  Button,
  Dialog,
  IconButton,
  List,
  Portal,
  Text,
} from 'react-native-paper';
import { EmptyState, ErrorState, Loading } from '../../components/common/ScreenState';
import { dictionary } from '../../i18n';
import { notificationsApi, type NotificationItem } from '../../modules/notifications/api';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

const t = dictionary.notifications;
const LIMIT = 20;

// Same as live-repo notification-helpers.ts timeAgo().
export const timeAgo = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// Port of live-repo src/components/notifications/NotificationInboxPage.tsx, with infinite
// scroll instead of page buttons: useInfiniteQuery fetches page N+1 when the list end is near.
export default function NotificationsScreen() {
  const { palette } = useAppTheme();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => notificationsApi.list({ page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page && last.last_page && last.current_page < last.last_page
        ? last.current_page + 1
        : undefined,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notificationsUnread'] });
  };
  const markRead = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: refresh });
  const markAllRead = useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: refresh });
  const removeOne = useMutation({ mutationFn: notificationsApi.remove, onSuccess: refresh });
  const removeAll = useMutation({
    mutationFn: notificationsApi.removeAll,
    onSuccess: () => {
      setConfirmDelete(false);
      refresh();
    },
  });

  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const items = query.data?.pages.flatMap((page) => page.data) ?? [];

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const unread = !item.read_at;
    return (
      <List.Item
        title={item.data.title}
        description={`${item.data.body}\n${timeAgo(item.created_at)}`}
        descriptionNumberOfLines={4}
        titleStyle={{ fontFamily: unread ? fonts.bold : fonts.regular, color: palette.textPrimary }}
        style={unread ? { backgroundColor: palette.background } : undefined}
        onPress={() => unread && markRead.mutate(item.id)}
        left={(p) => (
          <View style={styles.leftIcon}>
            <List.Icon
              {...p}
              icon={unread ? 'bell-ring-outline' : 'bell-outline'}
              color={unread ? palette.primary : p.color}
            />
            {unread ? <Badge size={8} style={styles.dot} /> : null}
          </View>
        )}
        right={(p) => (
          <IconButton {...p} icon="close" size={18} onPress={() => removeOne.mutate(item.id)} />
        )}
      />
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: palette.paper }]}>
      <Text style={[styles.heading, { color: palette.textPrimary }]}>Notifications</Text>
      {items.length > 0 && (
        <View style={styles.actions}>
          <Button
            icon="check-all"
            compact
            onPress={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
          >
            {t.markAllRead}
          </Button>
          <Button
            icon="delete-outline"
            compact
            textColor={palette.error}
            onPress={() => setConfirmDelete(true)}
          >
            {t.deleteAll}
          </Button>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState message={t.empty} />}
        ListFooterComponent={
          query.isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : undefined
        }
        contentContainerStyle={items.length ? undefined : styles.flex}
      />
      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Title>{t.deleteAll}</Dialog.Title>
          <Dialog.Content>
            <Text>{t.deleteAllConfirm}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>{t.cancel}</Button>
            <Button
              textColor={palette.error}
              loading={removeAll.isPending}
              onPress={() => removeAll.mutate()}
            >
              {t.delete}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  leftIcon: { justifyContent: 'center' },
  dot: { position: 'absolute', top: 8, right: 4 },
  footer: { padding: 16 },
});
