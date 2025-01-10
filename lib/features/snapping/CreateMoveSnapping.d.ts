/**
 * Snap during create and move.
 *
 */
export default class CreateMoveSnapping {
  static $inject: string[];

  /**
   * @param elementRegistry
   * @param eventBus
   * @param snapping
   */
  constructor(elementRegistry: ElementRegistry, eventBus: EventBus, snapping: Snapping);

  initSnap(event: any): any;
  addSnapTargetPoints(snapPoints: any, shape: any, target: any): any;
  getSnapTargets(shape: any, target: any): (import("../../model/Types").ShapeLike | import("../../model/Types").ConnectionLike)[];
}

type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Snapping = import('./Snapping').default;
