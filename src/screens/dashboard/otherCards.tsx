import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ActivityIndicator, Chip, Icon, Text } from 'react-native-paper';
import { useAuth } from '../../auth/AuthProvider';
import { MODULES } from '../../constants/modules';
import { PERMISSIONS } from '../../constants/permissions';
import { dictionary, format, language } from '../../i18n';
import { menuLabel } from '../../i18n/menu';
import { dashboardApi } from '../../api/modules/dashboard/services';
import { MENU, type MenuNode } from '../../navigation/moduleRegistry';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { Legend, useOpenReport } from './accountsCards';
import { useDashboardSettings } from './DashboardContext';
import { chartScale, readableDate, sparseLabels } from './format';
import { Card, chartColors, InfoAlert, SelectMenu, SubHeading } from './ui';

const t = dictionary.dashboard;

const useHrDashboard = () =>
  useQuery({
    queryKey: ['hrDashboard'],
    queryFn: dashboardApi.hrDashboard,
  });

export function OnLeaveToday() {
  const { palette } = useAppTheme();
  const openReport = useOpenReport();
  const rows = useHrDashboard().data?.employees_on_leave ?? [];
  return (
    <Card title={t.cards.employeesOnLeaveToday}>
      {rows.length ? (
        rows.map((r) => (
          <Pressable
            key={r.employee_id}
            style={[styles.mini, { borderColor: palette.divider }]}
            onPress={() =>
              openReport('employee', r.employee_name, `/humanResources/employees/${r.employee_id}`)
            }
          >
            <View style={styles.flex}>
              <Text style={{ color: palette.textPrimary, fontFamily: fonts.bold }}>
                {r.employee_name}
              </Text>
              {r.employee_number ? <Text style={styles.caption}>{r.employee_number}</Text> : null}
              {r.leave_type ? <Text style={styles.caption}>{r.leave_type}</Text> : null}
            </View>
            <Chip compact>
              {r.returns_in_days <= 1 ? t.today : format(t.inDaysShort, { n: r.returns_in_days })}
            </Chip>
          </Pressable>
        ))
      ) : (
        <Text style={styles.empty}>{t.noOneOnLeave}</Text>
      )}
    </Card>
  );
}

export function BirthdaysToday() {
  const { palette } = useAppTheme();
  const openReport = useOpenReport();
  const rows = useHrDashboard().data?.upcoming_birthdays ?? [];
  return (
    <Card title={t.cards.upcomingBirthdays}>
      {rows.length ? (
        rows.map((r) => (
          <Pressable
            key={r.employee_id}
            style={[styles.mini, { borderColor: palette.divider }]}
            onPress={() =>
              openReport('employee', r.employee_name, `/humanResources/employees/${r.employee_id}`)
            }
          >
            <View style={styles.flex}>
              <Text style={{ color: palette.textPrimary, fontFamily: fonts.bold }}>
                {r.employee_name}
              </Text>
              {r.employee_number ? <Text style={styles.caption}>{r.employee_number}</Text> : null}
            </View>
            {r.days_away === 0 ? (
              <Chip
                compact
                style={{ backgroundColor: palette.success }}
                textStyle={{ color: '#fff' }}
              >
                {t.today}
              </Chip>
            ) : (
              <Chip compact>{dayjs(r.next_birthday).format('DD MMM YYYY')}</Chip>
            )}
          </Pressable>
        ))
      ) : (
        <Text style={styles.empty}>{t.noBirthdays}</Text>
      )}
    </Card>
  );
}

type DippingMode = 'closing' | 'deviation' | 'stock';

export function DippingsCard() {
  const { chartFilters } = useDashboardSettings();
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<DippingMode>('closing');
  const stationIds = chartFilters.costCenters
    .filter((c) => c?.type === 'Fuel Station')
    .map((c) => c.cost_centerable_id!);
  const params = {
    from: chartFilters.from,
    to: chartFilters.to,
    fuel_station_ids: stationIds,
    with_calculated_stock: (mode === 'closing' ? 0 : 1) as 0 | 1,
  };
  const query = useQuery({
    queryKey: ['dippingsReport', params],
    queryFn: () => dashboardApi.dippingReport(params),
  });
  const stations = query.data ?? [];
  const pick = (tank: { reading: number; calculated_stock?: number; deviation?: number }) =>
    Number(
      mode === 'closing'
        ? tank.reading
        : mode === 'deviation'
          ? tank.deviation
          : tank.calculated_stock
    ) || 0;

  // One series per reading name: sum over its tanks, across all stations, per as_at.
  const trend = useMemo(() => {
    const times = [...new Set(stations.flatMap((s) => s.report_data.map((d) => d.as_at)))].sort();
    const names = [
      ...new Set(
        stations.flatMap((s) => s.report_data.flatMap((d) => d.readings.map((r) => r.name)))
      ),
    ];
    return {
      times,
      series: names.map((name) => ({
        name,
        values: times.map((time) =>
          stations.reduce(
            (sum, s) =>
              sum +
              s.report_data
                .filter((d) => d.as_at === time)
                .flatMap((d) => d.readings.filter((r) => r.name === name))
                .reduce((rs, r) => rs + r.tanks.reduce((ts, tank) => ts + pick(tank), 0), 0),
            0
          )
        ),
      })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations, mode]);

  const colors = chartColors(palette);

  return (
    <Card
      title={t.cards.dippings}
      action={
        <SelectMenu
          label={t.display}
          value={mode}
          onChange={setMode}
          options={[
            ['closing', t.closingShort],
            ['deviation', t.deviationShort],
            ['stock', t.stockShort],
          ]}
        />
      }
    >
      {query.isLoading ? (
        <ActivityIndicator style={{ height: 160 }} />
      ) : (
        <>
          <SubHeading>{t.dippingTrend}</SubHeading>
          {trend.times.length ? (
            <>
              <LineChart
                dataSet={trend.series.map((s, i) => ({
                  data: s.values.map((value, j) => ({
                    value,
                    label: sparseLabels(trend.times.map((x) => dayjs(x).format('ddd, MMM D')))[j],
                  })),
                  color: colors[i % colors.length],
                  hideDataPoints: true,
                  thickness: 1.2,
                }))}
                height={190}
                width={width - 32 - 32 - 56}
                adjustToWidth={trend.times.length <= 12}
                spacing={trend.times.length <= 12 ? undefined : 56}
                initialSpacing={10}
                {...chartScale(trend.series.flatMap((s) => s.values))}
                yAxisLabelWidth={56}
                yAxisTextStyle={{ color: palette.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: palette.textSecondary, fontSize: 9, width: 70 }}
                rulesType="dashed"
                rulesColor={palette.divider}
              />
              <Legend
                items={trend.series.map((s, i) => ({
                  name: s.name,
                  color: colors[i % colors.length],
                }))}
              />
            </>
          ) : (
            <InfoAlert>{t.noTrend}</InfoAlert>
          )}

          <View style={styles.section}>
            <SubHeading>{t.mostRecent}</SubHeading>
            {stations.every((s) => !s.report_data.length) ? (
              <InfoAlert>{t.noRecents}</InfoAlert>
            ) : (
              stations
                .filter((s) => s.report_data.length)
                .map((s) => {
                  const latest = s.report_data[s.report_data.length - 1];
                  return (
                    <View key={s.id} style={styles.station}>
                      <Text style={[styles.stationName, { color: palette.textPrimary }]}>
                        {s.name} <Text style={styles.caption}>({readableDate(latest.as_at)})</Text>
                      </Text>
                      {latest.readings.map((r) => (
                        <View key={r.id} style={styles.reading}>
                          <Text style={{ fontFamily: fonts.bold, color: palette.textPrimary }}>
                            {r.name}
                          </Text>
                          {r.tanks.map((tank) => (
                            <View key={tank.tank} style={styles.tankRow}>
                              <Text style={{ color: palette.textPrimary }}>{tank.tank}</Text>
                              <Text style={{ color: palette.textPrimary }}>
                                {pick(tank).toLocaleString()}
                              </Text>
                            </View>
                          ))}
                          <View style={styles.tankRow}>
                            <Text style={{ fontFamily: fonts.bold, color: palette.textPrimary }}>
                              {t.total}
                            </Text>
                            <Text style={{ fontFamily: fonts.bold, color: palette.textPrimary }}>
                              {r.tanks.reduce((sum, tank) => sum + pick(tank), 0).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })
            )}
          </View>
        </>
      )}
    </Card>
  );
}

// --- Quick Links / Quick Reports: tiles that open the report placeholder. ---

type Tile = { id: string; label: string; icon: string; show: boolean; onPress: () => void };

function TileGrid({ title, tiles }: { title: string; tiles: Tile[] }) {
  const { palette } = useAppTheme();
  const visible = tiles.filter((x) => x.show);
  if (!visible.length) return null;
  return (
    <Card title={title}>
      <View style={styles.grid}>
        {visible.map((tile) => (
          <Pressable
            key={tile.id}
            style={styles.tile}
            onPress={tile.onPress}
            accessibilityRole="button"
          >
            <Icon source={tile.icon} size={40} color={palette.primary} />
            <Text style={[styles.tileLabel, { color: palette.textPrimary }]}>{tile.label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const findByPath = (nodes: MenuNode[], path: string): MenuNode | undefined => {
  for (const n of nodes) {
    if (n.path === path) return n;
    const hit = n.children && findByPath(n.children, path);
    if (hit) return hit;
  }
};

export function QuickLinks() {
  const { organizationHasSubscribed: sub, checkOrganizationPermission: can } = useAuth();
  const openReport = useOpenReport();
  const go = (path: string) => {
    const node = findByPath(MENU, path);
    openReport(node?.id ?? path, node ? menuLabel(node.labelKey, language) : path, path);
  };
  const tiles: Tile[] = [
    {
      id: 'projects',
      label: t.quickLinkLabels.projects,
      icon: 'format-list-bulleted',
      show:
        sub(MODULES.PROJECT_MANAGEMENT) &&
        can([
          PERMISSIONS.PROJECTS_READ,
          PERMISSIONS.PROJECTS_CREATE,
          PERMISSIONS.PROJECTS_EDIT,
          PERMISSIONS.PROJECTS_DELETE,
        ]),
      onPress: () => go('/projectManagement/projects'),
    },
    {
      id: 'batches',
      label: t.quickLinkLabels.batches,
      icon: 'qrcode',
      show:
        sub(MODULES.MANUFACTURING_AND_PROCESSING) &&
        can([
          PERMISSIONS.BOM_READ,
          PERMISSIONS.BOM_CREATE,
          PERMISSIONS.BOM_EDIT,
          PERMISSIONS.BOM_DELETE,
          PERMISSIONS.PRODUCTION_BATCHES_CREATE,
          PERMISSIONS.PRODUCTION_BATCHES_READ,
          PERMISSIONS.PRODUCTION_BATCHES_EDIT,
          PERMISSIONS.PRODUCTION_BATCHES_DELETE,
          PERMISSIONS.MANUFACTURING_ORDERS_CREATE,
          PERMISSIONS.MANUFACTURING_ORDERS_READ,
          PERMISSIONS.MANUFACTURING_ORDERS_EDIT,
          PERMISSIONS.MANUFACTURING_ORDERS_DELETE,
        ]),
      onPress: () => go('/manufacturing/batches'),
    },
    {
      id: 'salesShift',
      label: t.quickLinkLabels.salesShift,
      icon: 'gas-station',
      show:
        sub(MODULES.FUEL_STATION) &&
        can([
          PERMISSIONS.FUEL_SALES_SHIFTS_READ,
          PERMISSIONS.FUEL_SALES_SHIFTS_CREATE,
          PERMISSIONS.FUEL_SALES_SHIFTS_UPDATE,
          PERMISSIONS.FUEL_SALES_SHIFTS_DELETE,
          PERMISSIONS.FUEL_SALES_SHIFTS_CLOSE,
        ]),
      onPress: () => go('/fuelStations/salesShifts'),
    },
    {
      id: 'sales',
      label: t.quickLinkLabels.sales,
      icon: 'point-of-sale',
      show:
        sub(MODULES.POINT_OF_SALE) &&
        can([
          PERMISSIONS.SALES_READ,
          PERMISSIONS.SALES_CREATE,
          PERMISSIONS.SALES_EDIT,
          PERMISSIONS.SALES_COMPLETE,
        ]),
      onPress: () => go('/pos/sales-counters'),
    },
    {
      id: 'purchases',
      label: t.quickLinkLabels.purchases,
      icon: 'cart-outline',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can([
          PERMISSIONS.PURCHASES_READ,
          PERMISSIONS.PURCHASES_CREATE,
          PERMISSIONS.PURCHASES_RECEIVE,
        ]),
      onPress: () => go('/procurement/purchases'),
    },
    {
      id: 'requisitions',
      label: t.quickLinkLabels.requisitions,
      icon: 'format-list-numbered-rtl',
      show:
        sub(MODULES.PROCESS_APPROVAL) &&
        can([
          PERMISSIONS.REQUISITIONS_READ,
          PERMISSIONS.REQUISITIONS_CREATE,
          PERMISSIONS.REQUISITIONS_EDIT,
        ]),
      onPress: () => go('/requisitions'),
    },
    {
      id: 'transactions',
      label: t.quickLinkLabels.transactions,
      icon: 'receipt-text-outline',
      show:
        sub(MODULES.ACCOUNTS_AND_FINANCE) &&
        can([
          PERMISSIONS.ACCOUNTS_TRANSACTIONS_READ,
          PERMISSIONS.ACCOUNTS_TRANSACTIONS_CREATE,
          PERMISSIONS.ACCOUNTS_TRANSACTIONS_DELETE,
          PERMISSIONS.ACCOUNTS_TRANSACTIONS_EDIT,
          PERMISSIONS.PAYMENTS_READ,
          PERMISSIONS.PAYMENTS_CREATE,
          PERMISSIONS.PAYMENTS_EDIT,
          PERMISSIONS.PAYMENTS_DELETE,
          PERMISSIONS.FUND_TRANSFERS_READ,
          PERMISSIONS.FUND_TRANSFERS_CREATE,
          PERMISSIONS.FUND_TRANSFERS_DELETE,
          PERMISSIONS.FUND_TRANSFERS_EDIT,
          PERMISSIONS.RECEIPTS_READ,
          PERMISSIONS.RECEIPTS_EDIT,
          PERMISSIONS.RECEIPTS_CREATE,
          PERMISSIONS.RECEIPTS_DELETE,
          PERMISSIONS.JOURNAL_VOUCHERS_READ,
          PERMISSIONS.JOURNAL_VOUCHERS_CREATE,
          PERMISSIONS.JOURNAL_VOUCHERS_DELETE,
          PERMISSIONS.JOURNAL_VOUCHERS_EDIT,
        ]),
      onPress: () => go('/accounts/transactions'),
    },
    {
      id: 'ledgers',
      label: t.quickLinkLabels.ledgers,
      icon: 'book-open-page-variant-outline',
      show: sub(MODULES.ACCOUNTS_AND_FINANCE) && can(PERMISSIONS.ACCOUNTS_MASTERS_READ),
      onPress: () => go('/accounts/ledgers'),
    },
    {
      id: 'stores',
      label: t.quickLinkLabels.stores,
      icon: 'package-variant-closed',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can([
          PERMISSIONS.STORES_READ,
          PERMISSIONS.STORES_CREATE,
          PERMISSIONS.INVENTORY_TRANSFERS_READ,
          PERMISSIONS.INVENTORY_TRANSFERS_CREATE,
          PERMISSIONS.INVENTORY_CONSUMPTIONS_READ,
          PERMISSIONS.INVENTORY_CONSUMPTIONS_CREATE,
        ]),
      onPress: () => go('/procurement/stores'),
    },
    {
      id: 'productInsights',
      label: t.quickLinkLabels.productInsights,
      icon: 'chart-line',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can(
          [PERMISSIONS.STORES_REPORTS, PERMISSIONS.PURCHASES_REPORTS, PERMISSIONS.ACCOUNTS_REPORTS],
          true
        ),
      onPress: () =>
        openReport('productInsights', t.quickLinkLabels.productInsights, '/procurement/reports'),
    },
    {
      id: 'products',
      label: t.quickLinkLabels.products,
      icon: 'qrcode',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can([PERMISSIONS.PRODUCTS_READ, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT]),
      onPress: () => go('/procurement/products'),
    },
    {
      id: 'employees',
      label: t.quickLinkLabels.employees,
      icon: 'account-group-outline',
      show:
        sub(MODULES.HUMAN_RESOURCES) &&
        can([
          PERMISSIONS.EMPLOYEES_READ,
          PERMISSIONS.EMPLOYEES_CREATE,
          PERMISSIONS.EMPLOYEES_UPDATE,
        ]),
      onPress: () => go('/humanResources/employees'),
    },
    {
      id: 'payrollRuns',
      label: t.quickLinkLabels.payrollRuns,
      icon: 'chart-box-outline',
      show:
        sub(MODULES.HUMAN_RESOURCES) &&
        can([PERMISSIONS.PAYROLLRUNS_CREATE, PERMISSIONS.PAYROLL_READ]),
      onPress: () => go('/humanResources/payroll-runs'),
    },
    {
      id: 'assetBookings',
      label: t.quickLinkLabels.assetBookings,
      icon: 'calendar-month-outline',
      show: sub(MODULES.ASSET_BOOKINGS) && can(PERMISSIONS.ASSET_BOOKINGS_READ),
      onPress: () => go('/asset-bookings'),
    },
  ];
  return <TileGrid title={t.cards.quickLinks} tiles={tiles} />;
}

// live-repo dashboard/QuickReports.tsx
export function QuickReports() {
  const { organizationHasSubscribed: sub, checkOrganizationPermission: can } = useAuth();
  const openReport = useOpenReport();
  const report = (
    id: keyof typeof t.quickReportLabels,
    icon: string,
    show: boolean,
    path: string
  ): Tile => {
    const label = t.quickReportLabels[id];

    return {
      id,
      label,
      icon,
      show,
      onPress: () => openReport(id, label, path),
    };
  };
  const fuel = sub(MODULES.FUEL_STATION);
  const pos = sub(MODULES.POINT_OF_SALE);
  const af = sub(MODULES.ACCOUNTS_AND_FINANCE);
  const proc = sub(MODULES.PROCUREMENT_AND_SUPPLY);
  const hr = sub(MODULES.HUMAN_RESOURCES);
  const tiles: Tile[] = [
    report(
      'salesCashSummary',
      'text-box-outline',
      (fuel || pos) && can(PERMISSIONS.SALES_REPORTS),
      '/pos/reports'
    ),
    report(
      'salesManifest',
      'clipboard-list-outline',
      pos && can(PERMISSIONS.SALES_REPORTS),
      '/pos/reports'
    ),
    report('salesPerformance', 'podium', pos && can(PERMISSIONS.SALES_REPORTS), '/pos/reports'),
    report('cashierReport', 'cash', af && can(PERMISSIONS.ACCOUNTS_REPORTS), '/accounts/reports'),
    report('dippingReport', 'table', fuel, '/fuelStations/reports'),
    report(
      'tankStockReport',
      'chart-bar',
      fuel && can([PERMISSIONS.STORES_REPORTS, PERMISSIONS.FUEL_STATIONS_REPORTS]),
      '/fuelStations/reports'
    ),
    report(
      'stockReport',
      'cube-outline',
      proc && can(PERMISSIONS.STORES_REPORTS),
      '/procurement/reports'
    ),
    report(
      'itemMovement',
      'timeline-text-outline',
      proc && can(PERMISSIONS.STORES_REPORTS),
      '/procurement/reports'
    ),
    report(
      'stockMovement',
      'newspaper-variant-outline',
      proc && can(PERMISSIONS.STORES_REPORTS),
      '/procurement/reports'
    ),
    report(
      'debtorsCreditors',
      'cash-multiple',
      af && can(PERMISSIONS.ACCOUNTS_REPORTS),
      '/accounts/reports'
    ),
    report(
      'apArAging',
      'chart-timeline-variant',
      af && can(PERMISSIONS.ACCOUNTS_REPORTS),
      '/accounts/reports'
    ),
    report('fvReport', 'receipt', fuel, '/fuelStations/reports'),
    report('shiftsSummaryReport', 'history', fuel, '/fuelStations/reports'),
    report(
      'payrollComponentsSummary',
      'receipt-text-outline',
      hr && can(PERMISSIONS.PAYROLL_READ),
      '/humanResources/reports'
    ),
    report(
      'leaveBalances',
      'beach',
      hr && can(PERMISSIONS.LEAVE_ALLOCATIONS_READ),
      '/humanResources/reports'
    ),
    report(
      'staffLoans',
      'file-document-outline',
      hr && can(PERMISSIONS.LOANS_READ),
      '/humanResources/reports'
    ),
    report(
      'projectStatusReport',
      'chart-box-outline',
      sub(MODULES.PROJECT_MANAGEMENT) && can(PERMISSIONS.PROJECTS_REPORTS),
      '/projectManagement/reports'
    ),
  ];
  return <TileGrid title={t.cards.quickReports} tiles={tiles} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  caption: { fontSize: 12, opacity: 0.7 },
  empty: { paddingVertical: 12, opacity: 0.7 },
  mini: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  section: { marginTop: 16 },
  station: { marginBottom: 12 },
  stationName: { fontFamily: fonts.bold, fontSize: 16, marginBottom: 6 },
  reading: { marginBottom: 8 },
  tankRow: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  tile: { width: '50%', alignItems: 'center', paddingVertical: 12, gap: 6 },
  tileLabel: { textAlign: 'center', fontSize: 13 },
});
