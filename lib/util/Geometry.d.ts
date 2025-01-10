/**
 * Computes the distance between two points.
 *
 * @param a
 * @param b
 *
 * @return The distance between the two points.
 */
export function pointDistance(a: Point, b: Point): number;

/**
 * Returns true if the point r is on the line between p and q.
 *
 * @param p
 * @param q
 * @param r
 * @param accuracy The accuracy with which to check (lower is better).
 *
 * @return
 */
export function pointsOnLine(p: Point, q: Point, r: Point, accuracy?: number): boolean;

/**
 * Check whether two points are horizontally or vertically aligned.
 *
 * @param a
 * @param b
 *
 * @return If and how the two points are aligned ('h', 'v' or `false`).
 */
export function pointsAligned(a: Point[] | Point, b?: Point): string | boolean;

/**
 * @param axis
 * @param points
 *
 * @return
 */
export function pointsAlignedOnAxis(axis: Axis, points: Point[]): boolean;

/**
 * Returns true if the point p is inside the rectangle rect
 *
 * @param p
 * @param rect
 * @param tolerance
 *
 * @return
 */
export function pointInRect(p: Point, rect: Rect, tolerance: number): boolean;

/**
 * Returns a point in the middle of points p and q
 *
 * @param p
 * @param q
 *
 * @return The mid point between the two points.
 */
export function getMidPoint(p: Point, q: Point): Point;

type Axis = import('../util/Types').Axis;
type Point = import('../util/Types').Point;
type Rect = import('../util/Types').Rect;
