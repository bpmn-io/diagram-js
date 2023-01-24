import EventBus from './EventBus';

import { Base } from '../model';

export type ElementRegistryElement = {
  element: Base;
  gfx: SVGElement;
  secondaryGfx: SVGElement;
};

export type ElementRegistryElements = {
  [id: string]: ElementRegistryElement;
};

export type ElementRegistryCallback = (element: Base, gfx: SVGElement) => boolean;

export default class ElementRegistry {
  constructor(eventBus: EventBus);
  add(element: Base, gfx: SVGElement, secondaryGfx?: SVGElement): void;
  remove(element: Base | string): void;
  updateId(element: Base | string, newId: string): void;
  updateGraphics(filter: Base | string, gfx: SVGElement, secondary?: boolean): void;
  get(filter: string | SVGElement): Base;
  filter(fn: ElementRegistryCallback): Base[];
  find(fn: ElementRegistryCallback): Base;
  getAll(): Base[];
  forEach(fn: (element: Base, gfx: SVGElement) => void): void;
  getGraphics(filter: Base | string, secondary?: boolean): SVGElement;
}