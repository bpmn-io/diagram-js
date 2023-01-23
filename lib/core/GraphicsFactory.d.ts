import ElementRegistry from './ElementRegistry';
import EventBus from './EventBus';

import {
  Base,
  Connection,
  ModelType,
  Shape
} from '../model';

export default class GraphicsFactory {
  constructor(eventBus: EventBus, elementRegistry: ElementRegistry);
  private _getChildrenContainer(element: Base | string): SVGElement;
  private _clear(gfx: SVGElement): SVGElement;
  private _createContainer(type: ModelType, childrenGfx?: SVGElement, parentIndex?: number, isFrame?: boolean): SVGElement;
  create(type: ModelType, element: Base, parentIndex?: number): SVGElement;
  updateContainments(elements: Base[]): void;
  drawShape(visual: SVGElement, element: Shape): SVGElement;
  getShapePath(element: Base): string;
  drawConnection(visual: SVGElement, element: Connection): SVGElement;
  getConnectionPath(connection: Connection): string;
  update(type: ModelType, element: Base, gfx: SVGElement): void;
  remove(element: Base): void;

  private _eventBus: EventBus;
  private _elementRegistry: ElementRegistry;
  private static $inject: string[];
}