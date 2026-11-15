import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Button, Modal, Portal, Snackbar, Text } from 'react-native-paper';
import * as yup from 'yup';
import { useAuth } from '../../../auth/AuthProvider';
import type { CostCenter } from '../../../api/modules/masters/types';
import { costCentersApi } from '../../../api/modules/masters/costCenters/services';
import AsyncAutocompleteField from '../../../components/form/AsyncAutocompleteField';
import TextField from '../../../components/form/TextField';
import { dictionary } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';

const normalizeIds = (value: string[]) => value.map((id) => (/^\d+$/.test(id) ? Number(id) : id));

type Values = { name: string; description: string; user_ids: string[] };
type Props = { visible: boolean; costCenter?: CostCenter | null; onDismiss: () => void };
const t = dictionary.masters.costCenters;
const common = dictionary.masters.common;
const schema = yup.object({
  name: yup.string().trim().required(common.required),
  description: yup.string().default(''),
  user_ids: yup
    .array()
    .of(yup.string().required())
    .min(1, t.usersRequired)
    .required(t.usersRequired),
});

export default function CostCenterForm({ visible, costCenter, onDismiss }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const { control, handleSubmit } = useForm<Values>({
    resolver: yupResolver(schema),
    values: {
      name: costCenter?.name ?? '',
      description: costCenter?.description ?? '',
      user_ids: costCenter?.users?.map((user) => String(user.id)) ?? [],
    },
  });
  const loadUsers = async (keyword: string) => {
    if (!organizationId) return [];
    const users = await costCentersApi.organizationUsers(organizationId, keyword);
    return users.map((user) => ({
      value: String(user.id),
      label: user.email ? `${user.name} — ${user.email}` : user.name,
    }));
  };
  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const user_ids = normalizeIds(values.user_ids);
      return costCenter
        ? costCentersApi.update({ ...values, id: costCenter.id, user_ids } as never)
        : costCentersApi.create({ ...values, user_ids } as never);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['masters', organizationId, 'costCenters'] });
      setNotice(costCenter ? common.saved : common.created);
      onDismiss();
    },
    onError: () => setNotice(common.failed),
  });

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={[styles.modal, { backgroundColor: palette.background }]}
        >
          <Text variant="titleLarge" style={[styles.title, { color: palette.textPrimary }]}>
            {costCenter ? `${common.edit} ${costCenter.name}` : t.addTitle}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.fields}>
            <TextField control={control} name="name" label={t.name} icon="form-textbox" />
            <TextField
              control={control}
              name="description"
              label={t.description}
              icon="text"
              multiline
              numberOfLines={3}
            />
            <AsyncAutocompleteField
              control={control}
              name="user_ids"
              label={t.users}
              queryKey={`organization-users-${organizationId ?? 'no-org'}`}
              loadOptions={loadUsers}
              multiple
            />
          </ScrollView>
          <View style={styles.actions}>
            <Button onPress={onDismiss}>{common.cancel}</Button>
            <Button
              mode="contained"
              loading={mutation.isPending}
              disabled={mutation.isPending}
              onPress={() => void handleSubmit((values) => mutation.mutate(values))()}
            >
              {common.save}
            </Button>
          </View>
        </Modal>
      </Portal>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2800}>
        {notice}
      </Snackbar>
    </>
  );
}
const styles = StyleSheet.create({
  modal: { marginHorizontal: 16, maxHeight: '88%', borderRadius: 18, padding: 20 },
  title: { marginBottom: 16 },
  fields: { paddingBottom: 8, gap: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 12 },
});
