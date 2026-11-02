import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Checkbox,
  Chip,
  Icon,
  List,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthProvider';
import '../../components/form/DateField'; // registers the date picker's translations
import { dictionary } from '../../i18n';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useDashboardSettings, type CostCenter } from './DashboardContext';
import { readableDate } from './format';
import { Card } from './ui';

const t = dictionary.dashboard;

// live-repo dashboard/Filters.tsx: From, To (date + time), cost centers, show-figures toggle,
// presets.
export default function Filters() {
  const { authOrganization } = useAuth();
  const { chartFilters, setChartFilters, showFigures, setShowFigures } = useDashboardSettings();
  const { palette } = useAppTheme();
  const minDate = authOrganization?.organization?.recording_start_date
    ? dayjs(authOrganization.organization.recording_start_date).toDate()
    : undefined;

  const preset = (from: dayjs.Dayjs) =>
    setChartFilters((f) => ({ ...f, from: from.toISOString(), to: dayjs().toISOString() }));
  const presets: Array<[string, () => void]> = [
    [t.cards.presets.today, () => preset(dayjs().startOf('day'))],
    [t.cards.presets.last7, () => preset(dayjs().subtract(6, 'day').startOf('day'))],
    [t.cards.presets.last30, () => preset(dayjs().subtract(29, 'day').startOf('day'))],
    [t.cards.presets.thisMonth, () => preset(dayjs().startOf('month'))],
    [t.cards.presets.thisYear, () => preset(dayjs().startOf('year'))],
  ];

  return (
    <Card>
      <DateTimeField
        label={t.from}
        value={chartFilters.from}
        minDate={minDate}
        onChange={(from) => setChartFilters((f) => ({ ...f, from }))}
      />
      <DateTimeField
        label={t.to}
        value={chartFilters.to}
        minDate={minDate}
        onChange={(to) => setChartFilters((f) => ({ ...f, to }))}
      />
      <CostCenterSelector />
      {/* Web: a Checkbox with eye icons; the label names the action. */}
      <Pressable
        style={styles.figures}
        onPress={() => setShowFigures(!showFigures)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: showFigures }}
      >
        <Icon
          source={showFigures ? 'eye-outline' : 'eye-off-outline'}
          size={22}
          color={showFigures ? palette.primary : palette.textSecondary}
        />
        <Text style={{ color: palette.textPrimary }}>
          {showFigures ? t.cards.hideFigures : t.cards.showFigures}
        </Text>
      </Pressable>
      <View style={styles.presets}>
        {presets.map(([label, onPress]) => (
          <Chip key={label} compact mode="outlined" onPress={onPress}>
            {label}
          </Chip>
        ))}
      </View>
    </Card>
  );
}

// MUI X DateTimePicker → date picker, then time picker.
function DateTimeField({
  label,
  value,
  minDate,
  onChange,
}: {
  label: string;
  value: string;
  minDate?: Date;
  onChange: (iso: string) => void;
}) {
  const { palette } = useAppTheme();
  const [step, setStep] = useState<'closed' | 'date' | 'time'>('closed');
  const [date, setDate] = useState<Date>(new Date(value));
  const current = dayjs(value);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
      <Button
        mode="outlined"
        icon="calendar-clock"
        onPress={() => {
          setDate(new Date(value));
          setStep('date');
        }}
        contentStyle={styles.fieldButton}
        style={styles.fieldOutline}
      >
        {readableDate(value)}
      </Button>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={step === 'date'}
        date={date}
        validRange={minDate ? { startDate: minDate } : undefined}
        onDismiss={() => setStep('closed')}
        onConfirm={({ date: picked }) => {
          if (!picked) return setStep('closed');
          setDate(picked);
          setStep('time');
        }}
      />
      <TimePickerModal
        locale="en"
        visible={step === 'time'}
        hours={current.hour()}
        minutes={current.minute()}
        onDismiss={() => setStep('closed')}
        onConfirm={({ hours, minutes }) => {
          setStep('closed');
          onChange(dayjs(date).hour(hours).minute(minutes).second(0).millisecond(0).toISOString());
        }}
      />
    </View>
  );
}

// live-repo masters/costCenters/CostCenterSelector.tsx (multiple, grouped by type).
const TYPE_ORDER: Array<[string | null, keyof typeof dictionary.dashboard.costCenterTypes]> = [
  [null, 'unspecified'],
  ['Work Center', 'workCenter'],
  ['Sales Outlet', 'salesOutlet'],
  ['Fuel Station', 'fuelStation'],
  ['Project', 'project'],
];

function CostCenterSelector() {
  const { authOrganization } = useAuth();
  const { chartFilters, setChartFilters } = useDashboardSettings();
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);
  const options: CostCenter[] = authOrganization?.costCenters ?? [];
  // Empty selection = the default filters (web shows nothing pre-selected).
  const [selected, setSelected] = useState<CostCenter[]>([]);

  const sections = useMemo(
    () =>
      TYPE_ORDER.map(([type, key]) => ({
        title: t.costCenterTypes[key],
        data: options.filter((c) =>
          type === null ? !c.type || !TYPE_ORDER.some(([tt]) => tt === c.type) : c.type === type
        ),
      })).filter((s) => s.data.length),
    [options]
  );

  const apply = (next: CostCenter[]) => {
    setSelected(next);
    setChartFilters((f) =>
      next.length
        ? { ...f, cost_center_ids: next.map((c) => c.id), costCenters: next }
        : { ...f, cost_center_ids: 'all', costCenters: options }
    );
  };
  const toggle = (c: CostCenter) =>
    apply(
      selected.some((s) => String(s.id) === String(c.id))
        ? selected.filter((s) => String(s.id) !== String(c.id))
        : [...selected, c]
    );

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{t.costCenterLabel}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.selector, { borderColor: palette.divider }]}
      >
        {selected.length ? (
          <View style={styles.chips}>
            {selected.map((c) => (
              <Chip key={String(c.id)} compact onClose={() => toggle(c)}>
                {c.name}
              </Chip>
            ))}
          </View>
        ) : (
          <Text style={{ color: palette.textSecondary, flex: 1 }}>{t.costCenterLabel}</Text>
        )}
        <Icon source="chevron-down" size={20} color={palette.textSecondary} />
      </Pressable>
      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: palette.paper }]}
        >
          <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
            <Appbar.Header statusBarHeight={0} style={{ backgroundColor: palette.paper }}>
              <Appbar.BackAction onPress={() => setOpen(false)} />
              <Appbar.Content title={t.costCenterLabel} />
            </Appbar.Header>
            <SectionList
              sections={sections}
              keyExtractor={(c) => String(c.id)}
              renderSectionHeader={({ section }) => (
                <List.Subheader style={{ backgroundColor: palette.background }}>
                  {section.title}
                </List.Subheader>
              )}
              renderItem={({ item }) => (
                <Checkbox.Item
                  label={item.name}
                  status={
                    selected.some((s) => String(s.id) === String(item.id)) ? 'checked' : 'unchecked'
                  }
                  onPress={() => toggle(item)}
                  position="leading"
                  labelStyle={styles.option}
                />
              )}
            />
          </SafeAreaView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  field: { marginBottom: 10 },
  label: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 6 },
  fieldButton: { justifyContent: 'flex-start' },
  fieldOutline: { borderRadius: 8 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 48,
  },
  chips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  figures: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  modal: { flex: 1 },
  option: { textAlign: 'left' },
});
