import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  IconButton,
  List,
  Modal,
  Portal,
  Searchbar,
  Snackbar,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StakeholderGroup } from '../../api/modules/masters/types';
import { stakeholderGroupsApi } from '../../api/modules/masters/stakeholderGroups/services';
import { stakeholdersApi } from '../../api/modules/masters/stakeholders/services';
import { dictionary } from '../../i18n';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthProvider';

type Props = {
  group: StakeholderGroup | null;
  canEdit: boolean;
  onClose: () => void;
};

export default function StakeholderGroupMembers({ group, canEdit, onClose }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [notice, setNotice] = useState('');
  const t = dictionary.masters.stakeholderGroups;
  const common = dictionary.masters.common;
  const membersKey = ['masters', organizationId, 'stakeholderGroups', group?.id, 'members'];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const membersQuery = useQuery({
    queryKey: [...membersKey, page],
    queryFn: () => stakeholderGroupsApi.listMembers({ id: group!.id, page, limit: 15 }),
    enabled: !!group,
    placeholderData: (previousData) => previousData,
  });
  const searchQuery = useQuery({
    queryKey: ['masters', organizationId, 'stakeholder-search', debouncedKeyword],
    queryFn: () =>
      stakeholdersApi.list({ page: 1, limit: 10, type: 'all', keyword: debouncedKeyword }),
    enabled: !!group && debouncedKeyword.length >= 2,
  });

  const invalidateMembers = () => {
    void queryClient.invalidateQueries({ queryKey: membersKey });
    void queryClient.invalidateQueries({
      queryKey: ['masters', organizationId, 'stakeholderGroups'],
    });
  };
  const addMutation = useMutation({
    mutationFn: (stakeholderId: string | number) =>
      stakeholderGroupsApi.addMembers(group!.id, [stakeholderId]),
    onSuccess: () => {
      setKeyword('');
      setDebouncedKeyword('');
      setNotice(t.memberAdded);
      invalidateMembers();
    },
    onError: () => setNotice(common.failed),
  });
  const removeMutation = useMutation({
    mutationFn: (stakeholderId: string | number) =>
      stakeholderGroupsApi.removeMember(group!.id, stakeholderId),
    onSuccess: () => {
      setNotice(t.memberRemoved);
      invalidateMembers();
    },
    onError: () => setNotice(common.failed),
  });

  const currentPage = membersQuery.data?.current_page ?? page;
  const lastPage = membersQuery.data?.last_page ?? 1;
  const total = membersQuery.data?.total ?? group?.stakeholders_count ?? 0;
  const title = t.membersTitle
    .replace('{name}', group?.name ?? '')
    .replace('{total}', String(total));

  return (
    <>
      <Portal>
        <Modal
          visible={!!group}
          onDismiss={onClose}
          contentContainerStyle={[styles.modal, { backgroundColor: palette.background }]}
        >
          <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
            <Appbar.Header statusBarHeight={0} style={{ backgroundColor: palette.paper }}>
              <Appbar.BackAction onPress={onClose} />
              <Appbar.Content title={title} />
            </Appbar.Header>
            {canEdit ? (
              <Searchbar
                value={keyword}
                onChangeText={(value) => {
                  setPage(1);
                  setKeyword(value);
                }}
                placeholder={t.searchMembers}
                style={styles.search}
              />
            ) : null}
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              {canEdit && keyword.trim().length > 0 ? (
                <View style={[styles.searchResults, { backgroundColor: palette.paper }]}>
                  {debouncedKeyword.length < 2 ? (
                    <Text style={styles.helper}>{t.typeMoreToSearch}</Text>
                  ) : searchQuery.isFetching ? (
                    <ActivityIndicator style={styles.loader} />
                  ) : (searchQuery.data?.data.length ?? 0) === 0 ? (
                    <Text style={styles.helper}>{t.noSearchResults}</Text>
                  ) : (
                    searchQuery.data?.data.map((stakeholder) => (
                      <List.Item
                        key={stakeholder.id}
                        title={stakeholder.name}
                        description={stakeholder.phone || stakeholder.email || stakeholder.type}
                        right={() => (
                          <IconButton
                            icon="plus"
                            accessibilityLabel={t.addMember}
                            disabled={addMutation.isPending}
                            onPress={() => addMutation.mutate(stakeholder.id)}
                          />
                        )}
                      />
                    ))
                  )}
                </View>
              ) : null}

              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t.members}
              </Text>
              {membersQuery.isPending ? (
                <ActivityIndicator style={styles.loader} />
              ) : membersQuery.isError ? (
                <View style={styles.error}>
                  <Text>{common.failed}</Text>
                  <Button onPress={() => void membersQuery.refetch()}>{common.retry}</Button>
                </View>
              ) : (membersQuery.data?.data.length ?? 0) === 0 ? (
                <Text style={styles.helper}>{t.noMembers}</Text>
              ) : (
                membersQuery.data?.data.map((member) => (
                  <List.Item
                    key={member.id}
                    title={member.name}
                    description={
                      member.phone
                        ? `${member.phone}${member.email ? ` · ${member.email}` : ''}`
                        : t.noPhone
                    }
                    right={() =>
                      canEdit ? (
                        <IconButton
                          icon="delete-outline"
                          accessibilityLabel={t.removeMember}
                          disabled={removeMutation.isPending}
                          onPress={() => removeMutation.mutate(member.id)}
                        />
                      ) : null
                    }
                  />
                ))
              )}
              {lastPage > 1 ? (
                <View style={styles.pagination}>
                  <IconButton
                    icon="chevron-left"
                    accessibilityLabel={t.previousPage}
                    disabled={currentPage <= 1 || membersQuery.isFetching}
                    onPress={() => setPage((value) => Math.max(1, value - 1))}
                  />
                  <Text style={{ color: palette.textSecondary }}>
                    {t.pageOf
                      .replace('{page}', String(currentPage))
                      .replace('{pages}', String(lastPage))}
                  </Text>
                  <IconButton
                    icon="chevron-right"
                    accessibilityLabel={t.nextPage}
                    disabled={currentPage >= lastPage || membersQuery.isFetching}
                    onPress={() => setPage((value) => Math.min(lastPage, value + 1))}
                  />
                </View>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </Portal>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2600}>
        {notice}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modal: { flex: 1, marginVertical: 12, marginHorizontal: 8, borderRadius: 18, overflow: 'hidden' },
  search: { marginHorizontal: 12, marginTop: 10 },
  content: { paddingHorizontal: 12, paddingBottom: 16 },
  searchResults: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  sectionTitle: { marginTop: 18, marginBottom: 4 },
  loader: { marginVertical: 20 },
  helper: { paddingHorizontal: 16, paddingVertical: 14 },
  error: { alignItems: 'center', padding: 24, gap: 8 },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
