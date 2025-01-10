/**
 * Copy and paste elements.
 *
 */
export default class CopyPaste {
  static $inject: string[];

  /**
   * @param canvas
   * @param create
   * @param clipboard
   * @param elementFactory
   * @param eventBus
   * @param modeling
   * @param mouse
   * @param rules
   */
  constructor(canvas: Canvas, create: Create, clipboard: Clipboard, elementFactory: ElementFactory, eventBus: EventBus, modeling: Modeling, mouse: Mouse, rules: Rules);

  /**
   * Copy elements.
   *
   * @param elements
   *
   * @return
   */
  copy(elements: Element[]): any;

  /**
   * Paste elements.
   *
   * @param context
   */
  paste(context?: {
      element?: Shape;
      point?: Point;
      hints?: any;
  }): import("../../model/Types").Element[];

  createConnection(attrs: any): import("../../model/Types").Connection;
  createLabel(attrs: any): import("../../model/Types").Label;
  createShape(attrs: any): import("../../model/Types").Shape;

  /**
   * Check wether element has relations to other elements e.g. attachers, labels and connections.
   *
   * @param element
   * @param elements
   *
   * @return
   */
  hasRelations(element: any, elements: Element[]): boolean;

  /**
   * Create a tree-like structure from elements.
   *
   * @example
   *
   * ```javascript
   * tree: {
   *  0: [
   *    { id: 'Shape_1', priority: 1, ... },
   *    { id: 'Shape_2', priority: 1, ... },
   *    { id: 'Connection_1', source: 'Shape_1', target: 'Shape_2', priority: 3, ... },
   *    ...
   *  ],
   *  1: [
   *    { id: 'Shape_3', parent: 'Shape1', priority: 1, ... },
   *    ...
   *  ]
   * };
   * ```
   *
   * @param elements
   *
   * @return
   */
  createTree(elements: Element[]): any;
}

type Element = import('../../core/Types').ElementLike;
type Shape = import('../../core/Types').ShapeLike;
type Point = import('../../util/Types').Point;
type Canvas = import('../../core/Canvas').default;
type Clipboard = import('../clipboard/Clipboard').default;
type Create = import('../create/Create').default;
type ElementFactory = import('../../core/ElementFactory').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
type Mouse = import('../mouse/Mouse').default;
type Rules = import('../rules/Rules').default;

export type CopyPasteCanCopyElementsListener = (event: {
    elements: Element[];
}) => Element[] | boolean;

export type CopyPasteCopyElementListener = (event: {
    descriptor: any;
    element: Element;
    elements: Element[];
}) => void;

export type CopyPasteCreateTreeListener = (event: {
    element: Element;
    children: Element[];
}) => void;

export type CopyPasteElementsCopiedListener = (event: {
    elements: any;
    tree: any;
}) => void;

export type CopyPastePasteElementListener = (event: {
    cache: any;
    descriptor: any;
}) => void;

export type CopyPastePasteElementsListener = (event: {
    hints: any;
}) => void;
