/**
 * The default renderer used for shapes and connections.
 *
 */
export default class DefaultRenderer extends BaseRenderer {
  static $inject: string[];

  /**
   * @param eventBus
   * @param styles
   */
  constructor(eventBus: EventBus, styles: Styles);

  CONNECTION_STYLE: any;
  SHAPE_STYLE: any;
  FRAME_STYLE: any;
}

type EventBus = import('../core/EventBus').default;
type Styles = import('./Styles').default;
import BaseRenderer from './BaseRenderer';
