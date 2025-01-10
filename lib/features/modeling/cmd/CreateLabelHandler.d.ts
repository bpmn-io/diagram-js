/**
 * A handler that attaches a label to a given target shape.
 *
 */
export default class CreateLabelHandler extends CreateShapeHandler {
    /**
     * Append label to element.
     *
     * @param context
     */
    execute(context: {
        parent: Parent;
        position: Point;
        shape: Shape;
        target: Element;
    }): any;
}

type Canvas = import('../../../core/Canvas').default;
type Element = import('../../../model/Types').Element;
type Parent = import('../../../model/Types').Parent;
type Shape = import('../../../model/Types').Shape;
type Point = import('../../../util/Types').Point;
import CreateShapeHandler from './CreateShapeHandler';
