export {
  default as escapeCSS
} from 'css.escape';

var HTML_ESCAPE_MAP = {
  '<': '&lt',
  '>': '&gt'
};

export function escapeHTML(str) {
  return str.replace(/[<>]/g, function(match) {
    return HTML_ESCAPE_MAP[match];
  });
}