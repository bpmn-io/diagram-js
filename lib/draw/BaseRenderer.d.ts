import EventBus from '../core/EventBus';

import {
  Base,
  Connection,
  Shape
} from '../model';

export default class BaseRenderer {
  constructor(eventBus: EventBus, renderPriority?: number);
  canRender(element: Base): boolean;
  drawShape(visuals: SVGElement, shape: Shape): SVGElement;
  drawConnection(visuals: SVGElement, connection: Connection): SVGElement;
  getShapePath(shape: Shape): string;
  getConnectionPath(connection: Connection): string;
}