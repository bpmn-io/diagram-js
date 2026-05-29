/* global require */

import './globals.js';

var allTests = require.context('.', true, /Spec\.js$/);

allTests.keys().forEach(allTests);