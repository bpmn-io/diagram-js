/**
 * A handler that implements reversible resizing of shapes.
 *
 */
export default class ResizeShapeHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  /**
   * {
   *   shape: {....}
   *   newBounds: {
   *     width:  20,
   *     height: 40,
   *     x:       5,
   *     y:      10
   *   }
   *
   * }
   */
  execute(context: any): any;

  postExecute(context: any): void;
  revert(context: any): any;
}

type Modeling = import('../Modeling').default;
