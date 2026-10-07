import { expect } from 'chai';
import { Injector } from 'didi';
import sinon from 'sinon';

import BaseRenderer from '../../../lib/draw/BaseRenderer.js';


describe('draw/BaseRenderer', function() {

  it('should declare minification-safe injection and accept a local priority', function() {

    // given
    const listeners = [];
    const eventBus = {
      on: (...args) => listeners.push(args)
    };
    const injector = new Injector([ { eventBus: [ 'value', eventBus ] } ]);
    const renderer = Object.create(BaseRenderer.prototype);

    // when
    injector.invoke(BaseRenderer, renderer, { renderPriority: 9001 });

    // then
    expect(BaseRenderer.$inject).to.eql([ 'eventBus', 'renderPriority' ]);
    expect(listeners).to.have.length(2);
    expect(listeners[0][1]).to.equal(9001);
    expect(listeners[1][1]).to.equal(9001);
  });

  it('should preserve the default priority when called directly', function() {

    // given
    const eventBus = { on: sinon.spy() };
    const renderer = Object.create(BaseRenderer.prototype);

    // when
    BaseRenderer.call(renderer, eventBus);

    // then
    expect(eventBus.on.callCount).to.equal(2);
    expect(eventBus.on.firstCall.args[1]).to.equal(1000);
    expect(eventBus.on.secondCall.args[1]).to.equal(1000);
  });

});
