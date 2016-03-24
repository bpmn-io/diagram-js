module.exports = {
  __depends__: [
    require('../rules')
  ],
  __init__: [ 'attachSupport' ],
  attachSupport: [ 'type', require('./AttachSupport') ]
};
