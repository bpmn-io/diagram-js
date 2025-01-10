export default class MoveClosure {
    /**
     * @type {Record<string, Shape>}
     */
    allShapes: Record<string, Shape>;
    /**
     * @type {Record<string, Connection>}
     */
    allConnections: Record<string, Connection>;
    /**
     * @type {Record<string, Element>}
     */
    enclosedElements: Record<string, Element>;
    /**
     * @type {Record<string, Connection>}
     */
    enclosedConnections: Record<string, Connection>;
    /**
     * @type {Record<string, Element>}
     */
    topLevel: Record<string, Element>;
    /**
     * @param element
     * @param isTopLevel
     *
     * @return
     */
    add(element: Element, isTopLevel?: boolean): MoveClosure;
    /**
     * @param elements
     * @param isTopLevel
     *
     * @return
     */
    addAll(elements: Element[], isTopLevel?: boolean): MoveClosure;
}

type Connection = import('../../../../model/Types').Connection;
type Element = import('../../../../model/Types').Element;
type Shape = import('../../../../model/Types').Shape;
