import React, { useState } from 'react';
import { Button } from 'react-native-paper';
import { useAuth } from '../../../auth/AuthProvider';
import { PERMISSIONS as P } from '../../../constants/permissions';
import { dictionary } from '../../../i18n';
import CostCenterForm from './CostCenterForm';

export default function CostCenterActionTail() {
  const { checkOrganizationPermission } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  if (!checkOrganizationPermission(P.COST_CENTERS_ALL)) return null;
  return (
    <>
      <Button icon="plus" mode="contained" onPress={() => setFormOpen(true)}>
        {dictionary.masters.common.add}
      </Button>
      <CostCenterForm visible={formOpen} onDismiss={() => setFormOpen(false)} />
    </>
  );
}
