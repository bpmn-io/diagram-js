'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject, sinon */


var editorActionsModule = require('../../../../lib/features/editor-actions'),
    modelingModule = require('../../../../lib/features/modeling'),
    customRulesModule = require('./rules');


describe('features/editor-actions', function() {

  beforeEach(bootstrapDiagram({ modules: [ editorActionsModule, modelingModule, customRulesModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100,
      width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('trigger', function() {

    it('should trigger an action', inject(function(modeling, editorActions) {
      // given
      modeling.moveElements([ childShape ], { x: 300, y: 0 }, rootShape);

      // when
      editorActions.trigger('undo');

      // then
      expect(childShape.parent).to.equal(parentShape);
      expect(childShape).to.have.position({ x: 110, y: 110 });
    }));


    it('should NOT trigger an action', inject(function(modeling, editorActions) {
      // given
      modeling.moveElements([ childShape ], { x: 300, y: 0 }, rootShape);

      // when
      function trigger() {
        editorActions.trigger('foo');
      }

      // then
      expect(trigger).to.throw('foo is not a registered action');
    }));

  });


  describe('register actions', function() {

    it('should register a list of actions', inject(function(editorActions) {
      // given
      var numOfActions = editorActions.length();

      // when
      editorActions.register({
        'foo': function() {
          return 'bar';
        },
        'bar': function() {
          return 'foo';
        }
      });

      // then
      expect(editorActions.length()).to.equal(numOfActions + 2);
    }));


    it('should register action', inject(function(editorActions) {
      // when
      editorActions.register('foo', function() {
        return 'bar';
      });

      var result = editorActions.trigger('foo');

      // then
      expect(result).to.equal('bar');
      expect(editorActions.isRegistered('foo')).to.be.true;
    }));


    it('should throw error on duplicate registration', inject(function(editorActions) {
      // when
      function register() {
        editorActions.register('undo', function() {
          return 'bar';
        });
      }

      // then
      expect(register).to.throw('undo is already registered');
    }));


    it('should unregister an action', inject(function(editorActions) {
      // when
      editorActions.unregister('undo');

      var result = editorActions.isRegistered('undo');

      // then
      expect(result).to.be.false;
    }));


    it('should throw an error on deregisering unregistered', inject(function(editorActions) {
      // when
      function unregister() {
        editorActions.unregister('bar');
      }

      // then
      expect(unregister).to.throw('bar is not a registered action');
    }));

  });


  describe('utilities', function() {

    it('listActions', inject(function(editorActions) {
      // when
      var actionsLength = editorActions.length();

      // then
      expect(actionsLength).to.equal(8);
    }));


    it('isRegistered -> true', inject(function(editorActions) {
      // when
      var undo = editorActions.isRegistered('undo'),
          foo = editorActions.isRegistered('foo');

      // then
      expect(undo).to.be.true;
      expect(foo).to.be.false;
    }));

  });


  describe('actions', function() {

    describe('undo', function () {
      var undo;

      beforeEach(inject(function(commandStack) {
        undo = sinon.spy(commandStack, 'undo');
      }));

      it('should NOT call commandStack.undo while model is read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });

        // when
        editorActions.trigger('undo');

        // then
        expect(undo).to.not.have.been.called;
      }));

      it('should call commandStack.undo after model was read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });
        eventBus.fire('readOnly.changed', { readOnly: false });

        // when
        editorActions.trigger('undo');

        // then
        expect(undo).to.have.been.calledOnce;
      }));

    });

    describe('redo', function () {
      var redo;

      beforeEach(inject(function(commandStack) {
        redo = sinon.spy(commandStack, 'redo');
      }));

      it('should NOT call commandStack.redo while model is read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });

        // when
        editorActions.trigger('redo');

        // then
        expect(redo).to.not.have.been.called;
      }));

      it('should call commandStack.redo after model was read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });
        eventBus.fire('readOnly.changed', { readOnly: false });

        // when
        editorActions.trigger('redo');

        // then
        expect(redo).to.have.been.calledOnce;
      }));

    });

    describe('copy', function () {
      var selectedElements,
          copy;

      beforeEach(inject(function(selection, copyPaste) {
        selectedElements = [];

        sinon.stub(selection, 'get', function() {
          return selectedElements;
        });

        copy = sinon.stub(copyPaste, 'copy', function () {});
      }));

      it('should call copyPaste.copy with selected elements', inject(function(eventBus, editorActions) {
        // given
        selectedElements = ['any'];

        // when
        editorActions.trigger('copy');

        // then
        expect(copy).to.have.been.calledOnce;
        expect(copy).to.have.been.calledWith(selectedElements);
      }));

      it('should NOT call copyPaste.copy while model is read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });

        // when
        editorActions.trigger('copy');

        // then
        expect(copy).to.not.have.been.called;
      }));

      it('should call copyPaste.copy after model was read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });
        eventBus.fire('readOnly.changed', { readOnly: false });

        // when
        editorActions.trigger('copy');

        // then
        expect(copy).to.have.been.calledOnce;
      }));

    });

    describe('paste', function () {
      var hoverContext,
          paste;

      beforeEach(inject(function(mouseTracking, copyPaste) {
        hoverContext = {};

        sinon.stub(mouseTracking, 'getHoverContext', function() {
          return hoverContext;
        });

        paste = sinon.stub(copyPaste, 'paste', function () {});
      }));

      it('should call copyPaste.paste with hoverContext', inject(function(eventBus, editorActions) {
        // given
        hoverContext = { foo: 'bar' };

        // when
        editorActions.trigger('paste');

        // then
        expect(paste).to.have.been.calledOnce;
        expect(paste).to.have.been.calledWith(hoverContext);
      }));

      it('should NOT call copyPaste.paste while model is read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });

        // when
        editorActions.trigger('paste');

        // then
        expect(paste).to.not.have.been.called;
      }));

      it('should call copyPaste.paste after model was read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });
        eventBus.fire('readOnly.changed', { readOnly: false });

        // when
        editorActions.trigger('paste');

        // then
        expect(paste).to.have.been.calledOnce;
      }));

    });

    describe('stepZoom', function () {
      var stepZoom,
          opts;

      beforeEach(inject(function(zoomScroll) {
        opts = { value: 1 };

        stepZoom = sinon.spy(zoomScroll, 'stepZoom');
      }));

      it('should call zoomScroll.stepZoom with value', inject(function(eventBus, editorActions) {
        // given
        opts = { value: 2 };

        // when
        editorActions.trigger('stepZoom', opts);

        // then
        expect(stepZoom).to.have.been.calledOnce;
        expect(stepZoom).to.have.been.calledWith(opts.value);
      }));

      it('should call zoomScroll.stepZoom even if model is read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });

        // when
        editorActions.trigger('stepZoom', opts);

        // then
        expect(stepZoom).to.have.been.called;
      }));

    });

    describe('zoom', function () {
      var zoom,
          opts;

      beforeEach(inject(function(canvas) {
        opts = { value: 1 };

        zoom = sinon.spy(canvas, 'zoom');
      }));

      it('should call canvas.zoom with value', inject(function(eventBus, editorActions) {
        // given
        opts = { value: 2 };

        // when
        editorActions.trigger('zoom', opts);

        // then
        expect(zoom).to.have.been.calledOnce;
        expect(zoom).to.have.been.calledWith(opts.value);
      }));

      it('should call canvas.zoom even if model is read-only', inject(function(eventBus, editorActions) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });

        // when
        editorActions.trigger('zoom', opts);

        // then
        expect(zoom).to.have.been.called;
      }));

    });

    describe('removeSelection', function() {

      var selectedElements,
          removeElements;

      beforeEach(inject(function(selection, modeling) {
        selectedElements = [];

        sinon.stub(selection, 'get', function() {
          return selectedElements;
        });

        removeElements = sinon.spy(modeling, 'removeElements');
      }));


      it('should call modeling.removeElements with selected elements', inject(function(editorActions) {
        selectedElements = ['any'];

        // when
        editorActions.trigger('removeSelection');

        // then
        expect(removeElements).to.have.been.calledOnce;
        expect(removeElements).to.have.been.calledWith(selectedElements);

        // pass shalow copy of selection
        expect(removeElements.getCall(0).args[0]).to.not.equal(selectedElements);
      }));


      it('should NOT call modeling.removeElements when no element is selected', inject(function(editorActions) {
        selectedElements = [];

        // when
        editorActions.trigger('removeSelection');

        // then
        expect(removeElements).to.not.have.been.called;
      }));


      describe('with rules', function() {

        var RULE_NAME = 'elements.delete';

        it('should remove all when rule returns true', inject(function(editorActions, customRules) {
          selectedElements = ['a', 'b', 'c'];

          customRules.addRule(RULE_NAME, function(context) {
            return true;
          });

          // when
          editorActions.trigger('removeSelection');

          // then
          expect(removeElements).to.have.been.calledOnce;
          expect(removeElements).to.have.been.calledWith(['a', 'b', 'c']);
        }));


        it('should not remove anything when rule returns true', inject(function(editorActions, customRules) {
          selectedElements = ['a', 'b', 'c'];

          customRules.addRule(RULE_NAME, function(context) {
            return false;
          });

          // when
          editorActions.trigger('removeSelection');

          // then
          expect(removeElements).not.to.have.been.called;
        }));


        it('should only remove items returned by rule', inject(function(editorActions, customRules) {
          selectedElements = ['a', 'b', 'c'];

          customRules.addRule(RULE_NAME, function(context) {
            return ['a', 'c'];
          });

          // when
          editorActions.trigger('removeSelection');

          // then
          expect(removeElements).to.have.been.calledOnce;
          expect(removeElements).to.have.been.calledWith(['a', 'c']);
        }));


        it('should call rule with .elements property', inject(function(editorActions, customRules) {
          selectedElements = ['a', 'b', 'c'];

          var ruleFn = sinon.spy(function(context) {
            return true;
          });

          customRules.addRule(RULE_NAME, ruleFn);

          // when
          editorActions.trigger('removeSelection');

          // then
          expect(ruleFn).to.have.been.calledOnce;
          expect(ruleFn).to.have.been.calledWith({ elements: ['a', 'b', 'c'] });
        }));

      });


      describe('readOnly.changed', function () {

        it('should NOT call modeling.removeElements when model is read-only', inject(function(editorActions, eventBus) {

          // given
          selectedElements = ['any'];
          eventBus.fire('readOnly.changed', { readOnly: true });

          // when
          editorActions.trigger('removeSelection');

          // then
          expect(removeElements).to.not.have.been.called;
        }));


        it('should call modeling.removeElements after model was read-only', inject(function(editorActions, eventBus) {

          // given
          selectedElements = ['any'];
          eventBus.fire('readOnly.changed', { readOnly: true });
          eventBus.fire('readOnly.changed', { readOnly: false });

          // when
          editorActions.trigger('removeSelection');

          // then
          expect(removeElements).to.have.been.called;
        }));

      });

    });

    describe('moveCanvas', function () {
      var scroll;

      beforeEach(inject(function(canvas) {
        scroll = sinon.spy(canvas, 'scroll');
      }));

      it('should scroll canvas even when model is read-only', inject(function(editorActions, eventBus) {
        // given
        eventBus.fire('readOnly.changed', { readOnly: true });

        // when
        editorActions.trigger('moveCanvas', { speed: 10, direction: 'left' });

        // then
        expect(scroll).to.have.been.calledOnce;
      }));

    });

  });

});
