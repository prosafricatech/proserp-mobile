import { useQuery } from '@tanstack/react-query';
import React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { banksApi } from '../../api/modules/masters/banks/services';
import { costCentersApi } from '../../api/modules/masters/costCenters/services';
import { currenciesApi } from '../../api/modules/masters/currencies/services';
import { measurementUnitsApi } from '../../api/modules/masters/measurementUnits/services';
import { stakeholderGroupsApi } from '../../api/modules/masters/stakeholderGroups/services';
import { stakeholdersApi } from '../../api/modules/masters/stakeholders/services';
import SelectField, { type SelectOption } from './SelectField';
import { useAuth } from '../../auth/AuthProvider';

type SelectorProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

function Selector<T extends FieldValues>({
  control,
  name,
  label,
  queryKey,
  load,
}: SelectorProps<T> & {
  queryKey: string;
  load: () => Promise<SelectOption[]>;
}) {
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const { data = [] } = useQuery({
    queryKey: ['master-options', organizationId, queryKey],
    queryFn: load,
  });
  return <SelectField control={control} name={name} label={label} options={data} />;
}

export function CurrencySelector<T extends FieldValues>(props: SelectorProps<T>) {
  return (
    <Selector
      {...props}
      queryKey="currencies"
      load={async () => {
        const result = await currenciesApi.list({ page: 1, limit: 1000 });
        return result.data.map((currency) => ({
          value: String(currency.id),
          label: `${currency.code} — ${currency.name}`,
        }));
      }}
    />
  );
}

export function UnitSelector<T extends FieldValues>(props: SelectorProps<T>) {
  return (
    <Selector
      {...props}
      queryKey="measurement-units"
      load={async () => {
        const units = await measurementUnitsApi.listAll();
        return units.map((unit) => ({
          value: String(unit.id),
          label: `${unit.name} (${unit.symbol})`,
        }));
      }}
    />
  );
}

export function BankSelector<T extends FieldValues>(props: SelectorProps<T>) {
  return (
    <Selector
      {...props}
      queryKey="banks"
      load={async () => {
        const result = await banksApi.list({ page: 1, limit: 1000 });
        return result.data.map((bank) => ({ value: String(bank.id), label: bank.name }));
      }}
    />
  );
}

export function StakeholderSelector<T extends FieldValues>(props: SelectorProps<T>) {
  return (
    <Selector
      {...props}
      queryKey="stakeholders"
      load={async () => {
        const stakeholders = await stakeholdersApi.listOptions();
        return stakeholders.map((stakeholder) => ({
          value: String(stakeholder.id),
          label: `${stakeholder.name} (${stakeholder.type})`,
        }));
      }}
    />
  );
}

export function StakeholderGroupSelector<T extends FieldValues>(props: SelectorProps<T>) {
  return (
    <Selector
      {...props}
      queryKey="stakeholder-groups"
      load={async () => {
        const groups = await stakeholderGroupsApi.listAll();
        return groups.map((group) => ({ value: String(group.id), label: group.name }));
      }}
    />
  );
}

export function CostCenterSelector<T extends FieldValues>(props: SelectorProps<T>) {
  return (
    <Selector
      {...props}
      queryKey="cost-centers"
      load={async () => {
        const costCenters = await costCentersApi.listAll();
        return costCenters.map((costCenter) => ({
          value: String(costCenter.id),
          label: costCenter.name,
        }));
      }}
    />
  );
}
