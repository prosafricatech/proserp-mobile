import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import type { CostCenterIds } from '../../modules/dashboard/api';

export type CostCenter = {
  id: number | string;
  name: string;
  type?: string | null;
  cost_centerable_id?: number | string;
};

export type ChartFilters = {
  from: string;
  to: string;
  cost_center_ids: CostCenterIds;
  costCenters: CostCenter[];
};

type DashboardSettings = {
  chartFilters: ChartFilters;
  setChartFilters: React.Dispatch<React.SetStateAction<ChartFilters>>;
  showFigures: boolean;
  setShowFigures: (show: boolean) => void;
  haveFuelStation: boolean;
};

const DashboardContext = createContext<DashboardSettings | null>(null);

// live-repo Dashboard.tsx DashboardContext + showFiguresPreference.ts.
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { authUser, authOrganization, checkOrganizationPermission } = useAuth();
  const orgCostCenters: CostCenter[] = authOrganization?.costCenters ?? [];

  const [chartFilters, setChartFilters] = useState<ChartFilters>(() => ({
    from: dayjs().startOf('month').toISOString(),
    to: dayjs().endOf('day').toISOString(),
    cost_center_ids:
      authUser?.user?.is_admin || checkOrganizationPermission('CostCenters:All')
        ? 'all'
        : orgCostCenters.map((c) => c.id),
    costCenters: orgCostCenters,
  }));

  // Opt-in, remembered per user, default hidden — same key as web's localStorage
  // (live-repo dashboard/showFiguresPreference.ts).
  const storageKey = `proserp_dashboard_show_figures_${authUser?.user?.id ?? 'anonymous'}`;
  const [showFigures, setShowFiguresState] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((v) => setShowFiguresState(v === '1'))
      .catch(() => setShowFiguresState(false));
  }, [storageKey]);
  const setShowFigures = (show: boolean) => {
    setShowFiguresState(show);
    AsyncStorage.setItem(storageKey, show ? '1' : '0').catch(() => {});
  };

  const value = useMemo<DashboardSettings>(
    () => ({
      chartFilters,
      setChartFilters,
      showFigures,
      setShowFigures,
      haveFuelStation: chartFilters.costCenters.some((c) => c?.type === 'Fuel Station'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chartFilters, showFigures]
  );
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboardSettings = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboardSettings must be used within DashboardProvider');
  return ctx;
};
