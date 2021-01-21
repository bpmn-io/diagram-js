import EventBus from 'lib/core/EventBus';


describe('core/EventBus', function() {

  var eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  describe('basic behavior', function() {

    it('should fire listener', function() {

      // given
      var listener = sinon.spy();

      eventBus.on('foo', listener);

      // when
      eventBus.fire('foo', {});

      // then
      expect(listener).to.have.been.called;
    });


    it('should fire typed listener', function() {

      // given
      var listener = sinon.spy();

      eventBus.on('foo', listener);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener).to.have.been.called;
    });


    it('should fire native event', function() {

      // given
      var event = eventBus.createEvent({
        type: 'foo',
        bar: [ 1 ]
      });

      var listener = sinon.spy(function(e) {
        expect(e).to.equal(event);

        expect(e.bar).to.eql([ 1 ]);
      });

      eventBus.on('foo', listener);

      // when
      eventBus.fire(event);

      // then
      expect(listener).to.have.been.called;
    });


    it('should register multiple', function() {

      // given
      var listener = sinon.spy();

      eventBus.on([ 'foo', 'foo' ], listener);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener).to.have.been.calledTwice;
    });


    it('should stopPropagation', function() {

      // given
      var listener1 = sinon.spy(function(event) {
        event.stopPropagation();
      });

      var listener2 = sinon.spy();

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).to.have.been.called;
      expect(listener2).not.to.have.been.called;
    });


    it('should fire event by name', function() {

      // given
      var listener = sinon.spy();

      // when
      eventBus.on('foo', listener);
      eventBus.fire('foo');

      expect(listener).to.have.been.called;
    });

  });


  describe('multiple events', function() {

    it('should register to multiple events', function() {

      // given
      var listener1 = sinon.spy();

      eventBus.on([ 'foo', 'bar' ], listener1);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).to.have.been.called;
    });


    it('should remove multiple listeners', function() {

      // given
      var listener1 = sinon.spy();

      eventBus.on([ 'foo', 'bar' ], listener1);
      eventBus.off([ 'foo', 'bar' ], listener1);

      // when
      eventBus.fire({ type: 'foo' });
      eventBus.fire({ type: 'bar' });

      // then
      expect(listener1).not.to.have.been.called;
    });

  });


  describe('once listeners', function() {

    it('should call only once', function() {

      // given
      var listener = sinon.spy();

      // when
      eventBus.once('onceEvent', listener);
      eventBus.fire('onceEvent', { value: 'a' });

      // then
      expect(listener).to.have.been.calledOnce;

      // but when...
      eventBus.fire('onceEvent');

      // then
      // still only called once
      expect(listener).to.have.been.calledOnce;

      // but when...
      // emitting with re-registered listener
      eventBus.once('onceEvent', listener);
      eventBus.fire('onceEvent');

      // then
      // should be fired again
      expect(listener).to.have.been.calledTwice;
    });


    it('should call next after once listener', function() {

      // given
      var listenerBefore = sinon.spy();
      var listenerOnce = sinon.spy();
      var listenerAfter = sinon.spy();

      eventBus.on('foo', listenerBefore);
      eventBus.once('foo', listenerOnce);
      eventBus.on('foo', listenerAfter);

      // when
      eventBus.fire('foo');

      // then
      expect(listenerBefore).to.have.been.calledOnce;
      expect(listenerOnce).to.have.been.calledOnce;
      expect(listenerAfter).to.have.been.calledOnce;

      // but when...
      eventBus.fire('foo');

      // then
      // still only called once
      expect(listenerOnce).to.have.been.calledOnce;

      // should be called again
      expect(listenerBefore).to.have.been.calledTwice;
      expect(listenerAfter).to.have.been.calledTwice;
    });


    it('should ignore once listener in loop', function() {

      // given
      var listener = sinon.spy(function() {
        eventBus.fire('onceEvent');
      });

      eventBus.once('onceEvent', listener);

      // when
      eventBus.fire('onceEvent');

      // then
      expect(listener).to.have.been.calledOnce;
    });

  });


  describe('return value', function() {

    it('should be undefined if no listeners', function() {

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).not.to.exist;
    });


    it('should be undefined on event if no listeners', function() {

      // given
      var event = eventBus.createEvent();

      event.init({ type: 'foo' });

      // when
      eventBus.fire(event);

      // then
      expect(event).not.to.have.property('returnValue');
    });


    it('should be true with non-acting listener', function() {

      // given
      eventBus.on('foo', function(event) { });

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).not.to.exist;
    });


    it('should be false with listener preventing event default', function() {

      // given
      eventBus.on('foo', function(event) {
        event.preventDefault();
      });

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).to.be.false;
    });


    it('should be undefined with listener stopping propagation', function() {

      // given
      eventBus.on('foo', function(event) {
        event.stopPropagation();
      });

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).not.to.exist;
    });

  });


  describe('passing context', function() {
    function Dog() {}

    Dog.prototype.bark = function(msg) {
      return msg || 'WOOF WOOF';
    };

    it('should pass context to listener', function() {

      // given
      Dog.prototype.bindListener = function() {

        eventBus.on('bark', function(event) {
          return this.bark();
        }, this);
      };

      var bobby = new Dog();

      bobby.bindListener();

      // when
      var returnValue = eventBus.fire('bark');

      // then
      expect(returnValue).to.equal('WOOF WOOF');
    });


    it('should pass context to listener and provide priority', function() {

      // given
      Dog.prototype.bindListener = function(priority, msg) {
        eventBus.on('bark', priority, function(event) {
          return this.bark(msg);
        }, this);
      };

      var bobby = new Dog();
      var bull = new Dog();

      bobby.bindListener(1000);
      bull.bindListener(1500, 'BOO');

      // when
      var returnValue = eventBus.fire('bark');

      // then
      expect(returnValue).to.equal('BOO');
    });


    it('should pass context to listener and provide priority -> once', function() {

      // given
      Dog.prototype.bindListener = function(priority, msg) {
        eventBus.once('bark', priority, function(event) {
          return this.bark(msg);
        }, this);
      };

      var bobby = new Dog();
      var bull = new Dog();

      eventBus.once('bark', function(event) {
        return this.bark('FOO');
      }, bobby);

      bull.bindListener(1500, 'BOO');

      // when
      var returnA = eventBus.fire('bark');
      var returnB = eventBus.fire('bark');
      var returnC = eventBus.fire('bark');

      // then
      expect(returnA).to.equal('BOO');
      expect(returnB).to.equal('FOO');
      expect(returnC).not.to.exist;
    });


    it('should fire only once', function() {

      // given
      Dog.prototype.barks = [];

      Dog.prototype.bindListener = function() {
        eventBus.once('bark', function(event) {
          this.barks.push('WOOF WOOF');
        }, this);
      };

      var bobby = new Dog();

      bobby.bindListener();

      // when
      eventBus.fire('bark'),
      eventBus.fire('bark');

      // then
      expect(bobby.barks).to.have.length(1);
    });

  });


  describe('returning custom value in listener', function() {

    it('should pass through', function() {

      // given
      var result = {};

      eventBus.on('foo', function(event) {
        return result;
      });

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).to.equal(result);
    });


    it('should stop propagation', function() {

      // given
      var result = {},
          otherResult = {};

      eventBus.on('foo', function(event) {
        return result;
      });

      eventBus.on('foo', function(event) {
        return otherResult;
      });

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).to.equal(result);
    });

  });


  describe('returning false in listener', function() {

    it('should set return value to false', function() {

      // given
      eventBus.on('foo', function(event) {
        return false;
      });

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).to.be.false;
    });


    it('should stop propagation to other listeners', function() {

      // given
      var listener1 = sinon.spy(function(event) {
        return false;
      });

      var listener2 = sinon.spy();

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      var returnValue = eventBus.fire('foo');

      // then
      expect(returnValue).to.be.false;

      expect(listener1).to.have.been.called;
      expect(listener2).not.to.have.been.called;
    });

  });


  describe('custom arguments', function() {

    it('should pass arguments', function() {

      var listenerArgs;

      function captureArgs() {
        listenerArgs = arguments;
      }

      eventBus.on('capture', captureArgs);

      // when
      eventBus.fire('capture', 1, 2, 3);

      // then
      expect(listenerArgs.length).to.eql(4);
      expect(listenerArgs[1]).to.eql(1);
      expect(listenerArgs[2]).to.eql(2);
      expect(listenerArgs[3]).to.eql(3);
    });

  });


  describe('removing listeners', function() {

    it('should remove listeners by event type', function() {

      // given
      var listener1 = sinon.spy();
      var listener2 = sinon.spy();

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo');
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).not.to.have.been.called;
      expect(listener2).not.to.have.been.called;
    });


    it('should remove listener by callback', function() {

      // given
      var listener1 = sinon.spy();
      var listener2 = sinon.spy();

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo', listener1);
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).not.to.have.been.called;
      expect(listener2).to.have.been.called;
    });


    it('should remove once listener by callback', function() {

      // given
      var listener1 = sinon.spy();
      var listener2 = sinon.spy();

      eventBus.once('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo', listener1);
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).not.to.have.been.called;
      expect(listener2).to.have.been.called;
    });


    it('should remove bound listener by callback', function() {

      // given
      var self = {};

      var listener1 = sinon.spy();
      var listener2 = sinon.spy();

      eventBus.on('foo', listener1, self);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo', listener1);
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).not.to.have.been.called;
      expect(listener2).to.have.been.called;
    });


    it('should remove bound once listener by callback', function() {

      // given
      var self = {};

      var listener1 = sinon.spy();
      var listener2 = sinon.spy();

      eventBus.once('foo', listener1, self);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo', listener1);
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).not.to.have.been.called;
      expect(listener2).to.have.been.called;
    });


    it('should not call listener removed in previous listener\'s callback', function() {

      // given
      var eventName = 'foo';

      var listener1,
          listener2 = sinon.spy();

      listener1 = sinon.spy(function() {
        eventBus.off(eventName, listener2);
        eventBus.off(eventName, listener1);
      });

      eventBus.on(eventName, listener1);
      eventBus.on(eventName, listener2);

      // when
      eventBus.fire({ type: eventName });

      // then
      expect(listener1).to.be.calledOnce;
      expect(listener2).to.have.not.been.called;

      // when
      listener1.resetHistory();
      listener2.resetHistory();

      eventBus.fire({ type: eventName });

      // then
      expect(listener1).to.have.not.been.called;
      expect(listener2).to.have.not.been.called;
    });

  });


  describe('adding listener during <emit>', function() {

    it('should call lower priority listener', function() {

      // given
      var listenerAdded = sinon.spy();

      var listenerOnce = sinon.spy(function() {
        eventBus.once('foo', 500, listenerAdded);
      });

      eventBus.once('foo', listenerOnce);

      // when
      eventBus.fire('foo');

      // then
      expect(listenerOnce).to.have.been.calledOnce;
      expect(listenerAdded).to.have.been.calledOnce;

      // but when...
      eventBus.fire('foo');

      // then
      // still only called once
      expect(listenerOnce).to.have.been.calledOnce;
      expect(listenerAdded).to.have.been.calledOnce;
    });


    it('should NOT call higher priority listener', function() {

      // given
      var listenerAdded = sinon.spy();

      var listenerOnce = sinon.spy(function() {
        eventBus.once('foo', 5000, listenerAdded);
      });

      eventBus.once('foo', listenerOnce);

      // when
      eventBus.fire('foo');

      // then
      expect(listenerOnce).to.have.been.calledOnce;
      expect(listenerAdded).not.to.have.been.called;

      // but when...
      eventBus.fire('foo');

      // then
      // still only called once
      expect(listenerOnce).to.have.been.calledOnce;

      // called once now, too
      expect(listenerAdded).to.have.been.calledOnce;
    });


    it('should call same priority listener', function() {

      // given
      var listenerAdded = sinon.spy();

      var listenerOnce = sinon.spy(function() {
        eventBus.once('foo', listenerAdded);
      });

      eventBus.once('foo', listenerOnce);

      // when
      eventBus.fire('foo');

      // then
      expect(listenerOnce).to.have.been.calledOnce;
      expect(listenerAdded).to.have.been.calledOnce;
    });

  });


  describe('error handling', function() {

    it('should propagate error via <error> event', function() {

      // given
      var errorListener = sinon.spy();
      var failingListener = function() {
        throw new Error('expected failure');
      };

      // when
      eventBus.on('error', errorListener);
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).to.throw('expected failure');

      expect(errorListener).to.have.been.called;
    });


    it('should handle error in <error> event listener', function() {

      // given
      function errorListener(e) {
        e.preventDefault();
      }

      function failingListener() {
        throw new Error('expected failure');
      }

      // when
      eventBus.on('error', errorListener);
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).not.to.throw();
    });


    it('should throw error without <error> event listener', function() {

      // given
      function failingListener() {
        throw new Error('expected failure');
      }

      // when
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).to.throw('expected failure');
    });

  });


  describe('event priorities', function() {

    var listener1,
        listener2,
        listener3,
        listenerStopPropagation;


    beforeEach(function() {

      listener1 = function(e) {
        if (e.data.value === 'C') {
          e.data.value = 'Target State';
        } else {
          e.data.value = '';
        }
      };

      listener2 = function(e) {
        if (e.data.value === 'A') {
          e.data.value = 'B';
        } else {
          e.data.value = '';
        }
      };

      listener3 = function(e) {
        if (e.data.value === 'B') {
          e.data.value = 'C';
        } else {
          e.data.value = '';
        }
      };

      listenerStopPropagation = function(e) {
        if (e.data.value === 'B') {
          e.data.value = 'C';
          e.stopPropagation();
        } else {
          e.data.value = '';
        }
      };

    });


    it('should fire highes priority first', function() {

      // setup
      eventBus.on('foo', 100, listener1);
      eventBus.on('foo', 500, listener2);
      eventBus.on('foo', 200, listener3);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      expect(param.data.value).to.equal('Target State');
    });


    it('should fire highest first (independent from registration order)', function() {

      // setup
      eventBus.on('foo', 200, listener3);
      eventBus.on('foo', 100, listener1);
      eventBus.on('foo', 500, listener2);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      expect(param.data.value).to.equal('Target State');
    });


    it('should fire same priority in registration order', function() {

      // setup
      eventBus.on('foo', 100, listener3);
      eventBus.on('foo', 100, listener2);
      eventBus.on('foo', 100, listener1);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);
    });


    it('should stop propagation to lower priority handlers', function() {

      // setup
      eventBus.on('foo', 200, listenerStopPropagation);
      eventBus.on('foo', 100, listener1);
      eventBus.on('foo', 500, listener2);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      // After second listener propagation should be stopped
      // listener1 should not be fired.
      expect(param.data.value).to.equal('C');
    });


    it('should default to 1000 if non is specified', function() {

      // setup
      eventBus.on('foo', listener3); // should use default of 1000
      eventBus.on('foo', 500, listener1);
      eventBus.on('foo', 5000, listener2);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      // After second listener propagation should be stopped
      // listener1 should not be fired.
      expect(param.data.value).to.equal('Target State');
    });

  });

});
