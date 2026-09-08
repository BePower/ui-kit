import { iconMap } from './icon-map';

describe('iconMap', () => {
  it('contains only callable variants that resolve to encoded SVG assets', async () => {
    expect(Object.keys(iconMap).length).toBeGreaterThan(40);
    const variants = Object.entries(iconMap).flatMap(([name, icons]) =>
      Object.entries(icons).map(async ([variant, load]) => {
        expect(['fill', 'no-fill']).toContain(variant);
        expect(load, `${name}/${variant}`).toBeTypeOf('function');
        const asset = await load!();
        expect(asset, `${name}/${variant}`).toMatch(/^data:image\/svg\+xml/);
      }),
    );
    await Promise.all(variants);
  });
});
