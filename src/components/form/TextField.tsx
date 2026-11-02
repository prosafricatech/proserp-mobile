import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, TextInputProps } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  icon: string;
  password?: boolean;
  disabled?: boolean;
  helper?: string; // shown under the field when there's no error
} & Pick<
  TextInputProps,
  | 'placeholder'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'keyboardType'
  | 'textContentType'
  | 'returnKeyType'
  | 'onSubmitEditing'
>;

// Label-above outlined field with an optional leading icon, like the web forms
// (fieldLabelSx + fieldSx in live-repo's LoginForm/SignupForm). Wraps
// react-hook-form's Controller so screens only pass control + name.
export default function TextField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  password,
  disabled,
  helper,
  ...inputProps
}: Props<T>) {
  const { palette } = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <>
          <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
          <TextInput
            mode="outlined"
            outlineStyle={styles.outline}
            outlineColor={palette.divider}
            activeOutlineColor={palette.primary}
            placeholderTextColor={palette.textSecondary}
            textColor={palette.textPrimary}
            style={{ backgroundColor: palette.paper }}
            contentStyle={styles.content}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            disabled={disabled}
            error={!!error}
            secureTextEntry={password && !visible}
            left={<TextInput.Icon icon={icon} color={palette.textSecondary} size={20} />}
            right={
              password ? (
                <TextInput.Icon
                  icon={visible ? 'eye' : 'eye-off'}
                  color={palette.textSecondary}
                  onPress={() => setVisible((v) => !v)}
                />
              ) : undefined
            }
            {...inputProps}
          />
          <HelperText
            type={error ? 'error' : 'info'}
            visible={!!error || !!helper}
            style={styles.helper}
          >
            {error?.message ?? helper}
          </HelperText>
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 6 },
  outline: { borderRadius: 10 },
  content: { fontFamily: fonts.regular },
  helper: { marginBottom: 4 },
});
