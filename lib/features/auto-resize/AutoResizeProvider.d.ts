/**
 * This is a base rule provider for the element.autoResize rule.
 *
 */
export default class AutoResizeProvider extends RuleProvider {
    /**
     * Needs to be implemented by sub classes to allow actual auto resize
     *
     * @param elements
     * @param target
     *
     * @return
     */
    canResize(elements: Shape[], target: Shape): boolean;
}

type Shape = import('../../model/Types').Shape;
type EventBus = import('../../core/EventBus').default;
import RuleProvider from '../rules/RuleProvider';
