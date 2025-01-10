/**
 * A handler that implements reversible addition of shapes.
 *
 */
export default class CreateShapeHandler {
  static $inject: string[];

  /**
   * @param canvas
   */
  constructor(canvas: Canvas);

  /**
   * Appends a shape to a target shape
   *
   * @param context
   * shape to the parent's children.
   */
  execute(context: {
      parent: Element;
      position: Point;
      parentIndex?: number;
  }): any;

  /**
   * Undo append by removing the shape
   */
  revert(context: any): any;
}

type Element = import('../../../model/Types').Element;
type Point = import('../../../util/Types').Point;
type Canvas = import('../../../core/Canvas').default;
