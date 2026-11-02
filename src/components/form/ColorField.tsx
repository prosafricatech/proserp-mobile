import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, Portal, Text, TextInput } from 'react-native-paper';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

// RN has no <input type="color">. This is the mobile equivalent of live-repo's colour inputs:
// type the HEX directly, or tap the swatch to pick from a palette.
const PRESETS = [
  '#2113AD',
  '#473BB7',
  '#567FFB',
  '#2196F3',
  '#00A8FF',
  '#2EB5C9',
  '#008598',
  '#0F8507',
  '#3BD2A2',
  '#7CB342',
  '#F39711',
  '#FFC84C',
  '#E44A77',
  '#E73145',
  '#AD001E',
  '#8E24AA',
  '#5E3BB7',
  '#795548',
  '#475259',
  '#263238',
  '#BEC5DA',
  '#F5F7FA',
  '#FFFFFF',
  '#000000',
];
const HEX = /^#([0-9A-Fa-f]{3}){1,2}$/;

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  helper?: string;
};

export default function ColorField<T extends FieldValues>({
  control,
  name,
  label,
  helper,
}: Props<T>) {
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        const valid = HEX.test(value ?? '');
        return (
          <>
            <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
            <TextInput
              mode="outlined"
              value={value ?? ''}
              onChangeText={(v) => onChange(v.startsWith('#') || !v ? v : `#${v}`)}
              onBlur={onBlur}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              error={!!error}
              outlineStyle={styles.outline}
              outlineColor={palette.divider}
              style={{ backgroundColor: palette.paper }}
              left={
                <TextInput.Icon
                  icon={() => (
                    <View
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: valid ? value : 'transparent',
                          borderColor: palette.divider,
                        },
                      ]}
                    />
                  )}
                  onPress={() => setOpen(true)}
                />
              }
              right={<TextInput.Icon icon="palette-outline" onPress={() => setOpen(true)} />}
            />
            <HelperText type={error ? 'error' : 'info'} visible={!!error || !!helper}>
              {error?.message ?? helper}
            </HelperText>
            <Portal>
              <Dialog visible={open} onDismiss={() => setOpen(false)}>
                <Dialog.Title>{label}</Dialog.Title>
                <Dialog.Content>
                  <View style={styles.grid}>
                    {PRESETS.map((color) => (
                      <Pressable
                        key={color}
                        accessibilityLabel={color}
                        onPress={() => {
                          onChange(color);
                          setOpen(false);
                        }}
                        style={[
                          styles.preset,
                          {
                            backgroundColor: color,
                            borderColor: color === value ? palette.primary : palette.divider,
                          },
                          color === value && styles.presetActive,
                        ]}
                      />
                    ))}
                  </View>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setOpen(false)}>OK</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 6 },
  outline: { borderRadius: 10 },
  swatch: { width: 22, height: 22, borderRadius: 6, borderWidth: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  preset: { width: 36, height: 36, borderRadius: 8, borderWidth: 1 },
  presetActive: { borderWidth: 3 },
});
