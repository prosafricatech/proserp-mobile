// Same math as MUI's lighten()/darken() so brand gradients match the web exactly.
const toRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb: number[]) =>
  '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

export const lighten = (hex: string, coefficient: number) =>
  toHex(toRgb(hex).map((c) => c + (255 - c) * coefficient));

export const darken = (hex: string, coefficient: number) =>
  toHex(toRgb(hex).map((c) => c * (1 - coefficient)));

export const alpha = (hex: string, opacity: number) => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
};
