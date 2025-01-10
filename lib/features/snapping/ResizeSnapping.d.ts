/**
 * Snap during resize.
 *
 */
export default class ResizeSnapping {
    static $inject: string[];
    /**
     * @param eventBus
     * @param snapping
     */
    constructor(eventBus: EventBus, snapping: Snapping);
    initSnap(event: any): any;
    addSnapTargetPoints(snapPoints: any, shape: any, target: any, direction: any): any;
    getSnapTargets(shape: any, target: any): (import("../../model/Types").ShapeLike | import("../../model/Types").ConnectionLike)[];
}

type EventBus = import('../../core/EventBus').default;
type Snapping = import('./Snapping').default;
