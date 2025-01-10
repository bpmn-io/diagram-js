/**
 * Shows connection preview during create.
 *
 */
export default class CreateConnectPreview {
    static $inject: string[];
    /**
     * @param injector
     * @param eventBus
     */
    constructor(injector: Injector, eventBus: EventBus);
}

type Injector = import('didi').Injector;
type EventBus = import('../../core/EventBus').default;
