import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IconButton, Menu, Snackbar } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import type { Stakeholder } from '../../../api/modules/masters/types';
import { stakeholdersApi } from '../../../api/modules/masters/stakeholders/services';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import StakeholderForm from './StakeholderForm';

type Props = { stakeholder: Stakeholder };
export default function StakeholderItemActions({ stakeholder }: Props) {
  const { authOrganization, checkOrganizationPermission } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const canEdit = checkOrganizationPermission(P.STAKEHOLDERS_EDIT);
  const canDelete = checkOrganizationPermission(P.STAKEHOLDERS_DELETE);
  const common = dictionary.masters.common;
  const mutation = useMutation({
    mutationFn: () => stakeholdersApi.remove(stakeholder.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'stakeholders'],
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
      <StakeholderForm
        visible={editOpen}
        stakeholder={stakeholder}
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
