/**
 * A handler that makes sure labels are properly moved with
 * their label targets.
 *
 */
export default class LabelSupport extends CommandInterceptor {
    /**
     * @param injector
     * @param eventBus
     * @param modeling
     */
    constructor(injector: Injector, eventBus: EventBus, modeling: Modeling);
}

type Element = import('../../model/Types').Element;
type Injector = import('didi').Injector;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
import CommandInterceptor from '../../command/CommandInterceptor';
