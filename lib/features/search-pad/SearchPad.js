import {
  clear as domClear,
  delegate as domDelegate,
  query as domQuery,
  classes as domClasses,
  attr as domAttr,
  domify as domify
} from 'min-dom';

import {
  escapeHTML
} from '../../util/EscapeUtil';

import { isKey } from '../keyboard/KeyboardUtil';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../selection/Selection').default} Selection
 * @typedef {import('../../i18n/translate/translate.js').default} Translate
 *
 * @typedef {import('../../util/Types').Dimensions} Dimensions
 *
 * @typedef {import('./SearchPadProvider').default} SearchPadProvider
 * @typedef {import('./SearchPadProvider').SearchResult} SearchResult
 * @typedef {import('./SearchPadProvider').Token} Token
 */

var SCROLL_TO_ELEMENT_PADDING = 300;

/**
 * Provides searching infrastructure.
 *
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {Selection} selection
 * @param {Translate} translate
 */
export default function SearchPad(canvas, eventBus, selection, translate) {
  this._open = false;
  this._results = {};
  this._eventMaps = [];

  this._cachedRootElement = null;
  this._cachedSelection = null;
  this._cachedViewbox = null;

  this._canvas = canvas;
  this._eventBus = eventBus;
  this._selection = selection;
  this._translate = translate;

  // setup elements
  this._container = this._getBoxHtml();
  this._searchInput = domQuery(SearchPad.INPUT_SELECTOR, this._container);
  this._resultsContainer = domQuery(SearchPad.RESULTS_CONTAINER_SELECTOR, this._container);

  // attach search pad
  this._canvas.getContainer().appendChild(this._container);

  // cleanup whenever appropriate
  eventBus.on([
    'canvas.destroy',
    'diagram.destroy',
    'drag.init',
    'elements.changed'
  ], this.close, this);
}


SearchPad.$inject = [
  'canvas',
  'eventBus',
  'selection',
  'translate'
];


/**
 * Binds and keeps track of all event listereners
 */
SearchPad.prototype._bindEvents = function() {
  var self = this;

  function listen(el, selector, type, fn) {
    self._eventMaps.push({
      el: el,
      type: type,
      listener: domDelegate.bind(el, selector, type, fn)
    });
  }

  // close search on clicking anywhere outside
  listen(document, 'html', 'click', function(e) {
    self.close(false);
  });

  // stop event from propagating and closing search
  // focus on input
  listen(this._container, SearchPad.INPUT_SELECTOR, 'click', function(e) {
    e.stopPropagation();
    e.delegateTarget.focus();
  });

  // preselect result on hover
  listen(this._container, SearchPad.RESULT_SELECTOR, 'mouseover', function(e) {
    e.stopPropagation();
    self._scrollToNode(e.delegateTarget);
    self._preselect(e.delegateTarget);
  });

  // selects desired result on mouse click
  listen(this._container, SearchPad.RESULT_SELECTOR, 'click', function(e) {
    e.stopPropagation();
    self._select(e.delegateTarget);
  });

  // prevent cursor in input from going left and right when using up/down to
  // navigate results
  listen(this._container, SearchPad.INPUT_SELECTOR, 'keydown', function(e) {

    if (isKey('ArrowUp', e)) {
      e.preventDefault();
    }

    if (isKey('ArrowDown', e)) {
      e.preventDefault();
    }
  });

  // handle keyboard input
  listen(this._container, SearchPad.INPUT_SELECTOR, 'keyup', function(e) {

    if (isKey('Escape', e)) {
      return self.close();
    }

    if (isKey('Enter', e)) {
      var selected = self._getCurrentResult();

      return selected ? self._select(selected) : self.close(false);
    }

    if (isKey('ArrowUp', e)) {
      return self._scrollToDirection(true);
    }

    if (isKey('ArrowDown', e)) {
      return self._scrollToDirection();
    }

    // do not search while navigating text input
    if (isKey([ 'ArrowLeft', 'ArrowRight' ], e)) {
      return;
    }

    // anything else
    self._search(e.delegateTarget.value);
  });
};


/**
 * Unbinds all previously established listeners
 */
SearchPad.prototype._unbindEvents = function() {
  this._eventMaps.forEach(function(m) {
    domDelegate.unbind(m.el, m.type, m.listener);
  });
};


/**
 * Performs a search for the given pattern.
 *
 * @param {string} pattern
 */
SearchPad.prototype._search = function(pattern) {
  var self = this;

  this._clearResults();

  // do not search on empty query
  if (!pattern || pattern === '') {
    return;
  }

  var searchResults = this._searchProvider.find(pattern);

  searchResults = searchResults.filter(function(searchResult) {
    return !self._canvas.getRootElements().includes(searchResult.element);
  });

  if (!searchResults.length) {
    this._clearMarkers();
    this._selection.select(null);

    return;
  }

  // append new results
  searchResults.forEach(function(result) {
    var id = result.element.id;
    var node = self._createResultNode(result, id);
    self._results[id] = {
      element: result.element,
      node: node
    };
  });

  // preselect first result
  var node = domQuery(SearchPad.RESULT_SELECTOR, this._resultsContainer);
  this._scrollToNode(node);
  this._preselect(node);
};


/**
 * Navigate to the previous/next result. Defaults to next result.
 *
 * @param {boolean} previous
 */
SearchPad.prototype._scrollToDirection = function(previous) {
  var selected = this._getCurrentResult();
  if (!selected) {
    return;
  }

  var node = previous ? selected.previousElementSibling : selected.nextElementSibling;
  if (node) {
    this._scrollToNode(node);
    this._preselect(node);
  }
};


/**
 * Scroll to the node if it is not visible.
 *
 * @param {HTMLElement} node
 */
SearchPad.prototype._scrollToNode = function(node) {
  if (!node || node === this._getCurrentResult()) {
    return;
  }

  var nodeOffset = node.offsetTop;
  var containerScroll = this._resultsContainer.scrollTop;

  var bottomScroll = nodeOffset - this._resultsContainer.clientHeight + node.clientHeight;

  if (nodeOffset < containerScroll) {
    this._resultsContainer.scrollTop = nodeOffset;
  } else if (containerScroll < bottomScroll) {
    this._resultsContainer.scrollTop = bottomScroll;
  }
};


/**
 * Clears all results data.
 */
SearchPad.prototype._clearResults = function() {
  domClear(this._resultsContainer);

  this._results = {};

  this._eventBus.fire('searchPad.cleared');
};


/**
 * Clears all markers.
 */
SearchPad.prototype._clearMarkers = function() {
  for (var id in this._results) {
    this._canvas.removeMarker(this._results[id].element, 'djs-search-preselected');
  }
};


/**
 * Get currently selected result.
 *
 * @return {HTMLElement}
 */
SearchPad.prototype._getCurrentResult = function() {
  return domQuery(SearchPad.RESULT_SELECTED_SELECTOR, this._resultsContainer);
};


/**
 * Create result DOM element within results container
 * that corresponds to a search result.
 *
 * 'result' : one of the elements returned by Pad
 * 'id' : id attribute value to assign to the new DOM node
 * return : created DOM element
 *
 * @param {SearchResult} result
 * @param {string} id
 *
 * @return {HTMLElement}
 */
SearchPad.prototype._createResultNode = function(result, id) {
  var node = domify(SearchPad.RESULT_HTML);

  // create only if available
  if (result.primaryTokens.length > 0) {
    createInnerTextNode(node, result.primaryTokens, SearchPad.RESULT_PRIMARY_HTML);
  }

  // secondary tokens (represent element ID) are allways available
  createInnerTextNode(node, result.secondaryTokens, SearchPad.RESULT_SECONDARY_HTML);

  domAttr(node, SearchPad.RESULT_ID_ATTRIBUTE, id);

  this._resultsContainer.appendChild(node);

  return node;
};


/**
 * Register search element provider.
 *
 * @param {SearchPadProvider} provider
 */
SearchPad.prototype.registerProvider = function(provider) {
  this._searchProvider = provider;
};


/**
 * Open search pad.
 */
SearchPad.prototype.open = function() {
  if (!this._searchProvider) {
    throw new Error('no search provider registered');
  }

  if (this.isOpen()) {
    return;
  }

  this._cachedRootElement = this._canvas.getRootElement();
  this._cachedSelection = this._selection.get();
  this._cachedViewbox = this._canvas.viewbox();

  this._bindEvents();

  this._open = true;

  domClasses(this._canvas.getContainer()).add('djs-search-open');
  domClasses(this._container).add('open');

  this._searchInput.focus();

  this._eventBus.fire('searchPad.opened');
};


/**
 * Close search pad.
 */
SearchPad.prototype.close = function(restoreCached = true) {
  if (!this.isOpen()) {
    return;
  }

  if (restoreCached) {
    if (this._cachedRootElement) {
      this._canvas.setRootElement(this._cachedRootElement);
    }

    if (this._cachedSelection) {
      this._selection.select(this._cachedSelection);
    }

    if (this._cachedViewbox) {
      this._canvas.viewbox(this._cachedViewbox);
    }

    this._eventBus.fire('searchPad.restored');
  }

  this._cachedRootElement = null;
  this._cachedSelection = null;
  this._cachedViewbox = null;

  this._unbindEvents();

  this._open = false;

  domClasses(this._canvas.getContainer()).remove('djs-search-open');
  domClasses(this._container).remove('open');

  this._clearMarkers();

  this._clearResults();

  this._searchInput.value = '';
  this._searchInput.blur();

  this._eventBus.fire('searchPad.closed');
};


/**
 * Toggles search pad on/off.
 */
SearchPad.prototype.toggle = function() {
  this.isOpen() ? this.close() : this.open();
};


/**
 * Report state of search pad.
 */
SearchPad.prototype.isOpen = function() {
  return this._open;
};


/**
 * Preselect result entry.
 *
 * @param {HTMLElement} element
 */
SearchPad.prototype._preselect = function(node) {
  var selectedNode = this._getCurrentResult();

  // already selected
  if (node === selectedNode) {
    return;
  }

  this._clearMarkers();

  // removing preselection from current node
  if (selectedNode) {
    domClasses(selectedNode).remove(SearchPad.RESULT_SELECTED_CLASS);
  }

  var id = domAttr(node, SearchPad.RESULT_ID_ATTRIBUTE);
  var element = this._results[id].element;

  domClasses(node).add(SearchPad.RESULT_SELECTED_CLASS);

  this._canvas.scrollToElement(element, {
    top: SCROLL_TO_ELEMENT_PADDING
  });

  this._selection.select(element);

  this._canvas.addMarker(element, 'djs-search-preselected');

  this._eventBus.fire('searchPad.preselected', element);
};


/**
 * Select result node.
 *
 * @param {HTMLElement} element
 */
SearchPad.prototype._select = function(node) {
  var id = domAttr(node, SearchPad.RESULT_ID_ATTRIBUTE);
  var element = this._results[id].element;

  this._cachedSelection = null;
  this._cachedViewbox = null;

  this.close(false);

  this._canvas.scrollToElement(element, {
    top: SCROLL_TO_ELEMENT_PADDING
  });

  this._selection.select(element);

  this._eventBus.fire('searchPad.selected', element);
};


SearchPad.prototype._getBoxHtml = function() {
  const box = domify(SearchPad.BOX_HTML);
  const input = domQuery(SearchPad.INPUT_SELECTOR, box);

  if (input) {
    input.setAttribute('aria-label', this._translate('Search in diagram'));
  }

  return box;
};


/**
 * Creates and appends child node from result tokens and HTML template.
 *
 * @param {HTMLElement} node
 * @param {Token[]} tokens
 * @param {string} template
 */
function createInnerTextNode(parentNode, tokens, template) {
  var text = createHtmlText(tokens);
  var childNode = domify(template);
  childNode.innerHTML = text;
  parentNode.appendChild(childNode);
}

/**
 * Create internal HTML markup from result tokens.
 * Caters for highlighting pattern matched tokens.
 *
 * @param {Token[]} tokens
 *
 * @return {string|null}
 */
function createHtmlText(tokens) {
  var htmlText = '';

  tokens.forEach(function(t) {
    if (t.matched) {
      htmlText += '<b class="' + SearchPad.RESULT_HIGHLIGHT_CLASS + '">' + escapeHTML(t.matched) + '</b>';
    } else {
      htmlText += escapeHTML(t.normal);
    }
  });

  return htmlText !== '' ? htmlText : null;
}


/**
 * CONSTANTS
 */
SearchPad.CONTAINER_SELECTOR = '.djs-search-container';
SearchPad.INPUT_SELECTOR = '.djs-search-input input';
SearchPad.RESULTS_CONTAINER_SELECTOR = '.djs-search-results';
SearchPad.RESULT_SELECTOR = '.djs-search-result';
SearchPad.RESULT_SELECTED_CLASS = 'djs-search-result-selected';
SearchPad.RESULT_SELECTED_SELECTOR = '.' + SearchPad.RESULT_SELECTED_CLASS;
SearchPad.RESULT_ID_ATTRIBUTE = 'data-result-id';
SearchPad.RESULT_HIGHLIGHT_CLASS = 'djs-search-highlight';

SearchPad.BOX_HTML =
`<div class="djs-search-container djs-scrollable">
  <div class="djs-search-input">
    <svg class="djs-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
    </svg>
    <input type="text" spellcheck="false" />
  </div>
  <div class="djs-search-results" />
</div>`;

SearchPad.RESULT_HTML =
  '<div class="djs-search-result"></div>';

SearchPad.RESULT_PRIMARY_HTML =
  '<div class="djs-search-result-primary"></div>';

SearchPad.RESULT_SECONDARY_HTML =
  '<p class="djs-search-result-secondary"></p>';
