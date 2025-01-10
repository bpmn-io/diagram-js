export function toCanvasCoordinates(canvas: any, event: any): {
    x: any;
    y: any;
};

export function getConnectionIntersection(canvas: any, waypoints: any, event: any): import("../../util/LineIntersection").Intersection;
export function addBendpoint(parentGfx: any, cls: any): SVGGElement;
export function addSegmentDragger(parentGfx: any, segmentStart: any, segmentEnd: any): SVGGElement;

/**
 * Calculates region for segment move which is 2/3 of the full segment length
 * @param segmentLength
 *
 * @return
 */
export function calculateSegmentMoveRegion(segmentLength: number): number;

/**
 * Returns the point with the closest distance that is on the connection path.
 *
 * @param position
 * @param connection
 * @return
 */
export function getClosestPointOnConnection(position: Point, connection: Connection): Point;

export const BENDPOINT_CLS: string;
export const SEGMENT_DRAGGER_CLS: string;
type Connection = import('../../core/Types').ConnectionLike;
type Point = import('../../util/Types').Point;
