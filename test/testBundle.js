/* global require */

import './globals';

var allTests = require.context('.', true, /Spec\.js$/);

allTests.keys().forEach(allTests);