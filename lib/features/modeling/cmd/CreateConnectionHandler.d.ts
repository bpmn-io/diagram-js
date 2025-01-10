export default class CreateConnectionHandler {
  static $inject: string[];

  /**
   * @param canvas
   * @param layouter
   */
  constructor(canvas: Canvas, layouter: Layouter);

  /**
   * Creates a new connection between two elements.
   *
   * @param context
   * connection to the parent's children.
   */
  execute(context: {
      source: Element;
      target: Element;
      parent: Shape;
      parentIndex?: number;
      hints?: ModelingHints;
  }): any;

  revert(context: any): any;
}

type Element = import('../../../model/Types').Element;
type Shape = import('../../../model/Types').Shape;
type Point = import('../../../util/Types').Point;
type ModelingHints = import('../Modeling').ModelingHints;
type Canvas = import('../../../core/Canvas').default;
type Layouter = import('../../../layout/BaseLayouter').default;
