import RulesModule from 'diagram-js/lib/features/rules';

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
