import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Button, Modal, Portal, Snackbar, Text } from 'react-native-paper';
import * as yup from 'yup';
import { useAuth } from '../../../auth/AuthProvider';
import type { StakeholderGroup } from '../../../api/modules/masters/types';
import { stakeholderGroupsApi } from '../../../api/modules/masters/stakeholderGroups/services';
import TextField from '../../../components/form/TextField';
import { dictionary } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';

type Values = { name: string; description: string };
type Props = { visible: boolean; group?: StakeholderGroup | null; onDismiss: () => void };
const t = dictionary.masters.stakeholderGroups;
const common = dictionary.masters.common;
const schema = yup.object({
  name: yup.string().trim().required(common.required),
  description: yup.string().default(''),
});

export default function StakeholderGroupForm({ visible, group, onDismiss }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const { control, handleSubmit } = useForm<Values>({
    resolver: yupResolver(schema),
    values: { name: group?.name ?? '', description: group?.description ?? '' },
  });
  const mutation = useMutation({
    mutationFn: (values: Values) =>
      group
        ? stakeholderGroupsApi.update({ ...values, id: group.id })
        : stakeholderGroupsApi.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'stakeholderGroups'],
      });
      setNotice(group ? common.saved : common.created);
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
            {group ? `${common.edit} ${group.name}` : t.addTitle}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.fields}>
            <TextField control={control} name="name" label={t.name} icon="account-group-outline" />
            <TextField
              control={control}
              name="description"
              label={t.description}
              icon="text"
              multiline
              numberOfLines={3}
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
