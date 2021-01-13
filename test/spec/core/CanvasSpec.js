import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import { merge } from 'min-dash';

import {
  queryAll as domQueryAll,
  matches as domMatches
} from 'min-dom';

import {
  attr as svgAttr,
  classes as svgClasses
} from 'tiny-svg';

import { getChildren as getChildrenGfx } from 'lib/util/GraphicsUtil';


describe('Canvas', function() {

  var container;

  /**
   * Create a diagram with the given options
   */
  function createDiagram(options) {
    return bootstrapDiagram(function() {
      return merge({
        canvas: {
          container: container,
          deferUpdate: false
        }
      }, options);
    }, {});
  }


  describe('initialize', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(createDiagram());

    it('should create <svg> element', inject(function() {

      // then
      var svg = container.querySelector('svg');

      expect(svg).not.to.be.null;
    }));

  });


  describe('events', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should fire "canvas.resized" event', inject(function(eventBus, canvas) {

      // given
      var listener = sinon.spy();
      eventBus.on('canvas.resized', listener);

      canvas._cachedViewbox = 'FOO';

      // when
      canvas.resized();

      // then
      expect(listener).to.have.been.called;
      expect(canvas._cachedViewbox).not.to.exist;
    }));

  });


  describe('destroy', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(createDiagram());


    it('should detach diagram container', inject(function(eventBus, canvas) {

      // when
      eventBus.fire('diagram.destroy');

      // then
      expect(container.childNodes.length).to.equal(0);
    }));

  });


  describe('clear', function() {

    beforeEach(createDiagram());


    it('should remove elements', inject(function(canvas, elementRegistry) {

      // given
      canvas.setRootElement({ id: 'FOO' });

      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });
      canvas.addShape({ id: 'b', x: 100, y: 20, width: 50, height: 50 });

      var baseLayer = canvas.getDefaultLayer();

      // when
      canvas._clear();

      // then
      expect(canvas._rootElement).not.to.exist;

      // all elements got removed
      expect(domQueryAll('*', baseLayer).length).to.equal(0);

      expect(elementRegistry.getAll()).to.be.empty;

      expect(canvas._cachedViewbox).not.to.exist;
    }));

  });


  describe('#addShape', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(createDiagram());


    it('should fire <shape.add> event', inject(function(canvas, eventBus) {

      // given
      var listener = sinon.spy();
      eventBus.on('shape.add', listener);

      // when
      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // then
      expect(listener).to.have.been.called;
    }));


    it('should fire <shape.added> event', inject(function(canvas, eventBus) {

      // given
      var listener = sinon.spy();
      eventBus.on('shape.added', listener);

      // when
      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // then
      expect(listener).to.have.been.called;
    }));


    it('should add shape to registry', inject(function(canvas, elementRegistry) {

      var shape = { id: 'a', x: 10, y: 20, width: 50, height: 50 };

      // when
      canvas.addShape(shape);

      // then
      expect(elementRegistry.get('a')).to.equal(shape);
    }));


    it('should fail when shape#id is not set', inject(function(canvas) {

      // given
      var s = { x: 10, y: 20, width: 50, height: 50 };

      expect(function() {

        // when
        canvas.addShape(s);

        throw new Error('expected exception');
      }).to.throw('element must have an id');
    }));


    it('should fail when adding shape#id twice', inject(function(canvas, elementRegistry) {

      // given
      var s = { id: 'FOO', x: 10, y: 10, width: 50, height: 50 };

      expect(function() {

        // when
        canvas.addShape(s);
        canvas.addShape(s);

        throw new Error('expected exception');
      }).to.throw('element with id FOO already exists');

    }));


    it('should fail on missing attr', inject(function(canvas, elementRegistry) {

      // given
      var s = { id: 'FOO', x: 10 };

      expect(function() {

        // when
        canvas.addShape(s);

        throw new Error('expected exception');
      }).to.throw('must supply { x, y, width, height } with shape');

    }));


    it('should add element hidden', inject(function(canvas, elementRegistry) {

      // given
      var shape = { id: 'FOO', x: 10, y: 10, width: 50, height: 50, hidden: true };

      // when
      canvas.addShape(shape);

      var gfx = elementRegistry.getGraphics(shape);

      // then
      expect(svgAttr(gfx, 'display')).to.equal('none');
    }));


    it('should wire parent child relationship', inject(function(elementFactory, canvas) {

      // given
      var parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      var childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110, width: 100, height: 100
      });

      // when
      canvas.addShape(parentShape);
      canvas.addShape(childShape, parentShape);

      // then
      expect(parentShape.children).to.contain(childShape);
      expect(childShape.parent).to.equal(parentShape);
    }));


    it('should add with parentIndex', inject(function(elementFactory, canvas) {

      // given
      var parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      var childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110, width: 100, height: 100
      });

      var firstChildShape = elementFactory.createShape({
        id: 'first-child',
        x: 110, y: 110, width: 100, height: 100
      });

      canvas.addShape(parentShape);
      canvas.addShape(childShape, parentShape);

      // when
      canvas.addShape(firstChildShape, parentShape, 0);

      // then
      expectChildren(parentShape, [
        firstChildShape,
        childShape
      ]);
    }));

  });


  describe('#removeShape', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(createDiagram());

    it('should fire <shape.removed> event', inject(function(canvas, eventBus, elementRegistry) {

      // given
      var listener = sinon.spy();
      eventBus.on('shape.removed', listener);

      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // when
      var shape = canvas.removeShape('a');

      // then
      expect(shape.parent).to.be.null;
      expect(elementRegistry.get('a')).not.to.exist;

      expect(listener).to.have.been.called;
    }));


    it('should remove shape from registry', inject(function(canvas, elementRegistry) {

      // given
      canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });

      // when
      canvas.removeShape('a');

      // then
      expect(elementRegistry.get('a')).not.to.exist;
    }));


    it('should unwire parent child relationship', inject(function(elementFactory, canvas) {

      // given
      var parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      var childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110, width: 100, height: 100
      });

      canvas.addShape(parentShape);
      canvas.addShape(childShape, parentShape);

      // when
      canvas.removeShape(childShape);

      // then
      expect(parentShape.children).to.be.empty;
      expect(childShape.parent).to.be.null;
    }));

  });


  describe('#addConnection', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram());


    it('should fire <connection.added> event', inject(function(canvas, eventBus) {

      // given
      var listener = sinon.spy();

      canvas.addShape({ id: 's1', x: 10, y: 10, width: 30, height: 30 });
      canvas.addShape({ id: 's2', x: 100, y: 100, width: 30, height: 30 });

      eventBus.on('connection.added', listener);

      // when
      canvas.addConnection({ id: 'c1', waypoints: [ { x: 25, y: 25 }, { x: 115, y: 115 } ] });

      // then
      expect(listener).to.have.been.called;
    }));


    it('should fail on missing attr', inject(function(canvas, elementRegistry) {

      // given
      var c = { id: 'FOO' };

      expect(function() {

        // when
        canvas.addConnection(c);

        throw new Error('expected exception');
      }).to.throw('must supply { waypoints } with connection');

    }));


    it('should add with parentIndex', inject(function(elementFactory, canvas) {

      // given
      var rootElement = canvas.getRootElement();

      var childShape = canvas.addShape({ id: 's1', x: 10, y: 10, width: 30, height: 30 });
      var otherChildShape = canvas.addShape({ id: 's2', x: 100, y: 100, width: 30, height: 30 });

      // when
      var connection = canvas.addConnection({
        id: 'c1',
        waypoints: [
          { x: 25, y: 25 },
          { x: 115, y: 115 }
        ]
      }, rootElement, 1);

      // then
      expectChildren(rootElement, [
        childShape,
        connection,
        otherChildShape
      ]);
    }));

  });


  describe('#removeConnection', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(createDiagram());


    it('should fire <connection.removed> event', inject(function(canvas, eventBus, elementRegistry) {

      // given
      var listener = sinon.spy();

      canvas.addShape({ id: 's1', x: 10, y: 10, width: 30, height: 30 });
      canvas.addShape({ id: 's2', x: 100, y: 100, width: 30, height: 30 });

      eventBus.on('connection.removed', listener);

      canvas.addConnection({ id: 'c1', waypoints: [ { x: 25, y: 25 }, { x: 115, y: 115 } ] });

      // when
      var connection = canvas.removeConnection('c1');

      // then
      expect(connection.parent).to.be.null;
      expect(elementRegistry.get('c1')).to.be.undefined;

      expect(listener).to.have.been.called;
    }));

  });


  describe('root element(s)', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram());


    it('should always return root element', inject(function(canvas) {

      // when
      // accessing root element for the first time
      expect(canvas.getRootElement()).to.exist;

      // expect
      // the canvas to be correctly wired
      expect(svgAttr(canvas._svg, 'data-element-id')).to.equal('__implicitroot');
    }));


    it('should have implicit root element', inject(function(canvas) {

      // when
      var a = canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });
      var root = canvas.getRootElement();

      // then
      expect(a.parent).to.equal(root);
    }));


    it('should allow setting root element', inject(function(canvas, elementRegistry) {

      var rootElement = { id: 'XXXX' };

      // when
      var setRootElement = canvas.setRootElement(rootElement);

      // then
      expect(canvas.getRootElement()).to.equal(rootElement);

      // new root element is registered
      expect(elementRegistry.get('XXXX')).to.exist;
      expect(elementRegistry.getGraphics('XXXX')).to.equal(canvas.getDefaultLayer());

      // root element is returned from setter?
      expect(setRootElement).to.equal(rootElement);
    }));


    it('should only update root element with override flag', inject(function(canvas) {

      var rootElement = { id: 'oldRoot' },
          newRootElement = { id: 'newRoot' };

      // when
      canvas.setRootElement(rootElement);

      // then
      expect(function() {
        canvas.setRootElement(newRootElement);
      }).to.throw;

      // but when
      canvas.setRootElement(newRootElement, true);

      // then
      expect(canvas.getRootElement()).to.equal(newRootElement);
    }));


    it('should unset root element with override flag', inject(function(canvas, elementRegistry) {

      // given
      canvas.setRootElement({ id: 'root' });

      // when
      canvas.setRootElement(null, true);

      // then
      expect(canvas._rootElement).to.equal(null);

      // root is unbound from canvas
      expect(svgAttr(canvas._svg, 'data-element-id')).to.equal('');

      expect(elementRegistry.getAll()).to.be.empty;
    }));


    it('should use explicitly defined root element', inject(function(canvas, elementRegistry) {

      // given
      var rootElement = canvas.setRootElement({ id: 'XXXX' });

      // when
      var shape = canvas.addShape({ id: 'child', width: 100, height: 100, x: 10, y: 10 }, elementRegistry.get('XXXX'));

      // then
      expect(shape.parent).to.equal(rootElement);
    }));

  });


  describe('viewbox', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    describe('getter', function() {

      it('should provide default viewbox', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));

      it('should provide default viewbox / overflowing diagram', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { width: 600, height: 600, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should provide default viewbox / offset element', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 150, height: 100 });

        // when
        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { width: 150, height: 100, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });
      }));

    });


    describe('setter', function() {

      it('should set viewbox', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = { x: 100, y: 100, width: 600, height: 600 };

        // when
        canvas.viewbox(viewbox);

        var changedViewbox = canvas.viewbox();

        // then
        expect(changedViewbox).to.eql({
          x: 100, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should set viewbox to origin', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 100, y: 100, width: 200, height: 200 });

        var viewbox = { x: 100, y: 100, width: 300, height: 300 };

        // when
        canvas.viewbox(viewbox);

        var changedViewbox = canvas.viewbox();

        // then
        expect(changedViewbox).to.eql({
          x: 100, y: 100,
          width: 300, height: 300,
          scale: 1,
          inner: { width: 200, height: 200, x: 100, y: 100 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should set viewbox / negative coordinates', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: -50, y: -50, width: 600, height: 600 });

        // when
        // set viewbox to inner viewbox
        canvas.viewbox(canvas.viewbox().inner);

        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).to.eql({
          x: -50, y: -50,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600, x: -50, y: -50 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should set viewbox / overflow', inject(function(canvas, eventBus) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 1200, height: 1200 });

        var viewbox = { x: 100, y: 100, width: 600, height: 600 };

        // when
        canvas.viewbox(viewbox);

        // then
        var changedViewbox = canvas.viewbox();

        expect(changedViewbox).to.eql({
          x: 100, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 1200, height: 1200, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should set viewbox / zoomed in', inject(function(canvas, eventBus) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = { x: 50, y: 50, width: 200, height: 200 };

        // when
        canvas.viewbox(viewbox);

        // then
        var changedViewbox = canvas.viewbox();

        expect(changedViewbox).to.eql({
          x: 50, y: 50,
          width: 200, height: 200,
          scale: 1.5,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should fire <canvas.viewbox.changed> event', inject(function(canvas, eventBus) {

        var changedListener = sinon.spy();
        eventBus.on('canvas.viewbox.changed', changedListener);

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = { x: 100, y: 100, width: 600, height: 600 };

        // when
        canvas.viewbox(viewbox);

        // then
        var calls = changedListener.callCount;

        expect(calls).to.equal(1);
        expect(changedListener.getCall(0).args[0].viewbox).to.eql({
          x: 100, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 300, height: 300, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });

      }));

    });

  });


  describe('viewbox - debounce', function() {

    var clock;

    beforeEach(function() {
      container = TestContainer.get(this);

      clock = sinon.useFakeTimers();
    });

    afterEach(function() {
      clock.restore();
    });


    beforeEach(createDiagram({
      canvas: {
        width: 300,
        height: 300,
        deferUpdate: true
      }
    }));


    // NOTE(nikku): this relies on fake timers properly set up
    // to work with lodash (see TestHelper)

    it('should debounce viewbox update', inject(function(eventBus, canvas) {

      // given
      var changedListener = sinon.spy(function(event) {
        var viewbox = event.viewbox;

        expect(viewbox).to.exist;
        expect(viewbox.scale).to.eql(0.5);
      });

      eventBus.on('canvas.viewbox.changed', changedListener);

      // when
      canvas.zoom(0.5);

      // then
      expect(changedListener).not.to.have.been.called;

      // but when...
      // letting the viewbox changed timeout of 300ms kick in
      clock.tick(300);

      // then
      expect(changedListener).to.have.been.called;
    }));


    it('should provide new viewbox immediately via getter', inject(function(canvas) {

      // given
      canvas.zoom();

      // when
      canvas.zoom(0.5);

      // then
      var newZoom = canvas.zoom();

      expect(newZoom).to.eql(0.5);
    }));

  });


  describe('scroll', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    describe('setter', function() {

      it('should scroll x/y', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = canvas.viewbox();

        // when
        var newScroll = canvas.scroll({ dx: 50, dy: 100 });

        // then
        expect(newScroll.x).to.equal(viewbox.x + 50);
        expect(newScroll.y).to.equal(viewbox.y + 100);

      }));


      it('should fire <canvas.viewbox.changed>', inject(function(eventBus, canvas) {

        var changedListener = sinon.spy();
        eventBus.on('canvas.viewbox.changed', changedListener);

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = canvas.viewbox();

        // when
        canvas.scroll({ dx: 50, dy: 100 });

        // then
        var calls = changedListener.callCount;

        expect(calls).to.equal(1);

        // expect { viewbox } event
        var newViewbox = changedListener.getCall(0).args[0].viewbox;

        expect(newViewbox.x).to.equal(viewbox.x - 50);
        expect(newViewbox.y).to.equal(viewbox.y - 100);

      }));

    });


    describe('getter', function() {

      it('should get scroll', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        var viewbox = canvas.viewbox();

        // when
        canvas.scroll({ dx: 50, dy: 100 });

        var newScroll = canvas.scroll();

        // then
        expect(newScroll.x).to.be.closeTo(viewbox.x + 50, .001);
        expect(newScroll.y).to.be.closeTo(viewbox.y + 100, .001);

      }));

    });

  });


  describe('zoom', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    describe('getter', function() {

      it('should return 1.0 / without zoom', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var zoom = canvas.zoom();

        // then
        expect(zoom).to.equal(1.0);
      }));


      it('should return 1.0 / without zoom / with overflow', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        var zoom = canvas.zoom();

        // then
        expect(zoom).to.equal(1.0);
      }));


      it('should return new scale after zoom', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        canvas.zoom(0.5);
        var zoom = canvas.zoom();

        // then
        expect(zoom).to.equal(0.5);
      }));

    });


    describe('setter', function() {

      it('should return new scale', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

        // when
        var zoom = canvas.zoom(0.5);

        // then
        expect(zoom).to.equal(0.5);
      }));


      it('should zoom fit-viewport (horizontally)', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 600, height: 200 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(0.5);

        expect(viewbox).to.eql({
          x: 50, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 200, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom fit-viewport (vertically)', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 250, height: 600 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(0.5);

        expect(viewbox).to.eql({
          x: 50, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 250, height: 600, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom fit-viewport / no scale up / align origin', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 50, height: 50 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(1);

        expect(viewbox).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1,
          inner: { width: 50, height: 50, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom fit-viewport / no scale up / negative coordinates', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: -50, y: -100, width: 50, height: 50 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(1);

        expect(viewbox).to.eql({
          x: -50, y: -100,
          width: 300, height: 300,
          scale: 1,
          inner: { width: 50, height: 50, x: -50, y: -100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom fit-viewport / scroll into view', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // scroll somewhere to change viewbox (x, y)
        canvas.zoom(2.0, { x: 200, y: 200 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(0.5);

        expect(viewbox).to.eql({
          x: 0, y: 0,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });

      }));

      it('should zoom fit-viewport / no scale up / center position', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 50, height: 50 });

        // scroll somewhere to change viewbox (x, y)
        canvas.zoom(2.0, { x: 200, y: 200 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(1);

        expect(viewbox).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1,
          inner: { width: 50, height: 50, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });

      }));

      it('should zoom fit-viewport / scale horizontally / center position', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 600, height: 200 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(0.5);

        expect(viewbox).to.eql({
          x: 50, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 200, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));

      it('should zoom fit-viewport / scale vertically / center position', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 50, y: 100, width: 250, height: 600 });

        // when
        var zoom = canvas.zoom('fit-viewport');
        var viewbox = canvas.viewbox();

        // then
        expect(zoom).to.equal(0.5);

        expect(viewbox).to.eql({
          x: 50, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 250, height: 600, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));

      it('should zoom fit-viewport, negative coordinates', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: -50, y: -50, width: 600, height: 600 });

        // when
        canvas.zoom('fit-viewport');

        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).to.eql({
          x: -50, y: -50,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 600, x: -50, y: -50 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should zoom 1.0', inject(function(canvas) {

        // given
        canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

        // when
        canvas.zoom('fit-viewport');
        canvas.zoom(1.0);

        var viewbox = canvas.viewbox();

        // then
        expect(viewbox).to.eql({
          x: 150, y: 150,
          width: 300, height: 300,
          scale: 1,
          inner: { width: 600, height: 600, x: 0, y: 0 },
          outer: { width: 300, height: 300 }
        });
      }));


      it('should remove cached viewbox on shape add', inject(function(canvas) {

        // given
        // enforce initial zoom
        canvas.zoom('fit-viewport');

        canvas.addShape({
          id: 's0',
          x: 50, y: 100,
          width: 600, height: 200
        });

        // when
        canvas.zoom('fit-viewport');

        // then
        expect(canvas.viewbox()).to.eql({
          x: 50, y: 100,
          width: 600, height: 600,
          scale: 0.5,
          inner: { width: 600, height: 200, x: 50, y: 100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should remove cached viewbox on shape add', inject(
        function(canvas, eventBus, graphicsFactory) {
          var shape = canvas.addShape({
            id: 's0',
            x: 0, y: 100,
            width: 600, height: 200
          });

          // given
          // enforce initial zoom
          canvas.zoom('fit-viewport');

          // simultate element changed (move x+50)
          shape.x = 50;
          graphicsFactory.update('shape', shape, canvas.getGraphics(shape));
          eventBus.fire('elements.changed', { elements: [ shape ] });

          // when
          canvas.zoom('fit-viewport');

          // then
          expect(canvas.viewbox()).to.eql({
            x: 50, y: 100,
            width: 600, height: 600,
            scale: 0.5,
            inner: { width: 600, height: 200, x: 50, y: 100 },
            outer: { width: 300, height: 300 }
          });

        }
      ));


      describe('reposition', function() {

        it('should zoom out (center)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(0.5, { x: 150, y: 150 });
          var viewbox = canvas.viewbox();

          // then
          expect(zoom).to.equal(0.5);

          expect(viewbox).to.eql({
            x: -150, y: -150,
            width: 600, height: 600,
            scale: 0.5,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom out (1/3)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(0.5, { x: 100, y: 100 });
          var viewbox = canvas.viewbox();

          // then
          expect(zoom).to.equal(0.5);

          expect(viewbox).to.eql({
            x: -100, y: -100,
            width: 600, height: 600,
            scale: 0.5,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom out / zoomed in', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          canvas.viewbox({ x: 50, y: 50, width: 200, height: 200 });

          // when
          var zoom = canvas.zoom(0.5, { x: 150, y: 150 });
          var viewbox = canvas.viewbox();

          expect(zoom).to.equal(0.5);

          // then
          expect(viewbox).to.eql({
            x: -150,
            y: -150,
            width: 600,
            height: 600,
            scale: 0.5,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom in (center)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(2.0, { x: 150, y: 150 });
          var viewbox = canvas.viewbox();

          expect(zoom).to.equal(2.0);

          // then
          expect(viewbox).to.eql({
            x: 75,
            y: 75,
            width: 150,
            height: 150,
            scale: 2.0,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom in (1/3)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(2.0, { x: 100, y: 150 });
          var viewbox = canvas.viewbox();

          expect(zoom).to.equal(2.0);

          // then
          expect(viewbox).to.eql({
            x: 50,
            y: 75,
            width: 150,
            height: 150,
            scale: 2.0,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));

        it('should zoom in (2/3)', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 300, height: 300 });

          // when
          var zoom = canvas.zoom(2.0, { x: 150, y: 200 });
          var viewbox = canvas.viewbox();

          expect(zoom).to.equal(2.0);

          // then
          expect(viewbox).to.eql({
            x: 75,
            y: 100,
            width: 150,
            height: 150,
            scale: 2.0,
            inner: { width: 300, height: 300, x: 0, y: 0 },
            outer: { width: 300, height: 300 }
          });

        }));


        it('should zoom with auto positioning in / out', inject(function(canvas) {

          // given
          canvas.addShape({ id: 's0', x: 0, y: 0, width: 600, height: 600 });

          // when
          canvas.zoom(2.0);
          canvas.zoom(0.3);
          canvas.zoom(1.5);
          canvas.zoom(1.8);
          canvas.zoom(0.5);

          var viewbox = canvas.viewbox();

          // then
          expect(viewbox.x).to.equal(-150);
          expect(viewbox.y).to.equal(-150);
        }));

      });

    });

  });


  describe('#getAbsoluteBBox', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    it('should return abs position (default zoom)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).to.eql({ x: 10, y: 20, width: 300, height: 200 });
    }));


    it('should return abs position (moved)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      canvas.viewbox({ x: 50, y: 50, width: 300, height: 300 });

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).to.eql({ x: -40, y: -30, width: 300, height: 200 });
    }));


    it('should return abs position (zoomed in)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      canvas.viewbox({ x: 50, y: 50, width: 600, height: 600 });

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).to.eql({ x: -20, y: -15, width: 150, height: 100 });
    }));


    it('should return abs position (zoomed in)', inject(function(canvas) {

      // given
      var shape = { id: 's0', x: 10, y: 20, width: 300, height: 200 };
      canvas.addShape(shape);

      canvas.viewbox({ x: 50, y: 50, width: 150, height: 150 });

      // when
      var bbox = canvas.getAbsoluteBBox(shape);

      // then
      expect(bbox).to.eql({ x: -80, y: -60, width: 600, height: 400 });
    }));

  });


  describe('#getGraphics', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));

    var shape;

    beforeEach(inject(function(canvas) {
      shape = canvas.addShape({ id: 'shape', x: 100, y: 100, width: 100, height: 100 });
    }));


    it('should return primary graphics for shape', inject(function(canvas) {

      // when
      var gfx = canvas.getGraphics(shape),
          secondaryGfx = canvas.getGraphics(shape, true);

      // then
      expect(gfx).to.exist;
      expect(secondaryGfx).to.be.undefined;
    }));


    it('should return primary + secondary graphics for root', inject(function(canvas) {

      var root = canvas.getRootElement();

      // when
      var gfx = canvas.getGraphics(root),
          secondaryGfx = canvas.getGraphics(root, true);

      // then
      expect(gfx).to.exist;
      expect(gfx.nodeName).to.equal('g');

      expect(secondaryGfx).to.exist;
      expect(secondaryGfx.nodeName).to.equal('svg');
    }));

  });


  describe('markers', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    var shape, gfx;

    beforeEach(inject(function(canvas) {
      shape = canvas.addShape({ id: 's0', x: 10, y: 20, width: 300, height: 200 });
      gfx = canvas.getGraphics(shape);
    }));


    it('should add', inject(function(canvas) {

      // when
      canvas.addMarker(shape, 'foo');

      // then
      expect(canvas.hasMarker(shape, 'foo')).to.be.true;
      expect(svgClasses(gfx).has('foo')).to.be.true;
    }));


    it('should add to secondary gfx', inject(function(canvas) {

      var root = canvas.getRootElement(),
          svgGfx = canvas.getGraphics(root, true);

      // when
      canvas.addMarker(root, 'foo');

      // then
      expect(canvas.hasMarker(root, 'foo')).to.be.true;
      expect(svgClasses(svgGfx).has('foo')).to.be.true;
    }));


    it('should remove', inject(function(canvas) {

      // given
      canvas.addMarker(shape, 'foo');

      // when
      canvas.removeMarker(shape, 'foo');

      // then
      expect(canvas.hasMarker(shape, 'foo')).to.be.false;
      expect(svgClasses(gfx).has('foo')).to.be.false;
    }));


    it('should toggle', inject(function(canvas) {

      // when
      canvas.toggleMarker(shape, 'foo');

      // then
      expect(canvas.hasMarker(shape, 'foo')).to.be.true;
      expect(svgClasses(gfx).has('foo')).to.be.true;

      // but when
      canvas.toggleMarker(shape, 'foo');

      // then
      expect(canvas.hasMarker(shape, 'foo')).to.be.false;
      expect(svgClasses(gfx).has('foo')).to.be.false;

    }));


    describe('eventBus integration', function() {

      var capturedEvents;

      beforeEach(inject(function(eventBus) {

        capturedEvents = [];

        eventBus.on('element.marker.update', function(event) {
          capturedEvents.push([ event.element, event.marker, event.add ]);
        });
      }));


      it('should fire element.marker.update', inject(function(canvas) {

        canvas.addMarker(shape, 'bar');
        canvas.removeMarker(shape, 'foo');
        canvas.toggleMarker(shape, 'bar');

        expect(capturedEvents).to.eql([
          [ shape, 'bar', true ],
          [ shape, 'foo', false ],
          [ shape, 'bar', false ]
        ]);
      }));

    });

  });

  describe('layers', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram({ canvas: { width: 300, height: 300 } }));


    it('get default layer', inject(function(canvas) {

      // when
      canvas.getDefaultLayer();

      // then
      expectLayersOrder(canvas._viewport, [
        'base'
      ]);
    }));


    it('layer with negative index is below default layer', inject(function(canvas) {

      // when
      canvas.getDefaultLayer();
      canvas.getLayer('foo', -10);

      // then
      expectLayersOrder(canvas._viewport, [
        'foo',
        'base'
      ]);
    }));


    it('layer with positive index is above default layer', inject(function(canvas) {

      // when
      canvas.getDefaultLayer();
      canvas.getLayer('foo', 10);

      // then
      expectLayersOrder(canvas._viewport, [
        'base',
        'foo'
      ]);
    }));


    it('layer without specified index gets default index', inject(function(canvas) {

      // when
      canvas.getDefaultLayer();
      canvas.getLayer('foo');

      // then
      expectLayersOrder(canvas._viewport, [
        'base',
        'foo'
      ]);
    }));


    it('layer with same index is above previously created layer', inject(function(canvas) {

      // when
      canvas.getLayer('foo');
      canvas.getLayer('bar');

      // then
      expectLayersOrder(canvas._viewport, [
        'foo',
        'bar'
      ]);
    }));


    it('layer with higher index is above layer with lower index', inject(function(canvas) {

      // when
      canvas.getLayer('foo', 10);
      canvas.getLayer('bar', 20);

      // then
      expectLayersOrder(canvas._viewport, [
        'foo',
        'bar'
      ]);
    }));


    it('layer with lower index is below layer with higher index', inject(function(canvas) {

      // when
      canvas.getLayer('foo', 20);
      canvas.getLayer('bar', 10);

      // then
      expectLayersOrder(canvas._viewport, [
        'bar',
        'foo'
      ]);
    }));


    it('layer cannot be retrieved with conflicting indices', inject(function(canvas) {

      // given
      canvas.getLayer('foo', 10);

      // when
      expect(function() {

        // then
        canvas.getLayer('foo', 20);
      }).to.throw(/layer <.*> already created at index <.*>/);
    }));

  });

});



// helpers //////////////////////

function expectLayersOrder(layersParent, expected) {
  var layers = layersParent.childNodes;

  for (var i = 0; i < layers.length; ++i) {
    var hasClass = svgClasses(layers[i]).has('layer-' + expected[i]);

    expect(hasClass).to.be.true;
  }
}

function expectChildren(parent, children) {

  return getDiagramJS().invoke(function(elementRegistry) {

    // verify model is consistent
    expect(parent.children).to.eql(children);

    // verify SVG is consistent
    var parentGfx = elementRegistry.getGraphics(parent);

    var expectedChildrenGfx = children.map(function(c) {
      return elementRegistry.getGraphics(c);
    });

    var childrenContainerGfx =
      domMatches(parentGfx, '[data-element-id="__implicitroot"]')
        ? parentGfx
        : getChildrenGfx(parentGfx);

    var existingChildrenGfx = Array.prototype.map.call(childrenContainerGfx.childNodes, function(c) {
      return c.querySelector('.djs-element');
    });

    expect(existingChildrenGfx).to.eql(expectedChildrenGfx);
  });

}