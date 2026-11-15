import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Snackbar, Switch, Text } from 'react-native-paper';
import * as yup from 'yup';
import { useAuth } from '../../../auth/AuthProvider';
import { measurementUnitsApi } from '../../../api/modules/masters/measurementUnits/services';
import type { MeasurementUnit } from '../../../api/modules/masters/types';
import SelectField from '../../../components/form/SelectField';
import TextField from '../../../components/form/TextField';
import { dictionary } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';

type Values = {
  name: string;
  symbol: string;
  dimension: string;
  base_factor: string;
  allows_fractional: boolean;
  description: string;
};
type Props = { visible: boolean; unit?: MeasurementUnit | null; onDismiss: () => void };
const t = dictionary.masters.measurementUnits;
const common = dictionary.masters.common;
const schema = yup.object({
  name: yup.string().trim().required(common.required),
  symbol: yup.string().trim().required(common.required),
  dimension: yup.string().default(''),
  base_factor: yup
    .number()
    .transform((value, original) => (original === '' ? undefined : value))
    .when('dimension', {
      is: (dimension: string) => Boolean(dimension),
      then: (field) => field.required(t.factorRequired).min(1e-21),
      otherwise: (field) => field.nullable(),
    }),
  allows_fractional: yup.boolean().default(true),
  description: yup.string().default(''),
});
const dimensions = [
  { value: '', label: t.noDimension },
  { value: 'mass', label: t.dimensions.mass },
  { value: 'volume', label: t.dimensions.volume },
  { value: 'length', label: t.dimensions.length },
];

export default function MeasurementUnitForm({ visible, unit, onDismiss }: Props) {
  const { palette } = useAppTheme();
  const { authOrganization } = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const { control, handleSubmit } = useForm<Values>({
    resolver: yupResolver(schema) as never,
    values: {
      name: unit?.name ?? '',
      symbol: unit?.symbol ?? '',
      dimension: unit?.dimension ?? '',
      base_factor: String(unit?.base_factor ?? ''),
      allows_fractional: unit?.allows_fractional !== false,
      description: unit?.description ?? '',
    },
  });
  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const payload = {
        ...values,
        base_factor: values.base_factor ? Number(values.base_factor) : null,
        allows_fractional: values.allows_fractional !== false,
      };
      return unit
        ? measurementUnitsApi.update({ ...payload, id: unit.id } as never)
        : measurementUnitsApi.create(payload as never);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'measurementUnits'],
      });
      setNotice(unit ? common.saved : common.created);
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
            {unit ? `${common.edit} ${unit.name}` : t.addTitle}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.fields}>
            <TextField control={control} name="name" label={t.name} icon="form-textbox" />
            <TextField control={control} name="symbol" label={t.symbol} icon="form-textbox" />
            <SelectField
              control={control}
              name="dimension"
              label={t.dimension}
              options={dimensions}
            />
            <TextField
              control={control}
              name="base_factor"
              label={t.baseFactor}
              keyboardType="numeric"
              icon="calculator"
            />
            <Controller
              control={control}
              name="allows_fractional"
              render={({ field }) => (
                <View style={styles.toggle}>
                  <Text style={{ color: palette.textPrimary, flex: 1 }}>{t.allowsFractional}</Text>
                  <Switch value={field.value} onValueChange={field.onChange} />
                </View>
              )}
            />
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
  toggle: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 12 },
});
