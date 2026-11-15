import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { IconButton, Menu, Snackbar } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import { PERMISSIONS as P } from '../../../constants/permissions';
import type { MeasurementUnit } from '../../../api/modules/masters/types';
import { measurementUnitsApi } from '../../../api/modules/masters/measurementUnits/services';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { dictionary } from '../../../i18n';
import MeasurementUnitForm from './MeasurementUnitForm';

type Props = { unit: MeasurementUnit };
export default function MeasurementUnitItemActions({ unit }: Props) {
  const { authOrganization, checkOrganizationPermission } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const canEdit = checkOrganizationPermission(P.MEASUREMENT_UNITS_EDIT);
  const canDelete = checkOrganizationPermission(P.MEASUREMENT_UNITS_DELETE);
  const common = dictionary.masters.common;
  const mutation = useMutation({
    mutationFn: () => measurementUnitsApi.remove(unit.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['masters', authOrganization?.organization.id, 'measurementUnits'],
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
      <MeasurementUnitForm visible={editOpen} unit={unit} onDismiss={() => setEditOpen(false)} />
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
