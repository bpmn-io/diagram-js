export default class CreatePreview {
    static $inject: string[];
    /**
     * @param canvas
     * @param eventBus
     * @param graphicsFactory
     * @param previewSupport
     * @param styles
     */
    constructor(canvas: Canvas, eventBus: EventBus, graphicsFactory: GraphicsFactory, previewSupport: PreviewSupport, styles: Styles);
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type GraphicsFactory = import('../../core/GraphicsFactory').default;
type PreviewSupport = import('../preview-support/PreviewSupport').default;
type Styles = import('../../draw/Styles').default;
