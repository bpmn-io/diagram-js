import Selection from './Selection.js';
import SelectionVisuals from './SelectionVisuals.js';
import SelectionBehavior from './SelectionBehavior.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'selectionVisuals', 'selectionBehavior' ],
  selection: [ 'type', Selection ],
  selectionVisuals: [ 'type', SelectionVisuals ],
  selectionBehavior: [ 'type', SelectionBehavior ]
};
