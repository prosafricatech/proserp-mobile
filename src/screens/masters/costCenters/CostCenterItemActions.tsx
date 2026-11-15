import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IconButton, Menu, Snackbar } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import type { CostCenter } from '../../../api/modules/masters/types';
import { costCentersApi } from '../../../api/modules/masters/costCenters/services';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import CostCenterForm from './CostCenterForm';

type Props = { costCenter: CostCenter };
export default function CostCenterItemActions({ costCenter }: Props) {
  const { authOrganization, checkOrganizationPermission } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const canManage = checkOrganizationPermission(P.COST_CENTERS_ALL);
  const common = dictionary.masters.common;
  const mutation = useMutation({
    mutationFn: () => costCentersApi.remove(costCenter.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'costCenters'],
      });
      setConfirmDelete(false);
      setNotice(common.deleted);
    },
    onError: () => setNotice(common.failed),
  });
  if (!canManage) return null;
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
        <Menu.Item
          leadingIcon="pencil-outline"
          title={common.edit}
          onPress={() => {
            setMenuOpen(false);
            setEditOpen(true);
          }}
        />
        <Menu.Item
          leadingIcon="delete-outline"
          title={common.delete}
          onPress={() => {
            setMenuOpen(false);
            setConfirmDelete(true);
          }}
        />
      </Menu>
      <CostCenterForm
        visible={editOpen}
        costCenter={costCenter}
        onDismiss={() => setEditOpen(false)}
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
