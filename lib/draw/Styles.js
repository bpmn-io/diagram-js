import {
  isArray,
  assign,
  reduce
} from 'min-dash';


/**
 * A component that manages shape styles
 */
export default function Styles() {

  var defaultTraits = {

    'no-fill': {
      fill: 'none'
    },
    'no-border': {
      strokeOpacity: 0.0
    },
    'no-events': {
      pointerEvents: 'none'
    }
  };

  var self = this;

  /**
   * Builds a style definition from a className, a list of traits and an object
   * of additional attributes.
   *
   * @param {string} className
   * @param {string[]} [traits]
   * @param {Object} [additionalAttrs]
   *
   * @return {Object} the style definition
   */
  this.cls = function(className, traits, additionalAttrs) {
    var attrs = this.style(traits, additionalAttrs);

    return assign(attrs, { 'class': className });
  };

  /**
   * Builds a style definition from a list of traits and an object of additional
   * attributes.
   *
   * @param {string[]} [traits]
   * @param {Object} additionalAttrs
   *
   * @return {Object} the style definition
   */
  this.style = function(traits, additionalAttrs) {

    if (!isArray(traits) && !additionalAttrs) {
      additionalAttrs = traits;
      traits = [];
    }

    var attrs = reduce(traits, function(attrs, t) {
      return assign(attrs, defaultTraits[t] || {});
    }, {});

    return additionalAttrs ? assign(attrs, additionalAttrs) : attrs;
  };


  /**
   * Computes a style definition from a list of traits and an object of
   * additional attributes, with custom style definition object.
   *
   * @param {Object} custom
   * @param {string[]} [traits]
   * @param {Object} defaultStyles
   *
   * @return {Object} the style definition
   */
  this.computeStyle = function(custom, traits, defaultStyles) {
    if (!isArray(traits)) {
      defaultStyles = traits;
      traits = [];
    }

    return self.style(traits || [], assign({}, defaultStyles, custom || {}));
  };
}
