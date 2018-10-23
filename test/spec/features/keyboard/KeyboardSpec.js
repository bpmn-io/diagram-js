/* global sinon */

import TestContainer from 'mocha-test-container-support';
import {
  assign
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import keyboardModule from 'lib/features/keyboard';

import {
  bootstrapDiagram,
  DomMocking,
  inject
} from 'test/TestHelper';
import { createKeyEvent } from 'test/util/KeyEvents';


describe('features/keyboard', function() {

  var TEST_KEY = 99;

  var defaultDiagramConfig = {
    modules: [
      modelingModule,
      keyboardModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  it('should bootstrap diagram with keyboard', inject(function(keyboard) {
    expect(keyboard).to.exist;
  }));


  describe('keyboard binding', function() {

    var keyboardConfig = {
      keyboard: {
        bindTo: document
      }
    };

    beforeEach(bootstrapDiagram(assign(defaultDiagramConfig, keyboardConfig)));


    it('should integrate with <attach> + <detach> events', inject(
      function(keyboard, eventBus) {

        // assume
        expect(keyboard._node).not.to.exist;

        // when
        eventBus.fire('attach');
        expect(keyboard._node).to.eql(document);

        // but when
        eventBus.fire('detach');
        expect(keyboard._node).not.to.exist;
      }
    ));

  });


  describe('keydown event listener handling', function() {

    beforeEach(function() {
      DomMocking.install();
    });

    var testDiv;

    beforeEach(function() {

      var testContainer = TestContainer.get(this);

      testDiv = document.createElement('div');
      testDiv.setAttribute('class', 'testClass');
      testContainer.appendChild(testDiv);
    });

    afterEach(function() {
      DomMocking.uninstall();
    });


    it('should bind keyboard events to node', inject(function(keyboard) {
      // Actually three listeners are set
      var STANDARD_LISTENER_COUNT = 1;

      keyboard.bind(testDiv);

      expect(testDiv.$$listenerCount).to.equal(STANDARD_LISTENER_COUNT);
    }));


    it('should unbind keyboard events to node', inject(function(keyboard) {

      keyboard.bind(testDiv);
      keyboard.unbind();

      expect(testDiv.$$listenerCount).to.equal(0);
    }));


    it('should not fail to execute unbind if bins was not called before', inject(function(keyboard) {
      keyboard.unbind();
    }));


    it('should return node', inject(function(keyboard) {

      keyboard.bind(testDiv);
      var binding = keyboard.getBinding();

      expect(binding).to.equal(testDiv);
    }));


    it('should not fire event if target is input field', inject(function(keyboard, eventBus) {

      // given
      var eventBusSpy = sinon.spy(eventBus, 'fire');

      var inputField = document.createElement('input');
      testDiv.appendChild(inputField);

      var event = createKeyEvent(TEST_KEY, {}, inputField);

      // when
      keyboard._keyHandler(event);

      // then
      expect(eventBusSpy).to.not.be.called;

    }));

  });


  describe('add listener', function() {

    it('should handle listeners by priority', inject(function(keyboard) {

      // given
      var lowerPrioritySpy = sinon.spy();
      var higherPrioritySpy = sinon.stub().returns(true);

      keyboard.addListener(500, lowerPrioritySpy);
      keyboard.addListener(1000, higherPrioritySpy);

      var event = createKeyEvent(TEST_KEY);

      // when
      keyboard._keyHandler(event);

      // then
      expect(higherPrioritySpy).to.be.called;
      expect(lowerPrioritySpy).to.not.be.called;

    }));


    it('should invoke listener of lower priority if key was not handled', inject(function(keyboard) {

      // given
      var lowerPrioritySpy = sinon.spy();
      var higherPrioritySpy = sinon.spy();

      keyboard.addListener(500, lowerPrioritySpy);
      keyboard.addListener(1000, higherPrioritySpy);

      var event = createKeyEvent(TEST_KEY);

      // when
      keyboard._keyHandler(event);

      // then
      expect(higherPrioritySpy).to.be.called;
      expect(lowerPrioritySpy).to.be.called;

    }));


    it('should allow to add event listener by passing bare function', inject(function(keyboard) {

      // given
      var keyboardEventSpy = sinon.spy();

      keyboard.addListener(keyboardEventSpy);

      var event = createKeyEvent(TEST_KEY);

      // when
      keyboard._keyHandler(event);

      // then
      expect(keyboardEventSpy).to.be.called;

    }));


    it('should prevent default if listener returned true', inject(function(keyboard) {

      // given
      var keyboardEventStub = sinon.stub().returns(true);

      keyboard.addListener(keyboardEventStub);

      var event = createKeyEvent(TEST_KEY);

      // when
      keyboard._keyHandler(event);

      // then
      expect(keyboardEventStub).to.be.called;
      expect(event.defaultPrevented).to.be.true;

    }));

  });

});
