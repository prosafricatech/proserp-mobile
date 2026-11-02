import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

// react-native-paper-dates ships no Swahili; the calendar uses English month names.
registerTranslation('en', en);

// Stored as YYYY-MM-DD (what the backend expects), shown the same way.
export const toIsoDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const fromIsoDate = (value?: string | null) => {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : undefined;
};

type Props<T extends FieldValues> = { control: Control<T>; name: Path<T>; label: string };

export default function DateField<T extends FieldValues>({ control, name, label }: Props<T>) {
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
          <Pressable onPress={() => setOpen(true)} accessibilityRole="button">
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                value={value ?? ''}
                placeholder="YYYY-MM-DD"
                editable={false}
                error={!!error}
                outlineStyle={styles.outline}
                outlineColor={palette.divider}
                style={{ backgroundColor: palette.paper }}
                left={<TextInput.Icon icon="calendar" color={palette.textSecondary} size={20} />}
              />
            </View>
          </Pressable>
          <HelperText type="error" visible={!!error}>
            {error?.message}
          </HelperText>
          <DatePickerModal
            locale="en"
            mode="single"
            visible={open}
            date={fromIsoDate(value)}
            onDismiss={() => setOpen(false)}
            onConfirm={({ date }) => {
              setOpen(false);
              if (date) onChange(toIsoDate(date));
            }}
          />
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 6 },
  outline: { borderRadius: 10 },
});
