/**
 * Adds the notion of attached elements to the modeler.
 *
 * Optionally depends on `diagram-js/lib/features/move` to render
 * the attached elements during move preview.
 *
 * Optionally depends on `diagram-js/lib/features/label-support`
 * to render attached labels during move preview.
 *
 */
export default class AttachSupport extends CommandInterceptor {
    /**
     * @param injector
     * @param eventBus
     * @param canvas
     * @param rules
     * @param modeling
     */
    constructor(injector: Injector, eventBus: EventBus, canvas: Canvas, rules: Rules, modeling: Modeling);
}

type Injector = import('didi').Injector;
type Element = import('../../model/Types').Element;
type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type Rules = import('../rules/Rules').default;
type Modeling = import('../modeling/Modeling').default;
import CommandInterceptor from '../../command/CommandInterceptor';
