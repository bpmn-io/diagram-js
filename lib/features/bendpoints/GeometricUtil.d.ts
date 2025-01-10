/**
 * Returns the length of a vector.
 *
 * @param vector
 *
 * @return
 */
export function vectorLength(vector: Vector): number;

/**
 * Calculates the angle between a line a the Y axis.
 *
 * @param line
 *
 * @return
 */
export function getAngle(line: Point[]): number;

/**
 * Rotates a vector by a given angle.
 *
 * @param vector
 * @param angle The angle in radians.
 *
 * @return
 */
export function rotateVector(vector: Vector, angle: number): Vector;

/**
 * Calculates the position of the perpendicular foot.
 *
 * @param point
 * @param line
 *
 * @return
 */
export function perpendicularFoot(point: Point, line: Point[]): Point;

/**
 * Calculates the distance between a point and a line.
 *
 * @param point
 * @param line
 *
 * @return
 */
export function getDistancePointLine(point: Point, line: Point[]): number;

/**
 * Calculates the distance between two points.
 *
 * @param point1
 * @param point2
 *
 * @return
 */
export function getDistancePointPoint(point1: Point, point2: Point): number;

type Point = import('../../util/Types').Point;
type Vector = import('../../util/Types').Vector;
