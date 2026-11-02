import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu, Text, TextInput } from 'react-native-paper';
import { Pressable } from 'react-native';
import { dictionary } from '../../i18n';
import type { Interval } from '../../modules/dashboard/api';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

const t = dictionary.dashboard;

// JumboCardQuick: header (title left, action right) + body.
export function Card({
  title,
  action,
  children,
  minHeight,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  minHeight?: number;
}) {
  const { palette, isDark } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.paper, minHeight },
        isDark ? { borderWidth: 1, borderColor: palette.divider } : styles.shadow,
      ]}
    >
      {title || action ? (
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            {typeof title === 'string' ? (
              <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
            ) : (
              title
            )}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

// MUI <Select size="small"> inside a labelled outlined field: the label sits on the border.
export function SelectMenu<T extends string | number>({
  label,
  value,
  options,
  onChange,
  width = 140,
}: {
  label: string;
  value: T;
  options: Array<[T, string]>;
  onChange: (v: T) => void;
  width?: number;
}) {
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);
  const current = options.find(([v]) => v === value)?.[1] ?? '';
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={label || current}
        >
          <View pointerEvents="none" style={{ width }}>
            <TextInput
              mode="outlined"
              dense
              label={label || undefined}
              value={current}
              editable={false}
              outlineColor={palette.divider}
              style={[styles.select, { backgroundColor: palette.paper }]}
              right={<TextInput.Icon icon="menu-down" />}
            />
          </View>
        </Pressable>
      }
    >
      {options.map(([v, l]) => (
        <Menu.Item
          key={String(v)}
          title={l}
          leadingIcon={v === value ? 'check' : undefined}
          onPress={() => {
            setOpen(false);
            onChange(v);
          }}
        />
      ))}
    </Menu>
  );
}

// Below lg, web replaces the Daily/Weekly/Monthly/Yearly button group with a Select "Interval".
export function IntervalSelect({
  value,
  onChange,
}: {
  value: Interval;
  onChange: (v: Interval) => void;
}) {
  return (
    <SelectMenu
      label={t.interval}
      value={value}
      onChange={onChange}
      options={[
        ['day', t.daily],
        ['week', t.weekly],
        ['month', t.monthly],
        ['year', t.yearly],
      ]}
    />
  );
}

export function InfoAlert({ children }: { children: React.ReactNode }) {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.alert, { borderColor: '#2EB5C9' }]}>
      <Text style={{ color: palette.textPrimary }}>{children}</Text>
    </View>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  const { palette } = useAppTheme();
  return <Text style={[styles.subHeading, { color: palette.textPrimary }]}>{children}</Text>;
}

export const chartColors = (palette: { primary: string; error: string; success: string }) => [
  palette.primary,
  palette.error,
  palette.success,
  '#F39711',
  '#2EB5C9',
  '#8E24AA',
  '#795548',
  '#00A073',
  '#E44A77',
  '#5E3BB7',
  '#567FFB',
  '#FFC84C',
];

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, marginBottom: 8 },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  titleWrap: { flexShrink: 1, flexGrow: 1, minWidth: 0 },
  title: { fontFamily: fonts.bold, fontSize: 17 },
  select: { height: 40, fontSize: 14 },
  alert: { borderWidth: 1, borderRadius: 6, padding: 12, marginVertical: 8 },
  subHeading: { fontFamily: fonts.semiBold, fontSize: 15, marginBottom: 8 },
});
