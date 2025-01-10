/**
 * A snap context, containing the (possibly incomplete)
 * mappings of drop targets (to identify the snapping)
 * to computed snap points.
 */
export default class SnapContext {
  /**
   * Get the snap origin for a given location.
   *
   * @param snapLocation
   *
   * @return
   */
  getSnapOrigin(snapLocation: SnapLocation): Point;

  /**
   * Set the snap origin for a given location.
   *
   * @param snapLocation
   * @param snapOrigin
   */
  setSnapOrigin(snapLocation: SnapLocation, snapOrigin: Point): void;

  /**
   * Add a default snap point.
   *
   * @param snapLocation
   * @param point
   */
  addDefaultSnap(snapLocation: SnapLocation, point: Point): void;

  /**
   * Get the snap locations for this context.
   *
   * @return
   */
  getSnapLocations(): SnapLocation[];

  /**
   * Set the snap locations for this context.
   *
   * The order of locations determines precedence.
   *
   * @param snapLocations
   */
  setSnapLocations(snapLocations: SnapLocation[]): void;

  /**
   * Get snap points for the given target.
   *
   * @param target
   *
   * @return
   */
  pointsForTarget(target: Element | string): SnapPoints;
}

/**
 * Add points to snap to.
 */
export class SnapPoints {
  /**
   * Add a snap point.
   *
   * @param snapLocation
   * @param point
   */
  add(snapLocation: SnapLocation, point: Point): void;

  /**
   * Snap a point's x or y value.
   *
   * @param point
   * @param snapLocation
   * @param axis
   * @param tolerance
   *
   * @return
   */
  snap(point: Point, snapLocation: SnapLocation, axis: Axis, tolerance: number): number;

  /**
   * Initialize default snap points.
   *
   * @param defaultSnaps
   */
  initDefaults(defaultSnaps: Record<SnapLocation, Point[]>): void;
}

type Element = import('../../model/Types').Element;
type Axis = import('../../util/Types').Axis;
type DirectionTRBL = import('../../util/Types').DirectionTRBL;
type Point = import('../../util/Types').Point;
export type SnapLocation = DirectionTRBL & 'mid';
