/**
 * Calculates the absolute point relative to the new element's position.
 *
 * @param point [absolute]
 * @param oldBounds
 * @param newBounds
 *
 * @return point [absolute]
 */
export function getNewAttachPoint(point: Point, oldBounds: Rect, newBounds: Rect): Point;

/**
 * Calculates the shape's delta relative to a new position
 * of a certain element's bounds.
 *
 * @param shape
 * @param oldBounds
 * @param newBounds
 *
 * @return delta
 */
export function getNewAttachShapeDelta(shape: Shape, oldBounds: Rect, newBounds: Rect): Point;

type Shape = import('../model/Types').Shape;
type Point = import('../util/Types').Point;
type Rect = import('../util/Types').Rect;
