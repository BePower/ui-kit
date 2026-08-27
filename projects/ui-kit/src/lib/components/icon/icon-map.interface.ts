import type { IconName, IconVariant } from '../../interfaces/icon.interface';

export type IconLoader = () => Promise<string>;

export type IconMap = {
  [key in IconName]: Partial<Record<IconVariant, IconLoader>>;
};
