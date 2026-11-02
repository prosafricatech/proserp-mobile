import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text } from 'react-native-paper';
import { dictionary } from '../../i18n';
import { dashboardApi, type DashboardSummary } from '../../modules/dashboard/api';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useDashboardSettings } from './DashboardContext';
import { compact, legendAmount } from './format';

const c = dictionary.dashboard.cards;

// live-repo dashboard/accountsCards/FinancialSummaryStrip.tsx. The ONLY thing "show figures"
// controls: hidden = labels + "••••", and the summary isn't even requested.
export function useFinancialSummary() {
  const { chartFilters, showFigures } = useDashboardSettings();
  const { from, to, cost_center_ids } = chartFilters;
  return useQuery({
    queryKey: ['financialSummary', from, to, cost_center_ids],
    queryFn: () => dashboardApi.summary({ from, to, cost_center_ids }),
    enabled: showFigures,
  });
}

type Metric = { value: number; previous: number };
type StatConfig = {
  label: string;
  shortLabel?: string;
  metric: Metric;
  higherIsBetter: boolean;
  signColoured?: boolean;
};
type Kind = 'incomeStatement' | 'balanceSheet' | 'revenue' | 'receivablesPayables' | 'inventory';

const statsFor = (kind: Kind, s: DashboardSummary): StatConfig[] => {
  const zero = { value: 0, previous: 0 };
  const is = s.income_statement;
  const bs = s.balance_sheet;
  switch (kind) {
    case 'incomeStatement':
      return [
        { label: c.revenue, metric: is?.revenue ?? zero, higherIsBetter: true },
        { label: c.expenses, metric: is?.expenses ?? zero, higherIsBetter: false },
        {
          label: c.netProfit,
          metric: is?.net_profit ?? zero,
          higherIsBetter: true,
          signColoured: true,
        },
      ];
    case 'balanceSheet':
      return [
        {
          label: c.totalAssets,
          shortLabel: c.assetsShort,
          metric: bs?.assets ?? zero,
          higherIsBetter: true,
        },
        {
          label: c.totalLiabilities,
          shortLabel: c.liabilitiesShort,
          metric: bs?.liabilities ?? zero,
          higherIsBetter: false,
        },
        { label: c.equity, metric: bs?.equity ?? zero, higherIsBetter: true, signColoured: true },
        {
          label: c.cashAndBank,
          shortLabel: c.cashShort,
          metric: bs?.cash ?? zero,
          higherIsBetter: true,
          signColoured: true,
        },
      ];
    case 'revenue':
      return [{ label: c.revenue, metric: is?.revenue ?? zero, higherIsBetter: true }];
    case 'receivablesPayables':
      return [
        { label: c.totalReceivable, metric: bs?.receivables ?? zero, higherIsBetter: true },
        { label: c.totalPayable, metric: bs?.payables ?? zero, higherIsBetter: false },
      ];
    case 'inventory':
      return [{ label: c.inventoryValue, metric: bs?.inventory ?? zero, higherIsBetter: true }];
  }
};

const isBalanceKind = (kind: Kind) =>
  kind === 'balanceSheet' || kind === 'receivablesPayables' || kind === 'inventory';

export function FinancialSummaryStrip({ kind, inline }: { kind: Kind; inline?: boolean }) {
  const { showFigures } = useDashboardSettings();
  const { palette } = useAppTheme();
  const summary = useFinancialSummary();
  const placeholder: DashboardSummary = {};
  const stats = statsFor(kind, summary.data ?? placeholder);
  // Phones use the short balance-sheet labels (web: below the sm breakpoint).
  const dense = kind === 'balanceSheet';

  if (showFigures && summary.isLoading) return <ActivityIndicator style={styles.loading} />;
  if (showFigures && summary.isError) return null;

  // Tooltip text for the deltas, e.g. "vs previous period: 1 Oct 2026 – 31 Oct 2026".
  const period = summary.data?.period;
  const dateOf = (iso: string) => dayjs(iso).format('D MMM YYYY');
  const previousFrom = period ? dateOf(period.previous_from) : '';
  const previousTo = period
    ? dayjs(period.previous_to).subtract(1, 'second').format('D MMM YYYY')
    : '';
  const comparison = isBalanceKind(kind)
    ? `${c.vsBalanceAsAt} ${previousTo}`
    : `${c.vsPreviousPeriod}: ${previousFrom} – ${previousTo}`;

  return (
    <View
      style={[inline ? styles.inlineWrap : [styles.strip, { borderBottomColor: palette.divider }]]}
    >
      {stats.map((stat) => (
        <Stat key={stat.label} stat={stat} inline={inline} dense={dense} comparison={comparison} />
      ))}
    </View>
  );
}

function Stat({
  stat,
  inline,
  dense,
  comparison,
}: {
  stat: StatConfig;
  inline?: boolean;
  dense?: boolean;
  comparison: string;
}) {
  const { showFigures } = useDashboardSettings();
  const { palette } = useAppTheme();
  const { value, previous } = stat.metric;
  const change = value - previous;
  const percent = Math.abs(previous) > 0.005 ? (change / Math.abs(previous)) * 100 : null;
  const flat = Math.abs(change) < 0.005;
  const good = stat.higherIsBetter ? change > 0 : change < 0;
  const deltaColour = flat ? palette.textSecondary : good ? palette.success : palette.error;
  const icon = flat ? 'minus' : change > 0 ? 'arrow-up' : 'arrow-down';
  const label = dense && stat.shortLabel ? stat.shortLabel : stat.label;

  if (!showFigures) {
    const mask = (
      <Text
        style={[
          inline ? styles.inlineValue : styles.value,
          { color: palette.textSecondary, opacity: 0.5, letterSpacing: 2 },
        ]}
      >
        ••••
      </Text>
    );
    return inline ? (
      mask
    ) : (
      <View style={styles.stat}>
        <Text numberOfLines={1} style={[styles.statLabel, { color: palette.textSecondary }]}>
          {label.toUpperCase()}
        </Text>
        {mask}
        <Text style={styles.spacer}> </Text>
      </View>
    );
  }

  const valueColour = stat.signColoured && value < 0 ? palette.error : palette.textPrimary;
  const delta = (
    <View style={styles.delta} accessibilityLabel={comparison}>
      <Icon source={icon} size={11} color={deltaColour} />
      <Text style={[styles.deltaText, { color: deltaColour }]}>
        {percent === null ? compact(Math.abs(change)) : `${Math.abs(percent).toFixed(1)}%`}
      </Text>
    </View>
  );

  if (inline) {
    return (
      <View style={styles.inlineStat}>
        <Text style={[styles.inlineValue, { color: valueColour }]}>{legendAmount(value)}</Text>
        {delta}
      </View>
    );
  }
  return (
    <View style={styles.stat}>
      <Text numberOfLines={1} style={[styles.statLabel, { color: palette.textSecondary }]}>
        {label.toUpperCase()}
      </Text>
      <Text numberOfLines={1} style={[styles.value, { color: valueColour }]}>
        {compact(value)}
      </Text>
      {delta}
    </View>
  );
}

// live-repo FigureLegend: inline value + delta for Operating Expenses (value from the pie).
export function FigureLegend({
  value,
  previous,
  loading,
  higherIsBetter,
}: {
  value: number;
  previous?: number;
  loading?: boolean;
  higherIsBetter: boolean;
}) {
  const { showFigures } = useDashboardSettings();
  if (showFigures && loading) return <ActivityIndicator style={styles.loading} />;
  return (
    <View style={styles.inlineWrap}>
      <Stat
        stat={{ label: '', metric: { value, previous: previous ?? value }, higherIsBetter }}
        inline
        comparison=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stat: { flex: 1, minWidth: 0, alignItems: 'center' },
  statLabel: { fontFamily: fonts.semiBold, fontSize: 10, letterSpacing: 0.5 },
  value: { fontFamily: fonts.bold, fontSize: 20 },
  spacer: { fontSize: 11, opacity: 0 },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  deltaText: { fontFamily: fonts.semiBold, fontSize: 11 },
  inlineWrap: { alignItems: 'center', marginTop: 4 },
  inlineStat: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  inlineValue: { fontFamily: fonts.bold, fontSize: 18 },
  loading: { marginVertical: 12 },
});
