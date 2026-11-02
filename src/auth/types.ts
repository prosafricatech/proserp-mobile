// Trimmed port of live-repo src/types/auth-types.ts — only what the mobile app reads.

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  email_verified_at?: string | null;
  photo_path?: string | null;
  organization_roles?: Array<{ id?: string; name: string }>;
  [key: string]: any;
}

export interface SubscriptionModule {
  id: string;
  name: string;
  settings?: { id: string; value: any }[];
}

export interface Organization {
  id: string;
  name: string;
  email?: string;
  logo_path?: string | null;
  phone?: string | null;
  tin?: string | null;
  address?: string | null;
  website?: string | null;
  country_code?: string | null;
  recording_start_date?: string | null;
  base_currency?: { code: string } | null;
  settings?: Record<string, any>;
  active_subscriptions?: {
    modules: SubscriptionModule[];
    days_remaining?: number;
    status?: string;
  }[];
  [key: string]: any;
}

export interface AuthUser {
  user: User;
  permissions?: string[];
  [key: string]: any;
}

export interface AuthOrganization {
  organization: Organization;
  permissions?: string[];
  [key: string]: any;
}

// Shape returned by backend POST /login and PUT /organizations/{id}/load.
export interface LoginResponse {
  token: string;
  authUser: AuthUser;
  authOrganization?: AuthOrganization | null;
}

// Shape returned by backend GET /getuser.
export interface CurrentUserResponse {
  authUser: AuthUser;
  authOrganization?: AuthOrganization | null;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  current_page?: number;
  last_page?: number;
}
