import React, { useMemo, useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import {
  Appbar,
  HelperText,
  List,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dictionary } from '../../i18n';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

export type SelectOption = { value: string; label: string; description?: string };

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  icon?: string;
  options: SelectOption[];
  onSelect?: (option: SelectOption) => void;
};

// Mobile stand-in for MUI <Autocomplete>: a read-only field that opens a full-screen,
// searchable list. FlatList only renders the rows on screen, so 200+ options stay fast.
export default function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  options,
  onSelect,
}: Props<T>) {
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        const selected = options.find((o) => o.value === value);
        return (
          <>
            <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
            <Pressable onPress={() => setOpen(true)} accessibilityRole="button">
              {/* pointerEvents="none" lets the Pressable receive the tap instead of the input. */}
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  value={selected?.label ?? ''}
                  placeholder={dictionary.organizationForm.select}
                  editable={false}
                  error={!!error}
                  outlineStyle={styles.outline}
                  outlineColor={palette.divider}
                  style={{ backgroundColor: palette.paper }}
                  left={
                    icon ? (
                      <TextInput.Icon icon={icon} color={palette.textSecondary} size={20} />
                    ) : undefined
                  }
                  right={<TextInput.Icon icon="chevron-down" color={palette.textSecondary} />}
                />
              </View>
            </Pressable>
            <HelperText type="error" visible={!!error}>
              {error?.message}
            </HelperText>

            <Portal>
              <Modal
                visible={open}
                onDismiss={() => {
                  setOpen(false);
                  onBlur();
                }}
                contentContainerStyle={[styles.modal, { backgroundColor: palette.background }]}
              >
                <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
                  <Appbar.Header statusBarHeight={0} style={{ backgroundColor: palette.paper }}>
                    <Appbar.BackAction onPress={() => setOpen(false)} />
                    <Appbar.Content title={label} />
                  </Appbar.Header>
                  <Searchbar
                    placeholder={dictionary.organizationForm.search}
                    value={query}
                    onChangeText={setQuery}
                    style={styles.search}
                    autoFocus
                  />
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.value}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={20}
                    renderItem={({ item }) => (
                      <List.Item
                        title={item.label}
                        description={item.description}
                        onPress={() => {
                          onChange(item.value);
                          onSelect?.(item);
                          setOpen(false);
                          setQuery('');
                        }}
                        right={(props) =>
                          item.value === value ? <List.Icon {...props} icon="check" /> : null
                        }
                      />
                    )}
                  />
                </SafeAreaView>
              </Modal>
            </Portal>
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  label: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 6 },
  outline: { borderRadius: 10 },
  modal: { flex: 1 },
  search: { margin: 12 },
});
