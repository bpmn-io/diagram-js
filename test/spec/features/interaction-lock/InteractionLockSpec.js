import { expect } from 'chai';
import { spy } from 'sinon';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import interactionLockModule from 'lib/features/interaction-lock';
import interactionEventsModule from 'lib/features/interaction-events';
import editorActionsModule from 'lib/features/editor-actions';
import contextPadModule from 'lib/features/context-pad';
import modelingModule from 'lib/features/modeling';


describe('features/interaction-lock', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      interactionLockModule,
      interactionEventsModule,
      editorActionsModule,
      contextPadModule,
      modelingModule
    ]
  }));


  var rootShape,
      shape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape = elementFactory.createShape({
      id: 'shape1',
      x: 100, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape, rootShape);
  }));


  describe('#lock', function() {

    it('should set locked state', inject(function(interactionLock) {

      // when
      interactionLock.lock();

      // then
      expect(interactionLock.isLocked()).to.be.true;
    }));


    it('should add CSS class to container', inject(function(interactionLock, canvas) {

      // when
      interactionLock.lock();

      // then
      var container = canvas.getContainer();
      expect(container.classList.contains('djs-interaction-locked')).to.be.true;
    }));


    it('should fire interactionLock.changed event', inject(function(interactionLock, eventBus) {

      // given
      var listener = spy();
      eventBus.on('interactionLock.changed', listener);

      // when
      interactionLock.lock();

      // then
      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].locked).to.be.true;
    }));


    it('should not fire event if already locked', inject(function(interactionLock, eventBus) {

      // given
      interactionLock.lock();

      var listener = spy();
      eventBus.on('interactionLock.changed', listener);

      // when
      interactionLock.lock();

      // then
      expect(listener).not.to.have.been.called;
    }));

  });


  describe('#unlock', function() {

    it('should clear locked state', inject(function(interactionLock) {

      // given
      interactionLock.lock();

      // when
      interactionLock.unlock();

      // then
      expect(interactionLock.isLocked()).to.be.false;
    }));


    it('should remove CSS class from container', inject(function(interactionLock, canvas) {

      // given
      interactionLock.lock();

      // when
      interactionLock.unlock();

      // then
      var container = canvas.getContainer();
      expect(container.classList.contains('djs-interaction-locked')).to.be.false;
    }));


    it('should fire interactionLock.changed event', inject(function(interactionLock, eventBus) {

      // given
      interactionLock.lock();

      var listener = spy();
      eventBus.on('interactionLock.changed', listener);

      // when
      interactionLock.unlock();

      // then
      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].locked).to.be.false;
    }));


    it('should not fire event if already unlocked', inject(function(interactionLock, eventBus) {

      // given
      var listener = spy();
      eventBus.on('interactionLock.changed', listener);

      // when
      interactionLock.unlock();

      // then
      expect(listener).not.to.have.been.called;
    }));

  });


  describe('interaction blocking', function() {

    it('should block element.click when locked', inject(
      function(interactionLock, eventBus) {

        // given
        interactionLock.lock();

        var listener = spy();
        eventBus.on('element.click', listener);

        // when
        var result = eventBus.fire('element.click', { element: shape });

        // then
        expect(result).to.be.false;
        expect(listener).not.to.have.been.called;
      }
    ));


    it('should block element.dblclick when locked', inject(
      function(interactionLock, eventBus) {

        // given
        interactionLock.lock();

        var listener = spy();
        eventBus.on('element.dblclick', listener);

        // when
        var result = eventBus.fire('element.dblclick', { element: shape });

        // then
        expect(result).to.be.false;
        expect(listener).not.to.have.been.called;
      }
    ));


    it('should block drag.init when locked', inject(
      function(interactionLock, eventBus) {

        // given
        interactionLock.lock();

        var listener = spy();
        eventBus.on('drag.init', listener);

        // when
        var result = eventBus.fire('drag.init', { });

        // then
        expect(result).to.be.false;
        expect(listener).not.to.have.been.called;
      }
    ));


    it('should block contextPad.open.allowed when locked', inject(
      function(interactionLock, eventBus) {

        // given
        interactionLock.lock();

        var listener = spy();
        eventBus.on('contextPad.open.allowed', listener);

        // when
        var result = eventBus.fire('contextPad.open.allowed', { target: shape });

        // then
        expect(result).to.be.false;
        expect(listener).not.to.have.been.called;
      }
    ));


    it('should block directEditing.activate when locked', inject(
      function(interactionLock, eventBus) {

        // given
        interactionLock.lock();

        var listener = spy();
        eventBus.on('directEditing.activate', listener);

        // when
        var result = eventBus.fire('directEditing.activate', { element: shape });

        // then
        expect(result).to.be.false;
        expect(listener).not.to.have.been.called;
      }
    ));


    it('should block editor actions when locked', inject(
      function(interactionLock, editorActions) {

        // given
        editorActions.register('testAction', spy());
        interactionLock.lock();

        // when
        var result = editorActions.trigger('testAction');

        // then
        expect(result).to.be.undefined;
      }
    ));


    it('should allow navigation editor actions when locked', inject(
      function(interactionLock, editorActions) {

        // given
        var action = spy();
        editorActions.register('stepZoom', action);
        interactionLock.lock();

        // when
        editorActions.trigger('stepZoom', { value: 1 });

        // then
        expect(action).to.have.been.calledOnce;
      }
    ));


    it('should NOT block events when unlocked', inject(
      function(interactionLock, eventBus) {

        // given (not locked)
        var listener = spy();
        eventBus.on('element.click', listener);

        // when
        eventBus.fire('element.click', { element: shape });

        // then
        expect(listener).to.have.been.calledOnce;
      }
    ));


    it('should restore interactions after unlock', inject(
      function(interactionLock, eventBus) {

        // given
        interactionLock.lock();
        interactionLock.unlock();

        var listener = spy();
        eventBus.on('element.click', listener);

        // when
        eventBus.fire('element.click', { element: shape });

        // then
        expect(listener).to.have.been.calledOnce;
      }
    ));

  });


  describe('programmatic API not blocked', function() {

    it('should allow modeling.moveShape when locked', inject(
      function(interactionLock, modeling) {

        // given
        interactionLock.lock();

        // when
        modeling.moveElements([ shape ], { x: 50, y: 50 });

        // then
        expect(shape.x).to.equal(150);
        expect(shape.y).to.equal(150);
      }
    ));


    it('should allow modeling.removeShape when locked', inject(
      function(interactionLock, modeling, elementRegistry) {

        // given
        interactionLock.lock();

        // when
        modeling.removeShape(shape);

        // then
        expect(elementRegistry.get('shape1')).not.to.exist;
      }
    ));


    it('should allow editor actions after unlock', inject(
      function(interactionLock, editorActions) {

        // given
        var action = spy();
        editorActions.register('testAction', action);

        interactionLock.lock();
        interactionLock.unlock();

        // when
        editorActions.trigger('testAction');

        // then
        expect(action).to.have.been.calledOnce;
      }
    ));

  });


  describe('close open overlays on lock', function() {

    it('should close context pad when locking', inject(
      function(interactionLock, contextPad) {

        // given
        contextPad.open(shape);

        // when
        interactionLock.lock();

        // then
        expect(contextPad.isOpen()).to.be.false;
      }
    ));


    it('should restore context pad for selected element on unlock', inject(
      function(interactionLock, contextPad, selection) {

        // given
        selection.select(shape);
        interactionLock.lock();

        // when
        interactionLock.unlock();

        // then
        expect(contextPad.isOpen(shape)).to.be.true;
      }
    ));

  });

});
