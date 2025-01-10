/**
 * A service that places elements connected to existing ones
 * to an appropriate position in an _automated_ fashion.
 *
 */
export default class AutoPlace {
    static $inject: string[];
    /**
     * @param eventBus
     * @param modeling
     * @param canvas
     */
    constructor(eventBus: EventBus, modeling: Modeling, canvas: Canvas);
    /**
     * Append shape to source at appropriate position.
     *
     * @param source
     * @param shape
     * @param hints
     *
     * @return appended shape
     */
    append: (source: Shape, shape: Shape, hints?: any) => Shape;
}

type Shape = import('../../core/Types').ShapeLike;
type Point = import('../../util/Types').Point;
type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
