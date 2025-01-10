/**
 * A component that implements moving of bendpoints.
 *
 */
export default class ConnectionSegmentMove {
    static $inject: string[];
    /**
     * @param injector
     * @param eventBus
     * @param canvas
     * @param dragging
     * @param graphicsFactory
     * @param modeling
     */
    constructor(injector: Injector, eventBus: EventBus, canvas: Canvas, dragging: Canvas, graphicsFactory: GraphicsFactory, modeling: Modeling);
    start: (event: any, connection: any, idx: any) => void;
}

type Shape = import('../../model/Types').Shape;
type Axis = import('../../util/Types').Axis;
type Point = import('../../util/Types').Point;
type Injector = import('didi').Injector;
type Canvas = import('../../core/Canvas').default;
type Dragging = import('../dragging/Dragging').default;
type EventBus = import('../../core/EventBus').default;
type GraphicsFactory = import('../../core/GraphicsFactory').default;
type Modeling = import('../modeling/Modeling').default;
