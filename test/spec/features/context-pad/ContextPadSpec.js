/* global sinon */

import {
  createEvent as globalEvent
} from '../../../util/MockEvents';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

import contextPadModule from 'lib/features/context-pad';

import ContextPadProvider from './ContextPadProvider';

var providerModule = {
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: ['type', ContextPadProvider ]
};

var initPadModule = {
  __init__: [ 'contextPad' ]
};


describe('features/context-pad', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, initPadModule ] }));


    it('should bootstrap diagram with component', inject(function(canvas, contextPad) {

      canvas.addShape({ id: 's1', width: 100, height: 100, x: 10, y: 10 });

      canvas.addShape({ id: 's2', width: 50, height: 50, x: 200, y: 10 });
      canvas.addShape({ id: 's3', width: 150, height: 150, x: 300, y: 300 });

      expect(contextPad).to.exist;
    }));

  });


  describe('providers', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, initPadModule ] }));


    function Provider(entries) {
      this.getContextPadEntries = function(element) {
        return entries || {};
      };
    }


    it('should register provider', inject(function(contextPad) {

      // given
      var provider = new Provider();

      // when
      contextPad.registerProvider(provider);

      // then
      expect(contextPad._providers).to.eql([ provider ]);
    }));


    it('should query provider for entries', inject(function(contextPad) {

      // given
      var provider = new Provider();

      contextPad.registerProvider(provider);

      sinon.spy(provider, 'getContextPadEntries');

      // when
      var entries = contextPad.getEntries('FOO');

      // then
      expect(entries).to.eql({});

      // pass over providers
      expect(provider.getContextPadEntries).to.have.been.calledWith('FOO');
    }));


    describe('entry className', function() {

      function testClassName(options) {

        var set = options.set,
            expected = options.expect;

        return inject(function(contextPad, canvas) {

          // given
          var entries = {
            'entryA': {
              alt: 'A',
              className: set
            }
          };

          var provider = new Provider(entries);

          // when
          contextPad.registerProvider(provider);

          // given
          var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

          canvas.addShape(shape);

          // when
          contextPad.open(shape);

          var pad = contextPad.getPad(shape),
              padContainer = pad.html;

          // then DOM should contain entries
          var entryA = domQuery('[data-action="entryA"]', padContainer);
          expect(entryA).to.exist;

          // expect all classes to be set
          expected.forEach(function(cls) {
            expect(domClasses(entryA).has(cls)).to.be.true;
          });
        });
      }


      it('should recognize Array<String> as className', testClassName({
        set: [ 'FOO', 'BAAAR' ],
        expect: [ 'FOO', 'BAAAR' ]
      }));


      it('should recognize <space separated classes> as className', testClassName({
        set: 'FOO BAAAR blub',
        expect: [ 'FOO', 'BAAAR', 'blub' ]
      }));

    });

  });


  describe('lifecycle', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, providerModule ] }));


    function expectEntries(contextPad, element, entries) {

      var pad = contextPad.getPad(element),
          html = pad.html;

      entries.forEach(function(e) {
        var entry = domQuery('[data-action="' + e + '"]', html);
        expect(entry).not.to.be.null;
      });

      expect(domQueryAll('.entry', html).length).to.equal(entries.length);
    }


    it('should open', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);


      // when
      contextPad.open(shape);

      // then
      expect(contextPad.isOpen()).to.be.true;
    }));


    it('should provide context dependent entries', inject(function(canvas, contextPad) {

      // given
      var shapeA = { id: 's1', type: 'A', width: 100, height: 100, x: 10, y: 10 };
      var shapeB = { id: 's2', type: 'B', width: 100, height: 100, x: 210, y: 10 };

      canvas.addShape(shapeA);
      canvas.addShape(shapeB);

      // when (1)
      contextPad.open(shapeA);

      // then (1)
      expectEntries(contextPad, shapeA, [ 'action.a', 'action.b' ]);


      // when (2)
      contextPad.open(shapeB);

      // then (2)
      expectEntries(contextPad, shapeB, [ 'action.c', 'action.no-image' ]);

      // when (3)
      contextPad.open(shapeA);
      contextPad.close();

      // then (3)
      expect(contextPad.isOpen()).to.be.false;
    }));


    it('should close', inject(function(canvas, contextPad, overlays) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);

      contextPad.open(shape);

      // when
      contextPad.close();

      // then
      expect(overlays.get({ element: shape })).to.have.length(0);
      expect(!!contextPad.isOpen()).to.be.false;
    }));


    it('should reopen, resetting entries', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);


      contextPad.open(shape);
      contextPad.close();

      // when
      contextPad.open(shape);

      // then
      expectEntries(contextPad, shape, [ 'action.c', 'action.no-image' ]);
    }));


    it('should reopen if current element changed', inject(function(eventBus, canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);

      contextPad.open(shape);

      var open = sinon.spy(contextPad, 'open');

      // when
      eventBus.fire('element.changed', { element: shape });

      // then
      expect(open).to.have.been.calledWith(shape, true);
    }));


    it('should not reopen if other element changed', inject(function(eventBus, canvas, contextPad) {

      // given
      var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);

      contextPad.open(shape);

      var open = sinon.spy(contextPad, 'open');

      // when
      eventBus.fire('element.changed', { element: canvas.getRootElement() });

      // then
      expect(open).not.to.have.been.called;
    }));


  });


  describe('event handling', function() {

    beforeEach(bootstrapDiagram({ modules: [ contextPadModule, providerModule ] }));


    it('should handle click event', inject(function(canvas, contextPad) {

      // given
      var shape = canvas.addShape({ id: 's1', width: 100, height: 100, x: 10, y: 10 });

      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = domQuery('[data-action="action.c"]', html);

      var event = globalEvent(target, { x: 0, y: 0 });

      // when
      contextPad.trigger('click', event);

      // then
      expect(event.__handled).to.be.true;
    }));


    it('should prevent unhandled events', inject(function(canvas, contextPad) {

      // given
      var shape = canvas.addShape({ id: 's1', width: 100, height: 100, x: 10, y: 10 });

      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = domQuery('[data-action="action.c"]', html);

      var event = globalEvent(target, { x: 0, y: 0 });

      // when
      contextPad.trigger('dragstart', event);

      // then
      expect(event.defaultPrevented).to.be.true;
    }));


    it('should handle drag event', inject(function(canvas, contextPad) {

      // given
      var shape = canvas.addShape({
        id: 's1',
        width: 100, height: 100,
        x: 10, y: 10,
        type: 'drag'
      });

      contextPad.open(shape);

      var pad = contextPad.getPad(shape),
          html = pad.html,
          target = domQuery('[data-action="action.dragstart"]', html);

      var event = globalEvent(target, { x: 0, y: 0 });

      // when
      contextPad.trigger('dragstart', event);

      // then
      expect(event.__handled).to.be.true;
    }));

  });


  describe('scaling', function() {

    var NUM_REGEX = /[+-]?\d*[.]?\d+(?=,|\))/g;
    var zoomLevels = [ 1.0, 1.2, 3.5, 10, 0.5 ];

    function asVector(scaleStr) {
      if (scaleStr && scaleStr !== 'none') {
        var m = scaleStr.match(NUM_REGEX);

        return {
          x: parseFloat(m[0], 10),
          y: parseFloat(m[1], 10)
        };
      }
    }

    function scaleVector(element) {
      return asVector(element.style.transform);
    }

    function verifyScales(expectedScales) {

      return getDiagramJS().invoke(function(canvas, contextPad) {

        // given
        var shape = canvas.addShape({
          id: 's1',
          width: 100, height: 100,
          x: 10, y: 10,
          type: 'drag'
        });

        contextPad.open(shape);

        var pad = contextPad.getPad(shape);

        var padParent = pad.html.parentNode;

        // test multiple zoom steps
        zoomLevels.forEach(function(zoom, idx) {

          var expectedScale = expectedScales[idx];

          // when
          canvas.zoom(zoom);

          var actualScale = scaleVector(padParent) || { x: 1, y: 1 };

          var effectiveScale = zoom * actualScale.x;

          // then
          expect(actualScale.x).to.eql(actualScale.y);
          expect(effectiveScale).to.be.closeTo(expectedScale, 0.00001);
        });
      });
    }


    it('should scale [ 1.0, 1.5 ] by default', function() {

      // given
      var expectedScales = [ 1.0, 1.2, 1.5, 1.5, 1.0 ];

      bootstrapDiagram({
        modules: [ contextPadModule, providerModule ]
      })();

      // when
      verifyScales(expectedScales);
    });


    it('should scale [ 1.0, 1.5 ] without scale config', function() {

      // given
      var expectedScales = [ 1.0, 1.2, 1.5, 1.5, 1.0 ];

      bootstrapDiagram({
        modules: [ contextPadModule, providerModule ],
        contextPad: {}
      })();

      // when
      verifyScales(expectedScales);
    });


    it('should scale within the limits set in config', function() {

      // given
      var expectedScales = [ 1.0, 1.2, 1.2, 1.2, 1.0 ];

      var config = {
        scale: {
          min: 1.0,
          max: 1.2
        }
      };

      bootstrapDiagram({
        modules: [ contextPadModule, providerModule ],
        contextPad: config
      })();

      // when
      verifyScales(expectedScales);
    });


    it('should scale with scale = true', function() {

      // given
      var expectedScales = zoomLevels;

      var config = {
        scale: true
      };

      bootstrapDiagram({
        modules: [ contextPadModule, providerModule ],
        contextPad: config
      })();

      // when
      verifyScales(expectedScales);
    });


    it('should not scale with scale = false', function() {

      // given
      var expectedScales = [ 1.0, 1.0, 1.0, 1.0, 1.0 ];

      var config = {
        scale: false
      };

      bootstrapDiagram({
        modules: [ contextPadModule, providerModule ],
        contextPad: config
      })();

      // when
      verifyScales(expectedScales);
    });

  });

});
