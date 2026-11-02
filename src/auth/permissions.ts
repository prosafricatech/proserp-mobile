import type { AuthOrganization, AuthUser } from './types';

// Ported from live-repo JumboAuthProvider.tsx as pure functions so they can be
// unit-tested without a provider. AuthProvider binds them to the current session.

const toArray = (value: string | string[]) => (Array.isArray(value) ? value : [value]);

const matches = (granted: string[], required: string | string[], mustHaveAll: boolean) => {
  const grantedLower = granted.map((g) => g.toLowerCase());
  const check = (item: string) => grantedLower.includes(item.toLowerCase());
  const requiredArray = toArray(required);
  return mustHaveAll ? requiredArray.every(check) : requiredArray.some(check);
};

export const checkPermission = (
  authUser: AuthUser | null,
  permissions: string | string[],
  mustHaveAll = false
) => {
  const granted = authUser?.permissions;
  if (!granted) return false;
  return matches(granted, permissions, mustHaveAll);
};

export const checkOrganizationPermission = (
  authOrganization: AuthOrganization | null,
  permissions: string | string[],
  mustHaveAll = false
) => {
  const granted = authOrganization?.permissions;
  if (!granted) return false;
  return matches(granted, permissions, mustHaveAll);
};

export const hasOrganizationRole = (
  authUser: AuthUser | null,
  roles: string | string[],
  mustHaveAll = false
) => {
  const granted = authUser?.user.organization_roles?.map((role) => role?.name).filter(Boolean);
  if (!granted) return false;
  return matches(granted as string[], roles, mustHaveAll);
};

// The backend does not re-check module subscriptions per route (see learning path §5),
// so every module screen must be gated with this on the client.
export const organizationHasSubscribed = (
  authOrganization: AuthOrganization | null,
  modules: string | string[],
  mustHaveAll = false
) => {
  const subscriptions = authOrganization?.organization?.active_subscriptions;
  if (!subscriptions) return false;
  const subscribed = subscriptions.flatMap((sub) => sub.modules.map((module) => module.name));
  return matches(subscribed, modules, mustHaveAll);
};

export const moduleSetting = (
  authOrganization: AuthOrganization | null,
  setting: { module_id: string; id: string }
) => {
  const subscriptions = authOrganization?.organization?.active_subscriptions;
  if (!subscriptions) return undefined;
  for (const subscription of subscriptions) {
    const module = subscription.modules.find((m) => m.id === setting.module_id);
    const value = module?.settings?.find((s) => s.id === setting.id)?.value;
    if (value !== undefined) return value;
  }
  return undefined;
};
