


export default function Scheduler(eventBus) {
  this._eventBus = eventBus;
  this._queue = new PriorityQueue();
  this._waiting = 0;
}

var MAX_CONCURENCY = 15;
var MAX_PRIORITY = Infinity;

Scheduler.prototype.schedule = function(fn, priority = 0, id) {
  this._queue.add(fn, priority, id);
  this._tick();
};

Scheduler.prototype.executeNow = function(id) {
  var item = this._queue.remove(id);

  if (item) {
    this._queue.add(item, MAX_PRIORITY, id);
  }
};

Scheduler.prototype._tick = function() {
  if (this._waiting >= MAX_CONCURENCY) {
    return;
  }

  var fn = this._queue.next();

  if (!fn) {
    return;
  }


  this._waiting++;
  window.setTimeout(() => {
    fn();
    this._waiting--;
    this._tick();
  }, 0);

};


Scheduler.$inject = [ 'eventBus' ];


class PriorityQueue {
  constructor() {
    this._queue = [];
  }

  add(fn, priority, id) {

    // FIFO for same priority
    var index = this._queue.findIndex(item => item.priority < priority);

    if (index === -1) {
      this._queue.push({
        fn: fn,
        priority: priority,
        id: id
      });
    } else {
      this._queue.splice(index, 0, {
        fn,
        priority,
        id: id
      });
    }
  }

  remove(id) {
    var index = this._queue.findIndex(item => item.id === id);

    if (index !== -1) {
      return this._queue.splice(index, 1)[0].fn;
    }
  }

  next() {
    var item = this._queue.shift();
    return item && item.fn;
  }
}