/**
 * @param {string} str
 *
 * @return {string}
 */
export function escapeCSS(str) {
  return CSS.escape(str);
}

var HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
};

/**
 * @param {string} str
 *
 * @return {string}
 */
export function escapeHTML(str) {
  str = '' + str;

  return str && str.replace(/[&<>"']/g, function(match) {
    return HTML_ESCAPE_MAP[match];
  });
}
