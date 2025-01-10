/**
 * A handler that implements reversible moving of shapes.
 *
 */
export default class MoveElementsHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  preExecute(context: any): void;
  postExecute(context: any): void;
}

type Modeling = import('../Modeling').default;
import MoveHelper from './helper/MoveHelper';
