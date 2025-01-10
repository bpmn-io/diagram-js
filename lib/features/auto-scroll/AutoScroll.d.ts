/**
 * Initiates canvas scrolling if current cursor point is close to a border.
 * Cancelled when current point moves back inside the scrolling borders
 * or cancelled manually.
 *
 * Default options :
 *   scrollThresholdIn: [ 20, 20, 20, 20 ],
 *   scrollThresholdOut: [ 0, 0, 0, 0 ],
 *   scrollRepeatTimeout: 15,
 *   scrollStep: 10
 *
 * Threshold order:
 *   [ left, top, right, bottom ]
 *
 */
export default class AutoScroll {
  static $inject: string[];

  /**
   * @param config
   * @param eventBus
   * @param canvas
   */
  constructor(config: any, eventBus: EventBus, canvas: Canvas);

  /**
   * Starts scrolling loop.
   * Point is given in global scale in canvas container box plane.
   *
   * @param point
   */
  startScroll(point: Point): void;

  /**
   * Stops scrolling loop.
   */
  stopScroll(): void;

  /**
   * Overrides defaults options.
   *
   * @param options
   */
  setOptions(options: any): void;
}

type Point = import('../../util/Types').Point;
type EventBus = import('../../core/EventBus').default;
type Canvas = import('../../core/Canvas').default;
