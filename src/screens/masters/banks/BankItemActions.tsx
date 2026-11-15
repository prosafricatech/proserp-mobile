import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IconButton, Menu, Snackbar } from 'react-native-paper';
import type { Bank } from '../../../api/modules/masters/types';
import { banksApi } from '../../../api/modules/masters/banks/services';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAuth } from '../../../auth/AuthProvider';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import BankForm from './BankForm';

type Props = { bank: Bank };

export default function BankItemActions({ bank }: Props) {
  const { authOrganization, checkOrganizationPermission } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const canEdit = checkOrganizationPermission(P.ACCOUNTS_MASTERS_EDIT);
  const canDelete = checkOrganizationPermission(P.ACCOUNTS_MASTERS_DELETE);
  const common = dictionary.masters.common;

  const deleteMutation = useMutation({
    mutationFn: () => banksApi.remove(bank.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'banks'],
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
            leadingIcon="pencil-outline"
            title={common.edit}
            onPress={() => {
              setMenuOpen(false);
              setEditOpen(true);
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
      <BankForm visible={editOpen} bank={bank} onDismiss={() => setEditOpen(false)} />
      <ConfirmDialog
        visible={confirmDelete}
        confirming={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2800}>
        {notice}
      </Snackbar>
    </>
  );
}
