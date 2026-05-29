export * from './helper/index.js';

import {
  insertCSS
} from './helper/index.js';

import diagramCSS from '../assets/diagram-js.css';

insertCSS('diagram-js.css', diagramCSS);

insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-content-container { height: 90vh; }'
);
