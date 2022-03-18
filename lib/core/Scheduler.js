


export default function Scheduler(eventBus) {
  this._eventBus = eventBus;
  this._scheduled = new PriorityQueue();
  this.executing = false;
}

var MAX_PRIORITY = Infinity;

Scheduler.prototype.schedule = function(fn, priority = 0, id) {
  this._scheduled.add(fn, priority, id);
  !this.executing && this._executeNext();
};

Scheduler.prototype.executeNow = function(id) {
  var item = this._scheduled.remove(id);

  if (item) {
    this._scheduled.add(item, MAX_PRIORITY, id);
  }
};

Scheduler.prototype._executeNext = function() {
  this.executing = true;
  var fn = this._scheduled.next();

  if (fn) {
    window.setTimeout(() => {
      fn();
      this._executeNext();
    }, 0);
  }
  else {
    this.executing = false;
  }
};


Scheduler.$inject = [ 'eventBus' ];


class PriorityQueue {
  constructor() {
    this._queue = [];
  }

  add(fn, priority, id) {

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
    return this._queue.shift().fn;
  }
}