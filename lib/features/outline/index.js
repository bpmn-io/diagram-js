import SelectionModule from '../selection';

import Outline from './Outline';
import MultiSelectionOutline from './MultiSelectionOutline';


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