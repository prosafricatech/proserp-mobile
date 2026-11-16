import { useAuth } from '../../../auth/AuthProvider';
import { stakeholdersApi } from '../../../api/modules/masters/stakeholders/services';
import type { Stakeholder } from '../../../api/modules/masters/types';
import ProsRqList from '../../../components/list/ProsRqList';
import { dictionary } from '../../../i18n';
import StakeholderActionTail from './StakeholderActionTail';
import StakeholderListItem from './StakeholderListItem';

export function Stakeholders() {
  const { authOrganization } = useAuth();
  const queryKey = ['masters', authOrganization?.organization.id, 'stakeholders'];
  return (
    <ProsRqList<Stakeholder, Record<string, never>>
      title={dictionary.masters.stakeholders.title}
      queryKey={queryKey}
      fetchPage={stakeholdersApi.list}
      filters={{}}
      emptyFilters={{}}
      onFiltersChange={() => undefined}
      actionTail={<StakeholderActionTail />}
      renderItem={(stakeholder) => <StakeholderListItem stakeholder={stakeholder} />}
      keyExtractor={(stakeholder) => String(stakeholder.id)}
    />
  );
}
