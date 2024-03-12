import DefaultRenderer from './DefaultRenderer.js';
import Styles from './Styles.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'defaultRenderer' ],
  defaultRenderer: [ 'type', DefaultRenderer ],
  styles: [ 'type', Styles ]
};
