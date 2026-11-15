import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { PERMISSIONS as P } from '../../constants/permissions';
import { dictionary } from '../../i18n';
import { banksApi } from '../../api/modules/masters/banks/services';
import { costCentersApi } from '../../api/modules/masters/costCenters/services';
import { currenciesApi } from '../../api/modules/masters/currencies/services';
import { measurementUnitsApi } from '../../api/modules/masters/measurementUnits/services';
import { stakeholderGroupsApi } from '../../api/modules/masters/stakeholderGroups/services';
import { stakeholdersApi } from '../../api/modules/masters/stakeholders/services';
import type { Currency, PageResult, StakeholderGroup } from '../../api/modules/masters/types';
import { CURRENCY_CATALOG } from '../../api/modules/masters/currencies/catalog';
import MasterCrudScreen, { type MasterResource, type MasterRow } from './MasterCrudScreen';
import StakeholderGroupMembers from './StakeholderGroupMembers';
import CurrencyExchangeRates from './CurrencyExchangeRates';

function useResource(
  resource: Omit<MasterResource, 'canCreate' | 'canEdit' | 'canDelete'>,
  permissions: { create?: string; edit?: string; delete?: string }
) {
  const { checkOrganizationPermission } = useAuth();
  return {
    ...resource,
    canCreate: permissions.create ? checkOrganizationPermission(permissions.create) : true,
    canEdit: permissions.edit ? checkOrganizationPermission(permissions.edit) : true,
    canDelete: permissions.delete ? checkOrganizationPermission(permissions.delete) : true,
  } satisfies MasterResource;
}

const asRows = <T,>(promise: Promise<PageResult<T>>) =>
  promise as unknown as Promise<PageResult<MasterRow>>;
const textValue = (value: string | string[] | boolean | undefined) =>
  Array.isArray(value) ? (value[0] ?? '') : typeof value === 'string' ? value : '';
const normalizeId = (value: string) => (/^\d+$/.test(value) ? Number(value) : value);
const normalizeIds = (value: string | string[] | boolean | undefined) =>
  (Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []).map(
    normalizeId
  );

export function CurrenciesScreen() {
  const t = dictionary.masters.currencies;
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const resource = useResource(
    {
      id: 'currencies',
      title: t.title,
      addTitle: t.addTitle,
      fields: [
        {
          name: 'currency_code',
          label: t.name,
          queryKey: `currency-catalog-${organizationId ?? 'no-org'}`,
          required: true,
          asyncOptions: async (keyword) => {
            const existing = await currenciesApi.list({ page: 1, limit: 1000 });
            const usedCodes = new Set(existing.data.map((currency) => currency.code));
            const search = keyword.toLocaleLowerCase();
            return CURRENCY_CATALOG.filter(
              (currency) =>
                !usedCodes.has(currency.code) &&
                `${currency.name_plural} ${currency.code}`.toLocaleLowerCase().includes(search)
            )
              .slice(0, 30)
              .map((currency) => ({
                value: currency.code,
                label: `${currency.name_plural} (${currency.code})`,
              }));
          },
        },
        {
          name: 'exchange_rate',
          label: t.exchangeRate,
          required: true,
          keyboardType: 'numeric',
          numeric: true,
          min: 1e-21,
        },
      ],
      editable: false,
      defaults: { currency_code: '', exchange_rate: '1' },
      list: (params) => asRows(currenciesApi.list(params)),
      create: (values) =>
        currenciesApi.add({
          currency_code: textValue(values.currency_code),
          exchange_rate: Number(values.exchange_rate),
        }),
      update: (id, values) => currenciesApi.updateCurrency({ id, ...values } as never),
      remove: currenciesApi.remove,
      canDeleteRow: (row) => Number(row.id) !== 1,
      onOpenDetails: (row) => setSelectedCurrency(row as unknown as Currency),
      detailsLabel: t.exchangeRates,
      getTitle: (row) => String(row.name_plural ?? row.name ?? row.code ?? row.id),
      getSubtitle: (row) =>
        `${String(row.code ?? '')} · ${String(row.symbol ?? '')}${row.is_base ? ` · ${t.baseCurrency}` : ''}`,
      getDetails: (row) =>
        row.exchangeRate == null ? '' : `${t.exchangeRate}: ${String(row.exchangeRate)}`,
    },
    { create: P.ACCOUNTS_MASTERS_CREATE }
  );
  return (
    <>
      <MasterCrudScreen resource={resource} />
      <CurrencyExchangeRates
        currency={selectedCurrency}
        canAdd={resource.canEdit}
        canDelete={resource.canDelete}
        onClose={() => setSelectedCurrency(null)}
      />
    </>
  );
}

export function MeasurementUnitsScreen() {
  const t = dictionary.masters.measurementUnits;
  const resource = useResource(
    {
      id: 'measurementUnits',
      title: t.title,
      addTitle: t.addTitle,
      fields: [
        { name: 'name', label: t.name, required: true },
        { name: 'symbol', label: t.symbol, required: true },
        {
          name: 'dimension',
          label: t.dimension,
          options: [
            { value: '', label: t.noDimension },
            { value: 'mass', label: t.dimensions.mass },
            { value: 'volume', label: t.dimensions.volume },
            { value: 'length', label: t.dimensions.length },
          ],
        },
        {
          name: 'base_factor',
          label: t.baseFactor,
          keyboardType: 'numeric',
          numeric: true,
          min: 1e-21,
          requiredWhen: 'dimension',
          requiredMessage: t.factorRequired,
        },
        { name: 'allows_fractional', label: t.allowsFractional, toggle: true },
        { name: 'description', label: t.description, multiline: true, numberOfLines: 3 },
      ],
      defaults: {
        name: '',
        symbol: '',
        dimension: '',
        base_factor: '',
        allows_fractional: true,
        description: '',
      },
      list: (params) => asRows(measurementUnitsApi.list(params)),
      create: (values) =>
        measurementUnitsApi.create({
          ...values,
          base_factor: values.base_factor ? Number(values.base_factor) : null,
          allows_fractional: values.allows_fractional !== false,
        } as never),
      update: (id, values) =>
        measurementUnitsApi.update({
          ...values,
          id,
          base_factor: values.base_factor ? Number(values.base_factor) : null,
          allows_fractional: values.allows_fractional !== false,
        } as never),
      remove: measurementUnitsApi.remove,
      getSubtitle: (row) =>
        `${String(row.symbol ?? row.unit_symbol ?? '')}${row.dimension ? ` · ${String(row.dimension)}` : ''}`,
    },
    {}
  );
  return <MasterCrudScreen resource={resource} />;
}

export function BanksScreen() {
  const t = dictionary.masters.banks;
  const resource = useResource(
    {
      id: 'banks',
      title: t.title,
      addTitle: t.addTitle,
      fields: [
        { name: 'name', label: t.name, required: true },
        { name: 'short_name', label: t.shortName },
        { name: 'swift_code', label: t.swiftCode },
      ],
      defaults: { name: '', short_name: '', swift_code: '' },
      list: (params) => asRows(banksApi.list(params)),
      create: (values) => banksApi.create(values as never),
      update: (id, values) => banksApi.update({ ...values, id } as never),
      remove: banksApi.remove,
      getSubtitle: (row) => String(row.short_name ?? row.swift_code ?? ''),
    },
    {}
  );
  return <MasterCrudScreen resource={resource} />;
}

export function StakeholdersScreen() {
  const t = dictionary.masters.stakeholders;
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const resource = useResource(
    {
      id: 'stakeholders',
      title: t.title,
      addTitle: t.addTitle,
      fields: [
        { name: 'name', label: t.name, required: true },
        {
          name: 'type',
          label: t.type,
          required: true,
          options: [
            { value: 'Individual', label: t.types.individual },
            { value: 'Group', label: t.types.group },
            { value: 'Sole Proprietor', label: t.types.soleProprietor },
            { value: 'Partnership', label: t.types.partnership },
            { value: 'Private Limited', label: t.types.privateLimited },
            { value: 'Public Liability', label: t.types.publicLiability },
            { value: 'Government Institution', label: t.types.government },
            { value: 'Non-Government Organization', label: t.types.ngo },
          ],
        },
        { name: 'email', label: t.email, keyboardType: 'email-address', email: true },
        { name: 'phone', label: t.phone, keyboardType: 'phone-pad' },
        { name: 'tin', label: t.tin },
        { name: 'vrn', label: t.vrn },
        { name: 'website', label: t.website, keyboardType: 'url' },
        { name: 'address', label: t.address, multiline: true, numberOfLines: 2 },
        { name: 'ledger_code', label: t.ledgerCode },
        { name: 'create_receivable', label: '', toggle: true, hidden: true },
        { name: 'create_payable', label: '', toggle: true, hidden: true },
        {
          name: 'ledger_type',
          label: t.ledgerType,
          required: true,
          createOnly: true,
          options: [
            { value: 'receivable', label: t.receivable },
            { value: 'payable', label: t.payable },
          ],
        },
        {
          name: 'currency_id',
          label: t.currency,
          queryKey: `currency-options-${organizationId ?? 'no-org'}`,
          asyncOptions: async (keyword) => {
            const result = await currenciesApi.list({ page: 1, limit: 30, keyword });
            return result.data.map((currency) => ({
              value: String(currency.id),
              label: `${currency.code} — ${currency.name}`,
            }));
          },
        },
        {
          name: 'group_ids',
          label: t.groups,
          queryKey: `stakeholder-group-options-${organizationId ?? 'no-org'}`,
          multiple: true,
          asyncOptions: async (keyword) => {
            const result = await stakeholderGroupsApi.list({ page: 1, limit: 30, keyword });
            return result.data.map((group) => ({ value: String(group.id), label: group.name }));
          },
        },
      ],
      defaults: {
        name: '',
        type: 'Individual',
        email: '',
        phone: '',
        tin: '',
        vrn: '',
        website: '',
        address: '',
        ledger_code: '',
        ledger_type: 'receivable',
        create_receivable: true,
        create_payable: false,
        currency_id: '',
        group_ids: [],
      },
      list: (params) => asRows(stakeholdersApi.list(params)),
      create: (values) =>
        stakeholdersApi.create({
          ...values,
          type: textValue(values.type) as never,
          name: textValue(values.name),
          ledger_type: textValue(values.ledger_type) as never,
          create_receivable: textValue(values.ledger_type) === 'receivable',
          create_payable: textValue(values.ledger_type) === 'payable',
          currency_id: values.currency_id ? normalizeId(textValue(values.currency_id)) : null,
          group_ids: normalizeIds(values.group_ids),
        } as never),
      update: (id, values) =>
        stakeholdersApi.update({
          ...values,
          id,
          type: textValue(values.type) as never,
          name: textValue(values.name),
          create_receivable: values.create_receivable,
          create_payable: values.create_payable,
          currency_id: values.currency_id ? normalizeId(textValue(values.currency_id)) : null,
          group_ids: normalizeIds(values.group_ids),
        } as never),
      remove: stakeholdersApi.remove,
      getSubtitle: (row) =>
        `${String(row.type ?? '')}${row.phone ? ` · ${String(row.phone)}` : ''}`,
      getDetails: (row) =>
        [row.email, row.address, row.tin ? `TIN: ${String(row.tin)}` : null]
          .filter(Boolean)
          .map(String)
          .join(' · '),
      getFormValues: (row) => ({
        name: String(row.name ?? ''),
        type: String(row.type ?? 'Individual'),
        email: String(row.email ?? ''),
        phone: String(row.phone ?? ''),
        tin: String(row.tin ?? ''),
        vrn: String(row.vrn ?? ''),
        website: String(row.website ?? ''),
        address: String(row.address ?? ''),
        ledger_code: String(row.ledger_code ?? ''),
        create_receivable: row.create_receivable === true,
        create_payable: row.create_payable === true,
        ledger_type: row.create_payable === true ? 'payable' : 'receivable',
        currency_id: String(row.currency_id ?? ''),
        group_ids: Array.isArray(row.groups) ? row.groups.map((group) => String(group.id)) : [],
      }),
    },
    {}
  );
  return <MasterCrudScreen resource={resource} />;
}

export function StakeholderGroupsScreen() {
  const t = dictionary.masters.stakeholderGroups;
  const { checkOrganizationPermission } = useAuth();
  const [groupWithOpenMembers, setGroupWithOpenMembers] = useState<StakeholderGroup | null>(null);
  const resource = useResource(
    {
      id: 'stakeholderGroups',
      title: t.title,
      addTitle: t.addTitle,
      fields: [
        { name: 'name', label: t.name, required: true },
        { name: 'description', label: t.description, multiline: true },
      ],
      defaults: { name: '', description: '' },
      list: (params) => asRows(stakeholderGroupsApi.list(params)),
      create: (values) => stakeholderGroupsApi.create(values as never),
      update: (id, values) => stakeholderGroupsApi.update({ ...values, id } as never),
      remove: stakeholderGroupsApi.remove,
      getSubtitle: (row) => t.memberCount.replace('{count}', String(row.stakeholders_count ?? 0)),
      getDetails: (row) => String(row.description ?? ''),
      onManageMembers: (row) =>
        setGroupWithOpenMembers({
          id: row.id,
          name: String(row.name ?? ''),
          stakeholders_count: Number(row.stakeholders_count ?? 0),
        }),
    },
    {}
  );
  return (
    <>
      <MasterCrudScreen resource={resource} />
      <StakeholderGroupMembers
        group={groupWithOpenMembers}
        canEdit={checkOrganizationPermission(P.STAKEHOLDER_GROUPS_EDIT)}
        onClose={() => setGroupWithOpenMembers(null)}
      />
    </>
  );
}

export function CostCentersScreen() {
  const t = dictionary.masters.costCenters;
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization?.id;
  const resource = useResource(
    {
      id: 'costCenters',
      title: t.title,
      addTitle: t.addTitle,
      fields: [
        { name: 'name', label: t.name, required: true },
        { name: 'description', label: t.description, multiline: true },
        {
          name: 'user_ids',
          label: t.users,
          queryKey: `organization-users-${organizationId ?? 'no-org'}`,
          required: true,
          requiredMessage: t.usersRequired,
          multiple: true,
          asyncOptions: async (keyword) => {
            if (!organizationId) return [];
            const users = await costCentersApi.organizationUsers(organizationId, keyword);
            return users.map((user) => ({
              value: String(user.id),
              label: user.email ? `${user.name} — ${user.email}` : user.name,
            }));
          },
        },
      ],
      defaults: { name: '', description: '', user_ids: [] },
      list: (params) => asRows(costCentersApi.list(params)),
      create: (values) =>
        costCentersApi.create({
          ...values,
          user_ids: normalizeIds(values.user_ids),
        } as never),
      update: (id, values) =>
        costCentersApi.update({
          ...values,
          id,
          user_ids: normalizeIds(values.user_ids),
        } as never),
      remove: costCentersApi.remove,
      getSubtitle: (row) => [row.type, row.status].filter(Boolean).map(String).join(' · '),
      getDetails: (row) =>
        Array.isArray(row.users)
          ? row.users.map((user) => String(user.name)).join(', ')
          : String(row.code ?? ''),
      getFormValues: (row) => ({
        name: String(row.name ?? ''),
        description: String(row.description ?? ''),
        user_ids: Array.isArray(row.users) ? row.users.map((user) => String(user.id)) : [],
      }),
    },
    { create: P.COST_CENTERS_ALL, edit: P.COST_CENTERS_ALL, delete: P.COST_CENTERS_ALL }
  );
  return <MasterCrudScreen resource={resource} />;
}
