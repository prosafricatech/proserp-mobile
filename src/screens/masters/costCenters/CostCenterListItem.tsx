import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { CostCenter } from '../../../api/modules/masters/types';
import { useAppTheme } from '../../../theme/ThemeProvider';
import CostCenterItemActions from './CostCenterItemActions';

type Props = { costCenter: CostCenter };
export default function CostCenterListItem({ costCenter }: Props) {
  const { palette } = useAppTheme();
  const subtitle = [costCenter.type, costCenter.status].filter(Boolean).join(' · ');
  const details = costCenter.users?.map((user) => user.name).join(', ') ?? costCenter.code ?? '';
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: palette.paper }]}>
      <Card.Content style={styles.row}>
        <View style={styles.text}>
          <Text variant="titleMedium" style={{ color: palette.textPrimary }}>
            {costCenter.name}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {subtitle}
            </Text>
          ) : null}
          {details ? (
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {details}
            </Text>
          ) : null}
        </View>
        <CostCenterItemActions costCenter={costCenter} />
      </Card.Content>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  text: { flex: 1, gap: 4 },
});
