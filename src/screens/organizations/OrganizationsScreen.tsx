import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Chip,
  Dialog,
  IconButton,
  Portal,
  Searchbar,
  Snackbar,
  Text,
} from 'react-native-paper';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import { ErrorState, Loading } from '../../components/common/ScreenState';
import { PERMISSIONS } from '../../constants/permissions';
import { PROS_CONTROL_PERMISSIONS } from '../../constants/prosControlPermissions';
import { dictionary, format } from '../../i18n';
import { organizationsApi, type OrganizationListItem } from '../../modules/organizations/api';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { Image } from 'expo-image';

type Props = NativeStackScreenProps<RootStackParamList, 'Organizations'>;

const t = dictionary.organizationsList;
const PAGE_SIZE = 10;

// Ids arrive as numbers from the API; compare as strings so number/string never mismatch.
const sameId = (a?: string | number | null, b?: string | number | null) =>
  a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b);

// Port of live-repo
// src/components/organizations/list/{OrganizationsList,OrganizationListItem,AutoLoadButton}.tsx.
// Same content and actions; web's page buttons become infinite scroll.
export default function OrganizationsScreen({ navigation }: Props) {
  const { authOrganization, loadOrganization, checkPermission, checkOrganizationPermission } =
    useAuth();
  const { palette } = useAppTheme();
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<OrganizationListItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canCreate = checkPermission(PROS_CONTROL_PERMISSIONS.ORGANIZATIONS_MANAGE);
  const activeId = authOrganization?.organization?.id;

  // Debounce the search like JumboSearch does.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const query = useInfiniteQuery({
    queryKey: ['organizations', search],
    queryFn: ({ pageParam }) =>
      organizationsApi.list({ keyword: search, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + (p.data?.length ?? 0), 0);
      return loaded < (last.total ?? 0) ? pages.length + 1 : undefined;
    },
  });

  // Web (OrganizationListItem.onLoad): load the organization, then router.replace to the
  // dashboard; the active one's button just opens the dashboard.
  const toDashboard = () => navigation.navigate('App', { screen: 'Dashboard' });
  const onLoad = async (organization: OrganizationListItem) => {
    if (loading) return;
    if (sameId(organization.id, activeId)) {
      toDashboard();
      return;
    }
    const hadOrganization = !!activeId;
    setLoading(organization);
    try {
      await loadOrganization(String(organization.id));
      setMessage(`${organization.name} ${t.loadedMessage}`);
      // With no organization before, the navigator mounts the app on its Dashboard by itself;
      // otherwise the app is already mounted underneath, so go to its Dashboard.
      if (hadOrganization) toDashboard();
    } catch (e) {
      setMessage(getErrorMessage(e, t.loadError));
    } finally {
      setLoading(null);
    }
  };

  if (query.isLoading && !search) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const items = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return (
    <View style={[styles.flex, { backgroundColor: palette.background }]}>
      <View style={[styles.card, { backgroundColor: palette.paper }]}>
        {/* Web's list toolbar: search, then "+" for users who may create organizations. */}
        <View style={styles.toolbar}>
          <Searchbar
            placeholder={t.search}
            value={keyword}
            onChangeText={setKeyword}
            style={[styles.search, { backgroundColor: palette.background }]}
            inputStyle={styles.searchInput}
          />
          {canCreate ? (
            <IconButton
              icon="plus"
              onPress={() => navigation.navigate('OrganizationForm')}
              accessibilityLabel={t.newOrganization}
            />
          ) : null}
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          refreshing={query.isRefetching && !query.isFetchingNextPage}
          onRefresh={() => query.refetch()}
          onEndReached={() =>
            query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()
          }
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            query.isFetchingNextPage || (query.isFetching && search) ? (
              <ActivityIndicator style={styles.footer} />
            ) : undefined
          }
          ListEmptyComponent={
            query.isFetching ? undefined : (
              <View style={[styles.empty, { borderColor: palette.primary }]}>
                <Text style={{ color: palette.textPrimary }}>{t.noOrganizations}</Text>
                <Text style={{ color: palette.textPrimary }}>
                  {t.invitationText}
                  <Text
                    style={{ color: palette.primary, fontFamily: fonts.semiBold }}
                    onPress={() =>
                      navigation.navigate('ComingSoon', {
                        id: 'invitations',
                        title: dictionary.organizationsList.invitationLink,
                        path: '/invitations',
                        hatua: 13,
                      })
                    }
                  >
                    {t.invitationLink}
                  </Text>
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <OrganizationRow
              organization={item}
              active={sameId(item.id, activeId)}
              canEdit={checkOrganizationPermission(PERMISSIONS.ORGANIZATION_UPDATE)}
              canViewProfile={checkOrganizationPermission(PERMISSIONS.ORGANIZATION_PROFILE)}
              onLoad={() => onLoad(item)}
              onEdit={() =>
                navigation.navigate('OrganizationForm', { organizationId: String(item.id) })
              }
              onProfile={() =>
                navigation.navigate('ComingSoon', {
                  id: 'organizationProfile',
                  title: `${item.name} ${t.profile}`,
                  path: `/organizations/profile/${item.id}`,
                  hatua: 13,
                })
              }
              onMessage={setMessage}
            />
          )}
        />
      </View>

      {/* Web's BackdropSpinner while an organization loads. */}
      <Portal>
        <Dialog visible={!!loading} dismissable={false}>
          <Dialog.Content style={styles.loadingDialog}>
            <ActivityIndicator />
            <Text>{t.loading}</Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
      <Snackbar visible={!!message} onDismiss={() => setMessage(null)} duration={3000}>
        {message}
      </Snackbar>
    </View>
  );
}

function OrganizationRow({
  organization,
  active,
  canEdit,
  canViewProfile,
  onLoad,
  onEdit,
  onProfile,
  onMessage,
}: {
  organization: OrganizationListItem;
  active: boolean;
  canEdit: boolean;
  canViewProfile: boolean;
  onLoad: () => void;
  onEdit: () => void;
  onProfile: () => void;
  onMessage: (message: string) => void;
}) {
  const { palette } = useAppTheme();
  const roles = organization.roles ?? [];

  return (
    <View style={[styles.row, { borderTopColor: palette.divider }]}>
      <View style={styles.rowTop}>
        <AutoLoadButton organization={organization} onMessage={onMessage} />
        <View>
          {organization.logo_path ? (
            <Image
              source={{ uri: organization.logo_path }}
              style={styles.logo}
              contentFit="cover"
            />
          ) : (
            // Web's fallback image path doesn't exist, so MUI shows the name's first letter.
            <Avatar.Text
              size={56}
              label={(organization.name?.[0] ?? '?').toUpperCase()}
              style={{ backgroundColor: palette.textSecondary }}
            />
          )}
          <Badge
            size={14}
            style={[
              styles.status,
              { backgroundColor: active ? palette.success : '#9E9E9E', borderColor: palette.paper },
            ]}
          />
        </View>
        <View style={styles.nameBlock}>
          <Text
            style={[styles.name, { color: palette.textPrimary }]}
            onPress={onLoad}
            accessibilityRole="button"
          >
            {organization.name}
          </Text>
          {organization.website ? (
            <Text style={{ color: palette.textSecondary }}>{organization.website}</Text>
          ) : null}
        </View>
      </View>

      <Text style={[styles.rolesTitle, { color: palette.textPrimary }]}>{t.roles}:</Text>
      {roles.length ? (
        <View style={styles.chips}>
          {roles.slice(0, 3).map((role) => (
            <Chip key={String(role.id ?? role.name)} compact>
              {role.name}
            </Chip>
          ))}
          {roles.length > 3 ? <Chip compact>{`+${roles.length - 3}`}</Chip> : null}
        </View>
      ) : (
        <Text style={{ color: palette.textSecondary }}>{t.noRoles}</Text>
      )}

      <View style={styles.actions}>
        {active && canEdit ? (
          <IconButton
            icon="pencil"
            onPress={onEdit}
            accessibilityLabel={`${t.edit} ${organization.name}`}
          />
        ) : null}
        {active && canViewProfile ? (
          <IconButton
            icon="information"
            onPress={onProfile}
            accessibilityLabel={`${organization.name} ${t.profile}`}
          />
        ) : null}
        {active ? (
          <IconButton
            icon="view-dashboard-outline"
            onPress={onLoad}
            accessibilityLabel={`${organization.name} ${t.dashboard}`}
          />
        ) : (
          <IconButton
            icon="chevron-right"
            mode="contained-tonal"
            onPress={onLoad}
            accessibilityLabel={`${t.load} ${organization.name}`}
          />
        )}
      </View>
    </View>
  );
}

// live-repo AutoLoadButton.tsx: star toggles which organization loads automatically at login.
function AutoLoadButton({
  organization,
  onMessage,
}: {
  organization: OrganizationListItem;
  onMessage: (m: string) => void;
}) {
  const queryClient = useQueryClient();
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);
  const autoLoad = !!organization.autoload;
  const a = t.autoLoad;
  const vars = { organizationName: organization.name };

  const mutation = useMutation({
    mutationFn: () => organizationsApi.toggleAutoload(organization.id, !autoLoad),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onMessage(a.success);
    },
    onError: () => {
      setOpen(false);
      onMessage(a.error);
    },
  });

  return (
    <>
      <IconButton
        icon={autoLoad ? 'star' : 'star-outline'}
        iconColor={autoLoad ? '#F39711' : palette.textSecondary}
        onPress={() => setOpen(true)}
        accessibilityLabel={autoLoad ? a.deactivate : a.activate}
      />
      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>
            {format(autoLoad ? a.deactivateTitle : a.activateTitle, vars)}
          </Dialog.Title>
          <Dialog.Content>
            <Text>{format(autoLoad ? a.deactivateBody : a.activateBody, vars)}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>{a.cancel}</Button>
            <Button loading={mutation.isPending} onPress={() => mutation.mutate()}>
              {a.confirm}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { flex: 1, margin: 12, borderRadius: 12, overflow: 'hidden' },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  search: { flex: 1, margin: 12, marginRight: 4, elevation: 0 },
  searchInput: { fontFamily: fonts.regular },
  row: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12, paddingHorizontal: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 56, height: 56, borderRadius: 28 },
  status: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2 },
  nameBlock: { flex: 1, marginLeft: 8 },
  name: { fontFamily: fonts.semiBold, fontSize: 17, marginBottom: 2 },
  rolesTitle: { fontFamily: fonts.semiBold, marginTop: 10, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  empty: { margin: 12, padding: 12, borderWidth: 1, borderRadius: 8, gap: 4 },
  footer: { padding: 16 },
  loadingDialog: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
