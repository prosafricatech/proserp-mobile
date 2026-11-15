import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Button, Modal, Portal, Snackbar, Text } from 'react-native-paper';
import * as yup from 'yup';
import { useAuth } from '../../../auth/AuthProvider';
import { currenciesApi } from '../../../api/modules/masters/currencies/services';
import { stakeholderGroupsApi } from '../../../api/modules/masters/stakeholderGroups/services';
import { stakeholdersApi } from '../../../api/modules/masters/stakeholders/services';
import type { Stakeholder } from '../../../api/modules/masters/types';
import AsyncAutocompleteField from '../../../components/form/AsyncAutocompleteField';
import SelectField from '../../../components/form/SelectField';
import TextField from '../../../components/form/TextField';
import { dictionary } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';

const normalizeId = (value: string) => (/^\d+$/.test(value) ? Number(value) : value);
const normalizeIds = (values: string[]) => values.map(normalizeId);

type Values = {
  name: string;
  type: string;
  email: string;
  phone: string;
  tin: string;
  vrn: string;
  website: string;
  address: string;
  ledger_code: string;
  ledger_type: string;
  currency_id: string;
  group_ids: string[];
};
type Props = { visible: boolean; stakeholder?: Stakeholder | null; onDismiss: () => void };
const t = dictionary.masters.stakeholders;
const common = dictionary.masters.common;
const schema = yup.object({
  name: yup.string().trim().required(common.required),
  type: yup.string().required(common.required),
  email: yup.string().email(common.invalidEmail).default(''),
  phone: yup.string().default(''),
  tin: yup.string().default(''),
  vrn: yup.string().default(''),
  website: yup.string().default(''),
  address: yup.string().default(''),
  ledger_code: yup.string().default(''),
  ledger_type: yup.string().default('receivable'),
  currency_id: yup.string().default(''),
  group_ids: yup.array().of(yup.string().required()).default([]),
});
const types = [
  { value: 'Individual', label: t.types.individual },
  { value: 'Group', label: t.types.group },
  { value: 'Sole Proprietor', label: t.types.soleProprietor },
  { value: 'Partnership', label: t.types.partnership },
  { value: 'Private Limited', label: t.types.privateLimited },
  { value: 'Public Liability', label: t.types.publicLiability },
  { value: 'Government Institution', label: t.types.government },
  { value: 'Non-Government Organization', label: t.types.ngo },
];
const ledgerTypes = [
  { value: 'receivable', label: t.receivable },
  { value: 'payable', label: t.payable },
];

export default function StakeholderForm({ visible, stakeholder, onDismiss }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const { control, handleSubmit } = useForm<Values>({
    resolver: yupResolver(schema),
    values: {
      name: stakeholder?.name ?? '',
      type: stakeholder?.type ?? 'Individual',
      email: stakeholder?.email ?? '',
      phone: stakeholder?.phone ?? '',
      tin: stakeholder?.tin ?? '',
      vrn: stakeholder?.vrn ?? '',
      website: stakeholder?.website ?? '',
      address: stakeholder?.address ?? '',
      ledger_code: stakeholder?.ledger_code ?? '',
      ledger_type: stakeholder?.create_payable ? 'payable' : 'receivable',
      currency_id: stakeholder?.currency_id == null ? '' : String(stakeholder.currency_id),
      group_ids: stakeholder?.groups?.map((group) => String(group.id)) ?? [],
    },
  });
  const loadCurrencies = async (keyword: string) => {
    const result = await currenciesApi.list({ page: 1, limit: 30, keyword });
    return result.data.map((currency) => ({
      value: String(currency.id),
      label: `${currency.code} — ${currency.name}`,
    }));
  };
  const loadGroups = async (keyword: string) => {
    const result = await stakeholderGroupsApi.list({ page: 1, limit: 30, keyword });
    return result.data.map((group) => ({ value: String(group.id), label: group.name }));
  };
  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const payload = {
        ...values,
        type: values.type as never,
        currency_id: values.currency_id ? normalizeId(values.currency_id) : null,
        group_ids: normalizeIds(values.group_ids),
        create_receivable: values.ledger_type === 'receivable',
        create_payable: values.ledger_type === 'payable',
      };
      return stakeholder
        ? stakeholdersApi.update({ ...payload, id: stakeholder.id } as never)
        : stakeholdersApi.create(payload as never);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['masters', organizationId, 'stakeholders'] });
      setNotice(stakeholder ? common.saved : common.created);
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
            {stakeholder ? `${common.edit} ${stakeholder.name}` : t.addTitle}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.fields}>
            <TextField control={control} name="name" label={t.name} icon="account-outline" />
            <SelectField control={control} name="type" label={t.type} options={types} />
            <TextField
              control={control}
              name="email"
              label={t.email}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="email-outline"
            />
            <TextField
              control={control}
              name="phone"
              label={t.phone}
              keyboardType="phone-pad"
              icon="phone-outline"
            />
            <TextField control={control} name="tin" label={t.tin} />
            <TextField control={control} name="vrn" label={t.vrn} />
            <TextField
              control={control}
              name="website"
              label={t.website}
              keyboardType="url"
              autoCapitalize="none"
            />
            <TextField
              control={control}
              name="address"
              label={t.address}
              multiline
              numberOfLines={2}
            />
            <TextField control={control} name="ledger_code" label={t.ledgerCode} />
            {!stakeholder ? (
              <SelectField
                control={control}
                name="ledger_type"
                label={t.ledgerType}
                options={ledgerTypes}
              />
            ) : null}
            <AsyncAutocompleteField
              control={control}
              name="currency_id"
              label={t.currency}
              queryKey={`currency-options-${organizationId ?? 'no-org'}`}
              loadOptions={loadCurrencies}
            />
            <AsyncAutocompleteField
              control={control}
              name="group_ids"
              label={t.groups}
              queryKey={`stakeholder-group-options-${organizationId ?? 'no-org'}`}
              loadOptions={loadGroups}
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
