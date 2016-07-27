'use strict';

/* global bootstrapDiagram, inject, sinon */

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - readOnly', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));

  it('should emit readOnly.changed when activating', inject(function (modeling, eventBus) {
    var fire = sinon.spy(eventBus, 'fire');

    // when
    var actual = modeling.readOnly(true);

    // then
    expect(actual).to.be.true;
    expect(fire).to.have.been.calledOnce;
    expect(fire).to.have.been.calledWith('readOnly.changed', { readOnly: true });
  }));

  it('should emit readOnly.changed when de-activating', inject(function (modeling, eventBus) {
    var fire = sinon.spy(eventBus, 'fire');

    // given
    modeling.readOnly(true);
    fire.reset();

    // when
    var actual = modeling.readOnly(false);

    // then
    expect(actual).to.be.false;
    expect(fire).to.have.been.calledOnce;
    expect(fire).to.have.been.calledWith('readOnly.changed', { readOnly: false });
  }));

  it('should NOT emit readOnly.changed when called without arguments', inject(function (modeling, eventBus) {
    var fire = sinon.spy(eventBus, 'fire');

    // when
    modeling.readOnly();

    // then
    expect(fire).to.not.have.been.called;
  }));

  it('should return false by default', inject(function (modeling) {
    // when
    // then
    expect(modeling.readOnly()).to.be.false;
  }));

  it('should return true when activated', inject(function (modeling) {
    // when
    modeling.readOnly(true);

    // then
    expect(modeling.readOnly()).to.be.true;
  }));

});
