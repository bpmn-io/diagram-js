import {
  assign,
  forEach
} from 'min-dash';

/**
 * A handler that toggles the collapsed state of an element
 * and the visibility of all its children.
 *
 * @param {Modeling} modeling
 */
export default function ToggleShapeCollapseHandler(modeling) {
  this._modeling = modeling;
}

ToggleShapeCollapseHandler.$inject = [ 'modeling' ];


ToggleShapeCollapseHandler.prototype.execute = function(context) {

  var shape = context.shape,
      children = shape.children;

  // recursively remember previous visibility of children
  context.oldChildrenVisibility = getElementsVisibilityRecursive(children);

  // toggle state
  shape.collapsed = !shape.collapsed;

  // recursively hide/show children
  var result = setHiddenRecursive(children, shape.collapsed);

  return [shape].concat(result);
};


ToggleShapeCollapseHandler.prototype.revert = function(context) {

  var shape = context.shape,
      oldChildrenVisibility = context.oldChildrenVisibility;

  var children = shape.children;

  // recursively set old visability of children
  var result = restoreVisibilityRecursive(children, oldChildrenVisibility);

  // retoggle state
  shape.collapsed = !shape.collapsed;

  return [shape].concat(result);
};


// helpers //////////////////////

/**
 * Return a map { elementId -> hiddenState}.
 *
 * @param {Array<djs.model.Shape>} elements
 *
 * @return {Object}
 */
function getElementsVisibilityRecursive(elements) {

  var result = {};

  forEach(elements, function(element) {
    result[element.id] = element.hidden;

    if (element.children) {
      result = assign({}, result, getElementsVisibilityRecursive(element.children));
    }
  });

  return result;
}


function setHiddenRecursive(elements, newHidden) {
  var result = [];
  forEach(elements, function(element) {
    element.hidden = newHidden;

    result = result.concat(element);

    if (element.children) {
      result = result.concat(setHiddenRecursive(element.children, element.collapsed || newHidden));
    }
  });

  return result;
}

function restoreVisibilityRecursive(elements, lastState) {
  var result = [];
  forEach(elements, function(element) {
    element.hidden = lastState[element.id];

    result = result.concat(element);

    if (element.children) {
      result = result.concat(restoreVisibilityRecursive(element.children, lastState));
    }
  });

  return result;
}
