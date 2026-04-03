var path = require('path');

var absoluteBasePath = path.resolve(__dirname, '..');

module.exports = {
  mode: 'development',
  entry: {
    bundle:  './poc/benchmark.js',
    sandbox: './poc/sandbox.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    mainFields: [ 'dev:module', 'module', 'main' ],
    modules: [
      'node_modules',
      absoluteBasePath,
    ],
  },
  devtool: 'eval-source-map',
};
