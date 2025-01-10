/**
 * Shows connection preview during connect.
 *
 */
export default class ConnectPreview {
    static $inject: string[];
    /**
     * @param injector
     * @param eventBus
     * @param canvas
     */
    constructor(injector: Injector, eventBus: EventBus, canvas: Canvas);
}

type Injector = import('didi').Injector;
type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
