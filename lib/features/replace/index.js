import Replace from './Replace.js';
import ReplaceSelectionBehavior from './ReplaceSelectionBehavior.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'replace', 'replaceSelectionBehavior' ],
  replaceSelectionBehavior: [ 'type', ReplaceSelectionBehavior ],
  replace: [ 'type', Replace ]
};