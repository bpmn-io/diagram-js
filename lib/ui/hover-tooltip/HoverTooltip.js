import {
  delegate as domDelegate,
  domify
} from 'min-dom';

import {
  html,
  render
} from '../index.js';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 */

const SHOW_DELAY = 300;

/**
 * @typedef { import('@bpmn-io/diagram-js-ui').VNode } VNode
 *
 * @typedef { {
 *   x: number;
 *   y: number;
 *   placement?: string;
 * } } HoverTooltipPosition
 *
 * @typedef { {
 *   container: HTMLElement;
 *   selector: string;
 *   getContent: (target: HTMLElement) => VNode | null;
 *   getPosition: (target: HTMLElement) => HoverTooltipPosition;
 *   showDelay?: number;
 * } } HoverTooltipConfig
 */

/**
 * Shows a styled tooltip when hovering UI controls such as palette or
 * context pad entries. Reusable across features; a consumer registers a
 * hover source via #add and provides the rendered content.
 *
 * @param {Canvas} canvas
 */
export default function HoverTooltip(canvas) {
  this._canvas = canvas;

  this._mount = null;
  this._current = null;
  this._showTimer = null;
}

HoverTooltip.$inject = [ 'canvas' ];

/**
 * Register a hover source. Hovering a `selector` match inside `container`
 * shows a tooltip with the content and position provided by the callbacks.
 *
 * @param {HoverTooltipConfig} config
 */
HoverTooltip.prototype.add = function(config) {
  const {
    container,
    selector,
    showDelay = SHOW_DELAY
  } = config;

  domDelegate.bind(container, selector, 'mouseover',
    (event) => this._show(event.delegateTarget, config, showDelay));

  domDelegate.bind(container, selector, 'mouseout',
    (event) => {
      const { delegateTarget, relatedTarget } = event;

      // ignore transitions to a child element of the same target
      if (relatedTarget && delegateTarget.contains(relatedTarget)) {
        return;
      }

      this._hide();
    });
};

HoverTooltip.prototype._show = function(target, config, showDelay) {
  const content = config.getContent(target);

  if (!content) {
    return;
  }

  this._current = {
    target,
    content,
    getPosition: config.getPosition
  };

  clearTimeout(this._showTimer);

  this._showTimer = setTimeout(() => this._render(), showDelay);
};

HoverTooltip.prototype._hide = function() {
  clearTimeout(this._showTimer);

  this._current = null;

  this._render();
};

HoverTooltip.prototype._render = function() {
  const mount = this._getMount();

  if (!this._current) {
    render(null, mount);

    return;
  }

  const { target, content, getPosition } = this._current;

  const { x, y, placement = 'right' } = getPosition(target);

  const style = {
    left: `${ x }px`,
    top: `${ y }px`
  };

  render(
    html`<div
      class="djs-hover-tooltip djs-hover-tooltip--${ placement }"
      style=${ style }
    >${ content }</div>`,
    mount
  );
};

HoverTooltip.prototype._getMount = function() {
  if (!this._mount) {
    this._mount = domify('<div class="djs-hover-tooltip-container"></div>');

    this._canvas.getContainer().appendChild(this._mount);
  }

  return this._mount;
};
