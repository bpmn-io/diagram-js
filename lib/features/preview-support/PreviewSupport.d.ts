/**
 * Adds support for previews of moving/resizing elements.
 *
 */
export default class PreviewSupport {
  static $inject: string[];

  /**
   * @param elementRegistry
   * @param eventBus
   * @param canvas
   * @param styles
   */
  constructor(elementRegistry: ElementRegistry, eventBus: EventBus, canvas: Canvas, styles: Styles);

  cleanUp(): void;

  /**
   * Returns graphics of an element.
   *
   * @param element
   *
   * @return
   */
  getGfx(element: Element): SVGElement;

  /**
   * Adds a move preview of a given shape to a given SVG group.
   *
   * @param element The element to be moved.
   * @param group The SVG group to add the preview to.
   * @param gfx The optional graphical element of the element.
   * @param className The optional class name to add to the preview.
   *
   * @return The preview.
   */
  addDragger(element: Element, group: SVGElement, gfx?: SVGElement, className?: string): SVGElement;

  /**
   * Adds a resize preview of a given shape to a given SVG group.
   *
   * @param shape The element to be resized.
   * @param group The SVG group to add the preview to.
   *
   * @return The preview.
   */
  addFrame(shape: Shape, group: SVGElement): SVGElement;
}

type Element = import('../../core/Types').ElementLike;
type Shape = import('../../core/Types').ShapeLike;
type Canvas = import('../../core/Canvas').default;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Styles = import('../../draw/Styles').default;
