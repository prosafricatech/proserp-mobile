import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm, type FieldValues } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Switch, Text } from 'react-native-paper';
import * as yup from 'yup';
import { dictionary } from '../../i18n';
import { useAppTheme } from '../../theme/ThemeProvider';
import TextField from './TextField';
import SelectField, { type SelectOption } from './SelectField';
import AsyncAutocompleteField from './AsyncAutocompleteField';
import DateField from './DateField';

export type FormField = {
  name: string;
  label: string;
  icon?: string;
  required?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  multiline?: boolean;
  numberOfLines?: number;
  options?: SelectOption[];
  numeric?: boolean;
  min?: number;
  asyncOptions?: (keyword: string) => Promise<SelectOption[]>;
  queryKey?: string;
  multiple?: boolean;
  date?: boolean;
  toggle?: boolean;
  createOnly?: boolean;
  requiredMessage?: string;
  email?: boolean;
  requiredWhen?: string;
  hidden?: boolean;
};

type Props<T extends FieldValues> = {
  visible: boolean;
  title: string;
  fields: FormField[];
  values: T;
  saving?: boolean;
  onDismiss: () => void;
  onSubmit: (values: T) => void;
};

// Shared RHF + Yup form shell for master CRUD forms. Resource screens own fields and API calls.
export default function FormKit<T extends FieldValues>({
  visible,
  title,
  fields,
  values,
  saving,
  onDismiss,
  onSubmit,
}: Props<T>) {
  const { palette } = useAppTheme();
  const schema = yup.object(
    Object.fromEntries(
      fields.map((field) => {
        if (field.multiple) {
          let arraySchema = yup.array().of(yup.string().required()).default([]);
          if (field.required)
            arraySchema = arraySchema.min(
              1,
              field.requiredMessage ?? dictionary.masters.common.required
            );
          return [field.name, arraySchema];
        }
        if (field.toggle) return [field.name, yup.boolean()];
        if (field.numeric) {
          let numberSchema = yup
            .number()
            .transform((value, original) => (original === '' ? undefined : value));
          if (field.required)
            numberSchema = numberSchema.required(
              field.requiredMessage ?? dictionary.masters.common.required
            );
          if (field.requiredWhen) {
            numberSchema = numberSchema.when(field.requiredWhen, {
              is: (dependencyValue: unknown) => Boolean(dependencyValue),
              then: (schema) =>
                schema.required(field.requiredMessage ?? dictionary.masters.common.required),
            });
          }
          if (field.min !== undefined) numberSchema = numberSchema.min(field.min);
          return [field.name, numberSchema];
        }
        let stringSchema = field.required
          ? yup
              .string()
              .trim()
              .required(field.requiredMessage ?? dictionary.masters.common.required)
          : yup.string().nullable();
        if (field.email) stringSchema = stringSchema.email(dictionary.masters.common.invalidEmail);
        return [field.name, stringSchema];
      })
    )
  );
  const form = useForm<T>({
    values,
    resolver: yupResolver(schema) as never,
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: palette.background }]}
      >
        <Text variant="titleLarge" style={[styles.title, { color: palette.textPrimary }]}>
          {title}
        </Text>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.fields}>
          {fields
            .filter((field) => !field.hidden)
            .map((field) =>
              field.asyncOptions ? (
                <AsyncAutocompleteField
                  key={field.name}
                  control={form.control}
                  name={field.name as never}
                  label={field.label}
                  queryKey={field.queryKey}
                  loadOptions={field.asyncOptions}
                  multiple={field.multiple}
                />
              ) : field.date ? (
                <DateField
                  key={field.name}
                  control={form.control}
                  name={field.name as never}
                  label={field.label}
                />
              ) : field.toggle ? (
                <Controller
                  key={field.name}
                  control={form.control}
                  name={field.name as never}
                  render={({ field: controlledField }) => (
                    <View style={styles.toggleRow}>
                      <Text style={{ color: palette.textPrimary, flex: 1 }}>{field.label}</Text>
                      <Switch
                        value={!!controlledField.value}
                        onValueChange={controlledField.onChange}
                      />
                    </View>
                  )}
                />
              ) : field.options ? (
                <SelectField
                  key={field.name}
                  control={form.control}
                  name={field.name as never}
                  label={field.label}
                  icon={field.icon}
                  options={field.options}
                />
              ) : (
                <TextField
                  key={field.name}
                  control={form.control}
                  name={field.name as never}
                  label={field.label}
                  icon={field.icon ?? 'form-textbox'}
                  keyboardType={field.keyboardType}
                  multiline={field.multiline}
                  numberOfLines={field.numberOfLines}
                />
              )
            )}
        </ScrollView>
        <View style={styles.actions}>
          <Button onPress={onDismiss}>{dictionary.masters.common.cancel}</Button>
          <Button
            mode="contained"
            loading={saving}
            disabled={saving}
            onPress={() => void form.handleSubmit(onSubmit)()}
          >
            {dictionary.masters.common.save}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { marginHorizontal: 16, maxHeight: '88%', borderRadius: 18, padding: 20 },
  title: { marginBottom: 16 },
  fields: { paddingBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
