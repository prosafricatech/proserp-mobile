import { useAuth } from '../../../auth/AuthProvider';
import { stakeholderGroupsApi } from '../../../api/modules/masters/stakeholderGroups/services';
import type { StakeholderGroup } from '../../../api/modules/masters/types';
import JumboRqList from '../../../components/list/JumboRqList';
import { dictionary } from '../../../i18n';
import StakeholderGroupActionTail from './StakeholderGroupActionTail';
import StakeholderGroupListItem from './StakeholderGroupListItem';

export function StakeholderGroups() {
  const { authOrganization } = useAuth();
  const queryKey = ['masters', authOrganization?.organization.id, 'stakeholderGroups'];
  return (
    <JumboRqList<StakeholderGroup, Record<string, never>>
      title={dictionary.masters.stakeholderGroups.title}
      queryKey={queryKey}
      fetchPage={stakeholderGroupsApi.list}
      filters={{}}
      emptyFilters={{}}
      onFiltersChange={() => undefined}
      actionTail={<StakeholderGroupActionTail />}
      renderItem={(group) => <StakeholderGroupListItem group={group} />}
      keyExtractor={(group) => String(group.id)}
    />
  );
}
