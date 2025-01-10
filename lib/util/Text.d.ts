/**
 * Creates a new label utility
 *
 */
export default class Text {
  /**
   * @param config
   */
  constructor(config?: TextConfig);

  /**
   * Returns the layouted text as an SVG element.
   *
   * @param text
   * @param options
   *
   * @return
   */
  createText(text: string, options: TextLayoutConfig): SVGElement;

  /**
   * Returns a labels layouted dimensions.
   *
   * @param text to layout
   * @param options
   *
   * @return
   */
  getDimensions(text: string, options: TextLayoutConfig): Dimensions;

  /**
   * Creates and returns a label and its bounding box.
   *
   * @param text the text to render on the label
   * @param options
   *
   * @return
   */
  layoutText(text: string, options: TextLayoutConfig): {
      element: SVGElement;
      dimensions: Dimensions;
  };
}

type Dimensions = import('../util/Types').Dimensions;

export type Padding = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export type PaddingConfig = number | Partial<Padding>;

export type Alignment = {
    horizontal: 'center' | 'left' | 'right';
    vertical: 'top' | 'middle';
};

export type AlignmentConfig = 'center-middle' | 'center-top';

export type BaseTextConfig = Partial<{
    align: AlignmentConfig;
    style: Record<string, number | string>;
    padding: PaddingConfig;
}>;

export type TextConfig = BaseTextConfig & Partial<{
    size: Dimensions;
}>;

export type TextLayoutConfig = BaseTextConfig & Partial<{
    box: Dimensions;
    fitBox: boolean;
}>;

export type LineDescriptor = Dimensions & {
    text: string;
};
