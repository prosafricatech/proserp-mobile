import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { MeasurementUnit } from '../../../api/modules/masters/types';
import { useAppTheme } from '../../../theme/ThemeProvider';
import MeasurementUnitItemActions from './MeasurementUnitItemActions';

type Props = { unit: MeasurementUnit };
export default function MeasurementUnitListItem({ unit }: Props) {
  const { palette } = useAppTheme();
  const subtitle = `${unit.symbol ?? unit.unit_symbol ?? ''}${unit.dimension ? ` · ${unit.dimension}` : ''}`;
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: palette.paper }]}>
      <Card.Content style={styles.row}>
        <View style={styles.text}>
          <Text variant="titleMedium" style={{ color: palette.textPrimary }}>
            {unit.name}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <MeasurementUnitItemActions unit={unit} />
      </Card.Content>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  text: { flex: 1, gap: 4 },
});
