import './globals.js';

var allTests = import.meta.webpackContext('.', {
  recursive: true,
  regExp: /Spec\.js$/
});

allTests.keys().forEach(allTests);