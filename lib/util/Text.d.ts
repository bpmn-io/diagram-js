export type Dimensions = import('../util/Types').Dimensions;

export type Padding = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export type PaddingConfig = number | Partial<Padding>;

export type Alignment = {
    horizontal: 'center' | 'left';
    vertical: 'top' | 'center';
};

export type AlignmentConfig = 'center-middle' | 'center-top';

export type BaseTextConfig = Partial<{
    align: AlignmentConfig;
    style: Record<string, any>;
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

/**
 * A utility to render text
 */
export default class Text {

    /**
     * Creates a new label utility
     *
     * @param {TextConfig} config
     */
    constructor(config: TextConfig);

    /**
     * Returns the layouted text as an SVG element.
     */
    createText(text: string, options: TextLayoutConfig): SVGElement;

    /**
     * Returns a labels layouted dimensions.
     */
    getDimensions(text: string, options: TextLayoutConfig): Dimensions;

    /**
     * Creates and returns a label and its bounding box.
     */
    layoutText(text: string, options: TextLayoutConfig): {
        element: SVGElement;
        dimensions: Dimensions;
    };
}
