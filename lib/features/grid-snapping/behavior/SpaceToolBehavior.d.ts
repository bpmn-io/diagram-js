/**
 * Integrates space tool with grid snapping.
 *
 */
export default class SpaceToolBehavior {
    static $inject: string[];
    /**
     * @param eventBus
     * @param gridSnapping
     */
    constructor(eventBus: EventBus, gridSnapping: GridSnapping);
}

type EventBus = import('../../../core/EventBus').default;
type GridSnapping = import('../../grid-snapping/GridSnapping').default;
