import keyboardModule from 'lib/features/keyboard';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import { createKeyEvent } from 'test/util/KeyEvents';


describe('features/keyboard', function() {

  var TEST_KEY = 'Numpad3';

  beforeEach(bootstrapDiagram({
    modules: [
      keyboardModule
    ]
  }));


  it('should bootstrap diagram with keyboard', inject(function(keyboard) {
    expect(keyboard).to.exist;
  }));


  describe('keydown event listener handling', function() {

    it('should bind keyboard events', inject(function(keyboard) {

      // given
      var keyHandlerSpy = sinon.spy(keyboard, '_keyHandler');

      // when
      keyboard.bind();

      // then
      var node = keyboard.getBinding();

      expect(node).to.exist;

      // but when
      dispatchKeyboardEvent(node, 'keydown');

      // then
      expect(keyHandlerSpy).to.have.been.calledOnce;
    }));


    it('should unbind keyboard events to node', inject(function(keyboard) {

      // given
      var keyHandlerSpy = sinon.spy(keyboard, '_keyHandler');

      // when
      keyboard.bind();

      var node = keyboard.getBinding();

      keyboard.unbind();

      // then
      dispatchKeyboardEvent(node, 'keydown');

      expect(keyHandlerSpy).not.to.have.been.called;
    }));


    it('should unbind regardless of not being bound', inject(function(keyboard) {

      // when
      keyboard.unbind();
    }));


    it('should return node', inject(function(keyboard, canvas) {

      // given
      keyboard.bind();

      // when
      var binding = keyboard.getBinding();

      // then
      expect(binding).to.equal(canvas._svg);
    }));

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


describe('features/keyboard - <keyboard.bind=false> config', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      keyboardModule
    ],
    keyboard: {
      bind: false
    }
  }));


  it('should not bind initially', inject(
    function(keyboard) {

      // then
      expect(keyboard.getBinding()).not.to.exist;
    }
  ));

});


describe('features/keyboard - legacy', function() {

  var errorSpy;

  beforeEach(function() {
    errorSpy = sinon.spy(console, 'error');
  });

  afterEach(function() {
    errorSpy.restore();
  });

  function expectError(errorSpy, errorMessage) {
    expect(errorSpy).to.have.been.calledOnce;

    var args = errorSpy.args[0];

    expect(args).to.have.length(2);
    expect(args[0]).to.eql(errorMessage);
  }


  describe('keyboard.bindTo=document> config', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        keyboardModule
      ],
      keyboard: {
        bindTo: document.body
      }
    }));


    it('should bind but indicate error', inject(
      function(keyboard) {

        // then
        // binding happens regardless
        expect(keyboard.getBinding()).to.exist;
        expect(keyboard.getBinding()).not.to.equal(document.body);

        // error is indicated
        expectError(errorSpy, 'unsupported configuration <keyboard.bindTo>');
      }
    ));

  });


  describe('keyboard.bind(Element)', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        keyboardModule
      ]
    }));


    it('should bind but indicate error', inject(
      function(keyboard) {

        // when
        keyboard.bind(document.body);

        // then
        // binding happens regardless
        expect(keyboard.getBinding()).to.exist;

        // error is indicated
        expectError(errorSpy, 'unsupported argument <node>');
      }
    ));

  });

});



// helpers //////////

function dispatchKeyboardEvent(target, type) {
  var event = createKeyEvent('KeyA', { type });

  target.dispatchEvent(event);
}
