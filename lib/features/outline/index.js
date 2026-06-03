import SelectionModule from 'diagram-js/lib/features/selection';

import Outline from './Outline.js';
import MultiSelectionOutline from './MultiSelectionOutline.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    SelectionModule
  ],
  __init__: [ 'outline', 'multiSelectionOutline' ],
  outline: [ 'type', Outline ],
  multiSelectionOutline: [ 'type', MultiSelectionOutline ]
};