import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import type { PickedFile } from '../../api/upload';
import { dictionary } from '../../i18n';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  helper?: string;
  existingUrl?: string | null; // what the server already has (edit mode)
};

// RN has no <input type="file">: pick from the photo library, preview it, or clear it.
// The field value is a PickedFile (new upload) or null (keep what the server has).
export default function ImageField<T extends FieldValues>({
  control,
  name,
  label,
  helper,
  existingUrl,
}: Props<T>) {
  const { palette } = useAppTheme();
  const [denied, setDenied] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const picked = value as PickedFile | null | undefined;
        const previewUri = picked?.uri ?? existingUrl ?? null;

        const pick = async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            setDenied(true);
            return;
          }
          setDenied(false);
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.9,
          });
          if (result.canceled) return;
          const asset = result.assets[0];
          onChange({
            uri: asset.uri,
            name: asset.fileName ?? `${String(name)}.png`,
            type: asset.mimeType ?? 'image/png',
          } satisfies PickedFile);
        };

        return (
          <View style={styles.wrap}>
            <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
            <View
              style={[
                styles.box,
                {
                  borderColor: error ? palette.error : palette.divider,
                  backgroundColor: palette.paper,
                },
              ]}
            >
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.preview} contentFit="contain" />
              ) : (
                <View
                  style={[styles.preview, styles.empty, { backgroundColor: palette.background }]}
                />
              )}
              <View style={styles.actions}>
                <Button icon="image-outline" compact mode="outlined" onPress={pick}>
                  {dictionary.organizationForm.upload}
                </Button>
                {picked ? (
                  <Button
                    icon="close"
                    compact
                    textColor={palette.error}
                    onPress={() => onChange(null)}
                  >
                    {dictionary.organizationForm.remove}
                  </Button>
                ) : null}
              </View>
            </View>
            <HelperText
              type={error || denied ? 'error' : 'info'}
              visible={!!error || denied || !!helper}
            >
              {error?.message ?? (denied ? dictionary.profile.permissionDenied : helper)}
            </HelperText>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  label: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  preview: { width: 72, height: 72, borderRadius: 8 },
  empty: { borderRadius: 8 },
  actions: { flex: 1, gap: 6, alignItems: 'flex-start' },
});
