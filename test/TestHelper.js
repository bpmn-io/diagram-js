export * from 'diagram-js/test/helper/index.js';

import {
  insertCSS
} from 'diagram-js/test/helper/index.js';

import diagramCSS from 'diagram-js/assets/diagram-js.css';

insertCSS('diagram-js.css', diagramCSS);

insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-content-container { height: 90vh; }'
);


import BoundsMatchers from 'diagram-js/test/matchers/BoundsMatchers.js';
import ConnectionMatchers from 'diagram-js/test/matchers/ConnectionMatchers.js';

/* global chai */

// add suite specific matchers
chai.use(BoundsMatchers);
chai.use(ConnectionMatchers);
