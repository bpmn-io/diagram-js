import {
  assign
} from 'min-dash';

import {
  getClosure
} from '../../../../util/Elements';


export default function MoveClosure() {

  this.allShapes = {};
  this.allConnections = {};

  this.enclosedElements = {};
  this.enclosedConnections = {};

  this.topLevel = {};
}


MoveClosure.prototype.add = function(element, isTopLevel) {
  return this.addAll([ element ], isTopLevel);
};


MoveClosure.prototype.addAll = function(elements, isTopLevel) {

  var newClosure = getClosure(elements, !!isTopLevel, this);

  assign(this, newClosure);

  return this;
};