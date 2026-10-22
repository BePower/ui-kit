import type { PictogramMap } from './pictogram-map.interface';

export const pictogramMap: PictogramMap = {
  placeholder: () =>
    import('./pictograms/placeholder').then(({ placeholderPictogram }) => placeholderPictogram),
};
