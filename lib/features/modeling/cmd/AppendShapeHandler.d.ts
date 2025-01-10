/**
 * A handler that implements reversible appending of shapes
 * to a source shape.
 *
 */
export default class AppendShapeHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  /**
   * Creates a new shape.
   *
   * @param context
   */
  preExecute(context: {
      shape: Partial<Shape>;
      source: Element;
      parent: Parent;
      position: Point;
  }): void;

  postExecute(context: any): void;
}

type Element = import('../../../model/Types').Element;
type Parent = import('../../../model/Types').Parent;
type Shape = import('../../../model/Types').Shape;
type Point = import('../../../util/Types').Point;
type Modeling = import('../Modeling').default;
