/**
 * Select element after auto placement.
 *
 */
export default class AutoPlaceSelectionBehavior {
    static $inject: string[];
    /**
     * @param eventBus
     * @param selection
     */
    constructor(eventBus: EventBus, selection: Selection);
}

type EventBus = import('../../core/EventBus').default;
type Selection = import('../selection/Selection').default;
