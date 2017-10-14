'use strict';

var path = require('path');

var basePath = '../../';

var absoluteBasePath = path.resolve(path.join(__dirname, basePath));

/* global process */

// configures browsers to run test against
// any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
var browsers =
  (process.env.TEST_BROWSERS || 'PhantomJS')
    .replace(/^\s+|\s+$/, '')
    .split(/\s*,\s*/g);


module.exports = function(karma) {
  karma.set({

    basePath: basePath,

    frameworks: [
      'browserify',
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/**/*Spec.js'
    ],

    preprocessors: {
      'test/**/*Spec.js': [ 'browserify' ]
    },

    reporters: [ 'spec' ],

    browsers: browsers,

    browserNoActivityTimeout: 30000,

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      paths: [ absoluteBasePath ],
      transform: [ 'brfs' ]
    }
  });
};
