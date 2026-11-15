import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { Currency } from '../../../api/modules/masters/types';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { dictionary } from '../../../i18n';
import CurrencyItemActions from './CurrencyItemActions';

type Props = { currency: Currency };
export default function CurrencyListItem({ currency }: Props) {
  const { palette } = useAppTheme();
  const subtitle = `${currency.code} · ${currency.symbol}${currency.is_base ? ` · ${dictionary.masters.currencies.baseCurrency}` : ''}`;
  const details =
    currency.exchangeRate == null
      ? ''
      : `${dictionary.masters.currencies.exchangeRate}: ${currency.exchangeRate}`;
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: palette.paper }]}>
      <Card.Content style={styles.row}>
        <View style={styles.text}>
          <Text variant="titleMedium" style={{ color: palette.textPrimary }}>
            {currency.name_plural ?? currency.name}
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
        <CurrencyItemActions currency={currency} />
      </Card.Content>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  text: { flex: 1, gap: 4 },
});
