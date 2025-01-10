/**
 * Complex preview for shapes and connections.
 */
declare class ComplexPreview {
  constructor(canvas: any, graphicsFactory: any, previewSupport: any);

  /**
   * Create complex preview.
   *
   * @param options
   */
  create(options: CreateOptions): void;

  cleanUp(): void;
  show(): void;
  hide(): void;
}

declare namespace ComplexPreview {
    let $inject: string[];
}

export default ComplexPreview;
type Element = import('../../model/Types').Element;
type Shape = import('../../model/Types').Shape;
type Point = import('../../util/Types').Point;
type Rect = import('../../util/Types').Rect;

export type MovedOption = {
    element: Element;
    delta: Point;
};

export type ResizedOption = {
    shape: Shape;
    bounds: Rect;
};

export type CreateOptions = {
    created?: Element[];
    removed?: Element[];
    moved?: MovedOption[];
    resized?: ResizedOption[];
};
