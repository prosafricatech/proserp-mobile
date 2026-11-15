import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Appbar,
  IconButton,
  List,
  Modal,
  Portal,
  Snackbar,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Currency } from '../../../api/modules/masters/types';
import { currenciesApi, type ExchangeRate } from '../../../api/modules/masters/currencies/services';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import DateField, { toIsoDate } from '../../../components/form/DateField';
import TextField from '../../../components/form/TextField';
import { dictionary } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { useAuth } from '../../../auth/AuthProvider';

type Props = {
  currency: Currency | null;
  canAdd: boolean;
  canDelete: boolean;
  onClose: () => void;
};
type RateValues = { as_at: string; rate: string };
type DateRange = { from: string; to: string };
const rateSchema = yup.object({
  as_at: yup.string().required(dictionary.masters.common.required),
  rate: yup
    .number()
    .transform((value, original) => (original === '' ? undefined : value))
    .required(dictionary.masters.common.required)
    .min(1e-21, dictionary.masters.currencies.rateRequired),
});

export default function CurrencyExchangeRates({ currency, canAdd, canDelete, onClose }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const queryClient = useQueryClient();
  const t = dictionary.masters.currencies;
  const common = dictionary.masters.common;
  const [addOpen, setAddOpen] = useState(false);
  const [deleteRate, setDeleteRate] = useState<ExchangeRate | null>(null);
  const [notice, setNotice] = useState('');
  const today = toIsoDate(new Date());
  const rateForm = useForm<RateValues>({
    resolver: yupResolver(rateSchema) as never,
    values: { as_at: today, rate: '' },
  });
  const rangeForm = useForm<DateRange>({
    defaultValues: { from: toIsoDate(dayjs().subtract(1, 'month').toDate()), to: today },
  });
  const range = useWatch({ control: rangeForm.control });
  const rateKey = ['masters', organizationId, 'exchangeRates', currency?.id, range.from, range.to];

  const ratesQuery = useQuery({
    queryKey: rateKey,
    queryFn: () =>
      currenciesApi.exchangeRates({
        currencyId: currency!.id,
        from: dayjs(range.from).startOf('day').toISOString(),
        to: dayjs(range.to).endOf('day').toISOString(),
      }),
    enabled: !!currency && Number(currency.id) !== 1 && !!range.from && !!range.to,
  });

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['masters', organizationId, 'exchangeRates', currency?.id],
    });
  const addMutation = useMutation({
    mutationFn: (values: RateValues) =>
      currenciesApi.updateExchangeRate({
        id: currency!.id,
        as_at: dayjs(values.as_at).toISOString(),
        rate: Number(values.rate),
      }),
    onSuccess: () => {
      setAddOpen(false);
      setNotice(t.rateAdded);
      void refresh();
    },
    onError: () => setNotice(common.failed),
  });
  const removeMutation = useMutation({
    mutationFn: (id: string | number) => currenciesApi.removeExchangeRate(id),
    onSuccess: () => {
      setDeleteRate(null);
      setNotice(t.rateDeleted);
      void refresh();
    },
    onError: () => setNotice(common.failed),
  });

  return (
    <>
      <Portal>
        <Modal
          visible={!!currency}
          onDismiss={onClose}
          contentContainerStyle={[styles.modal, { backgroundColor: palette.background }]}
        >
          <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
            <Appbar.Header statusBarHeight={0} style={{ backgroundColor: palette.paper }}>
              <Appbar.BackAction onPress={onClose} />
              <Appbar.Content title={`${currency?.code ?? ''} · ${t.title}`} />
              {currency && Number(currency.id) !== 1 && canAdd ? (
                <Appbar.Action
                  icon="plus"
                  accessibilityLabel={t.addRate}
                  onPress={() => setAddOpen(true)}
                />
              ) : null}
            </Appbar.Header>
            {currency && Number(currency.id) !== 1 ? (
              <View style={styles.dateRange}>
                <DateField control={rangeForm.control} name="from" label={t.fromDate} />
                <DateField control={rangeForm.control} name="to" label={t.toDate} />
              </View>
            ) : (
              <Text style={[styles.baseInfo, { color: palette.textSecondary }]}>
                {t.baseCurrencyInfo}
              </Text>
            )}
            {Number(currency?.id) === 1 ? null : ratesQuery.isPending ? (
              <ActivityIndicator style={styles.loader} />
            ) : ratesQuery.isError ? (
              <View style={styles.empty}>
                <Text>{common.failed}</Text>
                <IconButton
                  icon="refresh"
                  accessibilityLabel={common.retry}
                  onPress={() => void ratesQuery.refetch()}
                />
              </View>
            ) : (
              <FlatList
                data={ratesQuery.data ?? []}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>{t.noRates}</Text>}
                renderItem={({ item }) => (
                  <List.Item
                    title={String(item.rate)}
                    description={`${dayjs(item.rate_datetime).format('DD MMM YYYY, HH:mm')}${item.updated_by?.name ? ` · ${item.updated_by.name}` : ''}`}
                    right={() =>
                      canDelete ? (
                        <IconButton
                          icon="delete-outline"
                          accessibilityLabel={common.delete}
                          onPress={() => setDeleteRate(item)}
                        />
                      ) : null
                    }
                  />
                )}
              />
            )}
          </SafeAreaView>
        </Modal>
      </Portal>
      <Portal>
        <Modal
          visible={addOpen}
          onDismiss={() => setAddOpen(false)}
          contentContainerStyle={[styles.formModal, { backgroundColor: palette.background }]}
        >
          <Text variant="titleLarge" style={{ color: palette.textPrimary }}>
            {t.addRate}
          </Text>
          <View style={styles.rateFields}>
            <DateField control={rateForm.control} name="as_at" label={t.asAt} />
            <TextField
              control={rateForm.control}
              name="rate"
              label={t.exchangeRate}
              keyboardType="numeric"
              icon="currency-usd"
            />
          </View>
          <View style={styles.formActions}>
            <Button onPress={() => setAddOpen(false)}>{common.cancel}</Button>
            <Button
              mode="contained"
              loading={addMutation.isPending}
              disabled={addMutation.isPending}
              onPress={() => void rateForm.handleSubmit((values) => addMutation.mutate(values))()}
            >
              {common.save}
            </Button>
          </View>
        </Modal>
      </Portal>
      <ConfirmDialog
        visible={!!deleteRate}
        confirming={removeMutation.isPending}
        onCancel={() => setDeleteRate(null)}
        onConfirm={() => {
          if (deleteRate) removeMutation.mutate(deleteRate.id);
        }}
      />
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2600}>
        {notice}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modal: { flex: 1, marginVertical: 12, marginHorizontal: 8, borderRadius: 18, overflow: 'hidden' },
  dateRange: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  baseInfo: { padding: 20 },
  loader: { margin: 24 },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  empty: { textAlign: 'center', padding: 24 },
  formModal: { marginHorizontal: 16, borderRadius: 18, padding: 20 },
  rateFields: { paddingTop: 16, gap: 10 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 12 },
});
