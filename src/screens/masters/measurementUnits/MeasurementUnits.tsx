import { useAuth } from '../../../auth/AuthProvider';
import { measurementUnitsApi } from '../../../api/modules/masters/measurementUnits/services';
import type { MeasurementUnit } from '../../../api/modules/masters/types';
import JumboRqList from '../../../components/list/JumboRqList';
import { dictionary } from '../../../i18n';
import MeasurementUnitActionTail from './MeasurementUnitActionTail';
import MeasurementUnitListItem from './MeasurementUnitListItem';

export function MeasurementUnits() {
  const { authOrganization } = useAuth();
  const queryKey = ['masters', authOrganization?.organization.id, 'measurementUnits'];
  return (
    <JumboRqList<MeasurementUnit, Record<string, never>>
      title={dictionary.masters.measurementUnits.title}
      queryKey={queryKey}
      fetchPage={measurementUnitsApi.list}
      filters={{}}
      emptyFilters={{}}
      onFiltersChange={() => undefined}
      actionTail={<MeasurementUnitActionTail />}
      renderItem={(unit) => <MeasurementUnitListItem unit={unit} />}
      keyExtractor={(unit) => String(unit.id)}
    />
  );
}
