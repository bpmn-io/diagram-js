import {
  clear as svgClear,
  create as svgCreate
} from 'tiny-svg';

import { getVisual } from '../../util/GraphicsUtil';

import { isConnection } from '../../util/ModelUtil';

import { translate } from '../../util/SvgTransformUtil';

/**
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Shape} Shape
 * @typedef {import('../../util/Types').Point} Point
 * @typedef {import('../../util/Types').Rect} Rect
 *
 * @typedef { { element: Element, delta: Point } } MovedOption
 * @typedef { { shape: Shape, bounds: Rect } } ResizedOption
 *
 * @typedef { {
 *   created?: Element[],
 *   removed?: Element[],
 *   moved?: MovedOption[],
 *   resized?: ResizedOption[]
 * } } CreateOptions
 */

const LAYER_NAME = 'complex-preview';

/**
 * Complex preview for shapes and connections.
 */
export default class ComplexPreview {
  constructor(canvas, graphicsFactory, previewSupport) {
    this._canvas = canvas;
    this._graphicsFactory = graphicsFactory;
    this._previewSupport = previewSupport;

    this._markers = [];
  }

  /**
   * Create complex preview.
   *
   * @param {CreateOptions} options
   */
  create(options) {

    // there can only be one complex preview at a time
    this.cleanUp();

    const {
      created = [],
      moved = [],
      removed = [],
      resized = []
    } = options;

    const layer = this._canvas.getLayer(LAYER_NAME);

    // shapes and connections to be created
    created.filter(element => !isHidden(element)).forEach(element => {
      let gfx;

      if (isConnection(element)) {
        gfx = this._graphicsFactory._createContainer('connection', svgCreate('g'));

        this._graphicsFactory.drawConnection(getVisual(gfx), element);
      } else {
        gfx = this._graphicsFactory._createContainer('shape', svgCreate('g'));

        this._graphicsFactory.drawShape(getVisual(gfx), element);

        translate(gfx, element.x, element.y);
      }

      this._previewSupport.addDragger(element, layer, gfx);
    });

    // elements to be moved
    moved.forEach(({ element, delta }) => {
      this._previewSupport.addDragger(element, layer, undefined, 'djs-dragging');

      this._canvas.addMarker(element, 'djs-element-hidden');

      this._markers.push([ element, 'djs-element-hidden' ]);

      const dragger = this._previewSupport.addDragger(element, layer);

      if (isConnection(element)) {
        translate(dragger, delta.x, delta.y);
      } else {
        translate(dragger, element.x + delta.x, element.y + delta.y);
      }
    });

    // elements to be removed
    removed.forEach(element => {
      this._previewSupport.addDragger(element, layer, undefined, 'djs-dragging');

      this._canvas.addMarker(element, 'djs-element-hidden');

      this._markers.push([ element, 'djs-element-hidden' ]);
    });

    // elements to be resized
    resized.forEach(({ shape, bounds }) => {
      this._canvas.addMarker(shape, 'djs-hidden');

      this._markers.push([ shape, 'djs-hidden' ]);

      this._previewSupport.addDragger(shape, layer, undefined, 'djs-dragging');

      const gfx = this._graphicsFactory._createContainer('shape', svgCreate('g'));

      this._graphicsFactory.drawShape(getVisual(gfx), shape, {
        width: bounds.width,
        height: bounds.height
      });

      translate(gfx, bounds.x, bounds.y);

      this._previewSupport.addDragger(shape, layer, gfx);
    });
  }

  cleanUp() {
    svgClear(this._canvas.getLayer(LAYER_NAME));

    this._markers.forEach(([ element, marker ]) => this._canvas.removeMarker(element, marker));

    this._markers = [];
  }

  show() {
    this._canvas.showLayer(LAYER_NAME);
  }

  hide() {
    this._canvas.hideLayer(LAYER_NAME);
  }
}

ComplexPreview.$inject = [
  'canvas',
  'graphicsFactory',
  'previewSupport'
];

function isHidden(element) {
  return element.hidden;
}