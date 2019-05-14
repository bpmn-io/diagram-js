import {
  append as svgAppend,
  attr as svgAttr,
  clear as svgClear,
  create as svgCreate
} from 'tiny-svg';

import { query as domQuery } from 'min-dom';

import { SPACING, quantize } from '../GridUtil';

import { getMid } from '../../../layout/LayoutUtil';

var GRID_COLOR = '#ccc',
    LAYER_NAME = 'djs-grid';

export var GRID_DIMENSIONS = {
  width: 100000,
  height: 100000
};


export default function Grid(canvas, eventBus) {
  this._canvas = canvas;

  var self = this;

  eventBus.on('diagram.init', function() {
    self._init();
  });

  eventBus.on('gridSnapping.toggle', function(event) {
    var active = event.active;

    self._setVisible(active);

    self._centerGridAroundViewbox();
  });

  eventBus.on('canvas.viewbox.changed', function(context) {
    var viewbox = context.viewbox;

    self._centerGridAroundViewbox(viewbox);
  });
}

Grid.prototype._init = function() {
  var defs = domQuery('defs', this._canvas._svg);

  if (!defs) {
    defs = svgCreate('defs');

    svgAppend(this._canvas._svg, defs);
  }

  var pattern = this.pattern = svgCreate('pattern');

  svgAttr(pattern, {
    id: 'djs-grid-pattern',
    width: SPACING,
    height: SPACING,
    patternUnits: 'userSpaceOnUse'
  });

  var circle = this.circle = svgCreate('circle');

  svgAttr(circle, {
    cx: 0.5,
    cy: 0.5,
    r: 0.5,
    fill: GRID_COLOR
  });

  svgAppend(pattern, circle);

  svgAppend(defs, pattern);

  var grid = this.grid = svgCreate('rect');

  svgAttr(grid, {
    x: -(GRID_DIMENSIONS.width / 2),
    y: -(GRID_DIMENSIONS.height / 2),
    width: GRID_DIMENSIONS.width,
    height: GRID_DIMENSIONS.height,
    fill: 'url(#djs-grid-pattern)'
  });
};

Grid.prototype._centerGridAroundViewbox = function(viewbox) {
  if (!viewbox) {
    viewbox = this._canvas.viewbox();
  }

  var mid = getMid(viewbox);

  svgAttr(this.grid, {
    x: -(GRID_DIMENSIONS.width / 2) + quantize(mid.x, SPACING),
    y: -(GRID_DIMENSIONS.height / 2) + quantize(mid.y, SPACING)
  });
};

Grid.prototype._isVisible = function() {
  return this.visible;
};

Grid.prototype._setVisible = function(visible) {

  if (visible === this.visible) {
    return;
  }

  this.visible = visible;

  var parent = this._getParent();

  if (visible) {
    svgAppend(parent, this.grid);
  } else {
    svgClear(parent);
  }
};

Grid.prototype._getParent = function() {
  return this._canvas.getLayer(LAYER_NAME, -2);
};

Grid.$inject = [
  'canvas',
  'eventBus'
];