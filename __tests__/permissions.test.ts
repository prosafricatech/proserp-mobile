import {
  checkOrganizationPermission,
  checkPermission,
  hasOrganizationRole,
  moduleSetting,
  organizationHasSubscribed,
} from '../src/auth/permissions';
import type { AuthOrganization, AuthUser } from '../src/auth/types';

const authUser: AuthUser = {
  user: {
    id: 'user-1',
    name: 'Asha Mwita',
    email: 'asha@example.com',
    is_admin: false,
    organization_roles: [{ name: 'Finance Manager' }],
  },
  permissions: ['AccountsMasters:Read', 'Stakeholders:Create'],
};

const authOrganization: AuthOrganization = {
  organization: {
    id: 'org-1',
    name: 'Example Organization',
    active_subscriptions: [
      {
        modules: [
          {
            id: 'accounts-module',
            name: 'Accounts And Finance',
            settings: [{ id: 'defer-billing', value: true }],
          },
        ],
      },
    ],
  },
  permissions: ['AccountsMasters:Read', 'Stakeholders:Create'],
};

describe('permission helpers', () => {
  it('checks user permissions case-insensitively and supports any/all', () => {
    expect(checkPermission(authUser, 'accountsmasters:read')).toBe(true);
    expect(checkPermission(authUser, ['unknown', 'Stakeholders:Create'])).toBe(true);
    expect(checkPermission(authUser, ['AccountsMasters:Read', 'missing'], true)).toBe(false);
    expect(checkPermission(null, 'AccountsMasters:Read')).toBe(false);
  });

  it('checks organization permissions and roles', () => {
    expect(checkOrganizationPermission(authOrganization, 'Stakeholders:Create')).toBe(true);
    expect(checkOrganizationPermission(authOrganization, ['one', 'two'])).toBe(false);
    expect(hasOrganizationRole(authUser, 'finance manager')).toBe(true);
    expect(hasOrganizationRole(authUser, ['Finance Manager', 'Admin'], true)).toBe(false);
  });

  it('checks subscribed modules and reads their settings', () => {
    expect(organizationHasSubscribed(authOrganization, 'Accounts And Finance')).toBe(true);
    expect(organizationHasSubscribed(authOrganization, ['Accounts And Finance', 'HR'], true)).toBe(
      false
    );
    expect(
      moduleSetting(authOrganization, { module_id: 'accounts-module', id: 'defer-billing' })
    ).toBe(true);
    expect(
      moduleSetting(authOrganization, { module_id: 'missing', id: 'defer-billing' })
    ).toBeUndefined();
  });
});
