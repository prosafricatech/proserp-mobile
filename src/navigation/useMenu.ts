import { useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { filterMenu, MENU, type GateContext } from './moduleRegistry';

// The menu the signed-in user may see, recomputed whenever the session changes
// (login, org switch, refreshAuth). Mobile replacement for Sidebar.js's useEffect.
export const useMenu = () => {
  const { authOrganization, organizationHasSubscribed, checkOrganizationPermission } = useAuth();

  return useMemo(() => {
    const organization = authOrganization?.organization;
    const ctx: GateContext = {
      hasOrganization: !!organization?.name,
      subscriptionsCount: organization?.active_subscriptions?.length ?? 0,
      subscribed: (modules) => organizationHasSubscribed(modules),
      org: (permissions) => checkOrganizationPermission(permissions),
      setting: (name) => organization?.settings?.[name],
    };
    return filterMenu(MENU, ctx);
  }, [authOrganization, organizationHasSubscribed, checkOrganizationPermission]);
};
