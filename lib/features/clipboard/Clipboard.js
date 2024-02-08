export default Clipboard;

/**
 * A clip board stub
 */
export function Clipboard() {}


Clipboard.prototype.get = function() {
  return this._data;
};

Clipboard.prototype.set = function(data) {
  this._data = data;
};

Clipboard.prototype.clear = function() {
  var data = this._data;

  delete this._data;

  return data;
};

Clipboard.prototype.isEmpty = function() {
  return !this._data;
};