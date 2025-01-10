/**
 * A {@link ConnectionDocking} that crops connection waypoints based on
 * the path(s) of the connection source and target.
 *
 */
export default class CroppingConnectionDocking {
  static $inject: string[];

  /**
   * @param elementRegistry
   * @param graphicsFactory
   */
  constructor(elementRegistry: ElementRegistry, graphicsFactory: GraphicsFactory);

  /**
   * @inheritDoc ConnectionDocking#getCroppedWaypoints
   */
  getCroppedWaypoints(connection: any, source: any, target: any): any;

  /**
   * Return the connection docking point on the specified shape
   *
   * @inheritDoc ConnectionDocking#getDockingPoint
   */
  getDockingPoint(connection: any, shape: any, dockStart: any): {
      point: any;
      actual: any;
      idx: number;
  };
}

type ElementRegistry = import('../core/ElementRegistry').default;
type GraphicsFactory = import('../core/GraphicsFactory').default;
