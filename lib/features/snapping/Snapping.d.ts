export const SNAP_LINE_HIDE_DELAY: number;

/**
 * Generic snapping feature.
 *
 */
export default class Snapping {
  static $inject: string[];

  /**
   * @param canvas
   */
  constructor(canvas: Canvas);

  /**
   * Snap an event to given snap points.
   *
   * @param event
   * @param snapPoints
   */
  snap(event: Event, snapPoints: SnapPoints): void;

  showSnapLine(orientation: any, position: any): void;
  getSnapLine(orientation: any): any;
  hide(): void;
}

type Canvas = import('../../core/Canvas').default;
type Event = import('../../core/EventBus').Event;
type SnapPoints = import('./SnapContext').SnapPoints;
