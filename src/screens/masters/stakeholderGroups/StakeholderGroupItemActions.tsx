import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IconButton, Menu, Snackbar } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import type { StakeholderGroup } from '../../../api/modules/masters/types';
import { stakeholderGroupsApi } from '../../../api/modules/masters/stakeholderGroups/services';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import StakeholderGroupForm from './StakeholderGroupForm';
import StakeholderGroupMembers from './StakeholderGroupMembers';

type Props = { group: StakeholderGroup };
export default function StakeholderGroupItemActions({ group }: Props) {
  const { authOrganization, checkOrganizationPermission } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const canEdit = checkOrganizationPermission(P.STAKEHOLDER_GROUPS_EDIT);
  const canDelete = checkOrganizationPermission(P.STAKEHOLDER_GROUPS_DELETE);
  const common = dictionary.masters.common;
  const mutation = useMutation({
    mutationFn: () => stakeholderGroupsApi.remove(group.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'stakeholderGroups'],
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
        {canEdit ? (
          <Menu.Item
            leadingIcon="account-multiple-outline"
            title={dictionary.masters.stakeholderGroups.manageMembers}
            onPress={() => {
              setMenuOpen(false);
              setMembersOpen(true);
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
      <StakeholderGroupForm visible={editOpen} group={group} onDismiss={() => setEditOpen(false)} />
      <StakeholderGroupMembers
        group={membersOpen ? group : null}
        canEdit={canEdit}
        onClose={() => setMembersOpen(false)}
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
