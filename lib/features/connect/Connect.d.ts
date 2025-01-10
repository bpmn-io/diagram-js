export function isReverse(context: any): boolean;

export default class Connect {
    static $inject: string[];
    /**
     * @param eventBus
     * @param dragging
     * @param modeling
     * @param rules
     */
    constructor(eventBus: EventBus, dragging: Dragging, modeling: Modeling, rules: Rules);
    /**
     * Start connect operation.
     *
     * @param event
     * @param start
     * @param connectionStart
     * @param autoActivate
     */
    start: (event: MouseEvent | TouchEvent, start: Element, connectionStart?: Point, autoActivate?: boolean) => void;
}

type Element = import('../../model/Types').Element;
type Point = import('../../util/Types').Point;
type Dragging = import('../dragging/Dragging').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
