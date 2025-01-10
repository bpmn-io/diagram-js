/**
 * Returns the closest point on the connection towards a given reference point.
 *
 * @param waypoints
 * @param reference
 *
 * @return
 */
export function getApproxIntersection(waypoints: Point[], reference: Point): Intersection | null;

type Point = import('../util/Types').Point;

export type Intersection = {
    bendpoint?: boolean;
    index: number;
    point: Point;
};
