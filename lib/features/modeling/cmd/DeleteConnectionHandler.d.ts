/**
 * A handler that implements reversible deletion of Connections.
 */
export default class DeleteConnectionHandler {
  static $inject: string[];
  constructor(canvas: any, modeling: any);

  /**
   * - Remove connections
   */
  preExecute(context: any): void;

  execute(context: any): any;

  /**
   * Command revert implementation.
   */
  revert(context: any): any;
}

type Canvas = import('../../../core/Canvas').default;
type Modeling = import('../Modeling').default;
