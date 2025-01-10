/**
 * Move the canvas via mouse.
 *
 */
export default class MoveCanvas {
    static $inject: string[];
    /**
     * @param eventBus
     * @param canvas
     */
    constructor(eventBus: EventBus, canvas: Canvas);
    isActive: () => boolean;
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
