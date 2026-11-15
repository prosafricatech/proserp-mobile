import { api } from '../../../client';
import type { Currency, PageResult } from '../types';

export type ExchangeRate = {
  id: string | number;
  rate_datetime: string;
  rate: number;
  updated_by?: { name: string };
};

export const currenciesApi = {
  async list(params: { page: number; limit: number; keyword?: string }) {
    const { data } = await api.get<PageResult<Currency>>('/masters/currencies', { params });
    return data;
  },
  async add(values: { currency_code: string; exchange_rate: number }) {
    const { data } = await api.post('/masters/currencies', values);
    return data;
  },
  async updateCurrency(values: Currency) {
    const { data } = await api.put(`/masters/currencies/${values.id}`, values);
    return data;
  },
  async updateExchangeRate(values: { id: string | number; as_at: string; rate: number }) {
    const { data } = await api.post(
      `/masters/currencies/${values.id}/update_exchange_rates`,
      values
    );
    return data;
  },
  async remove(id: string | number) {
    const { data } = await api.delete(`/masters/currencies/${id}`);
    return data;
  },
  async exchangeRates(params: { currencyId: string | number; from: string; to: string }) {
    const { currencyId, ...query } = params;
    const { data } = await api.get<ExchangeRate[]>(
      `/masters/currencies/${currencyId}/exchange_rates`,
      {
        params: query,
      }
    );
    return data;
  },
  async removeExchangeRate(id: string | number) {
    const { data } = await api.delete(`/masters/exchange-rates-updates/${id}`);
    return data;
  },
};
