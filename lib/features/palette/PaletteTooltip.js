import {
  attr as domAttr
} from 'min-dom';

import { html } from '../../ui/index.js';

import PaletteTooltipComponent from './PaletteTooltipComponent.js';

/**
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('./Palette').default} Palette
 * @typedef {import('../../ui/hover-tooltip/HoverTooltip').default} HoverTooltip
 */

const PALETTE_ENTRY_SELECTOR = '.djs-palette-entries .entry';

const ENTRY_GAP = 8;

/**
 * Shows a hover tooltip for palette entries, displaying the entry `title`
 * and, if the entry provides one, its keyboard `shortcut`.
 *
 * @param {EventBus} eventBus
 * @param {Palette} palette
 * @param {HoverTooltip} hoverTooltip
 */
export default function PaletteTooltip(eventBus, palette, hoverTooltip) {
  this._palette = palette;
  this._hoverTooltip = hoverTooltip;

  this._entries = {};

  eventBus.on('palette.create', (event) => this._init(event.container));

  eventBus.on('palette.changed', () => this._updateEntries());
}

PaletteTooltip.$inject = [ 'eventBus', 'palette', 'hoverTooltip' ];

PaletteTooltip.prototype._init = function(container) {
  this._updateEntries();

  this._hoverTooltip.add({
    container,
    selector: PALETTE_ENTRY_SELECTOR,
    getContent: (target) => {
      const entry = this._entries[ domAttr(target, 'data-action') ];

      if (!entry || !entry.title) {
        return null;
      }

      return html`<${PaletteTooltipComponent}
        title=${ entry.title }
        shortcut=${ entry.shortcut }
      />`;
    },
    getPosition: (target) => {
      const bounds = target.getBoundingClientRect();

      return {
        x: bounds.right + ENTRY_GAP,
        y: bounds.top + bounds.height / 2,
        placement: 'right'
      };
    }
  });
};

PaletteTooltip.prototype._updateEntries = function() {
  this._entries = this._palette.getEntries();
};
