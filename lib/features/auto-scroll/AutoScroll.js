import { assign } from 'min-dash';

import {
  toPoint
} from '../../util/Event';


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
 */
export default class AutoScroll {
  constructor(config, eventBus, canvas) {

    this._canvas = canvas;

    this._opts = assign({
      scrollThresholdIn: [ 20, 20, 20, 20 ],
      scrollThresholdOut: [ 0, 0, 0, 0 ],
      scrollRepeatTimeout: 15,
      scrollStep: 10
    }, config);

    const self = this;

    eventBus.on('drag.move', e => {
      const point = self._toBorderPoint(e);

      self.startScroll(point);
    });

    eventBus.on([ 'drag.cleanup' ], () => {
      self.stopScroll();
    });
  }

  /**
   * Starts scrolling loop.
   * Point is given in global scale in canvas container box plane.
   *
   * @param  {Object} point { x: X, y: Y }
   */
  startScroll(point) {
    const canvas = this._canvas;
    const opts = this._opts;
    const self = this;

    const clientRect = canvas.getContainer().getBoundingClientRect();

    const diff = [
      point.x,
      point.y,
      clientRect.width - point.x,
      clientRect.height - point.y
    ];

    this.stopScroll();

    let dx = 0;
    let dy = 0;

    for (let i = 0; i < 4; i++) {
      if (between(diff[i], opts.scrollThresholdOut[i], opts.scrollThresholdIn[i])) {
        if (i === 0) {
          dx = opts.scrollStep;
        } else if (i == 1) {
          dy = opts.scrollStep;
        } else if (i == 2) {
          dx = -opts.scrollStep;
        } else if (i == 3) {
          dy = -opts.scrollStep;
        }
      }
    }

    if (dx !== 0 || dy !== 0) {
      canvas.scroll({ dx, dy });

      this._scrolling = setTimeout(() => {
        self.startScroll(point);
      }, opts.scrollRepeatTimeout);
    }
  }

  /**
   * Stops scrolling loop.
   */
  stopScroll() {
    clearTimeout(this._scrolling);
  }

  /**
   * Overrides defaults options.
   *
   * @param  {Object} options
   */
  setOptions(options) {
    this._opts = assign({}, this._opts, options);
  }

  /**
   * Converts event to a point in canvas container plane in global scale.
   *
   * @param  {Event} event
   * @return {Point}
   */
  _toBorderPoint({originalEvent}) {
    const clientRect = this._canvas._container.getBoundingClientRect();

    const globalPosition = toPoint(originalEvent);

    return {
      x: globalPosition.x - clientRect.left,
      y: globalPosition.y - clientRect.top
    };
  }
}

AutoScroll.$inject = [
  'config.autoScroll',
  'eventBus',
  'canvas'
];


function between(val, start, end) {
  if (start < val && val < end) {
    return true;
  }

  return false;
}