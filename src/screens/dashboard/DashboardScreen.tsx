import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../../auth/AuthProvider';
import { MODULES } from '../../constants/modules';
import { PERMISSIONS } from '../../constants/permissions';
import { dictionary } from '../../i18n';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import {
  BalanceSheetTrend,
  DueInvoicesCard,
  ExpenseDistributionCard,
  ProfitAndLossTrendCard,
  RevenueDistributionCard,
} from './accountsCards';
import { DashboardProvider, useDashboardSettings } from './DashboardContext';
import Filters from './Filters';
import { BirthdaysToday, DippingsCard, OnLeaveToday, QuickLinks, QuickReports } from './otherCards';
import { ProductSalesCard } from './posCards';
import { InventoryValueTrend, LowStockAlerts, PurchasesAndGrns } from './procurementCards';

const t = dictionary.dashboard;

// Port of live-repo src/components/dashboard/Dashboard.tsx: same cards, same order, same gates.
// On a phone every web Grid item is xs=12, so the cards simply stack in this order.
export default function DashboardScreen() {
  const { authOrganization } = useAuth();
  // The drawer keeps this screen mounted across organization switches: the key gives each
  // organization fresh filters (its own cost centers) instead of the previous one's.
  return (
    <DashboardProvider key={String(authOrganization?.organization?.id ?? 'none')}>
      <Dashboard />
    </DashboardProvider>
  );
}

function Dashboard() {
  const {
    authOrganization,
    organizationHasSubscribed: sub,
    checkOrganizationPermission: can,
  } = useAuth();
  const { haveFuelStation } = useDashboardSettings();
  const { palette } = useAppTheme();
  const subscriptions: any[] = authOrganization?.organization?.active_subscriptions ?? [];
  const hasSubs = subscriptions.length > 0;
  const alerting = subscriptions.filter((s) => !s?.successor && s.days_remaining <= 20);
  const accounts = sub(MODULES.ACCOUNTS_AND_FINANCE) && can(PERMISSIONS.ACCOUNTS_REPORTS);
  const procurement = sub(MODULES.PROCUREMENT_AND_SUPPLY);

  return (
    <ScrollView
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.content}
    >
      {!hasSubs ? <Alert color="#F39711">{t.noSubscriptions}</Alert> : null}
      {alerting.length > 0 && can('Subscriptions:Manage')
        ? alerting.map((s, i) => (
            <Alert key={s.id ?? i} color={s.days_remaining > 0 ? '#F39711' : palette.error}>
              {t.subscriptionPrefix}
              <Text style={styles.bold}>{s.modules.map((m: any) => m.name).join(', ')}</Text>
              {t.subscriptionHas}
              <Text style={styles.bold}>{`${s.status}.`}</Text>
              {t.subscriptionSuffix}
            </Alert>
          ))
        : null}

      {hasSubs &&
      (can(PERMISSIONS.ACCOUNTS_REPORTS) ||
        can(PERMISSIONS.PURCHASES_REPORTS) ||
        can([PERMISSIONS.SALES_REPORTS, PERMISSIONS.ACCOUNTS_REPORTS], true)) ? (
        <Filters />
      ) : null}

      {accounts && haveFuelStation ? <DippingsCard /> : null}
      {accounts ? (
        <>
          <ProfitAndLossTrendCard />
          <BalanceSheetTrend />
          <RevenueDistributionCard />
          <ExpenseDistributionCard />
        </>
      ) : null}

      {procurement && can(PERMISSIONS.STORES_REPORTS) && can(PERMISSIONS.ACCOUNTS_REPORTS) ? (
        <InventoryValueTrend />
      ) : null}
      {procurement && can(PERMISSIONS.STORES_REPORTS) ? <LowStockAlerts /> : null}
      {procurement && can(PERMISSIONS.PURCHASES_REPORTS) ? <PurchasesAndGrns /> : null}
      {accounts ? <DueInvoicesCard /> : null}

      {(sub(MODULES.POINT_OF_SALE) || sub(MODULES.FUEL_STATION)) &&
      can([PERMISSIONS.SALES_REPORTS, PERMISSIONS.ACCOUNTS_REPORTS], true) ? (
        <ProductSalesCard />
      ) : null}

      {sub(MODULES.HUMAN_RESOURCES) && can(PERMISSIONS.EMPLOYEES_READ) ? (
        <>
          <OnLeaveToday />
          <BirthdaysToday />
        </>
      ) : null}

      {hasSubs ? <QuickLinks /> : null}
      {hasSubs &&
      can([
        PERMISSIONS.STORES_REPORTS,
        PERMISSIONS.ACCOUNTS_REPORTS,
        PERMISSIONS.SALES_REPORTS,
        PERMISSIONS.PAYROLL_READ,
        PERMISSIONS.LEAVE_ALLOCATIONS_READ,
        PERMISSIONS.LOANS_READ,
      ]) ? (
        <QuickReports />
      ) : null}
    </ScrollView>
  );
}

// MUI <Alert severity="warning|error"> inside a Card.
function Alert({ color, children }: { color: string; children: React.ReactNode }) {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.alert, { backgroundColor: palette.paper }]}>
      <View style={[styles.alertInner, { backgroundColor: `${color}1F`, borderLeftColor: color }]}>
        <Text style={{ color: palette.textPrimary }}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8 },
  bold: { fontFamily: fonts.bold },
  alert: { borderRadius: 12, padding: 8, marginBottom: 8 },
  alertInner: { borderLeftWidth: 4, borderRadius: 6, padding: 12 },
});
