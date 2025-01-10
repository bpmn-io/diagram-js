/**
 * Return direction given axis and delta.
 *
 * @param axis
 * @param delta
 *
 * @return
 */
export function getDirection(axis: Axis, delta: number): Direction;

/**
 * Returns connections whose waypoints are to be updated. Waypoints are to be updated if start
 * or end is to be moved or resized.
 *
 * @param movingShapes
 * @param resizingShapes
 *
 * @return
 */
export function getWaypointsUpdatingConnections(movingShapes: Array<Shape>, resizingShapes: Array<Shape>): Array<Connection>;

/**
 * Resize bounds.
 *
 * @param bounds
 * @param direction
 * @param delta
 *
 * @return
 */
export function resizeBounds(bounds: Rect, direction: Direction, delta: Point): Rect;

type Connection = import('../../core/Types').ConnectionLike;
type Shape = import('../../core/Types').ShapeLike;
type Axis = import('../../util/Types').Axis;
type Direction = import('../../util/Types').Direction;
type Point = import('../../util/Types').Point;
type Rect = import('../../util/Types').Rect;
