import { useAuth } from '../../../auth/AuthProvider';
import type { Currency } from '../../../api/modules/masters/types';
import { currenciesApi } from '../../../api/modules/masters/currencies/services';
import ProsRqList from '../../../components/list/ProsRqList';
import { dictionary } from '../../../i18n';
import CurrencyListItem from './CurrencyListItem';
import CurrencyActionTail from './CurrencyActionTail';

export function Currencies() {
  const { authOrganization } = useAuth();
  const queryKey = ['masters', authOrganization?.organization.id, 'currencies'];
  return (
    <ProsRqList<Currency, Record<string, never>>
      title={dictionary.masters.currencies.title}
      queryKey={queryKey}
      fetchPage={currenciesApi.list}
      filters={{}}
      emptyFilters={{}}
      onFiltersChange={() => undefined}
      actionTail={<CurrencyActionTail />}
      renderItem={(currency) => <CurrencyListItem currency={currency} />}
      keyExtractor={(currency) => String(currency.id)}
    />
  );
}
