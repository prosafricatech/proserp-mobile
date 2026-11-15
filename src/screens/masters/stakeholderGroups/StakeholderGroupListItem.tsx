import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { StakeholderGroup } from '../../../api/modules/masters/types';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { dictionary } from '../../../i18n';
import StakeholderGroupItemActions from './StakeholderGroupItemActions';

type Props = { group: StakeholderGroup };
export default function StakeholderGroupListItem({ group }: Props) {
  const { palette } = useAppTheme();
  const subtitle = dictionary.masters.stakeholderGroups.memberCount.replace(
    '{count}',
    String(group.stakeholders_count ?? 0)
  );
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: palette.paper }]}>
      <Card.Content style={styles.row}>
        <View style={styles.text}>
          <Text variant="titleMedium" style={{ color: palette.textPrimary }}>
            {group.name}
          </Text>
          <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
            {subtitle}
          </Text>
          {group.description ? (
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {group.description}
            </Text>
          ) : null}
        </View>
        <StakeholderGroupItemActions group={group} />
      </Card.Content>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  text: { flex: 1, gap: 4 },
});
