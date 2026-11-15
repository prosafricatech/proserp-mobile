import React, { useState } from 'react';
import { Button } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import BankForm from './BankForm';

export default function BankActionTail() {
  const { checkOrganizationPermission } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const canCreate = checkOrganizationPermission(P.ACCOUNTS_MASTERS_CREATE);

  if (!canCreate) return null;

  return (
    <>
      <Button icon="plus" mode="contained" onPress={() => setFormOpen(true)}>
        {dictionary.masters.common.add}
      </Button>
      <BankForm visible={formOpen} onDismiss={() => setFormOpen(false)} />
    </>
  );
}
