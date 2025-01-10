/**
 * Provides previews for selecting/moving/resizing shapes when creating/removing space.
 *
 */
export default class SpaceToolPreview {
    static $inject: string[];
    /**
     * @param eventBus
     * @param elementRegistry
     * @param canvas
     * @param styles
     */
    constructor(
      eventBus: EventBus,
      elementRegistry: ElementRegistry,
      canvas: Canvas,
      styles: Styles
    );
}

type Canvas = import('../../core/Canvas').default;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Styles = import('../../draw/Styles').default;
