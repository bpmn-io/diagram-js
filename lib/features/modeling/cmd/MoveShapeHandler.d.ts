/**
 * A handler that implements reversible moving of shapes.
 *
 */
export default class MoveShapeHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  execute(context: any): any;
  postExecute(context: any): void;
  revert(context: any): any;
  moveChildren(context: any): void;
  getNewParent(context: any): any;
}

type Modeling = import('../Modeling').default;
import MoveHelper from './helper/MoveHelper';
