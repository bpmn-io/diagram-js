/**
 * An abstract provider that allows modelers to implement a custom
 * ordering of diagram elements on the canvas.
 *
 * It makes sure that the order is always preserved during element
 * creation and move operations.
 *
 * In order to use this behavior, inherit from it and override
 * the method {@link OrderingProvider#getOrdering}.
 *
 * @example
 *
 * ```javascript
 * function CustomOrderingProvider(eventBus) {
 *   OrderingProvider.call(this, eventBus);
 *
 *   this.getOrdering = function(element, newParent) {
 *     // always insert elements at the front
 *     // when moving
 *     return {
 *       index: 0,
 *       parent: newParent
 *     };
 *   };
 * }
 * ```
 *
 */
export default class OrderingProvider extends CommandInterceptor {
    /**
     * Return a custom ordering of the element, both in terms
     * of parent element and index in the new parent.
     *
     * Implementors of this method must return an object with
     * `parent` _and_ `index` in it.
     *
     * @param element
     * @param newParent
     *
     * @return ordering descriptor
     */
    getOrdering(element: Element, newParent: Shape): any;
}

type Element = import('../../core/Types').ElementLike;
type Shape = import('../../core/Types').ShapeLike;
type EventBus = import('../../core/EventBus').default;
import CommandInterceptor from '../../command/CommandInterceptor';
