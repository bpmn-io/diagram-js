import Replace from './Replace';
import ReplaceSelectionBehavior from './ReplaceSelectionBehavior';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'replace', 'replaceSelectionBehavior' ],
  replaceSelectionBehavior: [ 'type', ReplaceSelectionBehavior ],
  replace: [ 'type', Replace ]
};