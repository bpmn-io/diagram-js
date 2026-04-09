import DefaultRenderer from './DefaultRenderer';
import Styles from './Styles';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'defaultRenderer' ],
  defaultRenderer: [ 'type', DefaultRenderer ],
  styles: [ 'type', Styles ]
};
