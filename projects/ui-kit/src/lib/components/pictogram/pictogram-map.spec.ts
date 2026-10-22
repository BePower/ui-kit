import { pictogramMap } from './pictogram-map';

describe('pictogramMap', () => {
  it('contains callable loaders that resolve to encoded SVG assets with original colors', async () => {
    expect(Object.keys(pictogramMap)).toEqual(['placeholder']);

    for (const [name, load] of Object.entries(pictogramMap)) {
      expect(load, name).toBeTypeOf('function');
      const asset = await load();
      expect(asset, name).toMatch(/^data:image\/svg\+xml;base64,/);
      const svg = atob(asset.split(',')[1]);
      expect(svg).toContain('#1167D8');
      expect(svg).toContain('#FFC928');
      expect(svg).toContain('#52C98B');
    }
  });
});
