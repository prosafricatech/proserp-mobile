import { useAuth } from '../../../auth/AuthProvider';
import { costCentersApi } from '../../../api/modules/masters/costCenters/services';
import JumboRqList from '../../../components/list/JumboRqList';
import { dictionary } from '../../../i18n';
import type { CostCenter } from '../../../api/modules/masters/types';
import CostCenterActionTail from './CostCenterActionTail';
import CostCenterListItem from './CostCenterListItem';

export function CostCenters() {
  const { authOrganization } = useAuth();
  const queryKey = ['masters', authOrganization?.organization.id, 'costCenters'];

  return (
    <JumboRqList<CostCenter, Record<string, never>>
      title={dictionary.masters.costCenters.title}
      queryKey={queryKey}
      fetchPage={costCentersApi.list}
      filters={{}}
      emptyFilters={{}}
      onFiltersChange={() => undefined}
      actionTail={<CostCenterActionTail />}
      renderItem={(costCenter) => <CostCenterListItem costCenter={costCenter} />}
      keyExtractor={(costCenter) => String(costCenter.id)}
    />
  );
}
