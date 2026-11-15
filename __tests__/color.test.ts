import { alpha, darken, lighten } from '../src/theme/color';

describe('color helpers', () => {
  it('lightens and darkens six-digit hex colors', () => {
    expect(lighten('#000000', 0.5)).toBe('#808080');
    expect(darken('#ffffff', 0.5)).toBe('#808080');
  });

  it('supports three-digit hex colors and alpha values', () => {
    expect(lighten('#000', 1)).toBe('#ffffff');
    expect(alpha('#336699', 0.25)).toBe('rgba(51,102,153,0.25)');
  });
});
