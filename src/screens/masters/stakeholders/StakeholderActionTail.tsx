import React, { useState } from 'react';
import { Button } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import StakeholderForm from './StakeholderForm';

export default function StakeholderActionTail() {
  const { checkOrganizationPermission } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  if (!checkOrganizationPermission(P.STAKEHOLDERS_CREATE)) return null;
  return (
    <>
      <Button icon="plus" mode="contained" onPress={() => setFormOpen(true)}>
        {dictionary.masters.common.add}
      </Button>
      <StakeholderForm visible={formOpen} onDismiss={() => setFormOpen(false)} />
    </>
  );
}
