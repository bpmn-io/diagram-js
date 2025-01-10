/**
 * Draws connection preview. Optionally, this can use layouter and connection docking to draw
 * better looking previews.
 *
 */
export default class ConnectionPreview {
  static $inject: string[];

  /**
   * @param injector
   * @param canvas
   * @param graphicsFactory
   * @param elementFactory
   */
  constructor(injector: Injector, canvas: Canvas, graphicsFactory: GraphicsFactory, elementFactory: ElementFactory);

  /**
   * Draw connection preview.
   *
   * Provide at least one of <source, connectionStart> and <target, connectionEnd> to create a preview.
   * In the clean up stage, call `connectionPreview#cleanUp` with the context to remove preview.
   *
   * @param context
   * @param canConnect
   * @param hints
   */
  drawPreview(context: any, canConnect: any | boolean, hints: {
      source?: Element;
      target?: Element;
      connectionStart?: Point;
      connectionEnd?: Point;
      waypoints?: Point[];
      noLayout?: boolean;
      noCropping?: boolean;
      noNoop?: boolean;
  }): void;

  /**
   * Draw simple connection between source and target or provided points.
   *
   * @param connectionPreviewGfx container for the connection
   * @param hints
   */
  drawNoopPreview(connectionPreviewGfx: SVGElement, hints: {
      source?: Element;
      target?: Element;
      connectionStart?: Point;
      connectionEnd?: Point;
  }): void;

  /**
   * Return cropped waypoints.
   *
   * @param start
   * @param end
   * @param source
   * @param target
   *
   * @return
   */
  cropWaypoints(start: Point, end: Point, source: Element, target: Element): Point[];

  /**
   * Remove connection preview container if it exists.
   *
   * @param context
   */
  cleanUp(context?: {
      connectionPreviewGfx?: SVGElement;
  }): void;

  /**
   * Get connection that connects source and target.
   *
   * @param canConnect
   *
   * @return
   */
  getConnection(canConnect: any | boolean): Connection;

  /**
   * Add and return preview graphics.
   *
   * @return
   */
  createConnectionPreviewGfx(): SVGElement;

  /**
   * Create and return simple connection.
   *
   * @param start
   * @param end
   *
   * @return
   */
  createNoopConnection(start: Point, end: Point): SVGElement;
}

type Element = import('../../model/Types').Element;
type Connection = import('../../model/Types').Connection;
type Shape = import('../../model/Types').Shape;
type Point = import('../../util/Types').Point;
type Injector = import('didi').Injector;
type Canvas = import('../../core/Canvas').default;
type ElementFactory = import('../../core/ElementFactory').default;
type GraphicsFactory = import('../../core/GraphicsFactory').default;
