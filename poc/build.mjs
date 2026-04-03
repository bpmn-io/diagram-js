import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const webpack = require('webpack');
const config  = require('./webpack.config.js');

webpack(config, (err, stats) => {
  if (err) { console.error(err); process.exit(1); }
  if (stats.hasErrors()) { console.error(stats.toString('errors-only')); process.exit(1); }
  console.log(stats.toString({ colors: true, assets: true, timings: true }));
});
