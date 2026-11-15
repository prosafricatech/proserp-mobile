import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Snackbar, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import type { Bank } from '../../../api/modules/masters/types';
import { banksApi } from '../../../api/modules/masters/banks/services';
import TextField from '../../../components/form/TextField';
import { useAuth } from '../../../auth/AuthProvider';
import { dictionary } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';

type Props = {
  visible: boolean;
  bank?: Bank | null;
  onDismiss: () => void;
};

type BankFormValues = {
  name: string;
  short_name: string;
  swift_code: string;
};

const t = dictionary.masters.banks;
const common = dictionary.masters.common;
const schema = yup.object({
  name: yup.string().trim().required(common.required),
  short_name: yup.string().trim().default(''),
  swift_code: yup.string().trim().default(''),
});

export default function BankForm({ visible, bank, onDismiss }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const { control, handleSubmit, reset } = useForm<BankFormValues>({
    resolver: yupResolver(schema),
    values: {
      name: bank?.name ?? '',
      short_name: bank?.short_name ?? '',
      swift_code: bank?.swift_code ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: BankFormValues) =>
      bank ? banksApi.update({ ...values, id: bank.id }) : banksApi.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'banks'],
      });
      setNotice(bank ? common.saved : common.created);
      reset();
      onDismiss();
    },
    onError: () => setNotice(common.failed),
  });

  const close = () => {
    reset();
    onDismiss();
  };

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={close}
          contentContainerStyle={[styles.modal, { backgroundColor: palette.background }]}
        >
          <Text variant="titleLarge" style={[styles.title, { color: palette.textPrimary }]}>
            {bank ? `${common.edit} ${bank.name}` : t.addTitle}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.fields}>
            <TextField control={control} name="name" label={t.name} icon="form-textbox" />
            <TextField
              control={control}
              name="short_name"
              label={t.shortName}
              icon="form-textbox"
            />
            <TextField
              control={control}
              name="swift_code"
              label={t.swiftCode}
              icon="bank"
              autoCapitalize="characters"
            />
          </ScrollView>
          <View style={styles.actions}>
            <Button onPress={close}>{common.cancel}</Button>
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
