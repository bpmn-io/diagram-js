/**
 * Create a connection between the two points according
 * to the manhattan layout (only horizontal and vertical) edges.
 *
 * @param a
 * @param b
 * @param directions Specifies manhattan directions for each
 * point as {direction}:{direction}. A direction for a point is either
 * `h` (horizontal) or `v` (vertical).
 *
 * @return
 */
export function connectPoints(a: Point, b: Point, directions?: string): Point[];

/**
 * Connect two rectangles using a manhattan layouted connection.
 *
 * @param source source rectangle
 * @param target target rectangle
 * @param start source docking
 * @param end target docking
 * @param hints
 *
 * @return connection points
 */
export function connectRectangles(source: Rect, target: Rect, start?: Point, end?: Point, hints?: {
    preserveDocking?: string;
    preferredLayouts?: string[];
    connectionStart?: Point | boolean;
    connectionEnd?: Point | boolean;
}): Point[];

/**
 * Repair the connection between two rectangles, of which one has been updated.
 *
 * @param source
 * @param target
 * @param start
 * @param end
 * @param waypoints
 * @param hints
 *
 * @return The waypoints of the repaired connection.
 */
export function repairConnection(source: Rect, target: Rect, start?: Point, end?: Point, waypoints?: Point[], hints?: {
    preferredLayouts?: string[];
    connectionStart?: boolean;
    connectionEnd?: boolean;
}): Point[];

/**
 * Lay out a straight connection.
 *
 * @param source
 * @param target
 * @param start
 * @param end
 * @param hints
 *
 * @return The waypoints or null if layout isn't possible.
 */
export function tryLayoutStraight(source: Rect, target: Rect, start: Point, end: Point, hints?: {
    preserveDocking?: string;
}): Point[] | null;

/**
 * Return list of waypoints with redundant ones filtered out.
 *
 * @example
 *
 * Original points:
 *
 *   [x] ----- [x] ------ [x]
 *                         |
 *                        [x] ----- [x] - [x]
 *
 * Filtered:
 *
 *   [x] ---------------- [x]
 *                         |
 *                        [x] ----------- [x]
 *
 * @param waypoints
 *
 * @return
 */
export function withoutRedundantPoints(waypoints: Point[]): Point[];

type Point = import('../util/Types').Point;
type Rect = import('../util/Types').Rect;
