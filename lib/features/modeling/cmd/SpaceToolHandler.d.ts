/**
 * Add or remove space by moving and resizing shapes and updating connection waypoints.
 *
 */
export default class SpaceToolHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  preExecute(context: any): void;
  execute(): void;
  revert(): void;
  moveShapes(shapes: any, delta: any): void;
  resizeShapes(shapes: any, delta: any, direction: any): void;

  /**
   * Update connections waypoints according to the rules:
   *   1. Both source and target are moved/resized => move waypoints by the delta
   *   2. Only one of source and target is moved/resized => re-layout connection with moved start/end
   */
  updateConnectionWaypoints(connections: any, delta: any, direction: any, start: any, movingShapes: any, resizingShapes: any, oldBounds: any): void;
}

type Modeling = import('../Modeling').default;
