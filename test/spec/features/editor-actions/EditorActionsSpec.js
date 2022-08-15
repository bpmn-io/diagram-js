import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import editorActionsModule from 'lib/features/editor-actions';
import copyPasteModule from 'lib/features/copy-paste';
import selectionModule from 'lib/features/selection';
import keyboardMoveModule from 'lib/navigation/keyboard-move';
import keyboardMoveSelectionModule from 'lib/features/keyboard-move-selection';
import modelingModule from 'lib/features/modeling';
import customRulesModule from './rules';


describe('features/editor-actions', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      editorActionsModule,
      modelingModule,
      customRulesModule
    ]
  }));


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

      // when
      editorActions.register({
        foo: function() {
          return 'bar';
        },
        bar: function() {
          return 'foo';
        }
      });

      // then
      var actions = editorActions.getActions();

      expect(actions).to.include.members([ 'foo', 'bar' ]);
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

    it('#getActions()', inject(function(editorActions) {

      // when
      var actions = editorActions.getActions();

      // then
      expect(actions).to.eql([
        'undo',
        'redo',
        'zoom',
        'removeSelection'
      ]);
    }));


    it('#isRegistered(action)', inject(function(editorActions) {

      // when
      var undo = editorActions.isRegistered('undo'),
          foo = editorActions.isRegistered('foo');

      // then
      expect(undo).to.be.true;
      expect(foo).to.be.false;
    }));

  });

});


describe('feature/editor-actions - actions', function() {

  describe('removeSelection', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        editorActionsModule,
        modelingModule,
        customRulesModule
      ]
    }));


    var selectedElements,
        removeElements;

    beforeEach(inject(function(selection, modeling) {
      selectedElements = [];

      sinon.stub(selection, 'get').callsFake(function() {
        return selectedElements;
      });

      removeElements = sinon.spy(modeling, 'removeElements');
    }));


    it('should call modeling.removeElements with selected elements', inject(function(editorActions) {
      selectedElements = [ 'any' ];

      // when
      editorActions.trigger('removeSelection');

      // then
      expect(removeElements).to.have.been.calledOnce;
      expect(removeElements).to.have.been.calledWith(selectedElements);

      // pass shallow copy of selection
      expect(removeElements.getCall(0).args[0]).not.to.equal(selectedElements);
    }));


    it('should NOT call modeling.removeElements when no element is selected', inject(function(editorActions) {
      selectedElements = [];

      // when
      editorActions.trigger('removeSelection');

      // then
      expect(removeElements).not.to.have.been.called;
    }));


    describe('with rules', function() {

      var RULE_NAME = 'elements.delete';

      it('should remove all when rule returns true', inject(function(editorActions, customRules) {
        selectedElements = [ 'a', 'b', 'c' ];

        customRules.addRule(RULE_NAME, function(context) {
          return true;
        });

        // when
        editorActions.trigger('removeSelection');

        // then
        expect(removeElements).to.have.been.calledOnce;
        expect(removeElements).to.have.been.calledWith([ 'a', 'b', 'c' ]);
      }));


      it('should not remove anything when rule returns true', inject(function(editorActions, customRules) {
        selectedElements = [ 'a', 'b', 'c' ];

        customRules.addRule(RULE_NAME, function(context) {
          return false;
        });

        // when
        editorActions.trigger('removeSelection');

        // then
        expect(removeElements).not.to.have.been.called;
      }));


      it('should only remove items returned by rule', inject(function(editorActions, customRules) {
        selectedElements = [ 'a', 'b', 'c' ];

        customRules.addRule(RULE_NAME, function(context) {
          return [ 'a', 'c' ];
        });

        // when
        editorActions.trigger('removeSelection');

        // then
        expect(removeElements).to.have.been.calledOnce;
        expect(removeElements).to.have.been.calledWith([ 'a', 'c' ]);
      }));


      it('should call rule with .elements property', inject(function(editorActions, customRules) {
        selectedElements = [ 'a', 'b', 'c' ];

        var ruleFn = sinon.spy(function(context) {
          return true;
        });

        customRules.addRule(RULE_NAME, ruleFn);

        // when
        editorActions.trigger('removeSelection');

        // then
        expect(ruleFn).to.have.been.calledOnce;
        expect(ruleFn).to.have.been.calledWith({ elements: [ 'a', 'b', 'c' ] });
      }));

    });

  });


  describe('moveSelection', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        editorActionsModule,
        keyboardMoveSelectionModule,
        modelingModule
      ]
    }));

    it('should trigger action', inject(function(keyboardMoveSelection, editorActions) {

      // given
      var moveSpy = sinon.spy(keyboardMoveSelection, 'moveSelection');

      // when
      editorActions.trigger('moveSelection', {
        direction: 'left',
        accelerated: false
      });

      // then
      expect(moveSpy).to.have.been.calledOnce;
    }));

  });

  describe('moveCanvas', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        editorActionsModule,
        keyboardMoveModule,
        modelingModule
      ]
    }));


    it('should trigger action', inject(function(keyboardMove, editorActions) {

      // given
      var moveSpy = sinon.spy(keyboardMove, 'moveCanvas');

      // when
      editorActions.trigger('moveCanvas', {
        direction: 'left',
        speed: 10
      });

      // then
      expect(moveSpy).to.have.been.calledOnce;
    }));

  });


  describe('copy + paste', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        editorActionsModule,
        copyPasteModule,
        selectionModule,
        modelingModule
      ]
    }));


    var root, shape;

    beforeEach(inject(function(elementFactory, canvas) {
      root = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(root);

      shape = elementFactory.createShape({
        id: 'shape',
        x: 100, y: 100,
        width: 300, height: 300
      });

      canvas.addShape(shape, root);
    }));


    it('should copy non empty', inject(function(selection, clipboard, editorActions) {

      // given
      selection.select(shape);

      // when
      var copied = editorActions.trigger('copy');

      // then
      expect(copied).to.exist;
      expect(copied).to.equal(clipboard.get());
    }));


    it('should not copy empty', inject(function(selection, editorActions) {

      // assume
      expect(selection.get()).to.be.empty;

      // when
      var copied = editorActions.trigger('copy');

      // then
      expect(copied).not.to.exist;
    }));

  });

});
