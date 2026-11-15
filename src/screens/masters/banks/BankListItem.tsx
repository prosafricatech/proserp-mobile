import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { Bank } from '../../../api/modules/masters/types';
import { useAppTheme } from '../../../theme/ThemeProvider';
import BankItemActions from './BankItemActions';

type Props = { bank: Bank };

export default function BankListItem({ bank }: Props) {
  const { palette } = useAppTheme();
  const subtitle = bank.short_name ?? bank.swift_code;

  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: palette.paper }]}>
      <Card.Content style={styles.row}>
        <View style={styles.text}>
          <Text variant="titleMedium" style={{ color: palette.textPrimary }}>
            {bank.name}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <BankItemActions bank={bank} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  text: { flex: 1, gap: 4 },
});
