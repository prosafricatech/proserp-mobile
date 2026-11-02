import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import {
  ActivityIndicator,
  Badge,
  Chip,
  IconButton,
  List,
  Snackbar,
  Text,
} from 'react-native-paper';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import { dictionary } from '../../i18n';
import { escapeHtml, sharePdf } from '../../lib/files/share';
import { dashboardApi, type Interval, type LowStockStore } from '../../modules/dashboard/api';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { Legend } from './accountsCards';
import { useDashboardSettings } from './DashboardContext';
import { FinancialSummaryStrip } from './FinancialSummaryStrip';
import { chartScale, periodLabel, readableDate, shortNumber, sparseLabels } from './format';
import { Card, chartColors, InfoAlert, IntervalSelect } from './ui';

const t = dictionary.dashboard;

// live-repo procurementCards/InventoryValueTrend.tsx: stacked areas for the top 5 product
// categories (by value in the last period) + "Others", and a "Total Value" line. No legend.
// (Web picks random area colours on every render; mobile uses a stable palette.)
export function InventoryValueTrend() {
  const { chartFilters } = useDashboardSettings();
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const [aggregateBy, setAggregateBy] = useState<Interval>('day');
  const { from, to, cost_center_ids } = chartFilters;

  const query = useQuery({
    queryKey: ['inventoryValueTrend', { from, to, cost_center_ids, aggregate_by: aggregateBy }],
    queryFn: async () => {
      const rows = await dashboardApi.inventoryValue({
        from,
        to,
        cost_center_ids,
        aggregate_by: aggregateBy,
        group_by: 'product_category',
      });
      const last = rows[rows.length - 1]?.groupedValues ?? {};
      const top = Object.entries(last)
        .sort(([, a], [, b]) => (b?.balanceValue ?? 0) - (a?.balanceValue ?? 0))
        .slice(0, 5)
        .map(([k]) => k);
      return rows.map((row) => {
        const out: Record<string, number | string> = { asOf: periodLabel(row.asOf, aggregateBy) };
        let others = 0;
        let total = 0;
        Object.entries(row.groupedValues ?? {}).forEach(([category, v]) => {
          const value = Number(v?.balanceValue ?? 0);
          total += value;
          if (top.includes(category)) out[category] = value;
          else others += value;
        });
        if (others > 0) out.Others = others;
        out['Total Value'] = total;
        return out;
      });
    },
  });
  const rows = query.data ?? [];
  // Which area series exist is decided by the first row, as on web.
  const keys = rows[0]
    ? Object.keys(rows[0]).filter((k) => k !== 'asOf' && k !== 'Total Value')
    : [];
  const colors = chartColors(palette).slice(2);
  const chartWidth = width - 32 - 32 - 56;
  const fits = rows.length <= 12;

  // Stacked areas: each series is drawn at its cumulative height.
  const cumulative = keys.map((_, ki) =>
    rows.map((r) => keys.slice(0, ki + 1).reduce((s, k) => s + Number(r[k] ?? 0), 0))
  );
  const labels = fits
    ? sparseLabels(rows.map((r) => String(r.asOf)))
    : rows.map((r) => String(r.asOf));
  const scale = chartScale(rows.map((r) => Number(r['Total Value'] ?? 0)));

  return (
    <Card
      title={t.cards.inventoryValue}
      action={<IntervalSelect value={aggregateBy} onChange={setAggregateBy} />}
    >
      <FinancialSummaryStrip kind="inventory" />
      {query.isLoading ? (
        <ActivityIndicator style={{ height: 196 }} />
      ) : rows.length ? (
        <LineChart
          dataSet={[
            ...cumulative
              .map((values, i) => ({
                data: values.map((value, j) => ({ value, label: labels[j] })),
                areaChart: true,
                color: colors[i % colors.length],
                startFillColor: colors[i % colors.length],
                endFillColor: colors[i % colors.length],
                startOpacity: 0.3,
                endOpacity: 0.3,
                hideDataPoints: true,
                thickness: 1,
              }))
              .reverse(),
            {
              data: rows.map((r, j) => ({
                value: Number(r['Total Value'] ?? 0),
                label: labels[j],
              })),
              color: '#1976d2',
              hideDataPoints: true,
              thickness: 2,
            },
          ]}
          height={156}
          width={chartWidth}
          adjustToWidth={fits}
          spacing={fits ? undefined : 56}
          initialSpacing={10}
          endSpacing={10}
          {...scale}
          formatYLabel={(v) => String(shortNumber(Number(v)))}
          yAxisLabelWidth={56}
          yAxisTextStyle={{ color: palette.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{
            color: palette.textSecondary,
            fontSize: 9,
            width: fits ? 100 : 70,
          }}
          rulesType="dashed"
          rulesColor={palette.divider}
          yAxisColor={palette.divider}
          xAxisColor={palette.divider}
          scrollToEnd={!fits}
        />
      ) : (
        <View style={{ height: 196 }} />
      )}
    </Card>
  );
}

// live-repo procurementCards/LowStockAlertsPDF.tsx, as HTML for expo-print.
const lowStockHtml = (
  stores: LowStockStore[],
  org: { name?: string; logo_path?: string | null; settings?: any }
) => {
  const main = org.settings?.main_color || '#2113AD';
  const light = org.settings?.light_color || '#bec5da';
  const contrast = org.settings?.contrast_text || '#fff';

  const logo = org.logo_path
    ? `<img src="${escapeHtml(org.logo_path)}" style="height:48px" />`
    : `<b>${escapeHtml(org.name)}</b>`;

  // Web colours stock below half the threshold dark red, the rest orange.
  const stockColour = (available: number, threshold: number) =>
    available < threshold / 2 ? '#d60404' : '#f54905';

  const alertRows = (store: LowStockStore) =>
    store.alerts
      .map(
        (a, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(a.product_name)}</td>
            <td>${a.threshold}</td>
            <td style="color: ${stockColour(a.available_stock, a.threshold)}">
              ${a.available_stock}
            </td>
            <td>${escapeHtml(a.cost_centers.map((c) => c.name).join(', '))}</td>
          </tr>`
      )
      .join('');

  const storeTables = stores
    .map(
      (store) => `
        <p><b>Store: ${escapeHtml(store.name)}</b></p>
        <table>
          <tr>
            <th>S/N</th>
            <th>Product</th>
            <th>Threshold</th>
            <th>Available Stock</th>
            <th>Cost Centers</th>
          </tr>
          ${alertRows(store)}
        </table>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 10px;
            padding: 24px;
            color: #000;
          }
          .head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          h1 { color: ${main}; font-size: 16px; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin: 6px 0 14px; }
          th { background: ${main}; color: ${contrast}; text-align: left; padding: 4px; }
          td { padding: 4px; }
          tr:nth-child(even) td { background: ${light}; }
        </style>
      </head>
      <body>
        <div class="head">
          ${logo}
          <h1>LOW STOCKS ALERTS</h1>
        </div>
        <div><b>Printed On</b><br />${escapeHtml(readableDate(undefined))}</div>
        ${storeTables}
      </body>
    </html>`;
};

// live-repo procurementCards/LowStockAlerts.tsx
export function LowStockAlerts() {
  const { chartFilters } = useDashboardSettings();
  const { authOrganization } = useAuth();
  const { palette } = useAppTheme();
  const [message, setMessage] = useState<string | null>(null);
  const params = { cost_center_ids: chartFilters.cost_center_ids, as_of: chartFilters.to };
  const query = useQuery({
    queryKey: ['lowStockAlerts', params],
    queryFn: () => dashboardApi.lowStockAlerts(params),
  });
  const stores = query.data ?? [];

  const print = () =>
    sharePdf(
      lowStockHtml(stores, authOrganization?.organization ?? {}),
      'Low Stock Alert.pdf'
    ).catch((e) => setMessage(getErrorMessage(e)));

  return (
    <Card
      title={t.cards.lowStockAlerts}
      action={
        stores.length ? (
          <IconButton icon="printer" accessibilityLabel={t.tooltips.print} onPress={print} />
        ) : undefined
      }
    >
      {query.isLoading ? (
        <ActivityIndicator style={{ height: 120 }} />
      ) : stores.length ? (
        stores.map((store) => (
          <List.Accordion
            key={store.id}
            title={store.name}
            titleStyle={styles.storeName}
            accessibilityLabel={t.tooltips.storeName}
            theme={{ colors: { background: 'transparent' } }}
            right={(p) => (
              <View style={styles.badgeWrap}>
                <List.Icon icon="bell-ring" />
                <Badge style={[styles.badge, { backgroundColor: palette.secondary }]}>
                  {store.alerts.length}
                </Badge>
                <List.Icon {...p} icon={p.isExpanded ? 'chevron-up' : 'chevron-down'} />
              </View>
            )}
          >
            {store.alerts.map((alert, i) => (
              <View
                key={`${store.id}-${i}`}
                style={[styles.alertRow, { borderTopColor: palette.divider }]}
              >
                <Text
                  style={{ color: palette.textPrimary, fontFamily: fonts.semiBold }}
                  accessibilityLabel={t.tooltips.productName}
                >
                  {alert.product_name}
                </Text>
                <View style={styles.chips}>
                  <Chip
                    compact
                    style={{ backgroundColor: palette.primary }}
                    textStyle={{ color: '#fff' }}
                    accessibilityLabel={t.tooltips.threshold}
                  >
                    {String(alert.threshold)}
                  </Chip>
                  <Chip
                    compact
                    style={{
                      backgroundColor: alert.available_stock > 0 ? '#F39711' : palette.error,
                    }}
                    textStyle={{ color: '#fff' }}
                    accessibilityLabel={t.tooltips.availableStock}
                  >
                    {String(alert.available_stock)}
                  </Chip>
                </View>
                <View style={styles.chips} accessibilityLabel={t.tooltips.costCenters}>
                  {alert.cost_centers.slice(0, 3).map((c) => (
                    <Chip key={c.name} compact mode="outlined">
                      {c.name}
                    </Chip>
                  ))}
                  {alert.cost_centers.length > 3 ? (
                    <Chip compact mode="outlined">{`+${alert.cost_centers.length - 3}`}</Chip>
                  ) : null}
                </View>
              </View>
            ))}
          </List.Accordion>
        ))
      ) : (
        <InfoAlert>{t.noLowStock}</InfoAlert>
      )}
      <Snackbar visible={!!message} onDismiss={() => setMessage(null)}>
        {message}
      </Snackbar>
    </Card>
  );
}

// live-repo procurementCards/PurchasesAndGrns.tsx: two bars per period, no totals.
export function PurchasesAndGrns() {
  const { chartFilters } = useDashboardSettings();
  const { palette, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const [aggregateBy, setAggregateBy] = useState<Interval>('day');
  const { from, to, cost_center_ids } = chartFilters;
  const purchasesColor = isDark ? '#4dabf5' : '#1976d2';
  const grnsColor = isDark ? '#81c784' : '#39960e';

  const query = useQuery({
    queryKey: ['purchasesChart', { from, to, cost_center_ids, aggregate_by: aggregateBy }],
    queryFn: async () => {
      const params = { from, to, cost_center_ids, aggregate_by: aggregateBy };
      const purchases = await dashboardApi.purchaseValues(params);
      const grns = await dashboardApi.grnValues(params);
      const merged = new Map<string, { Purchases: number; GRNs: number }>();
      purchases.forEach((p) => merged.set(p.period, { Purchases: p.amount, GRNs: 0 }));
      grns.forEach((g) =>
        merged.set(g.period, { Purchases: merged.get(g.period)?.Purchases ?? 0, GRNs: g.amount })
      );
      return [...merged.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([p, v]) => ({ name: periodLabel(p, aggregateBy), ...v }));
    },
  });
  const rows = query.data ?? [];
  const barLabels = sparseLabels(
    rows.map((r) => r.name),
    3
  );

  return (
    <Card
      title={t.cards.purchasesAndGrns}
      action={<IntervalSelect value={aggregateBy} onChange={setAggregateBy} />}
    >
      {query.isLoading ? (
        <ActivityIndicator style={{ height: 245 }} />
      ) : rows.length ? (
        <>
          <BarChart
            data={rows.flatMap((r, i) => [
              {
                value: r.Purchases,
                frontColor: purchasesColor,
                spacing: 2,
                label: barLabels[i],
                labelWidth: 80,
              },
              { value: r.GRNs, frontColor: grnsColor },
            ])}
            barWidth={10}
            spacing={24}
            height={205}
            width={width - 32 - 32 - 56}
            {...chartScale(rows.flatMap((r) => [r.Purchases, r.GRNs]))}
            initialSpacing={12}
            formatYLabel={(v) => String(shortNumber(Number(v)))}
            yAxisLabelWidth={56}
            yAxisTextStyle={{ color: palette.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: palette.textSecondary, fontSize: 9 }}
            rulesType="dashed"
            rulesColor={palette.divider}
            yAxisColor={palette.divider}
            xAxisColor={palette.divider}
          />
          <Legend
            shape="square"
            items={[
              { name: t.purchases, color: purchasesColor },
              { name: t.grns, color: grnsColor },
            ]}
          />
        </>
      ) : (
        <View style={{ height: 245 }} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  storeName: { fontFamily: fonts.bold, fontSize: 16 },
  badgeWrap: { flexDirection: 'row', alignItems: 'center' },
  badge: { position: 'absolute', top: -4, left: 14 },
  alertRow: { paddingVertical: 8, gap: 6, borderTopWidth: StyleSheet.hairlineWidth },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
