import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ActivityIndicator, Chip, Icon, Text } from 'react-native-paper';
import { useAuth } from '../../auth/AuthProvider';
import { MODULES } from '../../constants/modules';
import { dictionary, format, language } from '../../i18n';
import { dashboardApi } from '../../modules/dashboard/api';
import { MENU, type MenuNode } from '../../navigation/moduleRegistry';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { Legend, useOpenReport } from './accountsCards';
import { useDashboardSettings } from './DashboardContext';
import { chartScale, readableDate, sparseLabels } from './format';
import { Card, chartColors, InfoAlert, SelectMenu, SubHeading } from './ui';

const t = dictionary.dashboard;

// --- HR: both cards read GET /hr-dashboard once (shared query key), unaffected by filters. ---

const useHrDashboard = () =>
  useQuery({ queryKey: ['hrDashboard'], queryFn: dashboardApi.hrDashboard });

// live-repo humanResourcesCards/OnLeaveToday.tsx (phone layout: mini-cards).
export function OnLeaveToday() {
  const { palette } = useAppTheme();
  const openReport = useOpenReport();
  const rows = useHrDashboard().data?.employees_on_leave ?? [];
  return (
    <Card title={t.cards.employeesOnLeaveToday}>
      {/* Web has no loading state here: the empty text shows while loading. */}
      {rows.length ? (
        rows.map((r) => (
          <Pressable
            key={r.employee_id}
            style={[styles.mini, { borderColor: palette.divider }]}
            onPress={() =>
              openReport(
                'employee',
                r.employee_name,
                `/humanResources/employees/${r.employee_id}`,
                6
              )
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

// live-repo humanResourcesCards/BirthdaysToday.tsx: every row the backend returns (30-day window).
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
              openReport(
                'employee',
                r.employee_name,
                `/humanResources/employees/${r.employee_id}`,
                6
              )
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

// --- Fuel: live-repo fuelStationCards/{DippingsCard,DippingTrend,LatestDippings}.tsx ---

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

// --- Quick Links / Quick Reports: tiles; each destination is built in its own Hatua. ---

type Tile = { label: string; icon: string; show: boolean; onPress: () => void };

function TileGrid({ title, tiles }: { title: string; tiles: Tile[] }) {
  const { palette } = useAppTheme();
  const visible = tiles.filter((x) => x.show);
  if (!visible.length) return null;
  return (
    <Card title={title}>
      <View style={styles.grid}>
        {visible.map((tile) => (
          <Pressable
            key={tile.label}
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

// live-repo dashboard/QuickLinks.tsx
export function QuickLinks() {
  const { organizationHasSubscribed: sub, checkOrganizationPermission: can } = useAuth();
  const openReport = useOpenReport();
  const go = (path: string) => {
    const node = findByPath(MENU, path);
    openReport(node?.id ?? path, node?.label[language] ?? path, path, node?.hatua ?? 0);
  };
  const tiles: Tile[] = [
    {
      label: 'Projects',
      icon: 'format-list-bulleted',
      show:
        sub(MODULES.PROJECT_MANAGEMENT) &&
        can(['Projects:Read', 'Projects:Create', 'Projects:Edit', 'Projects:Delete']),
      onPress: () => go('/projectManagement/projects'),
    },
    {
      label: 'Batches',
      icon: 'qrcode',
      show:
        sub(MODULES.MANUFACTURING_AND_PROCESSING) &&
        can([
          'BOM:Read',
          'BOM:Create',
          'BOM:Edit',
          'BOM:Delete',
          'ProductionBatches:Create',
          'ProductionBatches:Read',
          'ProductionBatches:Update',
          'ProductionBatches:Delete',
          'ManufacturingOrders:Create',
          'ManufacturingOrders:Read',
          'ManufacturingOrders:Edit',
          'ManufacturingOrders:Delete',
        ]),
      onPress: () => go('/manufacturing/batches'),
    },
    {
      label: 'Sales Shift',
      icon: 'gas-station',
      show:
        sub(MODULES.FUEL_STATION) &&
        can([
          'FuelSalesShifts:Read',
          'FuelSalesShifts:Create',
          'FuelSalesShifts:Update',
          'FuelSalesShifts:Delete',
          'FuelSalesShifts:Close',
        ]),
      onPress: () => go('/fuelStations/salesShifts'),
    },
    {
      label: 'Sales',
      icon: 'point-of-sale',
      show:
        sub(MODULES.POINT_OF_SALE) &&
        can(['Sales:Read', 'Sales:Create', 'Sales:Edit', 'Sales:Complete']),
      onPress: () => go('/pos/sales-counters'),
    },
    {
      label: 'Purchases',
      icon: 'cart-outline',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can(['Purchases:Read', 'Purchases:Create', 'Purchases:Receive']),
      onPress: () => go('/procurement/purchases'),
    },
    {
      label: 'Requisitions',
      icon: 'format-list-numbered-rtl',
      show:
        sub(MODULES.PROCESS_APPROVAL) &&
        can(['Requisitions:Read', 'Requisitions:Create', 'Requisitions:Edit']),
      onPress: () => go('/requisitions'),
    },
    {
      label: 'Transactions',
      icon: 'receipt-text-outline',
      show:
        sub(MODULES.ACCOUNTS_AND_FINANCE) &&
        can([
          'AccountsTransactions:Read',
          'AccountsTransactions:Create',
          'AccountsTransactions:Delete',
          'AccountsTransactions:Edit',
          'Payments:Read',
          'Payments:Create',
          'Payments:Edit',
          'Payments:Delete',
          'FundTransfers:Read',
          'FundTransfers:Create',
          'FundTransfers:Delete',
          'FundTransfers:Edit',
          'Receipts:Read',
          'Receipts:Edit',
          'Receipts:Create',
          'Receipts:Delete',
          'JournalVouchers:Read',
          'JournalVouchers:Create',
          'JournalVouchers:Delete',
          'JournalVouchers:Edit',
        ]),
      onPress: () => go('/accounts/transactions'),
    },
    {
      label: 'Ledgers',
      icon: 'book-open-page-variant-outline',
      show: sub(MODULES.ACCOUNTS_AND_FINANCE) && can('AccountsMasters:Read'),
      onPress: () => go('/accounts/ledgers'),
    },
    {
      label: 'Stores',
      icon: 'package-variant-closed',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can([
          'Stores:Read',
          'Stores:Create',
          'InventoryTransfers:Read',
          'InventoryTransfers:Create',
          'InventoryConsumptions:Read',
          'InventoryConsumptions:Create',
        ]),
      onPress: () => go('/procurement/stores'),
    },
    {
      label: language === 'sw' ? 'Uchambuzi wa Bidhaa' : 'Product Insights',
      icon: 'chart-line',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can(['Stores:Reports', 'Purchases:Reports', 'Accounts:Reports'], true),
      onPress: () => openReport('productInsights', 'Product Insights', '/procurement/reports', 8),
    },
    {
      label: 'Products',
      icon: 'qrcode',
      show:
        sub(MODULES.PROCUREMENT_AND_SUPPLY) &&
        can(['Products:Read', 'Products:Create', 'Products:Edit']),
      onPress: () => go('/procurement/products'),
    },
    {
      label: 'Employees',
      icon: 'account-group-outline',
      show:
        sub(MODULES.HUMAN_RESOURCES) &&
        can(['Employees:Read', 'Employees:Create', 'Employees:Update']),
      onPress: () => go('/humanResources/employees'),
    },
    {
      label: 'Payroll Runs',
      icon: 'chart-box-outline',
      show: sub(MODULES.HUMAN_RESOURCES) && can(['PayrollRuns:Create', 'Payroll:Read']),
      onPress: () => go('/humanResources/payroll-runs'),
    },
    {
      label: 'Asset Bookings',
      icon: 'calendar-month-outline',
      show: sub(MODULES.ASSET_BOOKINGS) && can('AssetBookings:Read'),
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
    label: string,
    icon: string,
    show: boolean,
    path: string,
    hatua: number
  ): Tile => ({
    label,
    icon,
    show,
    onPress: () => openReport(label, label, path, hatua),
  });
  const fuel = sub(MODULES.FUEL_STATION);
  const pos = sub(MODULES.POINT_OF_SALE);
  const af = sub(MODULES.ACCOUNTS_AND_FINANCE);
  const proc = sub(MODULES.PROCUREMENT_AND_SUPPLY);
  const hr = sub(MODULES.HUMAN_RESOURCES);
  const tiles: Tile[] = [
    report(
      'Sales & Cash Summary',
      'text-box-outline',
      (fuel || pos) && can('Sales:Reports'),
      '/pos/reports',
      9
    ),
    report(
      'Sales Manifest',
      'clipboard-list-outline',
      pos && can('Sales:Reports'),
      '/pos/reports',
      9
    ),
    report('Sales Performance', 'podium', pos && can('Sales:Reports'), '/pos/reports', 9),
    report('Cashier Report', 'cash', af && can('Accounts:Reports'), '/accounts/reports', 10),
    report('Dipping Report', 'table', fuel, '/fuelStations/reports', 12),
    report(
      'Tank Stock Report',
      'chart-bar',
      fuel && can(['Stores:Reports', 'FuelStations:Reports']),
      '/fuelStations/reports',
      12
    ),
    report(
      'Stock Report',
      'cube-outline',
      proc && can('Stores:Reports'),
      '/procurement/reports',
      8
    ),
    report(
      'Item Movement',
      'timeline-text-outline',
      proc && can('Stores:Reports'),
      '/procurement/reports',
      8
    ),
    report(
      'Stock Movement',
      'newspaper-variant-outline',
      proc && can('Stores:Reports'),
      '/procurement/reports',
      8
    ),
    report(
      'Debtors & Creditors',
      'cash-multiple',
      af && can('Accounts:Reports'),
      '/accounts/reports',
      10
    ),
    report(
      'A/P & A/R Aging',
      'chart-timeline-variant',
      af && can('Accounts:Reports'),
      '/accounts/reports',
      10
    ),
    report('FV Report', 'receipt', fuel, '/fuelStations/reports', 12),
    report('Shifts Summary Report', 'history', fuel, '/fuelStations/reports', 12),
    report(
      'Payroll Components Summary',
      'receipt-text-outline',
      hr && can('Payroll:Read'),
      '/humanResources/reports',
      7
    ),
    report(
      'Leave Balances',
      'beach',
      hr && can('LeaveAllocations:Read'),
      '/humanResources/reports',
      6
    ),
    report(
      'Staff Loans',
      'file-document-outline',
      hr && can('Loans:Read'),
      '/humanResources/reports',
      6
    ),
    report(
      'Project Status Report',
      'chart-box-outline',
      sub(MODULES.PROJECT_MANAGEMENT) && can('Projects:Reports'),
      '/projectManagement/reports',
      11
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
