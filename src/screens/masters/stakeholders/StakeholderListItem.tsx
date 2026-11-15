import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { Stakeholder } from '../../../api/modules/masters/types';
import { useAppTheme } from '../../../theme/ThemeProvider';
import StakeholderItemActions from './StakeholderItemActions';

type Props = { stakeholder: Stakeholder };
export default function StakeholderListItem({ stakeholder }: Props) {
  const { palette } = useAppTheme();
  const subtitle = `${stakeholder.type}${stakeholder.phone ? ` · ${stakeholder.phone}` : ''}`;
  const details = [
    stakeholder.email,
    stakeholder.address,
    stakeholder.tin ? `TIN: ${stakeholder.tin}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: palette.paper }]}>
      <Card.Content style={styles.row}>
        <View style={styles.text}>
          <Text variant="titleMedium" style={{ color: palette.textPrimary }}>
            {stakeholder.name}
          </Text>
          <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
            {subtitle}
          </Text>
          {details ? (
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {details}
            </Text>
          ) : null}
        </View>
        <StakeholderItemActions stakeholder={stakeholder} />
      </Card.Content>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  text: { flex: 1, gap: 4 },
});
