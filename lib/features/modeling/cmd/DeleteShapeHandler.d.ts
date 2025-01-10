/**
 * A handler that implements reversible deletion of shapes.
 *
 */
export default class DeleteShapeHandler {
  static $inject: string[];

  /**
   * @param canvas
   * @param modeling
   */
  constructor(canvas: Canvas, modeling: Modeling);

  /**
   * - Remove connections
   * - Remove all direct children
   */
  preExecute(context: any): void;

  /**
   * Remove shape and remember the parent
   */
  execute(context: any): any;

  /**
   * Command revert implementation
   */
  revert(context: any): any;
}

type Canvas = import('../../../core/Canvas').default;
type Modeling = import('../Modeling').default;
