/**
 * @param bounds
 *
 * @returns
 */
export function roundBounds(bounds: Rect): Rect;

/**
 * @param point
 *
 * @returns
 */
export function roundPoint(point: Point): Point;

/**
 * Convert the given bounds to a { top, left, bottom, right } descriptor.
 *
 * @param bounds
 *
 * @return
 */
export function asTRBL(bounds: Point | Rect): RectTRBL;

/**
 * Convert a { top, left, bottom, right } to an objects bounds.
 *
 * @param trbl
 *
 * @return
 */
export function asBounds(trbl: RectTRBL): Rect;

/**
 * Get the mid of the given bounds or point.
 *
 * @param bounds
 *
 * @return
 */
export function getBoundsMid(bounds: Point | Rect): Point;

/**
 * Get the mid of the given Connection.
 *
 * @param connection
 *
 * @return
 */
export function getConnectionMid(connection: Connection): Point;

/**
 * Get the mid of the given Element.
 *
 * @param element
 *
 * @return
 */
export function getMid(element: Element): Point;

/**
 * Get orientation of the given rectangle with respect to
 * the reference rectangle.
 *
 * A padding (positive or negative) may be passed to influence
 * horizontal / vertical orientation and intersection.
 *
 * @param rect
 * @param reference
 * @param padding
 *
 * @return the orientation; one of top, top-left, left, ..., bottom, right or intersect.
 */
export function getOrientation(rect: Rect, reference: Rect, padding: Point | number): DirectionTRBL | Intersection;

/**
 * Get intersection between an element and a line path.
 *
 * @param elementPath
 * @param linePath
 * @param cropStart Whether to crop start or end.
 *
 * @return
 */
export function getElementLineIntersection(elementPath: string, linePath: string, cropStart: boolean): Point;

export function getIntersections(a: any, b: any): any;
export function filterRedundantWaypoints(waypoints: any): any;
type Element = import('../core/Types').ElementLike;
type Connection = import('../core/Types').ConnectionLike;
type DirectionTRBL = import('../util/Types').DirectionTRBL;
type Intersection = import('../util/Types').Intersection;
type Point = import('../util/Types').Point;
type Rect = import('../util/Types').Rect;
type RectTRBL = import('../util/Types').RectTRBL;
