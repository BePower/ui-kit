import { Capacitor } from '@capacitor/core';
import { Style } from '@capacitor/status-bar';
import { StatusBarService } from './status-bar.service';

const statusBarMocks = vi.hoisted(() => ({
  setStyle: vi.fn(),
  getInfo: vi.fn(),
  hide: vi.fn(),
  show: vi.fn(),
}));

vi.mock('@capacitor/status-bar', () => ({
  Style: { Dark: 'DARK', Light: 'LIGHT' },
  StatusBar: statusBarMocks,
}));

describe('StatusBarService', () => {
  beforeEach(() => {
    Object.values(statusBarMocks).forEach((mock) => mock.mockReset());
  });
  it('does not call native APIs on the web', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
    statusBarMocks.setStyle.mockResolvedValue(undefined);
    const service = new StatusBarService();

    await service.setStatusBarStyleDark();
    await service.setStatusBarStyleLight();
    await service.hideStatusBar();
    await service.showStatusBar();
    expect(await service.getInfo()).toEqual({});
    expect(statusBarMocks.setStyle).not.toHaveBeenCalled();
    expect(statusBarMocks.getInfo).not.toHaveBeenCalled();
    expect(statusBarMocks.hide).not.toHaveBeenCalled();
    expect(statusBarMocks.show).not.toHaveBeenCalled();
  });

  it('delegates every operation to the Capacitor plugin on native platforms', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    statusBarMocks.setStyle.mockResolvedValue(undefined);
    const info = { visible: true, style: Style.Dark, color: '#000000', overlays: false };
    statusBarMocks.getInfo.mockResolvedValue(info);
    statusBarMocks.hide.mockResolvedValue(undefined);
    statusBarMocks.show.mockResolvedValue(undefined);
    const service = new StatusBarService();

    await service.setStatusBarStyleDark();
    await service.setStatusBarStyleLight();
    await service.hideStatusBar();
    await service.showStatusBar();
    expect(await service.getInfo()).toBe(info);
    expect(statusBarMocks.setStyle).toHaveBeenNthCalledWith(1, { style: Style.Dark });
    expect(statusBarMocks.setStyle).toHaveBeenNthCalledWith(2, { style: Style.Light });
    expect(statusBarMocks.hide).toHaveBeenCalledOnce();
    expect(statusBarMocks.show).toHaveBeenCalledOnce();
    expect(statusBarMocks.getInfo).toHaveBeenCalledOnce();
  });

  it('propagates native failures to the caller', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');
    statusBarMocks.setStyle.mockRejectedValue(new Error('unavailable'));
    await expect(new StatusBarService().setStatusBarStyleDark()).rejects.toThrow('unavailable');
  });
});
