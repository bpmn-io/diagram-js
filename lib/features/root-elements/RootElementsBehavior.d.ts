/**
 * A modeling behavior that ensures we set the correct root element
 * as we undo and redo commands.
 *
 */
export default class RootElementsBehavior extends CommandInterceptor {
    /**
     * @param canvas
     * @param injector
     */
    constructor(canvas: Canvas, injector: Injector);
}

type Injector = import('didi').Injector;
type Canvas = import('../../core/Canvas').default;
import CommandInterceptor from '../../command/CommandInterceptor';
