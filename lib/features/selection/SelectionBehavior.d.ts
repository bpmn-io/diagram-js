export default class SelectionBehavior {
    static $inject: string[];
    /**
     * @param eventBus
     * @param selection
     * @param canvas
     * @param elementRegistry
     */
    constructor(eventBus: EventBus, selection: Selection, canvas: Canvas, elementRegistry: ElementRegistry);
}

type Canvas = import('../../core/Canvas').default;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Selection = import('./Selection').default;
