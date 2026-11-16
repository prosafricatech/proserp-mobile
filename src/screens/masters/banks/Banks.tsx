import React from 'react';
import { useAuth } from '../../../auth/AuthProvider';
import { banksApi } from '../../../api/modules/masters/banks/services';
import ProsRqList from '../../../components/list/ProsRqList';
import { dictionary } from '../../../i18n';
import type { Bank } from '../../../api/modules/masters/types';
import BankActionTail from './BankActionTail';
import BankListItem from './BankListItem';

export function Banks() {
  const { authOrganization } = useAuth();
  const organizationId = authOrganization?.organization.id;
  const queryKey = ['masters', organizationId, 'banks'];

  return (
    <ProsRqList<Bank, Record<string, never>>
      title={dictionary.masters.banks.title}
      queryKey={queryKey}
      fetchPage={banksApi.list}
      filters={{}}
      emptyFilters={{}}
      onFiltersChange={() => undefined}
      actionTail={<BankActionTail />}
      renderItem={(bank) => <BankListItem bank={bank} />}
      keyExtractor={(bank) => String(bank.id)}
    />
  );
}
