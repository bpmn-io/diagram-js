/**
 * Create new elements through drag and drop.
 *
 */
export default class Create {
    static $inject: string[];
    /**
     * @param canvas
     * @param dragging
     * @param eventBus
     * @param modeling
     * @param rules
     */
    constructor(canvas: Canvas, dragging: Dragging, eventBus: EventBus, modeling: Modeling, rules: Rules);
    /**
     * @param event
     * @param elements
     * @param context
     */
    start: (event: any, elements: any, context?: any) => void;
}

type Element = import('../../core/Types').ElementLike;
type Shape = import('../../core/Types').ShapeLike;
type Point = import('../../util/Types').Point;
type Canvas = import('../../core/Canvas').default;
type Dragging = import('../dragging/Dragging').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
