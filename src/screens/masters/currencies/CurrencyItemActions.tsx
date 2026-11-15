import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IconButton, Menu, Snackbar } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import type { Currency } from '../../../api/modules/masters/types';
import { currenciesApi } from '../../../api/modules/masters/currencies/services';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import CurrencyExchangeRates from './CurrencyExchangeRates';

type Props = { currency: Currency };
export default function CurrencyItemActions({ currency }: Props) {
  const { authOrganization, checkOrganizationPermission } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const canEdit = checkOrganizationPermission(P.ACCOUNTS_MASTERS_EDIT);
  const canDelete =
    checkOrganizationPermission(P.ACCOUNTS_MASTERS_DELETE) && Number(currency.id) !== 1;
  const common = dictionary.masters.common;
  const mutation = useMutation({
    mutationFn: () => currenciesApi.remove(currency.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'currencies'],
      });
      setConfirmDelete(false);
      setNotice(common.deleted);
    },
    onError: () => setNotice(common.failed),
  });
  return (
    <>
      <Menu
        visible={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            accessibilityLabel={common.edit}
            onPress={() => setMenuOpen(true)}
          />
        }
      >
        {canEdit ? (
          <Menu.Item
            leadingIcon="chart-timeline-variant"
            title={dictionary.masters.currencies.exchangeRates}
            onPress={() => {
              setMenuOpen(false);
              setRatesOpen(true);
            }}
          />
        ) : null}
        {canDelete ? (
          <Menu.Item
            leadingIcon="delete-outline"
            title={common.delete}
            onPress={() => {
              setMenuOpen(false);
              setConfirmDelete(true);
            }}
          />
        ) : null}
      </Menu>
      <CurrencyExchangeRates
        currency={ratesOpen ? currency : null}
        canAdd={canEdit}
        canDelete={canDelete}
        onClose={() => setRatesOpen(false)}
      />
      <ConfirmDialog
        visible={confirmDelete}
        confirming={mutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => mutation.mutate()}
      />
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2800}>
        {notice}
      </Snackbar>
    </>
  );
}
