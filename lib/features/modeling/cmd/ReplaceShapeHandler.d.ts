/**
 * Replace shape by adding new shape and removing old shape. Incoming and outgoing connections will
 * be kept if possible.
 *
 *
 */
export default class ReplaceShapeHandler {
  static $inject: string[];

  /**
   * @param modeling
   * @param rules
   */
  constructor(modeling: Modeling, rules: Rules);

  /**
   * Add new shape.
   *
   * @param context
   */
  preExecute(context: {
      oldShape: Shape;
      newData: {
          type: string;
          x: number;
          y: number;
      };
      hints?: any;
  }): void;

  /**
   * Remove old shape.
   */
  postExecute(context: any): void;

  execute(context: any): void;
  revert(context: any): void;
  createShape(shape: any, position: any, target: any, hints: any): import("../../../model/Types").Shape;
  reconnectStart(connection: any, newSource: any, dockingPoint: any, hints: any): void;
  reconnectEnd(connection: any, newTarget: any, dockingPoint: any, hints: any): void;
}

export type Shape = any;
type Modeling = import('../Modeling').default;
type Rules = import('../../rules/Rules').default;
