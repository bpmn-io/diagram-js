export default class BendpointSnapping {
    static $inject: string[];
    /**
     * @param eventBus
     */
    constructor(eventBus: EventBus);
}

type EventBus = import('../../core/EventBus').default;
