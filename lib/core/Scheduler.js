


export default function Scheduler(eventBus) {
  this._eventBus = eventBus;
  this._scheduled = [];
  this.executing = false;
}

Scheduler.prototype.schedule = function(fn, priority, id) {

  // this._scheduled.push(fn);

  window.requestIdleCallback(fn);

  // !this.executing && this.executeNext();
};

Scheduler.prototype.executeNext = function() {
  this.executing = true;
  var fn = this._scheduled.shift();

  if (fn) {
    window.setTimeout(() => {
      fn();
      this.executeNext();
    }, 0);
  }
  else {
    this.executing = false;
  }
};


Scheduler.$inject = [ 'eventBus' ];
