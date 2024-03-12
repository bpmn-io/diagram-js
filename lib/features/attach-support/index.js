import RulesModule from '../rules/index.js';

import AttachSupport from './AttachSupport.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    RulesModule
  ],
  __init__: [ 'attachSupport' ],
  attachSupport: [ 'type', AttachSupport ]
};
