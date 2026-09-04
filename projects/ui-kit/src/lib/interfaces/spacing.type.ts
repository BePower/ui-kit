/**
 * Semantic spacing tokens available in the design system.
 */
export type UISpacing =
  | 'none'
  | 'xxxs'
  | 'xxs'
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | 'xxl'
  | 'xxxl';

/**
 * Spacing tokens approved for horizontal layout values.
 */
export type UIHorizontalSpacing = Exclude<UISpacing, 'l' | 'xl' | 'xxl' | 'xxxl'>;

/**
 * Spacing tokens approved for vertical layout values.
 */
export type UIVerticalSpacing = Exclude<UISpacing, 'xl' | 'xxl' | 'xxxl'>;
