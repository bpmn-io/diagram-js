import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  forEach
} from 'min-dash';

import copyPasteModule from 'lib/features/copy-paste';
import modelingModule from 'lib/features/modeling';
import keyboardModule from 'lib/features/keyboard';
import editorActionsModule from 'lib/features/editor-actions';
import zoomScrollModule from 'lib/navigation/zoomscroll';

import { createKeyEvent } from 'test/util/KeyEvents';


describe('features/keyboard - bindings', function() {

  var defaultDiagramConfig = {
    modules: [
      copyPasteModule,
      modelingModule,
      keyboardModule,
      editorActionsModule,
      zoomScrollModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  describe('copy', function() {

    var KEYS_COPY = [ 'c', 'C' ];

    var decisionTable = [
      {
        desc: 'should call copy',
        keys: KEYS_COPY,
        ctrlKey: true,
        called: true
      }, {
        desc: 'should not call copy',
        keys: KEYS_COPY,
        ctrlKey: false,
        called: false
      }
    ];

    forEach(decisionTable, function(testCase) {

      forEach(testCase.keys, function(key) {

        it(testCase.desc, inject(function(keyboard, editorActions) {

          // given
          var copySpy = sinon.spy(editorActions, 'trigger');

          var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

          // when
          keyboard._keyHandler(event);

          // then
          expect(copySpy.calledWith('copy')).to.be.equal(testCase.called);
        }));

      });

    });

  });


  describe('paste', function() {

    var KEYS_PASTE = [ 'v', 'V' ];

    var decisionTable = [
      {
        desc: 'should call paste',
        keys: KEYS_PASTE,
        ctrlKey: true,
        called: true
      }, {
        desc: 'should not call paste',
        keys: KEYS_PASTE,
        ctrlKey: false,
        called: false
      }
    ];

    forEach(decisionTable, function(testCase) {

      forEach(testCase.keys, function(key) {

        it(testCase.desc, inject(function(keyboard, editorActions) {

          // given
          var pasteSpy = sinon.spy(editorActions, 'trigger');

          var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

          // when
          keyboard._keyHandler(event);

          // then
          expect(pasteSpy.calledWith('paste')).to.be.equal(testCase.called);
        }));

      });

    });

  });


  describe('duplicate', function() {

    var KEYS_DUPLICATE = [ 'd', 'D' ];

    var decisionTable = [
      {
        desc: 'should call duplicate',
        keys: KEYS_DUPLICATE,
        ctrlKey: true,
        called: true
      }, {
        desc: 'should not call duplicate',
        keys: KEYS_DUPLICATE,
        ctrlKey: false,
        called: false
      }
    ];

    forEach(decisionTable, function(testCase) {

      forEach(testCase.keys, function(key) {

        it(testCase.desc, inject(function(keyboard, editorActions) {

          // given
          var duplicateSpy = sinon.spy(editorActions, 'trigger');

          var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

          // when
          keyboard._keyHandler(event);

          // then
          expect(duplicateSpy.calledWith('duplicate')).to.be.equal(testCase.called);
        }));

      });

    });

  });


  describe('undo', function() {

    var KEYS_UNDO = [ 'z', 'Z' ];

    var decisionTable = [
      {
        desc: 'should call undo',
        keys: KEYS_UNDO,
        ctrlKey: true,
        shiftKey: false,
        called: true
      }, {
        desc: 'should not call undo',
        keys: KEYS_UNDO,
        ctrlKey: true,
        shiftKey: true,
        called: false
      }, {
        desc: 'should not call undo',
        keys: KEYS_UNDO,
        ctrlKey: false,
        shiftKey: true,
        called: false
      }, {
        desc: 'should not call undo',
        keys: KEYS_UNDO,
        ctrlKey: false,
        shiftKey: false,
        called: false
      }
    ];

    forEach(decisionTable, function(testCase) {

      forEach(testCase.keys, function(key) {

        it(testCase.desc, inject(function(keyboard, editorActions) {

          // given
          var undoSpy = sinon.spy(editorActions, 'trigger');

          var event = createKeyEvent(key, {
            ctrlKey: testCase.ctrlKey,
            shiftKey: testCase.shiftKey
          });

          // when
          keyboard._keyHandler(event);

          // then
          expect(undoSpy.calledWith('undo')).to.be.equal(testCase.called);
        }));

      });

    });

  });


  describe('redo', function() {

    var KEYS_REDO = [ 'y', 'Y' ];
    var KEYS_UNDO = [ 'z', 'Z' ];

    var decisionTable = [
      {
        desc: 'should call redo',
        keys: KEYS_UNDO,
        ctrlKey: true,
        shiftKey: true,
        called: true
      }, {
        desc: 'should call redo',
        keys: KEYS_REDO,
        ctrlKey: true,
        shiftKey: false,
        called: true
      }, {
        desc: 'should call redo',
        keys: KEYS_REDO,
        ctrlKey: true,
        shiftKey: true,
        called: true
      }, {
        desc: 'should not call redo',
        keys: KEYS_UNDO,
        ctrlKey: false,
        shiftKey: true,
        called: false
      }, {
        desc: 'should not call redo',
        keys: KEYS_UNDO,
        ctrlKey: true,
        shiftKey: false,
        called: false
      }, {
        desc: 'should not call redo',
        keys: KEYS_REDO,
        ctrlKey: false,
        shiftKey: false,
        called: false
      }, {
        desc: 'should not call redo',
        keys: KEYS_UNDO,
        ctrlKey: false,
        shiftKey: false,
        called: false
      }
    ];

    forEach(decisionTable, function(testCase) {

      forEach(testCase.keys, function(key) {

        it(testCase.desc, inject(function(keyboard, editorActions) {

          // given
          var redoSpy = sinon.spy(editorActions, 'trigger');

          var event = createKeyEvent(key, {
            ctrlKey: testCase.ctrlKey,
            shiftKey: testCase.shiftKey
          });

          // when
          keyboard._keyHandler(event);

          // then
          expect(redoSpy.calledWith('redo')).to.be.equal(testCase.called);
        }));

      });

    });

  });


  describe('zoom', function() {

    var KEYS = {
      ZOOM_IN: [ '+', 'Add', '=' ],
      ZOOM_OUT: [ '-', 'Subtract' ],
      ZOOM_DEFAULT: [ '0' ]
    };

    var decisionTable = [
      {
        desc: 'zoom in',
        keys: KEYS.ZOOM_IN,
        ctrlKey: true,
        defaultZoom: 3,
        zoom: 4
      }, {
        desc: 'zoom out',
        keys: KEYS.ZOOM_OUT,
        ctrlKey: true,
        defaultZoom: 3,
        zoom: 2.456
      }, {
        desc: 'zoom default',
        keys: KEYS.ZOOM_DEFAULT,
        ctrlKey: true,
        defaultZoom: 3,
        zoom: 1
      }
    ];

    forEach(decisionTable, function(testCase) {

      forEach(testCase.keys, function(key) {

        it('should handle ' + key + ' for ' + testCase.desc, inject(function(canvas, keyboard) {

          // given
          canvas.zoom(testCase.defaultZoom);

          var event = createKeyEvent(key, {
            ctrlKey: testCase.ctrlKey
          });

          // when
          keyboard._keyHandler(event);

          // then
          expect(canvas.zoom()).to.be.equal(testCase.zoom);
          expect(event.defaultPrevented).to.be.true;
        }));

      });

    });

  });


  describe('removeSelection', function() {

    var KEYS = [
      'Backspace',
      'Delete',
      'Del'
    ];

    forEach(KEYS, function(key) {

      it('should call remove selection when ' + key + ' is pressed',
        inject(function(keyboard, editorActions) {

          // given
          var removeSelectionSpy = sinon.spy(editorActions, 'trigger');

          var event = createKeyEvent(key);

          // when
          keyboard._keyHandler(event);

          // then
          expect(removeSelectionSpy.calledWith('removeSelection')).to.be.true;
        })
      );

    });

  });

});
