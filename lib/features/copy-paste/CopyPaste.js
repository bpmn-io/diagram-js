import {
  assign,
  find,
  forEach,
  isArray,
  isNumber,
  map,
  matchPattern,
  omit,
  sortBy
} from 'min-dash';

import {
  getBBox,
  getParents
} from '../../util/Elements';

import { eachElement } from '../../util/Elements';

import {
  isConnection,
  isLabel
} from '../../util/ModelUtil';

/**
 * @typedef {import('../../core/Types').ElementLike} Element
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../util/Types').Point} Point
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../clipboard/Clipboard').default} Clipboard
 * @typedef {import('../create/Create').default} Create
 * @typedef {import('../../core/ElementFactory').default} ElementFactory
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../mouse/Mouse').default} Mouse
 * @typedef {import('../rules/Rules').default} Rules
 */

/**
 * @typedef { (event: { elements: Element[] }) => Element[]|boolean } CopyPasteCanCopyElementsListener
 */

/**
 * @typedef { (event: { descriptor: any, element: Element, elements: Element[] }) => void } CopyPasteCopyElementListener
 */

/**
 * @typedef { (event: { element: Element, children: Element[] }) => void } CopyPasteCreateTreeListener
 */

/**
 * @typedef { (event: { elements: any, tree: any }) => void } CopyPasteElementsCopiedListener
 */

/**
 * @typedef { (event: { cache: any, descriptor: any }) => void } CopyPastePasteElementListener
 */

/**
 * @typedef { (event: { hints: any }) => void } CopyPastePasteElementsListener
 */

/**
 * Copy and paste elements.
 *
 * @param {Canvas} canvas
 * @param {Create} create
 * @param {Clipboard} clipboard
 * @param {ElementFactory} elementFactory
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {Mouse} mouse
 * @param {Rules} rules
 */
export default function CopyPaste(
    canvas,
    create,
    clipboard,
    elementFactory,
    eventBus,
    modeling,
    mouse,
    rules
) {

  this._canvas = canvas;
  this._create = create;
  this._clipboard = clipboard;
  this._elementFactory = elementFactory;
  this._eventBus = eventBus;
  this._modeling = modeling;
  this._mouse = mouse;
  this._rules = rules;

  eventBus.on('copyPaste.copyElement', function(context) {
    var descriptor = context.descriptor,
        element = context.element,
        elements = context.elements;

    // default priority (priority = 1)
    descriptor.priority = 1;

    descriptor.id = element.id;

    var parentCopied = find(elements, function(e) {
      return e === element.parent;
    });

    // do NOT reference parent if parent wasn't copied
    if (parentCopied) {
      descriptor.parent = element.parent.id;
    }

    // attachers (priority = 2)
    if (isAttacher(element)) {
      descriptor.priority = 2;

      descriptor.host = element.host.id;
    }

    // connections (priority = 3)
    if (isConnection(element)) {
      descriptor.priority = 3;

      descriptor.source = element.source.id;
      descriptor.target = element.target.id;

      descriptor.waypoints = copyWaypoints(element);
    }

    // labels (priority = 4)
    if (isLabel(element)) {
      descriptor.priority = 4;

      descriptor.labelTarget = element.labelTarget.id;
    }

    forEach([ 'x', 'y', 'width', 'height' ], function(property) {
      if (isNumber(element[ property ])) {
        descriptor[ property ] = element[ property ];
      }
    });

    descriptor.hidden = element.hidden;
    descriptor.collapsed = element.collapsed;

  });

  eventBus.on('copyPaste.pasteElements', function(context) {
    var hints = context.hints;

    assign(hints, {
      createElementsBehavior: false
    });
  });
}

CopyPaste.$inject = [
  'canvas',
  'create',
  'clipboard',
  'elementFactory',
  'eventBus',
  'modeling',
  'mouse',
  'rules'
];


/**
 * Copy elements.
 *
 * @param {Element[]} elements
 *
 * @return {Object}
 */
CopyPaste.prototype.copy = function(elements) {
  var allowed,
      tree;

  if (!isArray(elements)) {
    elements = elements ? [ elements ] : [];
  }

  allowed = this._eventBus.fire('copyPaste.canCopyElements', {
    elements: elements
  });

  if (allowed === false) {
    tree = {};
  } else {
    tree = this.createTree(isArray(allowed) ? allowed : elements);
  }

  // we set an empty tree, selection of elements
  // to copy was empty.
  this._clipboard.set(tree);

  this._eventBus.fire('copyPaste.elementsCopied', {
    elements: elements,
    tree: tree
  });

  return tree;
};

/**
 * Paste elements.
 *
 * @param {Object} [context]
 * @param {Shape} [context.element] The optional parent.
 * @param {Point} [context.point] The optional osition.
 * @param {Object} [context.hints] The optional hints.
 */
CopyPaste.prototype.paste = function(context) {
  var tree = this._clipboard.get();

  if (this._clipboard.isEmpty()) {
    return;
  }

  var hints = context && context.hints || {};

  this._eventBus.fire('copyPaste.pasteElements', {
    hints: hints
  });

  var elements = this._createElements(tree);

  // paste directly
  if (context && context.element && context.point) {
    return this._paste(elements, context.element, context.point, hints);
  }

  this._create.start(this._mouse.getLastMoveEvent(), elements, {
    hints: hints || {}
  });
};

/**
 * Paste elements directly.
 *
 * @param {Element[]} elements
 * @param {Shape} target
 * @param {Point} position
 * @param {Object} [hints]
 */
CopyPaste.prototype._paste = function(elements, target, position, hints) {

  // make sure each element has x and y
  forEach(elements, function(element) {
    if (!isNumber(element.x)) {
      element.x = 0;
    }

    if (!isNumber(element.y)) {
      element.y = 0;
    }
  });

  var bbox = getBBox(elements);

  // center elements around cursor
  forEach(elements, function(element) {
    if (isConnection(element)) {
      element.waypoints = map(element.waypoints, function(waypoint) {
        return {
          x: waypoint.x - bbox.x - bbox.width / 2,
          y: waypoint.y - bbox.y - bbox.height / 2
        };
      });
    }

    assign(element, {
      x: element.x - bbox.x - bbox.width / 2,
      y: element.y - bbox.y - bbox.height / 2
    });
  });

  return this._modeling.createElements(elements, position, target, assign({}, hints));
};

/**
 * Create elements from tree.
 */
CopyPaste.prototype._createElements = function(tree) {
  var self = this;

  var eventBus = this._eventBus;

  var cache = {};

  var elements = [];

  forEach(tree, function(branch, depth) {

    depth = parseInt(depth, 10);

    // sort by priority
    branch = sortBy(branch, 'priority');

    forEach(branch, function(descriptor) {

      // remove priority
      var attrs = assign({}, omit(descriptor, [ 'priority' ]));

      if (cache[ descriptor.parent ]) {
        attrs.parent = cache[ descriptor.parent ];
      } else {
        delete attrs.parent;
      }

      eventBus.fire('copyPaste.pasteElement', {
        cache: cache,
        descriptor: attrs
      });

      var element;

      if (isConnection(attrs)) {
        attrs.source = cache[ descriptor.source ];
        attrs.target = cache[ descriptor.target ];

        element = cache[ descriptor.id ] = self.createConnection(attrs);

        elements.push(element);

        return;
      }

      if (isLabel(attrs)) {
        attrs.labelTarget = cache[ attrs.labelTarget ];

        element = cache[ descriptor.id ] = self.createLabel(attrs);

        elements.push(element);

        return;
      }

      if (attrs.host) {
        attrs.host = cache[ attrs.host ];
      }

      element = cache[ descriptor.id ] = self.createShape(attrs);

      elements.push(element);
    });

  });

  return elements;
};

CopyPaste.prototype.createConnection = function(attrs) {
  var connection = this._elementFactory.createConnection(omit(attrs, [ 'id' ]));

  return connection;
};

CopyPaste.prototype.createLabel = function(attrs) {
  var label = this._elementFactory.createLabel(omit(attrs, [ 'id' ]));

  return label;
};

CopyPaste.prototype.createShape = function(attrs) {
  var shape = this._elementFactory.createShape(omit(attrs, [ 'id' ]));

  return shape;
};

/**
 * Check wether element has relations to other elements e.g. attachers, labels and connections.
 *
 * @param {Object} element
 * @param {Element[]} elements
 *
 * @return {boolean}
 */
CopyPaste.prototype.hasRelations = function(element, elements) {
  var labelTarget,
      source,
      target;

  if (isConnection(element)) {
    source = find(elements, matchPattern({ id: element.source.id }));
    target = find(elements, matchPattern({ id: element.target.id }));

    if (!source || !target) {
      return false;
    }
  }

  if (isLabel(element)) {
    labelTarget = find(elements, matchPattern({ id: element.labelTarget.id }));

    if (!labelTarget) {
      return false;
    }
  }

  return true;
};

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
 * @param {Element[]} elements
 *
 * @return {Object}
 */
CopyPaste.prototype.createTree = function(elements) {
  var rules = this._rules,
      self = this;

  var tree = {},
      elementsData = [];

  var parents = getParents(elements);

  function canCopy(element, elements) {
    return rules.allowed('element.copy', {
      element: element,
      elements: elements
    });
  }

  function addElementData(element, depth) {

    // (1) check wether element has already been added
    var foundElementData = find(elementsData, function(elementsData) {
      return element === elementsData.element;
    });

    // (2) add element if not already added
    if (!foundElementData) {
      elementsData.push({
        element: element,
        depth: depth
      });

      return;
    }

    // (3) update depth
    if (foundElementData.depth < depth) {
      elementsData = removeElementData(foundElementData, elementsData);

      elementsData.push({
        element: foundElementData.element,
        depth: depth
      });
    }
  }

  function removeElementData(elementData, elementsData) {
    var index = elementsData.indexOf(elementData);

    if (index !== -1) {
      elementsData.splice(index, 1);
    }

    return elementsData;
  }

  // (1) add elements
  eachElement(parents, function(element, _index, depth) {

    // do NOT add external labels directly
    if (isLabel(element)) {
      return;
    }

    // always copy external labels
    forEach(element.labels, function(label) {
      addElementData(label, depth);
    });

    function addRelatedElements(elements) {
      elements && elements.length && forEach(elements, function(element) {

        // add external labels
        forEach(element.labels, function(label) {
          addElementData(label, depth);
        });

        addElementData(element, depth);
      });
    }

    forEach([ element.attachers, element.incoming, element.outgoing ], addRelatedElements);

    addElementData(element, depth);

    var children = [];

    if (element.children) {
      children = element.children.slice();
    }

    // allow others to add children to tree
    self._eventBus.fire('copyPaste.createTree', {
      element: element,
      children: children
    });

    return children;
  });

  elements = map(elementsData, function(elementData) {
    return elementData.element;
  });

  // (2) copy elements
  elementsData = map(elementsData, function(elementData) {
    elementData.descriptor = {};

    self._eventBus.fire('copyPaste.copyElement', {
      descriptor: elementData.descriptor,
      element: elementData.element,
      elements: elements
    });

    return elementData;
  });

  // (3) sort elements by priority
  elementsData = sortBy(elementsData, function(elementData) {
    return elementData.descriptor.priority;
  });

  elements = map(elementsData, function(elementData) {
    return elementData.element;
  });

  // (4) create tree
  forEach(elementsData, function(elementData) {
    var depth = elementData.depth;

    if (!self.hasRelations(elementData.element, elements)) {
      removeElement(elementData.element, elements);

      return;
    }

    if (!canCopy(elementData.element, elements)) {
      removeElement(elementData.element, elements);

      return;
    }

    if (!tree[depth]) {
      tree[depth] = [];
    }

    tree[depth].push(elementData.descriptor);
  });

  return tree;
};

// helpers //////////

function isAttacher(element) {
  return !!element.host;
}

function copyWaypoints(element) {
  return map(element.waypoints, function(waypoint) {

    waypoint = copyWaypoint(waypoint);

    if (waypoint.original) {
      waypoint.original = copyWaypoint(waypoint.original);
    }

    return waypoint;
  });
}

function copyWaypoint(waypoint) {
  return assign({}, waypoint);
}

function removeElement(element, elements) {
  var index = elements.indexOf(element);

  if (index === -1) {
    return elements;
  }

  return elements.splice(index, 1);
}