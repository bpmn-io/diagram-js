const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    bundle: ['./app/app.js']
  },
  output: {
    path: __dirname + '/public',
    filename: 'app.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: '**/*', to: 'css', context: '../assets' },
      { from: '**/*.{html,css}', context: 'app' }
    ])
  ],
  mode: 'development',
  devtool: 'source-map'
};
