import dayjs from 'dayjs';

// Exact ports of live-repo's formatting so numbers and dates read the same as on web.

// input-sanitization-helpers.js shortNumber(): Y-axis ticks. No rounding, on purpose.
export function shortNumber(value: number): string | number {
  let short: string | number = value;
  if (Math.abs(value) > 100000) short = `${value / 1000}K`;
  if (Math.abs(value) > 1000000) short = `${value / 1000000}M`;
  if (Math.abs(value) > 1000000000) short = `${value / 1000000000}B`;
  return short;
}

// input-sanitization-helpers.js readableDate(d, true): "DD MMM YYYY HH:mm"
export const readableDate = (value?: string | Date, withTime = true) =>
  dayjs(value).format(withTime ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY');

// FinancialSummaryStrip: Intl compact (en-US, max 2 decimals) e.g. "1.25M". Hand-written
// fallback because not every Hermes build implements notation: 'compact'.
export const compact = (value: number) => {
  try {
    const out = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    } as Intl.NumberFormatOptions).format(value);
    if (/[KMBT]$/.test(out) || Math.abs(value) < 1000) return out;
  } catch {}
  const abs = Math.abs(value);
  const [div, suffix] =
    abs >= 1e12
      ? [1e12, 'T']
      : abs >= 1e9
        ? [1e9, 'B']
        : abs >= 1e6
          ? [1e6, 'M']
          : abs >= 1e3
            ? [1e3, 'K']
            : [1, ''];
  return `${value < 0 ? '-' : ''}${parseFloat((abs / div).toFixed(2))}${suffix}`;
};

// FinancialSummaryStrip legendAmount(): full integer below 1e9, compact from there.
export const legendAmount = (value: number) =>
  Math.abs(value) >= 1e9
    ? compact(value)
    : value.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const twoDecimals = (value: number) =>
  Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// DueInvoices: amount.toLocaleString('en-US', { style: 'currency', currency })
export const currency = (value: number, code: string) => {
  try {
    return value.toLocaleString('en-US', { style: 'currency', currency: code });
  } catch {
    return `${code} ${twoDecimals(value)}`;
  }
};

// Trend cards: day periods are reformatted, week/month/year periods shown raw.
export const periodLabel = (period: string, interval: string, dayFormat = 'ddd, MMM D, YYYY') =>
  interval === 'day' ? dayjs(period).format(dayFormat) : period;

// Round chart axes: gifted-charts divides the raw max into sections ("9.40001M"); Recharts
// on web picks round ticks. Pick a round max (1, 1.5, 2, 2.5, 5, 7.5 × 10^n) and step.
const niceCeil = (value: number) => {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10].find((s) => s * pow >= value) ?? 10;
  return step * pow;
};
export const chartScale = (values: number[], sections = 4) => {
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const stepValue = niceCeil((max || Math.abs(min) || 1) / sections);
  const below = min < 0 ? Math.ceil(Math.abs(min) / stepValue) : 0;
  return {
    maxValue: stepValue * Math.max(1, Math.ceil(max / stepValue)),
    stepValue,
    noOfSections: Math.max(1, Math.ceil(max / stepValue)),
    ...(below ? { mostNegativeValue: -below * stepValue, noOfSectionsBelowXAxis: below } : {}),
  };
};

// Long day labels ("Mon, Nov 2, 2026") can't all fit on a phone axis: show every k-th one.
// The tooltip still shows each point's full label.
export const sparseLabels = (labels: string[], maxShown = 4) => {
  const k = Math.max(1, Math.ceil(labels.length / maxShown));
  return labels.map((l, i) => (i % k === 0 ? l : ''));
};
