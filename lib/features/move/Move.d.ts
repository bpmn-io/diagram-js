/**
 * A plugin that makes shapes draggable / droppable.
 *
 */
export default class MoveEvents {
    static $inject: string[];
    /**
     * @param eventBus
     * @param dragging
     * @param modeling
     * @param selection
     * @param rules
     */
    constructor(eventBus: EventBus, dragging: Dragging, modeling: Modeling, selection: Selection, rules: Rules);
    start: (event: MouseEvent | TouchEvent, element: Shape, activate?: boolean, context?: any) => boolean;
}

type Element = import('../../core/Types').ElementLike;
type Shape = import('../../core/Types').ShapeLike;
type Dragging = import('../dragging/Dragging').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
type Selection = import('../selection/Selection').default;
