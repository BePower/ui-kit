import type { PictogramName } from '../../interfaces/pictogram.interface';

export type PictogramLoader = () => Promise<string>;

export type PictogramMap = Record<PictogramName, PictogramLoader>;
