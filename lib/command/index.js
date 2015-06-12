module.exports = {
  __depends__: [ require('../core/EventBus') ],
  commandStack: [ 'type', require('./CommandStack') ]
};
