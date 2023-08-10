import Selection from './Selection';
import SelectionBehavior from './SelectionBehavior';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [
    'selectionBehavior'
  ],
  selection: [ 'type', Selection ],
  selectionBehavior: [ 'type', SelectionBehavior ]
};
