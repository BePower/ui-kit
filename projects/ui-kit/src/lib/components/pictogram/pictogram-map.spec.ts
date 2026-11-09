import { pictogramMap } from './pictogram-map';

const expectedPictograms = [
  'accesso-biometrico',
  'activity',
  'avvio-ricarica',
  'battery-25',
  'battery-50',
  'battery-75',
  'battery-over-75',
  'e-truck',
  'email-verificata',
  'favoriti',
  'gps',
  'info',
  'invita-amico',
  'loyalty',
  'metodo-pagamento',
  'negative',
  'nessuna-ricarica',
  'notifica',
  'positive',
  'profilo-aggiornato',
  'riprendi-registrazione',
  'wallet',
];

describe('pictogramMap', () => {
  it('contains every supported pictogram in deterministic order', () => {
    expect(Object.keys(pictogramMap)).toEqual(expectedPictograms);
  });

  it('loads encoded SVG assets locally while preserving authored colors', async () => {
    for (const [name, load] of Object.entries(pictogramMap)) {
      expect(load, name).toBeTypeOf('function');
      const asset = await load();
      expect(asset, name).toMatch(/^data:image\/svg\+xml;base64,/);
      const svg = atob(asset.split(',')[1]);
      expect(svg, name).toContain('<svg');
      expect(svg, name).toMatch(/(?:fill|stroke)="#[0-9A-Fa-f]{6}"/);
      expect(svg, name).not.toContain('figma.com/api/mcp/asset');
    }
  });
});
