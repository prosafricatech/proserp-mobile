import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper';
import { dictionary } from '../../../i18n';
import { fonts } from '../../../theme/palette';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { EmptyState, ErrorState } from '../../common/ScreenState';
import type { JumboRqPage, JumboRqPageRequest, JumboRqPageResponse } from './types';

function readPage<T>(result: JumboRqPageResponse<T>) {
  const page: JumboRqPage<T> = Array.isArray(result)
    ? { data: result }
    : 'current_page' in result || 'last_page' in result
      ? (result as JumboRqPage<T>)
      : (result as { data: JumboRqPage<T> }).data;
  return {
    items: Array.isArray(page.data) ? page.data : [],
    currentPage: page.current_page ?? 1,
    lastPage: page.last_page,
    nextPageUrl: page.next_page_url,
  };
}

type Props<T, F extends Record<string, unknown>> = {
  title: string;
  queryKey: readonly unknown[];
  fetchPage: (params: JumboRqPageRequest<F>) => Promise<JumboRqPageResponse<T>>;
  filters: F;
  emptyFilters: F;
  onFiltersChange: (filters: F) => void;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  filterContent?: (value: F, onChange: (next: F) => void) => React.ReactNode;
  onCreate?: () => void;
  createLabel?: string;
  actionTail?: React.ReactNode;
  pageSize?: number;
};

// Shared FlatList pattern for searchable master data: debounced server search,
// pagination, pull-to-refresh, filter sheet, and consistent empty/error states.
export default function JumboRqList<T, F extends Record<string, unknown>>({
  title,
  queryKey,
  fetchPage,
  filters,
  emptyFilters,
  onFiltersChange,
  renderItem,
  keyExtractor,
  filterContent,
  onCreate,
  createLabel,
  actionTail,
  pageSize = 20,
}: Props<T, F>) {
  const { palette } = useAppTheme();
  const t = dictionary.masters.common;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: [...queryKey, { keyword: debouncedSearch, filters }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPage({ page: pageParam, limit: pageSize, keyword: debouncedSearch, ...filters }),
    getNextPageParam: (lastResult, allPages) => {
      const last = readPage(lastResult);
      if (last.nextPageUrl === null) return undefined;
      if (last.lastPage != null)
        return last.currentPage < last.lastPage ? last.currentPage + 1 : undefined;
      return last.items.length === pageSize ? allPages.length + 1 : undefined;
    },
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => readPage(page).items) ?? [],
    [query.data]
  );

  if (query.isError && !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={styles.heading}>
        <Text variant="headlineSmall" style={[styles.title, { color: palette.textPrimary }]}>
          {title}
        </Text>
        {actionTail ??
          (onCreate ? (
            <Button icon="plus" mode="contained" onPress={onCreate}>
              {createLabel ?? t.add}
            </Button>
          ) : null)}
      </View>

      <View style={styles.searchRow}>
        <Searchbar
          placeholder={t.search}
          value={search}
          onChangeText={setSearch}
          style={[styles.search, { backgroundColor: palette.paper }]}
        />
        {filterContent ? (
          <IconButton
            icon="filter-variant"
            mode="outlined"
            accessibilityLabel={t.filters}
            onPress={() => {
              setDraftFilters(filters);
              setFilterOpen(true);
            }}
          />
        ) : null}
      </View>

      {query.isPending ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => renderItem(item)}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isFetchingNextPage}
              onRefresh={() => {
                void query.refetch();
              }}
              tintColor={palette.primary}
            />
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<EmptyState message={debouncedSearch ? t.noResults : t.empty} />}
          ListFooterComponent={
            query.isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : undefined
          }
        />
      )}

      <Portal>
        <Modal
          visible={filterOpen}
          onDismiss={() => setFilterOpen(false)}
          contentContainerStyle={[styles.sheet, { backgroundColor: palette.paper }]}
        >
          <Appbar.Header statusBarHeight={0} style={{ backgroundColor: palette.paper }}>
            <Appbar.Content title={t.filters} />
            <Appbar.Action icon="close" onPress={() => setFilterOpen(false)} />
          </Appbar.Header>
          <View style={styles.filterContent}>{filterContent?.(draftFilters, setDraftFilters)}</View>
          <View style={styles.filterActions}>
            <Button
              onPress={() => {
                const clearedFilters = emptyFilters;
                setDraftFilters(clearedFilters);
                onFiltersChange(clearedFilters);
                setFilterOpen(false);
              }}
            >
              {t.clearFilters}
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                onFiltersChange(draftFilters);
                setFilterOpen(false);
              }}
            >
              {t.applyFilters}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  title: { fontFamily: fonts.bold, flexShrink: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  search: { flex: 1 },
  list: { paddingBottom: 28 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { marginVertical: 16 },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  filterContent: { paddingHorizontal: 16, paddingVertical: 12 },
  filterActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16 },
});
