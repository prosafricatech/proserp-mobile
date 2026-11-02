import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Checkbox,
  Chip,
  Dialog,
  IconButton,
  Menu,
  Portal,
  Snackbar,
  Text,
} from 'react-native-paper';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import { dictionary } from '../../i18n';
import { escapeHtml, shareExcel, sharePdf } from '../../lib/files/share';
import { dashboardApi, type ProductSale } from '../../modules/dashboard/api';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useDashboardSettings } from './DashboardContext';
import { readableDate, twoDecimals } from './format';
import { Card, InfoAlert, SelectMenu } from './ui';

const t = dictionary.dashboard;
type Top = 'products' | 'product categories' | 'brands';
type OrderBy = 'profit' | 'revenue' | 'quantity' | 'cogs' | 'margin';
const TOP_LABEL: Record<Top, string> = {
  products: t.products,
  'product categories': t.categories,
  brands: t.brands,
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// Web computes the on-screen margin itself: profit × 100 / revenue, two decimals.
const marginOf = (r: ProductSale) =>
  r.revenue ? ((r.profit * 100) / r.revenue).toFixed(2) : '0.00';

// live-repo posCards/ProductSalesCardPDF.tsx, as HTML for expo-print.
const productSalesHtml = (
  rows: ProductSale[],
  o: {
    org: any;
    top: string;
    params: any;
    user?: string;
    salesPersons: string[];
    costCenters: Array<{ name: string }>;
  }
) => {
  const main = o.org?.settings?.main_color || '#2113AD';

  const logo = o.org?.logo_path
    ? `<img src="${escapeHtml(o.org.logo_path)}" style="height:48px" />`
    : `<b>${escapeHtml(o.org?.name)}</b>`;
  const period = `${readableDate(o.params.from)} - ${readableDate(o.params.to)}`;
  const orderedBy = `${cap(o.params.order_by)} ${cap(o.params.order_direction)}`;
  const salesPerson = o.salesPersons.length
    ? `<div><b>Sales Person</b>${escapeHtml(o.salesPersons.join(', '))}</div>`
    : '';
  const costCenters = o.costCenters.map((c) => c.name).join(', ');

  const tableRows = rows
    .map(
      (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(r.name)}</td>
          <td>${escapeHtml(r.unit_symbol)}</td>
          <td class="r">${r.quantity.toLocaleString()}</td>
          <td class="r revenue">${twoDecimals(r.revenue)}</td>
          <td class="r cogs">${twoDecimals(r.cogs)}</td>
          <td class="r profit">${twoDecimals(r.profit)}</td>
          <td class="r profit">${escapeHtml(r.margin)} %</td>
        </tr>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Helvetica, Arial, sans-serif; font-size: 10px; padding: 24px; }
          .head { display: flex; justify-content: space-between; align-items: center; }
          h1 { color: ${main}; font-size: 16px; margin: 0; }
          .info { display: flex; flex-wrap: wrap; gap: 16px; margin: 12px 0; }
          .info div b { display: block; }
          table { width: 100%; border-collapse: collapse; }
          th { background: ${main}; color: #fff; text-align: left; padding: 4px; }
          td { padding: 4px; border-bottom: 1px solid #ddd; }
          .r { text-align: right; }
          .revenue { color: #2196f3; }
          .cogs { color: red; }
          .profit { color: green; }
        </style>
      </head>
      <body>
        <div class="head">
          ${logo}
          <div style="text-align: right">
            <h1>TOP PRODUCTS</h1>
            ${escapeHtml(period)}
          </div>
        </div>

        <div class="info">
          <div><b>Ordered By</b>${escapeHtml(orderedBy)}</div>
          <div><b>Printed By</b>${escapeHtml(o.user)}</div>
          <div><b>Printed On</b>${escapeHtml(readableDate(undefined))}</div>
          ${salesPerson}
          <div><b>Cost Centers</b>${escapeHtml(costCenters)}</div>
        </div>

        <table>
          <tr>
            <th>S/N</th>
            <th>${escapeHtml(o.top)}</th>
            <th>Unit</th>
            <th class="r">Quantity</th>
            <th class="r">Revenue</th>
            <th class="r">CoGS</th>
            <th class="r">Profit</th>
            <th class="r">Margin</th>
          </tr>
          ${tableRows}
        </table>
      </body>
    </html>`;
};

// live-repo posCards/ProductSalesCard.tsx ("Top …"). No chart, no totals row.
export function ProductSalesCard() {
  const { chartFilters } = useDashboardSettings();
  const { authOrganization, authUser } = useAuth();
  const { palette, isDark } = useAppTheme();
  const [top, setTop] = useState<Top>('products');
  const [orderBy, setOrderBy] = useState<OrderBy>('profit');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState(5);
  const [salesPersons, setSalesPersons] = useState<string[]>([]);
  const [pickPeople, setPickPeople] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const people = useQuery({ queryKey: ['salesPerson'], queryFn: dashboardApi.salesPeople });
  const params = {
    from: chartFilters.from,
    to: chartFilters.to,
    top,
    order_by: orderBy,
    order_direction: direction,
    limit,
    cost_center_ids: chartFilters.cost_center_ids,
    sales_persons: salesPersons,
  };
  const query = useQuery({
    queryKey: ['topProducts', params],
    queryFn: () => dashboardApi.productSales(params),
  });
  const rows = query.data ?? [];
  const topLabel = TOP_LABEL[top];
  const cogsColor = isDark ? '#EF9A9A' : 'red';

  const exportPdf = () =>
    sharePdf(
      productSalesHtml(rows, {
        org: authOrganization?.organization,
        top: topLabel,
        params,
        user: authUser?.user?.name,
        salesPersons,
        costCenters: chartFilters.costCenters,
      }),
      'Top Product Sales.pdf'
    ).catch((e) => setMessage(getErrorMessage(e)));

  const exportExcel = async () => {
    try {
      // Loaded on demand: exceljs is ~1MB and only needed when someone exports.
      const { exportProductSalesExcel } = await import('../../lib/excel/exporters/topProducts');
      const buffer = await exportProductSalesExcel({
        popularProducts: rows,
        organization: authOrganization?.organization,
        topProductsData: {
          params,
          costCenters: chartFilters.costCenters,
          user: authUser?.user?.name,
        },
        selectedTop: topLabel,
        salesPersonsSelected: salesPersons,
      });
      await shareExcel(
        buffer,
        `Top Product Sales ${dayjs(chartFilters.to).format('DD MMM YYYY HH:mm')}.xlsx`
      );
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  };

  return (
    <Card
      title={
        <View style={styles.titleRow}>
          <Text style={[styles.top, { color: palette.textPrimary }]}>{t.top}</Text>
          <SelectMenu
            label="-----"
            value={top}
            onChange={setTop}
            options={[
              ['products', t.products],
              ['product categories', t.categories],
              ['brands', t.brands],
            ]}
          />
        </View>
      }
    >
      {people.isLoading ? (
        <ActivityIndicator style={styles.gap} />
      ) : (
        <Pressable
          onPress={() => setPickPeople(true)}
          style={[styles.people, { borderColor: palette.divider }]}
        >
          <Text style={{ color: palette.textSecondary }}>{t.salesPerson}</Text>
          <View style={styles.chips}>
            {salesPersons.map((p) => (
              <Chip
                key={p}
                compact
                onClose={() => setSalesPersons((s) => s.filter((x) => x !== p))}
              >
                {p}
              </Chip>
            ))}
          </View>
        </Pressable>
      )}
      {/* Below md, web renders the actions at the top of the body. */}
      <View style={styles.actionsRow}>
        <SelectMenu
          label={t.orderBy}
          value={orderBy}
          onChange={setOrderBy}
          options={[
            ['profit', t.orderProfit],
            ['revenue', t.orderSales],
            ['quantity', t.orderQuantity],
            ['cogs', t.orderCogs],
            ['margin', t.orderMargin],
          ]}
        />
        <SelectMenu
          label={t.orderDirection}
          value={direction}
          onChange={setDirection}
          options={[
            ['asc', t.ascending],
            ['desc', t.descending],
          ]}
        />
        <SelectMenu
          label={t.limit}
          width={90}
          value={limit}
          onChange={setLimit}
          options={[
            [5, '5'],
            [10, '10'],
            [20, '20'],
            [50, '50'],
            [100, '100'],
          ]}
        />
        {rows.length ? (
          <Menu
            visible={shareOpen}
            onDismiss={() => setShareOpen(false)}
            anchor={
              <IconButton
                icon="share-variant"
                accessibilityLabel={t.tooltips.share}
                onPress={() => setShareOpen(true)}
              />
            }
          >
            <Menu.Item
              leadingIcon="file-pdf-box"
              title={t.pdf}
              onPress={() => {
                setShareOpen(false);
                exportPdf();
              }}
            />
            <Menu.Item
              leadingIcon="file-excel-box"
              title={t.excel}
              onPress={() => {
                setShareOpen(false);
                exportExcel();
              }}
            />
          </Menu>
        ) : null}
      </View>

      {query.isLoading ? (
        <ActivityIndicator style={styles.gap} />
      ) : rows.length ? (
        <ScrollView horizontal>
          <View>
            <View style={[styles.tr, { backgroundColor: palette.background }]}>
              {[topLabel, t.quantity, t.revenueCol, t.cogsCol, t.profitAndMargin].map((h, i) => (
                <Text
                  key={h}
                  style={[
                    styles.th,
                    i === 0 ? styles.nameCol : styles.numCol,
                    { color: palette.textPrimary },
                  ]}
                >
                  {h}
                </Text>
              ))}
            </View>
            {rows.map((r, i) => (
              <View
                key={`${r.name}-${i}`}
                style={[styles.tr, i % 2 ? { backgroundColor: palette.background } : null]}
              >
                <Text
                  style={[styles.nameCol, { color: palette.textPrimary }]}
                  accessibilityLabel={t.tooltips.productName}
                >
                  {r.name}
                </Text>
                <Text
                  style={[styles.numCol, { color: palette.textPrimary }]}
                  accessibilityLabel={t.tooltips.quantitySold}
                >{`${r.unit_symbol ?? ''} ${r.quantity.toLocaleString()}`}</Text>
                <Text
                  style={[styles.numCol, { color: '#2196f3' }]}
                  accessibilityLabel={t.tooltips.sales}
                >
                  {twoDecimals(r.revenue)}
                </Text>
                <Text
                  style={[styles.numCol, { color: cogsColor }]}
                  accessibilityLabel={t.tooltips.cogs}
                >
                  {twoDecimals(r.cogs)}
                </Text>
                <Text
                  style={[styles.numCol, { color: palette.success }]}
                  accessibilityLabel={t.tooltips.profit}
                >
                  {`${twoDecimals(r.profit)}\n${marginOf(r)}%`}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <InfoAlert>{t.noProductData}</InfoAlert>
      )}

      <Portal>
        <Dialog visible={pickPeople} onDismiss={() => setPickPeople(false)}>
          <Dialog.Title>{t.salesPerson}</Dialog.Title>
          <Dialog.ScrollArea style={styles.peopleList}>
            <ScrollView>
              {(people.data ?? []).map((p) => (
                <Checkbox.Item
                  key={p}
                  label={p}
                  position="leading"
                  labelStyle={styles.left}
                  status={salesPersons.includes(p) ? 'checked' : 'unchecked'}
                  onPress={() =>
                    setSalesPersons((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]))
                  }
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Chip onPress={() => setPickPeople(false)}>OK</Chip>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={!!message} onDismiss={() => setMessage(null)}>
        {message}
      </Snackbar>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  top: { fontFamily: fonts.bold, fontSize: 18 },
  people: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8, gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gap: { marginVertical: 16 },
  tr: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4 },
  th: { fontFamily: fonts.semiBold },
  nameCol: { width: 150, paddingRight: 8 },
  numCol: { width: 110, textAlign: 'right', paddingRight: 8 },
  peopleList: { maxHeight: 360, paddingHorizontal: 0 },
  left: { textAlign: 'left' },
});
