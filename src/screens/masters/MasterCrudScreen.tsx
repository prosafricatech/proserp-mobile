import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Snackbar, Text } from 'react-native-paper';
import type { FormField } from '../../components/form/FormKit';
import FormKit from '../../components/form/FormKit';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MasterListScreen from '../../components/list/MasterListScreen';
import type { PageResult } from '../../api/modules/masters/types';
import { dictionary } from '../../i18n';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthProvider';

export type MasterRow = { id: string | number; [key: string]: unknown };
export type MasterValues = Record<string, string | string[] | boolean>;

export type MasterResource = {
  id: string;
  title: string;
  addTitle: string;
  fields: FormField[];
  editFields?: FormField[];
  list: (params: {
    page: number;
    limit: number;
    keyword: string;
  }) => Promise<PageResult<MasterRow>>;
  create: (values: MasterValues) => Promise<unknown>;
  update: (id: string | number, values: MasterValues) => Promise<unknown>;
  remove: (id: string | number) => Promise<unknown>;
  defaults: MasterValues;
  getFormValues?: (row: MasterRow) => MasterValues;
  onManageMembers?: (row: MasterRow) => void;
  onOpenDetails?: (row: MasterRow) => void;
  detailsLabel?: string;
  editable?: boolean;
  canDeleteRow?: (row: MasterRow) => boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  getSubtitle?: (row: MasterRow) => string;
  getTitle?: (row: MasterRow) => string;
  getDetails?: (row: MasterRow) => string;
};

// Shared list + CRUD lifecycle. Each resource keeps endpoint mapping in its API service.
export default function MasterCrudScreen({ resource }: { resource: MasterResource }) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<MasterRow | null>(null);
  const [toDelete, setToDelete] = useState<MasterRow | null>(null);
  const [notice, setNotice] = useState('');
  const common = dictionary.masters.common;
  const formFields = selected
    ? (resource.editFields ?? resource.fields.filter((field) => !field.createOnly))
    : resource.fields;
  const formValues = selected
    ? (resource.getFormValues?.(selected) ??
      (Object.fromEntries(
        formFields.map((field) => [
          field.name,
          selected[field.name] ?? resource.defaults[field.name] ?? '',
        ])
      ) as MasterValues))
    : resource.defaults;

  const resourceQueryKey = ['masters', organizationId, resource.id];
  const refresh = () => queryClient.invalidateQueries({ queryKey: resourceQueryKey });
  const saveMutation = useMutation({
    mutationFn: async (values: MasterValues) =>
      selected ? resource.update(selected.id, values) : resource.create(values),
    onSuccess: () => {
      setFormOpen(false);
      setSelected(null);
      setNotice(selected ? common.saved : common.created);
      void refresh();
    },
    onError: () => setNotice(common.failed),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => resource.remove(id),
    onSuccess: () => {
      setToDelete(null);
      setNotice(common.deleted);
      void refresh();
    },
    onError: () => setNotice(common.failed),
  });

  return (
    <>
      <MasterListScreen<MasterRow, Record<string, never>>
        title={resource.title}
        queryKey={resourceQueryKey}
        fetchPage={resource.list}
        filters={{}}
        emptyFilters={{}}
        onFiltersChange={() => undefined}
        onCreate={
          resource.canCreate
            ? () => {
                setSelected(null);
                setFormOpen(true);
              }
            : undefined
        }
        renderItem={(row) => (
          <Card mode="outlined" style={[styles.card, { backgroundColor: palette.paper }]}>
            <Card.Content style={styles.row}>
              <View style={styles.text}>
                <Text variant="titleMedium" style={{ color: palette.textPrimary }}>
                  {resource.getTitle?.(row) ?? String(row.name ?? row.code ?? row.id)}
                </Text>
                {resource.getSubtitle?.(row) ? (
                  <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
                    {resource.getSubtitle(row)}
                  </Text>
                ) : null}
                {resource.getDetails?.(row) ? (
                  <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
                    {resource.getDetails(row)}
                  </Text>
                ) : null}
              </View>
              {resource.canEdit && resource.editable !== false ? (
                <IconButton
                  icon="pencil-outline"
                  accessibilityLabel={common.edit}
                  onPress={() => {
                    setSelected(row);
                    setFormOpen(true);
                  }}
                />
              ) : null}
              {resource.canDelete && (resource.canDeleteRow?.(row) ?? true) ? (
                <IconButton
                  icon="delete-outline"
                  accessibilityLabel={common.delete}
                  onPress={() => setToDelete(row)}
                />
              ) : null}
              {resource.onManageMembers ? (
                <IconButton
                  icon="account-multiple-outline"
                  accessibilityLabel={dictionary.masters.stakeholderGroups.manageMembers}
                  onPress={() => resource.onManageMembers?.(row)}
                />
              ) : null}
              {resource.onOpenDetails ? (
                <IconButton
                  icon="chart-timeline-variant"
                  accessibilityLabel={resource.detailsLabel ?? dictionary.masters.common.details}
                  onPress={() => resource.onOpenDetails?.(row)}
                />
              ) : null}
            </Card.Content>
          </Card>
        )}
        keyExtractor={(row) => String(row.id)}
      />
      <FormKit
        visible={formOpen}
        title={selected ? `${common.edit} ${String(selected.name ?? '')}` : resource.addTitle}
        fields={formFields}
        values={formValues}
        saving={saveMutation.isPending}
        onDismiss={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        onSubmit={(values) => saveMutation.mutate(values as MasterValues)}
      />
      <ConfirmDialog
        visible={!!toDelete}
        confirming={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id);
        }}
      />
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2800}>
        {notice}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  text: { flex: 1, gap: 4 },
});
