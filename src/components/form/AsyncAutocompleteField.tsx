import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Checkbox,
  HelperText,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dictionary } from '../../i18n';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { SelectOption } from './SelectField';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  queryKey?: string;
  loadOptions: (keyword: string) => Promise<SelectOption[]>;
  multiple?: boolean;
};

export default function AsyncAutocompleteField<T extends FieldValues>({
  control,
  name,
  label,
  queryKey,
  loadOptions,
  multiple,
}: Props<T>) {
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [draft, setDraft] = useState<string[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);
  const query = useQuery({
    queryKey: ['async-autocomplete', queryKey ?? `${label}:${name}`, debouncedKeyword],
    queryFn: () => loadOptions(debouncedKeyword),
    enabled: open && debouncedKeyword.length >= 2,
  });
  const options = query.data ?? [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        const selectedValues = multiple
          ? Array.isArray(value)
            ? value.map(String)
            : []
          : value == null || value === ''
            ? []
            : [String(value)];
        const selectedLabels = selectedValues.map(
          (selected: string) =>
            options.find((option) => option.value === selected)?.label ?? selected
        );
        const toggle = (option: SelectOption) => {
          if (!multiple) {
            onChange(option.value);
            setOpen(false);
            onBlur();
            return;
          }
          setDraft((current) =>
            current.includes(option.value)
              ? current.filter((id) => id !== option.value)
              : [...current, option.value]
          );
        };

        return (
          <>
            <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
            <Pressable
              onPress={() => {
                setDraft(selectedValues);
                setOpen(true);
              }}
              accessibilityRole="button"
            >
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  editable={false}
                  value={selectedLabels.join(', ')}
                  placeholder={dictionary.masters.common.select}
                  error={!!error}
                  outlineColor={palette.divider}
                  activeOutlineColor={palette.primary}
                  style={{ backgroundColor: palette.paper }}
                  right={<TextInput.Icon icon="chevron-down" />}
                />
              </View>
            </Pressable>
            <HelperText type="error" visible={!!error}>
              {error?.message}
            </HelperText>
            <Portal>
              <Modal
                visible={open}
                onDismiss={() => setOpen(false)}
                contentContainerStyle={[styles.modal, { backgroundColor: palette.background }]}
              >
                <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
                  <Appbar.Header statusBarHeight={0} style={{ backgroundColor: palette.paper }}>
                    <Appbar.BackAction onPress={() => setOpen(false)} />
                    <Appbar.Content title={label} />
                  </Appbar.Header>
                  <Searchbar
                    value={keyword}
                    onChangeText={setKeyword}
                    placeholder={dictionary.masters.common.search}
                    style={styles.search}
                  />
                  <FlatList
                    data={options}
                    keyExtractor={(option) => option.value}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <Text style={[styles.empty, { color: palette.textSecondary }]}>
                        {debouncedKeyword.length < 2
                          ? dictionary.masters.common.typeMore
                          : query.isFetching
                            ? dictionary.masters.common.loading
                            : dictionary.masters.common.noResults}
                      </Text>
                    }
                    renderItem={({ item }) => {
                      const checked = (multiple ? draft : selectedValues).includes(item.value);
                      return (
                        <Checkbox.Item
                          label={item.label}
                          status={checked ? 'checked' : 'unchecked'}
                          onPress={() => toggle(item)}
                        />
                      );
                    }}
                  />
                  {multiple ? (
                    <View style={styles.actions}>
                      <Button onPress={() => setOpen(false)}>
                        {dictionary.masters.common.cancel}
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => {
                          onChange(draft);
                          onBlur();
                          setOpen(false);
                        }}
                      >
                        {dictionary.masters.common.selected.replace(
                          '{count}',
                          String(draft.length)
                        )}
                      </Button>
                    </View>
                  ) : null}
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
  modal: { flex: 1, marginVertical: 12, marginHorizontal: 8, borderRadius: 18, overflow: 'hidden' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  search: { margin: 12 },
  empty: { textAlign: 'center', paddingVertical: 28 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 12 },
});
