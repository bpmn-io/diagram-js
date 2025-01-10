/**
 * An implementation of zooming and scrolling within the
 * {@link Canvas} via the mouse wheel.
 *
 * Mouse wheel zooming / scrolling may be disabled using
 * the {@link toggle(enabled)} method.
 *
 */
export default class ZoomScroll {
  static $inject: string[];

  /**
   * @param eventBus
   * @param canvas
   */
  constructor(eventBus: EventBus, canvas: Canvas);

  /**
   * @param config
   * @param eventBus
   * @param canvas
   */
  constructor(
    config: {
        enabled?: boolean;
        scale?: number;
    },
    eventBus: EventBus,
    canvas: Canvas
  );

  /**
   * @param delta
   */
  scroll(delta: ScrollDelta): void;

  reset(): void;

  /**
   * Zoom depending on delta.
   *
   * @param delta
   * @param position
   */
  zoom(delta: number, position: Point): void;

  /**
   * Zoom with fixed step size.
   *
   * @param delta Zoom delta (1 for zooming in, -1 for zooming out).
   * @param position
   */
  stepZoom(delta: number, position?: Point): void;

  /**
   * Toggle the zoom scroll ability via mouse wheel.
   *
   * @param newEnabled new enabled state
   */
  toggle(newEnabled?: boolean): boolean;
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type Point = import('../../util/Types').Point;
type ScrollDelta = import('../../util/Types').ScrollDelta;
