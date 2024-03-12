/* eslint-env node */

var path = require('path');

var coverage = process.env.COVERAGE;

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

var absoluteBasePath = path.resolve(__dirname);

var suite = coverage ? 'test/coverageBundle.js' : 'test/testBundle.js';


module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'sinon-chai',
      'webpack'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [suite]: [ 'webpack' ]
    },

    reporters: [ 'progress' ].concat(coverage ? 'coverage' : []),

    browsers,

    browserNoActivityTimeout: 30000,

    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' }
      ]
    },

    autoWatch: false,
    singleRun: true,

    webpack: {
      mode: 'development',
      target: 'browserslist:last 2 versions, IE 11',
      module: {
        rules: [
          {
            test: /TestHelper/,
            sideEffects: true
          },
          {
            test: /\.css$/,
            type: 'asset/source'
          },
          {
            test: /\.png$/,
            type: 'asset/resource'
          }
        ].concat(
          coverage ? {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: [
                  [ 'istanbul', {
                    include: [
                      'lib/**'
                    ]
                  } ]
                ],
              }
            }
          } : []
        )
      },
      resolve: {
        mainFields: [
          'dev:module',
          'module',
          'main'
        ],
        modules: [
          'node_modules',
          absoluteBasePath
        ]
      },
      devtool: 'eval-source-map'
    }
  });
};
