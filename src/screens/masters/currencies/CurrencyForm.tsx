import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Button, Modal, Portal, Snackbar, Text } from 'react-native-paper';
import * as yup from 'yup';
import { useAuth } from '../../../auth/AuthProvider';
import { CURRENCY_CATALOG } from '../../../api/modules/masters/currencies/catalog';
import { currenciesApi } from '../../../api/modules/masters/currencies/services';
import AsyncAutocompleteField from '../../../components/form/AsyncAutocompleteField';
import TextField from '../../../components/form/TextField';
import { dictionary } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';

type Values = { currency_code: string; exchange_rate: string };
type Props = { visible: boolean; onDismiss: () => void };
const t = dictionary.masters.currencies;
const common = dictionary.masters.common;
const schema = yup.object({
  currency_code: yup.string().required(common.required),
  exchange_rate: yup
    .number()
    .transform((value, original) => (original === '' ? undefined : value))
    .required(common.required)
    .min(1e-21),
});

export default function CurrencyForm({ visible, onDismiss }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const { control, handleSubmit } = useForm<Values>({
    resolver: yupResolver(schema) as never,
    values: { currency_code: '', exchange_rate: '1' },
  });
  const loadCurrencies = async (keyword: string) => {
    const existing = await currenciesApi.list({ page: 1, limit: 1000 });
    const usedCodes = new Set(existing.data.map((currency) => currency.code));
    const search = keyword.toLocaleLowerCase();
    return CURRENCY_CATALOG.filter(
      (currency) =>
        !usedCodes.has(currency.code) &&
        `${currency.name_plural} ${currency.code}`.toLocaleLowerCase().includes(search)
    )
      .slice(0, 30)
      .map((currency) => ({
        value: currency.code,
        label: `${currency.name_plural} (${currency.code})`,
      }));
  };
  const mutation = useMutation({
    mutationFn: (values: Values) =>
      currenciesApi.add({
        currency_code: values.currency_code,
        exchange_rate: Number(values.exchange_rate),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['masters', organizationId, 'currencies'] });
      setNotice(common.created);
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
            {t.addTitle}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.fields}>
            <AsyncAutocompleteField
              control={control}
              name="currency_code"
              label={t.name}
              queryKey={`currency-catalog-${organizationId ?? 'no-org'}`}
              loadOptions={loadCurrencies}
            />
            <TextField
              control={control}
              name="exchange_rate"
              label={t.exchangeRate}
              keyboardType="numeric"
              icon="currency-usd"
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
