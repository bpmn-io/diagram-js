// eslint-disable-next-line spaced-comment
/// <reference types="webpack/module.d.ts" />

const allTests = import.meta.webpackContext('.', {
  recursive: true,
  regExp: /Spec\.js$/
});

allTests.keys().forEach(allTests);

var allSources = import.meta.webpackContext('../lib', {
  recursive: true,
  regExp: /.*\.js$/
});

allSources.keys().forEach(allSources);