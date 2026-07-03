import {
  assign
} from 'min-dash';

/**
 * Observe child DOM mutations on the given node while executing `fn` and
 * return an API to inspect which child nodes were touched (added and/or
 * removed) during the execution.
 *
 * Uses `MutationObserver#takeRecords` to collect changes synchronously, so it
 * can be used in tests without waiting for the observer callback to fire.
 *
 * @example
 *
 * ```javascript
 * var changes = recordChildChanges(container, function() {
 *   doSomething();
 * });
 *
 * expect(changes.touched(someChildNode)).to.be.false;
 * ```
 *
 * @param {Node} node the node to observe
 * @param {Function} fn the operation to execute while observing
 * @param {MutationObserverInit} [options] additional observer options; merged
 * with `{ childList: true }`
 *
 * @return {{ records: MutationRecord[], touched(node: Node): boolean }}
 */
export function recordChildChanges(node, fn, options) {
  var observer = new MutationObserver(function() {});

  observer.observe(node, assign({ childList: true }, options || {}));

  try {
    fn();
  } finally {
    var records = observer.takeRecords();

    observer.disconnect();
  }

  return {
    records: records,
    touched: function(target) {
      return records.some(function(record) {
        return includesNode(record.removedNodes, target)
          || includesNode(record.addedNodes, target);
      });
    }
  };
}


// helpers //////////

function includesNode(nodeList, node) {
  return Array.prototype.indexOf.call(nodeList, node) !== -1;
}
