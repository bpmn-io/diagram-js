import DefaultRenderer from './DefaultRenderer';
import Styles from './Styles';
import TextLayouter from './TextLayouter';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'defaultRenderer' ],
  defaultRenderer: [ 'type', DefaultRenderer ],
  styles: [ 'type', Styles ],
  textLayouter: [ 'type', TextLayouter ]
};
