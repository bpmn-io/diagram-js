/**
 * Provides previews for resizing shapes when resizing.
 *
 */
export default class ResizePreview {
    static $inject: string[];
    /**
     * @param eventBus
     * @param canvas
     * @param previewSupport
     */
    constructor(eventBus: EventBus, canvas: Canvas, previewSupport: PreviewSupport);
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type PreviewSupport = import('../preview-support/PreviewSupport').default;
