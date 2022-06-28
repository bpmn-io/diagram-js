import {
  createEvent as globalEvent
} from '../../../util/MockEvents';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import { assign, isArray } from 'min-dash';

import {
  query as domQuery,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

import contextPadModule from 'lib/features/context-pad';
import selectionModule from 'lib/features/selection';

import ContextPadProvider from './ContextPadProvider';

var providerModule = {
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: [ 'type', ContextPadProvider ]
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

    /**
     * @constructor
     *
     * @param {any} [entriesOrUpdater]
     */
    function Provider(entriesOrUpdater) {
      this.getContextPadEntries = function(element) {
        return entriesOrUpdater || {};
      };

      this.getMultiElementContextPadEntries = function(element) {
        return entriesOrUpdater || {};
      };
    }


    it('should register provider', inject(function(contextPad) {

      // given
      var provider = new Provider();

      // then
      expect(function() {
        contextPad.registerProvider(provider);
      }).to.not.throw;
    }));


    describe('should query provider for entries', function() {

      it('single element', inject(function(contextPad) {

        // given
        var provider = {
          getContextPadEntries: sinon.spy()
        };

        contextPad.registerProvider(provider);

        // when
        var entries = contextPad.getEntries('FOO');

        // then
        expect(entries).to.eql({});

        // pass over providers
        expect(provider.getContextPadEntries).to.have.been.calledWith('FOO');
      }));


      it('multiple elements', inject(function(contextPad) {

        // given
        var provider = {
          getMultiElementContextPadEntries: sinon.spy()
        };

        contextPad.registerProvider(provider);

        // when
        var entries = contextPad.getEntries([ 'FOO', 'BAR' ]);

        // then
        expect(entries).to.eql({});

        // pass over providers
        expect(provider.getMultiElementContextPadEntries).to.have.been.calledWith([ 'FOO', 'BAR' ]);
      }));


      it('missing provider API', inject(function(contextPad) {

        // given
        var provider = {};

        contextPad.registerProvider(provider);

        // when
        var entries = contextPad.getEntries('FOO');

        // then
        expect(entries).to.eql({});
      }));

    });


    describe('with updater', function() {

      it('should allow to add entries', inject(function(contextPad) {

        // given
        function updater(entries) {
          return assign(entries, { entryB: {} });
        }

        var plainProvider = new Provider({ entryA: { action: function() {} } }),
            updatingProvider = new Provider(updater);

        contextPad.registerProvider(plainProvider);
        contextPad.registerProvider(updatingProvider);

        // when
        var entries = contextPad.getEntries([]);

        // then
        expect(entries.entryA).to.exist;
        expect(entries.entryB).to.exist;
      }));


      it('should allow to update entries', inject(function(contextPad) {

        // given
        function updater(entries) {
          return assign(entries, { entryA: { alt: 'text' } });
        }

        var plainProvider = new Provider({ entryA: { action: function() {} } }),
            updatingProvider = new Provider(updater);

        contextPad.registerProvider(plainProvider);
        contextPad.registerProvider(updatingProvider);

        // when
        var entries = contextPad.getEntries([]);

        // then
        expect(entries.entryA).to.exist;
        expect(entries.entryA).to.have.property('alt');
      }));


      it('should allow to remove entries', inject(function(contextPad) {

        // given
        function updater(entries) {
          return {};
        }

        var plainProvider = new Provider({ entryA: { action: function() {} } }),
            updatingProvider = new Provider(updater);

        contextPad.registerProvider(plainProvider);
        contextPad.registerProvider(updatingProvider);

        // when
        var entries = contextPad.getEntries([]);

        // then
        expect(entries.entryA).to.not.exist;
      }));


      describe('ordering', function() {

        function updater(entries) {
          return {};
        }

        var plainProvider = new Provider({ entryA: { action: function() {} } }),
            updatingProvider = new Provider(updater);


        it('should call providers by registration order per default', inject(function(contextPad) {

          // given
          contextPad.registerProvider(plainProvider);
          contextPad.registerProvider(updatingProvider);

          // when
          var entries = contextPad.getEntries([]);

          // then
          expect(entries.entryA).to.not.exist;
        }));


        it('should call providers by priority', inject(function(contextPad) {

          // given
          contextPad.registerProvider(plainProvider);
          contextPad.registerProvider(1200, updatingProvider);

          // when
          var entries = contextPad.getEntries([]);

          // then
          expect(entries.entryA).to.exist;
        }));

      });
    });


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


      it('should recognize Array<string> as className', testClassName({
        set: [ 'FOO', 'BAAAR' ],
        expect: [ 'FOO', 'BAAAR' ]
      }));


      it('should recognize <space separated classes> as className', testClassName({
        set: 'FOO BAAAR blub',
        expect: [ 'FOO', 'BAAAR', 'blub' ]
      }));

    });

  });


  describe('life-cycle', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        contextPadModule,
        providerModule
      ]
    }));


    function expectEntries(contextPad, element, entries) {

      var pad = contextPad.getPad(element),
          html = pad.html;

      entries.forEach(function(e) {
        var entry = domQuery('[data-action="' + e + '"]', html);
        expect(entry).not.to.be.null;
      });

      expect(domQueryAll('.entry', html).length).to.equal(entries.length);
    }


    describe('is open', function() {

      it('single element', inject(function(canvas, contextPad) {

        // given
        var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

        canvas.addShape(shape);

        // when
        contextPad.open(shape);

        // then
        expect(contextPad.isOpen(shape)).to.be.true;
      }));


      it('multiple elements', inject(function(canvas, contextPad) {

        // given
        var shape1 = { id: 's1', type: 'A', width: 100, height: 100, x: 10, y: 10 };
        var shape2 = { id: 's2', type: 'A', width: 100, height: 100, x: 210, y: 10 };

        canvas.addShape(shape1);
        canvas.addShape(shape2);

        // when
        contextPad.open([ shape1, shape2 ]);

        // then
        expect(contextPad.isOpen(shape1)).to.be.false;
        expect(contextPad.isOpen([ shape2 ])).to.be.false;
        expect(contextPad.isOpen([ shape1, shape2 ])).to.be.true;

      }));

    });


    describe('should open', function() {

      it('single element', inject(function(canvas, contextPad) {

        // given
        var shape = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

        canvas.addShape(shape);

        // when
        contextPad.open(shape);

        // then
        expect(contextPad.isOpen()).to.be.true;
      }));


      it('multiple elements', inject(function(canvas, contextPad) {

        // given
        var shape1 = { id: 's1', type: 'A', width: 100, height: 100, x: 10, y: 10 };
        var shape2 = { id: 's2', type: 'A', width: 100, height: 100, x: 210, y: 10 };

        canvas.addShape(shape1);
        canvas.addShape(shape2);

        // when
        contextPad.open([ shape1, shape2 ]);

        // then
        expect(contextPad.isOpen()).to.be.true;
      }));

    });


    it('should provide context dependent entries', inject(function(canvas, contextPad) {

      // given
      var shapeA = { id: 's1', type: 'A', width: 100, height: 100, x: 10, y: 10 };
      var shapeB = { id: 's2', type: 'B', width: 100, height: 100, x: 210, y: 10 };
      var shapeA2 = { id: 's3', type: 'A', width: 100, height: 100, x: 410, y: 10 };

      canvas.addShape(shapeA);
      canvas.addShape(shapeB);
      canvas.addShape(shapeA2);

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

      // when (4)
      contextPad.open([ shapeA, shapeA2 ]);

      // then (4)
      expectEntries(contextPad, [ shapeA, shapeA2 ], [ 'action.a' ]);

      // when (5)
      contextPad.open([ shapeA, shapeB ]);

      // then (5)
      expectEntries(contextPad, [ shapeA, shapeB ], [ ]);

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

  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        contextPadModule,
        selectionModule,
        providerModule
      ]
    }));


    var openSpy, closeSpy;

    function expectOpened(target) {
      expect(openSpy).to.have.been.calledOnceWith(target);

      openSpy.resetHistory();
      closeSpy.resetHistory();
    }

    function expectUntouched() {
      expect(openSpy).not.to.have.been.called;
      expect(closeSpy).not.to.have.been.called;
    }

    function expectClosed() {
      expect(closeSpy).to.have.been.calledOnce;

      openSpy.resetHistory();
      closeSpy.resetHistory();
    }

    beforeEach(inject(function(eventBus) {
      openSpy = sinon.spy();
      closeSpy = sinon.spy();

      eventBus.on('contextPad.open', function(event) {
        openSpy(event.current.target);
      });

      eventBus.on('contextPad.close', closeSpy);
    }));


    describe('<elements.changed>', function() {

      function change(elements) {
        getDiagramJS().invoke(function(eventBus) {
          eventBus.fire('elements.changed', {
            elements: isArray(elements) ? elements : [ elements ]
          });
        });
      }


      describe('should handle changed', function() {

        it('single target', inject(function(eventBus, canvas, contextPad) {

          // given
          var shape_1 = { id: 's1', width: 100, height: 100, x: 10, y: 10 };

          canvas.addShape(shape_1);

          // assume
          contextPad.open(shape_1);

          // then
          expectOpened(shape_1);

          // when
          change(shape_1);

          // then
          expectOpened(shape_1);
        }));


        it('multiple targets', inject(function(eventBus, canvas, contextPad) {

          // given
          var shape_1 = { id: 's1', width: 100, height: 100, x: 10, y: 10 };
          var shape_2 = { id: 's2', width: 50, height: 50, x: 210, y: 10 };

          canvas.addShape(shape_1);
          canvas.addShape(shape_2);

          // assume
          contextPad.open([ shape_1, shape_2 ]);

          // then
          expectOpened([ shape_1, shape_2 ]);

          // when
          change(shape_1);

          // then
          expectOpened([ shape_1, shape_2 ]);
        }));

      });


      describe('should ignore unrelated', function() {

        it('single target', inject(function(eventBus, canvas, contextPad) {

          // given
          var shape_1 = { id: 's1', width: 100, height: 100, x: 10, y: 10 };
          var shape_2 = { id: 's2', width: 100, height: 100, x: 210, y: 10 };

          canvas.addShape(shape_1);
          canvas.addShape(shape_2);

          // assume
          contextPad.open(shape_1);

          // then
          expectOpened(shape_1);

          // when
          change(shape_2);

          // then
          expectUntouched();
        }));


        it('multiple targets', inject(function(eventBus, canvas, contextPad) {

          // given
          var shape_1 = { id: 's1', width: 100, height: 100, x: 10, y: 10 };
          var shape_2 = { id: 's2', width: 50, height: 50, x: 210, y: 10 };
          var shape_3 = { id: 's3', width: 50, height: 50, x: 410, y: 10 };

          canvas.addShape(shape_1);
          canvas.addShape(shape_2);
          canvas.addShape(shape_3);

          // assume
          contextPad.open([ shape_1, shape_2 ]);

          // then
          expectOpened([ shape_1, shape_2 ]);

          // when
          change(shape_3);

          // then
          expectUntouched();
        }));

      });

    });


    describe('<selection.changed>', function() {

      function select(elements) {
        getDiagramJS().invoke(function(selection) {
          selection.select(isArray(elements) ? elements : [ elements ]);
        });
      }


      describe('should handle select', function() {

        it('single target', inject(function(eventBus, canvas, contextPad) {

          // given
          var shape_1 = { id: 's1', width: 100, height: 100, x: 10, y: 10 };
          var shape_2 = { id: 's2', width: 100, height: 100, x: 10, y: 10 };

          canvas.addShape(shape_1);
          canvas.addShape(shape_2);

          // assume
          contextPad.open(shape_1);

          // then
          expectOpened(shape_1);

          // when
          select(shape_2);

          // then
          expectOpened(shape_2);

          // when
          select([]);

          // then
          expectClosed();
        }));


        it('multiple targets', inject(function(eventBus, canvas, contextPad) {

          // given
          var shape_1 = { id: 's1', width: 100, height: 100, x: 10, y: 10 };
          var shape_2 = { id: 's2', width: 50, height: 50, x: 210, y: 10 };

          canvas.addShape(shape_1);
          canvas.addShape(shape_2);

          // assume
          contextPad.open([ shape_1, shape_2 ]);

          // then
          expectOpened([ shape_1, shape_2 ]);

          // when
          select(shape_1);

          // then
          expectOpened(shape_1);

          // when
          select([ shape_1, shape_2 ]);

          // then
          expectOpened([ shape_1, shape_2 ]);
        }));

      });

    });

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

    var NUM_REGEX = /([+-]?\d*[.]?\d+)(?=,|\))/g;
    var zoomLevels = [ 1.0, 1.2, 3.5, 10, 0.5 ];

    function asVector(scaleStr) {
      if (scaleStr && scaleStr !== 'none') {
        var m = scaleStr.match(NUM_REGEX);

        var x = parseFloat(m[0], 10);
        var y = m[1] ? parseFloat(m[1], 10) : x;

        return {
          x: x,
          y: y
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


  describe('icons', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        contextPadModule,
        providerModule
      ]
    }));


    it('should NOT allow XSS via imageUrl', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', type: 'bigImage', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);
      contextPad.registerProvider({
        getContextPadEntries: function() {
          return {
            entry: {
              imageUrl: '"><marquee />'
            }
          };
        }
      });

      // when
      contextPad.open(shape);

      // then
      var pad = contextPad.getPad(shape),
          padContainer = pad.html,
          injected = domQuery('marquee', padContainer);

      expect(injected).not.to.exist;
    }));


    it('should limit image size', function(done) {

      function verify(entry, image) {
        var imageBox = image.getBoundingClientRect(),
            entryBox = entry.getBoundingClientRect();

        try {
          expect(entryBox.width).to.eql(imageBox.width);
          expect(entryBox.height).to.eql(imageBox.width);

          done();
        } catch (error) {
          done(error);
        }
      }

      var test = inject(function(canvas, contextPad) {

        // given
        var shape = { id: 's1', type: 'bigImage', width: 100, height: 100, x: 10, y: 10 };

        canvas.addShape(shape);

        // when
        contextPad.open(shape);

        // then
        var pad = contextPad.getPad(shape),
            padContainer = pad.html;

        var entry = domQuery('[data-action="action.c"]', padContainer),
            image = domQuery('img', entry);

        if (image.complete) {
          return verify(entry, image);
        }

        image.onload = function() {
          verify(entry, image);
        };

        image.onerror = function(error) {
          done(error);
        };
      });

      test();
    });
  });


  describe('grouping', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        contextPadModule
      ]
    }));


    it('should NOT allow XSS via group', inject(function(canvas, contextPad) {

      // given
      var shape = { id: 's1', type: 'bigImage', width: 100, height: 100, x: 10, y: 10 };

      canvas.addShape(shape);
      contextPad.registerProvider({
        getContextPadEntries: function() {
          return {
            entry: {
              group: '"><marquee />'
            }
          };
        }
      });

      // when
      contextPad.open(shape);

      // then
      var pad = contextPad.getPad(shape),
          padContainer = pad.html,
          injected = domQuery('marquee', padContainer);

      expect(injected).not.to.exist;
    }));
  });
});
