import TestContainer from 'mocha-test-container-support';

import {
  assign
} from 'min-dash';

import {
  domify
} from 'min-dom';

import modelingModule from 'lib/features/modeling';
import keyboardModule from 'lib/features/keyboard';

import {
  bootstrapDiagram,
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

    var testDiv;

    beforeEach(function() {

      var testContainer = TestContainer.get(this);

      testDiv = document.createElement('div');
      testDiv.setAttribute('class', 'testClass');
      testContainer.appendChild(testDiv);
    });


    it('should bind keyboard events to node', inject(function(keyboard) {

      // given
      var keyHandlerSpy = sinon.spy(keyboard, '_keyHandler');

      // when
      keyboard.bind(testDiv);

      // then
      dispatchKeyboardEvent(testDiv, 'keydown');

      expect(keyHandlerSpy).to.have.been.called;
    }));


    it('should unbind keyboard events to node', inject(function(keyboard) {

      // given
      var keyHandlerSpy = sinon.spy(keyboard, '_keyHandler');

      keyboard.bind(testDiv);

      // when
      keyboard.unbind();

      // then
      dispatchKeyboardEvent(testDiv, 'keydown');

      expect(keyHandlerSpy).not.to.have.been.called;
    }));


    it('should unbind regardless of not being bound', inject(function(keyboard) {

      // when
      keyboard.unbind();
    }));


    it('should return node', inject(function(keyboard) {

      // given
      keyboard.bind(testDiv);

      // when
      var binding = keyboard.getBinding();

      // then
      expect(binding).to.equal(testDiv);
    }));


    it('should not fire non-modifier event if target is input field', inject(
      function(keyboard, eventBus) {

        // given
        var eventBusSpy = sinon.spy(eventBus, 'fire');

        var inputField = document.createElement('input');
        testDiv.appendChild(inputField);

        // when
        keyboard._keyHandler({ key: TEST_KEY, target: inputField });
        keyboard._keyHandler({ key: TEST_KEY, shiftKey: true, target: inputField });

        // then
        expect(eventBusSpy).to.not.be.called;
      })
    );


    it('should not fire modifier event if target is input field', inject(
      function(keyboard, eventBus) {

        // given
        var eventBusSpy = sinon.spy(eventBus, 'fire');

        var inputField = document.createElement('input');
        testDiv.appendChild(inputField);

        // when
        keyboard._keyHandler({ key: TEST_KEY, metaKey: true, target: inputField });
        keyboard._keyHandler({ key: TEST_KEY, ctrlKey: true, target: inputField });

        // then
        expect(eventBusSpy).to.not.be.called;
      })
    );


    describe('input-handle-modified-keys property', function() {

      it('should fire modifier event if requesting it', inject(
        function(keyboard, eventBus) {

          // given
          var eventBusSpy = sinon.spy(eventBus, 'fire');

          var inputField = domify('<input></input>');
          testDiv.appendChild(inputField);
          testDiv.setAttribute('input-handle-modified-keys', 'a');

          // when
          keyboard._keyHandler({ key: 'a', metaKey: true, target: inputField });
          keyboard._keyHandler({ key: 'a', ctrlKey: true, target: inputField });

          // then
          expect(eventBusSpy).to.have.been.calledTwice;
        })
      );


      it('should not fire modifier event if not requested', inject(
        function(keyboard, eventBus) {

          // given
          var eventBusSpy = sinon.spy(eventBus, 'fire');

          var inputField = domify('<input></input>');
          testDiv.appendChild(inputField);
          testDiv.setAttribute('input-handle-modified-keys', 'a');

          // when
          keyboard._keyHandler({ key: 'b', metaKey: true, target: inputField });
          keyboard._keyHandler({ key: 'b', ctrlKey: true, target: inputField });

          // then
          expect(eventBusSpy).to.not.be.called;
        })
      );


      it('should override handled keys', inject(
        function(keyboard, eventBus) {

          // given
          var eventBusSpy = sinon.spy(eventBus, 'fire');

          var inputField = domify('<input input-handle-modified-keys="b"></input>');
          testDiv.appendChild(inputField);
          testDiv.setAttribute('input-handle-modified-keys', 'a');

          // when
          keyboard._keyHandler({ key: 'a', metaKey: true, target: inputField });
          keyboard._keyHandler({ key: 'a', ctrlKey: true, target: inputField });

          // then
          expect(eventBusSpy).to.not.be.called;

          // when
          keyboard._keyHandler({ key: 'b', metaKey: true, target: inputField });
          keyboard._keyHandler({ key: 'b', ctrlKey: true, target: inputField });

          // then
          expect(eventBusSpy).to.have.been.calledTwice;
        })
      );


      it('should not fire modifier event if the requesting element is outside of binding', inject(
        function(keyboard, eventBus) {

          // given
          var inputContainer = domify('<div class="container"><input /></div>'),
              inputField = inputContainer.querySelector('input');

          testDiv.appendChild(inputContainer);
          testDiv.setAttribute('input-handle-modified-keys', 'a');

          keyboard.bind(inputContainer);

          var eventBusSpy = sinon.spy(eventBus, 'fire');

          // when
          keyboard._keyHandler({ key: 'a', metaKey: true, target: inputField });
          keyboard._keyHandler({ key: 'a', ctrlKey: true, target: inputField });

          // then
          expect(eventBusSpy).to.not.be.called;
        })
      );

    });

  });


  describe('add listener', function() {

    it('should add keydown listener by default', inject(function(keyboard) {

      // given
      var keydownSpy = sinon.spy();

      // when
      keyboard.addListener(keydownSpy);

      var event = createKeyEvent(TEST_KEY);

      keyboard._keydownHandler(event);

      // then
      expect(keydownSpy).to.have.been.called;
    }));


    it('should add keyup listener', inject(function(keyboard) {

      // given
      var keyupSpy = sinon.spy();

      // when
      keyboard.addListener(keyupSpy, 'keyboard.keyup');

      var event = createKeyEvent(TEST_KEY, { type: 'keyup' });

      keyboard._keyupHandler(event);

      // then
      expect(keyupSpy).to.have.been.called;
    }));


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


    it('should invoke listener of lower priority if key was not handled', inject(
      function(keyboard) {

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
      }
    ));


    it('should allow to add event listener by passing bare function', inject(
      function(keyboard) {

        // given
        var keyboardEventSpy = sinon.spy();

        keyboard.addListener(keyboardEventSpy);

        var event = createKeyEvent(TEST_KEY);

        // when
        keyboard._keyHandler(event);

        // then
        expect(keyboardEventSpy).to.be.called;
      }
    ));


    it('should prevent default if listener returned true', inject(
      function(keyboard) {

        // given
        var keyboardEventStub = sinon.stub().returns(true);

        keyboard.addListener(keyboardEventStub);

        var event = createKeyEvent(TEST_KEY);

        // when
        keyboard._keyHandler(event);

        // then
        expect(keyboardEventStub).to.be.called;

        expect(event.defaultPrevented).to.be.true;
      }
    ));

  });


  describe('remove listener', function() {

    it('should remove keydown listener by default', inject(function(keyboard) {

      // given
      var keydownSpy = sinon.spy();

      keyboard.addListener(keydownSpy);

      // when
      keyboard.removeListener(keydownSpy);

      // then
      var event = createKeyEvent(TEST_KEY);

      keyboard._keydownHandler(event);

      // then
      expect(keydownSpy).not.to.have.been.called;
    }));


    it('should remove keyup listener', inject(function(keyboard) {

      // given
      var keyupSpy = sinon.spy();

      keyboard.addListener(keyupSpy, 'keyboard.keyup');

      // when
      keyboard.removeListener(keyupSpy, 'keyboard.keyup');

      var event = createKeyEvent(TEST_KEY, { type: 'keyup' });

      keyboard._keyupHandler(event);

      // then
      expect(keyupSpy).not.to.have.been.called;
    }));

  });

});


// helpers //////////

function dispatchKeyboardEvent(target, type) {
  var event;

  try {
    event = new KeyboardEvent(type);
  } catch (e) {
    event = document.createEvent('KeyboardEvent');

    event.initEvent(type, true, false);
  }

  target.dispatchEvent(event);
}