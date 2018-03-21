var isObject = require('min-dash').isObject,
    forEach = require('min-dash').forEach,
    assign = require('min-dash').assign;

module.exports = function merge(target) {
  var sources = [].slice.call(arguments, 1);
  if (!sources.length) return target;
  var source = sources.shift();

  if (isObject(target) && isObject(source)) {
    forEach(source, function(val, key) {
      if (isObject(source[key])) {
        if (!target[key]) target[key] = {};
        merge(target[key], source[key]);
      } else {
        var tmp = {};
        tmp[key] = source[key];
        assign(target, tmp);
      }
    });
  }

  return merge.apply(this, [target].concat(sources));
};
