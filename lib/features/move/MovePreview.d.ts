/**
 * Provides previews for moving shapes when moving.
 *
 */
export default class MovePreview {
    static $inject: string[];
    /**
     * @param eventBus
     * @param canvas
     * @param styles
     * @param previewSupport
     */
    constructor(eventBus: EventBus, canvas: Canvas, styles: Styles, previewSupport: PreviewSupport);
    /**
     * Make an element draggable.
     *
     * @param context
     * @param element
     * @param addMarker
     */
    makeDraggable: (context: any, element: Element, addMarker: boolean) => void;
}

type Element = import('../../model/Types').Element;
type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type PreviewSupport = import('../preview-support/PreviewSupport').default;
type Styles = import('../../draw/Styles').default;
