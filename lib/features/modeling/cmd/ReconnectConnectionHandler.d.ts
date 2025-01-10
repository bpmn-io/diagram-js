/**
 * Reconnect connection handler.
 *
 */
export default class ReconnectConnectionHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  execute(context: any): any;
  postExecute(context: any): void;
  revert(context: any): any;
}

type Modeling = import('../Modeling').default;
