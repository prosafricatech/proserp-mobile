import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { Text as SvgText, TSpan } from 'react-native-svg';
import {
  ActivityIndicator,
  Badge,
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  List,
  Menu,
  Modal,
  Portal,
  ProgressBar,
  Snackbar,
  Text,
} from 'react-native-paper';
import { shareImage, sharePdf } from '../../lib/files/share';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import { PERMISSIONS } from '../../constants/permissions';
import { dictionary, format } from '../../i18n';
import { dashboardApi, type DueInvoice, type Interval } from '../../modules/dashboard/api';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useDashboardSettings } from './DashboardContext';
import { FigureLegend, FinancialSummaryStrip, useFinancialSummary } from './FinancialSummaryStrip';
import {
  chartScale,
  currency,
  periodLabel,
  readableDate,
  shortNumber,
  sparseLabels,
  twoDecimals,
} from './format';
import { Card, chartColors, InfoAlert, IntervalSelect } from './ui';

const t = dictionary.dashboard;

// Opens a full report that is built in its own Hatua (web opens it in a dialog).
export const useOpenReport = () => {
  const navigation = useNavigation<any>();
  return (id: string, title: string, path: string, hatua: number) =>
    navigation.navigate('ComingSoon', { id, title, path, hatua });
};

// Shared multi-series trend chart (Recharts ComposedChart of Lines on web).
export function TrendChart({
  series,
  labels,
  height = 196,
}: {
  series: Array<{ name: string; color: string; values: number[] }>;
  labels: string[];
  height?: number;
}) {
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const chartWidth = width - 32 - 32 - 56;
  const fits = labels.length <= 12;
  if (!labels.length) return <View style={{ height }} />;
  const shown = fits ? sparseLabels(labels) : labels;
  const single = labels.length === 1;
  const scale = chartScale(series.flatMap((s) => s.values));
  return (
    <View>
      <LineChart
        dataSet={series.map((s) => ({
          // Recharts draws no line for a single point, only its dot: show hollow dots then.
          data: s.values.map((value, i) => ({
            value,
            label: shown[i],
            customDataPoint: single
              ? () => (
                  <View
                    style={[styles.dot, { borderColor: s.color, backgroundColor: palette.paper }]}
                  />
                )
              : undefined,
          })),
          color: s.color,
          dataPointsColor: s.color,
          hideDataPoints: !single,
          thickness: 2,
        }))}
        curved
        height={height - 40}
        width={chartWidth}
        adjustToWidth={fits}
        spacing={fits ? undefined : 56}
        // A single point sits in the middle of the plot, as in Recharts.
        initialSpacing={single ? chartWidth / 2 : 10}
        endSpacing={10}
        {...scale}
        formatYLabel={(v) => String(shortNumber(Number(v)))}
        yAxisLabelWidth={56}
        yAxisTextStyle={{ color: palette.textSecondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: palette.textSecondary, fontSize: 9, width: fits ? 100 : 70 }}
        rulesType="dashed"
        rulesColor={palette.divider}
        yAxisColor={palette.divider}
        xAxisColor={palette.divider}
        scrollToEnd={!fits}
        pointerConfig={{
          pointerStripColor: palette.divider,
          pointerColor: palette.primary,
          radius: 5,
          pointerLabelWidth: 180,
          pointerLabelHeight: 20 + series.length * 18,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: Array<{ value: number }>, _: unknown, index: number) => (
            <View
              style={[
                styles.tooltip,
                { backgroundColor: palette.paper, borderColor: palette.divider },
              ]}
            >
              <Text style={styles.tooltipTitle}>{labels[index] ?? ''}</Text>
              {series.map((s, i) => (
                <Text key={s.name} style={{ color: s.color, fontSize: 12 }}>
                  {`${s.name}: ${twoDecimals(Number(items[i]?.value ?? 0))}`}
                </Text>
              ))}
            </View>
          ),
        }}
      />
      <Legend items={series.map((s) => ({ name: s.name, color: s.color }))} />
    </View>
  );
}

// Recharts' default legend: a short line through a hollow circle, label in the series colour.
export function Legend({
  items,
  shape = 'line',
}: {
  items: Array<{ name: string; color: string }>;
  shape?: 'line' | 'square';
}) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.legend}>
      {items.map((i) => (
        <View key={i.name} style={styles.legendItem}>
          {shape === 'square' ? (
            <View style={[styles.legendSquare, { backgroundColor: i.color }]} />
          ) : (
            <View style={styles.legendLine}>
              <View style={[styles.legendStroke, { backgroundColor: i.color }]} />
              <View
                style={[
                  styles.legendCircle,
                  { borderColor: i.color, backgroundColor: palette.paper },
                ]}
              />
            </View>
          )}
          <Text style={{ color: i.color, fontSize: 13 }}>{i.name}</Text>
        </View>
      ))}
    </View>
  );
}

// live-repo accountsCards/ProfitAndLossTrendCard.tsx
export function ProfitAndLossTrendCard() {
  const { chartFilters } = useDashboardSettings();
  const { palette } = useAppTheme();
  const openReport = useOpenReport();
  const [aggregateBy, setAggregateBy] = useState<Interval>('day');
  const { from, to, cost_center_ids } = chartFilters;

  const query = useQuery({
    queryKey: ['profitAndLossTrend', { from, to, cost_center_ids, aggregate_by: aggregateBy }],
    queryFn: async () => {
      const { incomeFigures, expenseFigures } = await dashboardApi.profitAndLossFigures({
        from,
        to,
        cost_center_ids,
        aggregate_by: aggregateBy,
      });
      const merged = new Map<string, { Revenue: number; Expenses: number }>();
      incomeFigures.forEach((i) => merged.set(i.period, { Revenue: i.amount, Expenses: 0 }));
      expenseFigures.forEach((e) =>
        merged.set(e.period, { Revenue: merged.get(e.period)?.Revenue ?? 0, Expenses: e.amount })
      );
      return [...merged.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, v]) => ({
          name: periodLabel(name, aggregateBy),
          ...v,
          Profit: v.Revenue - v.Expenses,
        }));
    },
  });
  const rows = query.data ?? [];

  return (
    <Card
      title={t.cards.profitAndLossTrend}
      action={
        <View style={styles.actions}>
          <IntervalSelect value={aggregateBy} onChange={setAggregateBy} />
          <IconButton
            icon="chart-gantt"
            size={30}
            iconColor={palette.primary}
            accessibilityLabel={t.tooltips.incomeStatement}
            onPress={() =>
              openReport('incomeStatement', t.cards.incomeStatement, '/accounts/reports', 10)
            }
          />
        </View>
      }
    >
      <FinancialSummaryStrip kind="incomeStatement" />
      {query.isLoading ? (
        <ActivityIndicator style={{ height: 196 }} />
      ) : (
        <TrendChart
          labels={rows.map((r) => r.name)}
          series={[
            { name: 'Revenue', color: '#2196f3', values: rows.map((r) => r.Revenue) },
            { name: 'Expenses', color: '#e91e63', values: rows.map((r) => r.Expenses) },
            { name: 'Profit', color: '#4caf50', values: rows.map((r) => r.Profit) },
          ]}
        />
      )}
    </Card>
  );
}

// live-repo accountsCards/BalanceSheetTrend.tsx
export function BalanceSheetTrend() {
  const { chartFilters } = useDashboardSettings();
  const { palette } = useAppTheme();
  const openReport = useOpenReport();
  const [aggregateBy, setAggregateBy] = useState<Interval>('day');
  const { from, to, cost_center_ids } = chartFilters;

  const query = useQuery({
    queryKey: ['balanceSheetTrend', { from, to, cost_center_ids, aggregate_by: aggregateBy }],
    queryFn: async () => {
      const figures = await dashboardApi.balanceSheetFigures({
        from,
        to,
        cost_center_ids,
        aggregate_by: aggregateBy,
      });
      return figures.map((f) => ({
        name: periodLabel(f.period, aggregateBy, 'dddd, MMMM D, YYYY'),
        Assets: f.assetsFigure,
        Liabilities: f.liabilitiesFigure,
        Equity: f.assetsFigure - f.liabilitiesFigure,
      }));
    },
  });
  const rows = query.data ?? [];

  return (
    <Card
      title={t.cards.balanceSheetTrend}
      action={
        <View style={styles.actions}>
          <IntervalSelect value={aggregateBy} onChange={setAggregateBy} />
          <IconButton
            icon="scale-balance"
            size={30}
            iconColor={palette.primary}
            accessibilityLabel={t.tooltips.openBalanceSheetReport}
            onPress={() =>
              openReport('balanceSheet', t.cards.balanceSheet, '/accounts/reports', 10)
            }
          />
        </View>
      }
    >
      <FinancialSummaryStrip kind="balanceSheet" />
      {query.isLoading ? (
        <ActivityIndicator style={{ height: 196 }} />
      ) : (
        <TrendChart
          labels={rows.map((r) => r.name)}
          series={[
            { name: 'Assets', color: palette.success, values: rows.map((r) => r.Assets) },
            { name: 'Liabilities', color: palette.error, values: rows.map((r) => r.Liabilities) },
            { name: 'Equity', color: '#2196f3', values: rows.map((r) => r.Equity) },
          ]}
        />
      )}
    </Card>
  );
}

// Highcharts pie: "<b>{name}</b> {percentage:.1f} %" data labels, no legend, a tooltip on tap
// ("{point.y:,.2f}: ({point.percentage:.1f}%)") and Highcharts' exporting (☰) menu.
function DistributionPie({
  data,
  loading,
  title,
}: {
  data: Array<{ name: string; y: number }>;
  loading: boolean;
  title: string;
}) {
  const { palette } = useAppTheme();
  // captureRef photographs any View that isn't collapsed away (collapsable={false}).
  const shot = useRef<any>(null);
  const [menu, setMenu] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const slices = data.filter((d) => d.y > 0);
  const total = slices.reduce((s, d) => s + d.y, 0);
  const colors = chartColors(palette);
  if (loading) return <ActivityIndicator style={{ height: 255 }} />;

  const capture = async (format: 'png' | 'jpg') => {
    const uri = await captureRef(shot, {
      format,
      quality: 1,
      result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
    });
    return uri;
  };
  const run = (fn: () => Promise<void>) => {
    setMenu(false);
    fn().catch((e) => setMessage(getErrorMessage(e)));
  };
  // The chart as a one-image HTML page, for printing and PDF.
  const imageHtml = async () => {
    const src =
      Platform.OS === 'web'
        ? await capture('png')
        : `data:image/png;base64,${await captureRef(shot, { format: 'png', result: 'base64' })}`;
    return `
      <html>
        <body style="margin: 0; display: flex; justify-content: center">
          <img style="max-width: 100%" src="${src}" />
        </body>
      </html>`;
  };

  const pie = (radius: number) =>
    total > 0 ? (
      <PieChart
        data={slices.map((d, i) => ({
          value: d.y,
          color: colors[i % colors.length],
          text: d.name,
        }))}
        radius={radius}
        // Room around the pie for the external labels (Highcharts' distance: 15).
        extraRadius={radius * 1.1}
        focusOnPress
        // Highcharts tooltip: "{point.name}" then "{point.y:,.2f}: ({point.percentage:.1f}%)".
        showTooltip
        tooltipComponent={(index: number) => {
          const point = slices[index];
          if (!point) return null;
          return (
            <View
              style={[
                styles.tooltip,
                { backgroundColor: palette.paper, borderColor: palette.divider, width: 200 },
              ]}
            >
              <Text style={{ fontSize: 12, color: palette.textSecondary }}>{point.name}</Text>
              <Text style={{ color: palette.textPrimary }}>
                {`${twoDecimals(point.y)}: `}
                <Text
                  style={{ fontFamily: fonts.bold }}
                >{`(${((point.y / total) * 100).toFixed(1)}%)`}</Text>
              </Text>
            </View>
          );
        }}
        showExternalLabels
        labelLineConfig={{
          color: palette.textSecondary,
          length: 12,
          tailLength: 6,
          labelComponentWidth: 150,
          avoidOverlappingOfLabels: true,
        }}
        // Labels are drawn inside the chart's SVG, so they must be react-native-svg Text.
        externalLabelComponent={(item) => (
          // Two lines, like Highcharts' "<b>{name}</b><br>{percentage:.1f} %".
          <SvgText fontSize={10} fill={palette.textPrimary}>
            <TSpan x="0" fontFamily={fonts.bold}>
              {item?.text ?? ''}
            </TSpan>
            <TSpan
              x="0"
              dy="12"
              fontFamily={fonts.regular}
            >{`${((Number(item?.value ?? 0) / total) * 100).toFixed(1)} %`}</TSpan>
          </SvgText>
        )}
      />
    ) : (
      // Highcharts draws an empty pie as a bare circle outline.
      <View
        style={{
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: palette.textSecondary,
        }}
      />
    );

  return (
    <View>
      <View style={styles.exportButton}>
        <Menu
          visible={menu}
          onDismiss={() => setMenu(false)}
          anchor={
            <IconButton
              icon="menu"
              mode="contained"
              containerColor="#fff"
              iconColor="#666"
              size={18}
              onPress={() => setMenu(true)}
              accessibilityLabel="Chart context menu"
            />
          }
        >
          <Menu.Item
            title="View in full screen"
            onPress={() => {
              setMenu(false);
              setFullScreen(true);
            }}
          />
          <Menu.Item
            title="Print chart"
            onPress={() =>
              run(async () => {
                await Print.printAsync({ html: await imageHtml() });
              })
            }
          />
          <Divider />
          <Menu.Item
            title="Download PNG image"
            onPress={() =>
              run(async () => shareImage(await capture('png'), 'chart.png', 'image/png'))
            }
          />
          <Menu.Item
            title="Download JPEG image"
            onPress={() =>
              run(async () => shareImage(await capture('jpg'), 'chart.jpg', 'image/jpeg'))
            }
          />
          <Menu.Item
            title="Download PDF document"
            onPress={() => run(async () => sharePdf(await imageHtml(), 'chart.pdf'))}
          />
        </Menu>
      </View>
      <View ref={shot} collapsable={false} style={[styles.pie, { backgroundColor: palette.paper }]}>
        {pie(62)}
      </View>
      <Portal>
        <Modal
          visible={fullScreen}
          onDismiss={() => setFullScreen(false)}
          contentContainerStyle={[styles.fullScreen, { backgroundColor: palette.paper }]}
        >
          <Text style={[styles.subtitle1, { color: palette.textPrimary, marginBottom: 24 }]}>
            {title}
          </Text>
          {pie(120)}
          <Button style={{ marginTop: 24 }} onPress={() => setFullScreen(false)}>
            {t.close}
          </Button>
        </Modal>
      </Portal>
      <Snackbar visible={!!message} onDismiss={() => setMessage(null)}>
        {message}
      </Snackbar>
    </View>
  );
}

// live-repo accountsCards/RevenueDistributionCard.tsx ("Revenue Composition", ledger group 3)
export function RevenueDistributionCard() {
  const { from, to, cost_center_ids } = useDashboardSettings().chartFilters;
  const query = useQuery({
    queryKey: ['revenueDistribution', { from, to, cost_center_ids }],
    queryFn: () =>
      dashboardApi.incomeFigures({
        from,
        to,
        ledgerGroupId: 3,
        cost_center_ids,
        group_by_ledgers: true,
      }),
  });
  return (
    <Card title={<Text style={styles.subtitle1}>{t.cards.revenueComposition}</Text>}>
      <DistributionPie
        title={t.cards.revenueComposition}
        loading={query.isLoading}
        data={(query.data ?? []).map((r) => ({ name: r.ledger_name, y: r.amount }))}
      />
      <FinancialSummaryStrip kind="revenue" inline />
    </Card>
  );
}

// live-repo accountsCards/ExpenseDistributionCard.tsx ("Operating Expenses", ledger group 19). Its
// legend value is the pie total; the comparison is the same query over the previous period.
export function ExpenseDistributionCard() {
  const { chartFilters, showFigures } = useDashboardSettings();
  const { from, to, cost_center_ids } = chartFilters;
  const summary = useFinancialSummary();
  const current = useQuery({
    queryKey: ['expenseDistribution', { from, to, cost_center_ids }],
    queryFn: () =>
      dashboardApi.expenseFigures({
        from,
        to,
        ledgerGroupId: 19,
        cost_center_ids,
        group_by_ledgers: true,
      }),
  });
  const prevPeriod = summary.data?.period;
  const previous = useQuery({
    queryKey: ['expenseDistributionPrevious', prevPeriod, cost_center_ids],
    queryFn: () =>
      dashboardApi.expenseFigures({
        from: prevPeriod!.previous_from,
        to: dayjs(prevPeriod!.previous_to).subtract(1, 'millisecond').toISOString(),
        ledgerGroupId: 19,
        cost_center_ids,
        group_by_ledgers: true,
      }),
    enabled: !!prevPeriod,
  });
  const sum = (rows?: Array<{ amount: number }>) =>
    (rows ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <Card title={<Text style={styles.subtitle1}>{t.cards.operatingExpenses}</Text>}>
      <DistributionPie
        title={t.cards.operatingExpenses}
        loading={current.isLoading}
        data={(current.data ?? []).map((r) => ({ name: r.ledger_name, y: r.amount }))}
      />
      <FigureLegend
        value={sum(current.data)}
        previous={previous.data ? sum(previous.data) : undefined}
        loading={showFigures && (current.isLoading || previous.isLoading || summary.isLoading)}
        higherIsBetter={false}
      />
    </Card>
  );
}

// "overdue since 20 Oct 2026 10:00" / "due 28 Oct 2026 10:00", as in DueInvoiceRow on web.
const dueLabel = (invoice: DueInvoice) =>
  `${invoice.is_overdue ? t.overdueSince : t.due} ${readableDate(invoice.due_date ?? undefined)}`;

// live-repo accountsCards/DueInvoices.tsx
export function DueInvoicesCard() {
  const { chartFilters } = useDashboardSettings();
  const { palette } = useAppTheme();
  const { checkOrganizationPermission } = useAuth();
  const openReport = useOpenReport();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<{
    invoice: DueInvoice;
    kind: 'incoming' | 'outgoing';
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const params = { cost_center_ids: chartFilters.cost_center_ids, as_at: chartFilters.to };

  const query = useQuery({
    queryKey: ['dueInvoicesSummary', params],
    queryFn: () => dashboardApi.dueInvoicesSummary(params),
  });
  const incoming = query.data?.incoming ?? [];
  const outgoing = query.data?.outgoing ?? [];
  const incomingTotal = query.data?.incoming_total ?? incoming.length;
  const outgoingTotal = query.data?.outgoing_total ?? outgoing.length;

  const markPaid = useMutation({
    mutationFn: ({ invoice, kind }: { invoice: DueInvoice; kind: 'incoming' | 'outgoing' }) =>
      kind === 'incoming'
        ? dashboardApi.markCustomerInvoicePaid(invoice.id)
        : dashboardApi.markPurchaseBillPaid(invoice.id),
    onSuccess: (data) => {
      setMessage(data?.message || t.markedPaid);
      queryClient.invalidateQueries({ queryKey: ['dueInvoicesSummary'] });
    },
    onError: (e) => setMessage(getErrorMessage(e, t.markPaidFailed)),
    onSettled: () => setConfirm(null),
  });

  const section = (
    kind: 'incoming' | 'outgoing',
    title: string,
    rows: DueInvoice[],
    total: number,
    canMark: boolean
  ) => (
    <List.Accordion
      title={title}
      titleStyle={styles.sectionTitle}
      right={(p) => (
        <View style={styles.badgeWrap}>
          <List.Icon icon="bell-ring" />
          <Badge style={styles.badge}>{total > 999 ? '999+' : total}</Badge>
          <List.Icon {...p} icon={p.isExpanded ? 'chevron-up' : 'chevron-down'} />
        </View>
      )}
      accessibilityLabel={format(t.totalCount, { n: total })}
      theme={{ colors: { background: 'transparent' } }}
    >
      {rows.map((invoice) => (
        <View
          key={`${kind}-${invoice.id}`}
          style={[styles.row, { borderTopColor: palette.divider }]}
        >
          <View style={styles.rowMain}>
            <Text
              numberOfLines={1}
              style={{ color: palette.textPrimary, fontFamily: fonts.semiBold }}
            >
              {invoice.name}
            </Text>
            <Text style={{ fontSize: 12, color: palette.textSecondary }}>
              {invoice.invoiceNo}
              {invoice.due_date ? (
                <Text style={{ color: invoice.is_overdue ? palette.error : '#F39711' }}>
                  {` — ${dueLabel(invoice)}`}
                </Text>
              ) : null}
            </Text>
          </View>
          <Chip compact>{currency(invoice.amount, invoice.currencyCode)}</Chip>
          {canMark ? (
            <IconButton
              icon="check-circle-outline"
              iconColor={palette.success}
              accessibilityLabel={t.tooltips.markAsPaid}
              onPress={() => setConfirm({ invoice, kind })}
            />
          ) : null}
        </View>
      ))}
      {total > rows.length ? (
        <Button
          onPress={() =>
            openReport('apArAging', 'A/P & A/R Aging', '/accounts/reports?report=ap-ar-aging', 10)
          }
        >
          {format(t.viewAllAging, { n: total })}
        </Button>
      ) : null}
    </List.Accordion>
  );

  return (
    <Card title={t.cards.dueInvoices}>
      {query.isFetching && !query.data ? (
        <ProgressBar indeterminate />
      ) : (
        <>
          <FinancialSummaryStrip kind="receivablesPayables" />
          {incoming.length
            ? section(
                'incoming',
                t.cards.receivables,
                incoming,
                incomingTotal,
                checkOrganizationPermission(PERMISSIONS.ACCOUNTS_TRANSACTIONS_CREATE)
              )
            : null}
          {outgoing.length
            ? section(
                'outgoing',
                t.cards.payables,
                outgoing,
                outgoingTotal,
                checkOrganizationPermission('SupplierBills:Edit')
              )
            : null}
          {!incoming.length && !outgoing.length ? <InfoAlert>{t.noDueInvoices}</InfoAlert> : null}
        </>
      )}
      <Portal>
        <Dialog visible={!!confirm} onDismiss={() => setConfirm(null)}>
          <Dialog.Title>{t.markPaidTitle}</Dialog.Title>
          <Dialog.Content>
            <Text>{format(t.markPaidBody, { invoiceNo: confirm?.invoice.invoiceNo ?? '' })}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm(null)}>{t.no}</Button>
            <Button
              loading={markPaid.isPending}
              onPress={() => confirm && markPaid.mutate(confirm)}
            >
              {t.yes}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={!!message} onDismiss={() => setMessage(null)} duration={3000}>
        {message}
      </Snackbar>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSquare: { width: 12, height: 12 },
  legendLine: { width: 16, height: 10, justifyContent: 'center', alignItems: 'center' },
  legendStroke: { position: 'absolute', left: 0, right: 0, height: 2 },
  legendCircle: { width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  tooltip: { padding: 8, borderRadius: 6, borderWidth: 1 },
  tooltipTitle: { fontFamily: fonts.semiBold, fontSize: 12, marginBottom: 2 },
  pie: { alignItems: 'center', paddingVertical: 8 },
  exportButton: { position: 'absolute', right: 0, top: -8, zIndex: 2 },
  fullScreen: { margin: 16, padding: 24, borderRadius: 12, alignItems: 'center' },
  subtitle1: { fontFamily: fonts.semiBold, fontSize: 16 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16 },
  badgeWrap: { flexDirection: 'row', alignItems: 'center' },
  badge: { position: 'absolute', top: -4, left: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowMain: { flex: 1, minWidth: 0 },
});
