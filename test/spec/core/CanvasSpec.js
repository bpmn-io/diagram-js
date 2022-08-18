import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import { merge } from 'min-dash';

import {
  queryAll as domQueryAll
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


    it('should remove root elements', inject(function(canvas, elementRegistry) {

      // given
      canvas.addRootElement({ id: 'a' });
      canvas.setRootElement(canvas.addRootElement({ id: 'b' }));

      // when
      canvas._clear();

      // then
      expect(canvas._planes).to.be.empty;
      expect(canvas._layers).to.be.empty;
      expect(canvas._rootElement).not.to.exist;
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
      }).to.throw('element must have an id');
    }));


    it('should fail when adding shape#id twice', inject(function(canvas, elementRegistry) {

      // given
      var s = { id: 'FOO', x: 10, y: 10, width: 50, height: 50 };

      expect(function() {

        // when
        canvas.addShape(s);
        canvas.addShape(s);
      }).to.throw('element <FOO> already exists');

    }));


    it('should fail on missing attr', inject(function(canvas, elementRegistry) {

      // given
      var s = { id: 'FOO', x: 10 };

      expect(function() {

        // when
        canvas.addShape(s);
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
      }).to.throw('must supply { waypoints } with connection');

    }));


    it('should add with parentIndex', inject(function(elementFactory, canvas) {

      // given
      var rootElement = canvas.getRootElement();

      // assume
      expect(rootElement).to.exist;

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


    it('should always return root element', inject(function(canvas, elementRegistry) {

      // when
      // accessing root element for the first time
      var implictRoot = canvas.getRootElement();

      // then
      // element exists
      expect(implictRoot).to.exist;

      // the canvas is correctly wired
      var name = svgAttr(canvas._svg, 'data-element-id');
      expect(name).to.match(/^__implicitroot_/);

      expect(elementRegistry.get(implictRoot.id)).to.equal(implictRoot);
    }));


    it('should set root element', inject(function(canvas, elementRegistry) {

      // when
      // explicitly setting a root element
      var foobarRoot = canvas.setRootElement({ id: 'foobar' });

      // then
      // element exists
      expect(foobarRoot).to.exist;

      // the canvas to be correctly wired
      var name = svgAttr(canvas._svg, 'data-element-id');
      expect(name).to.match(/^foobar/);

      // element registry is populated
      expect(elementRegistry.get('foobar')).to.equal(foobarRoot);
    }));


    it('should have implicit root elements', inject(function(canvas) {

      // when
      // accessing root element for the first time
      var rootElement = canvas.getRootElement();

      // then
      expect(rootElement.isImplicit).to.be.true;
    }));


    it('should not create implicit roots when explicit elements are present',
      inject(function(canvas) {

        // given
        // root element is added but not set yet
        canvas.addRootElement({ id: 'foo' });

        // when
        var rootElement = canvas.getRootElement();

        // then
        expect(rootElement).not.to.exist;
      }));


    it('should use implicit root element', inject(function(canvas) {

      // when
      var a = canvas.addShape({ id: 'a', x: 10, y: 20, width: 50, height: 50 });
      var root = canvas.getRootElement();

      // then
      expect(a.parent).to.equal(root);
    }));


    it('should allow setting root element', inject(function(canvas, elementRegistry) {

      // when
      var rootElement = canvas.setRootElement({ id: 'XXXX' });

      // then
      expect(canvas.getRootElement()).to.equal(rootElement);

      // new root element is registered
      expect(elementRegistry.get('XXXX')).to.exist;
      expect(elementRegistry.getGraphics('XXXX')).to.equal(canvas.getActiveLayer());

      // root element is returned from setter?
      expect(rootElement).to.equal(rootElement);
    }));


    it('should fail with override flag', inject(function(canvas) {

      // then
      expect(function() {
        canvas.setRootElement({ id: 'newRoot' }, true);
      }).to.throw(/override not supported/);
    }));


    it('should list root elements', inject(function(canvas, elementRegistry) {

      // given
      var rootA = canvas.addRootElement({ id: 'a' });
      var rootB = canvas.addRootElement({ id: 'b' });

      // when
      var rootElements = canvas.getRootElements();

      // then
      expect(rootElements).to.eql([
        rootA,
        rootB
      ]);
    }));


    it('should not allow unsetting root element', inject(function(canvas, elementRegistry) {

      // given
      canvas.setRootElement({ id: 'root' });

      expect(function() {

        // when
        canvas.setRootElement(null);
      }).to.throw(/rootElement required/);

    }));


    it('should use explicitly defined root element', inject(function(canvas, elementRegistry) {

      // given
      var rootElement = canvas.setRootElement({ id: 'XXXX' });

      // when
      var shape = canvas.addShape({ id: 'child', width: 100, height: 100, x: 10, y: 10 }, rootElement);

      // then
      expect(shape.parent).to.equal(rootElement);
    }));


    it('should add root element', inject(function(canvas) {

      // given
      canvas.setRootElement({ id: 'XXXX' });

      // when
      var otherRoot = canvas.addRootElement({ id: 'Other' });

      // then
      expect(canvas.findRoot(otherRoot)).to.exist;

      expectLayersOrder(canvas._viewport, [
        canvas.getRootElement(),
        otherRoot
      ]);
    }));


    describe('#removeRootElement', function() {

      it('should remove root element', inject(function(canvas, elementRegistry) {

        // given
        var xxxxRoot = canvas.setRootElement({ id: 'XXXX' });

        var otherRoot = canvas.addRootElement({ id: 'Other' });

        // when
        canvas.removeRootElement(otherRoot);

        // then
        expect(canvas.findRoot(otherRoot)).not.to.exist;

        expect(elementRegistry.get('Other')).not.to.exist;

        expect(canvas.getRootElements()).to.eql([
          xxxxRoot
        ]);

        expectLayersOrder(canvas._viewport, [
          xxxxRoot
        ]);
      }));


      it('should remove active root', inject(function(canvas) {

        // given
        var root = canvas.setRootElement({ id: 'root' });
        var otherRoot = canvas.addRootElement({ id: 'otherRoot' });

        // when
        canvas.removeRootElement(root);

        // then
        expect(canvas.getRootElement()).to.not.exist;

        expect(canvas.getRootElements()).to.eql([
          otherRoot
        ]);

        expectLayersOrder(canvas._viewport, [
          otherRoot
        ]);
      }));


      it('should return removed root element', inject(function(canvas) {

        // given
        var root = canvas.setRootElement({ id: 'root' });

        // when
        var removedRoot = canvas.removeRootElement(root);

        // then
        expect(removedRoot).to.exist;
        expect(removedRoot).to.equal(root);
      }));


      it('should accept IDs', inject(function(canvas, elementRegistry) {

        // given
        var root = canvas.setRootElement({ id: 'root' });

        // when
        canvas.removeRootElement('root');

        // then
        expect(canvas.findRoot(root)).not.to.exist;

        expect(elementRegistry.get('root')).not.to.exist;

      }));

    });


    describe('layers', function() {

      it('should create layer below utility planes', inject(function(canvas) {

        // given
        canvas.getLayer('foo');

        // when
        var rootA = canvas.setRootElement({ id: 'A' });

        canvas.getLayer('bar');

        // then
        expectLayersOrder(canvas._viewport, [
          rootA,
          'foo',
          'bar'
        ]);
      }));


      it('should create layer with default priority', inject(function(canvas) {

        // when
        canvas.getDefaultLayer();
        var rootA = canvas.setRootElement({ id: 'A' });

        // then
        expectLayersOrder(canvas._viewport, [
          'base',
          rootA
        ]);
      }));

      describe('visibility', function() {

        it('should hide by default', inject(function(canvas) {

          // when
          canvas.addRootElement({ id: 'A' });

          // then
          expectLayersOrder(canvas._viewport, []);
        }));


        it('should show active root', inject(function(canvas) {

          // given
          var rootA = canvas.addRootElement({ id: 'A' });

          // when
          canvas.setRootElement(rootA);

          // then
          expectLayersOrder(canvas._viewport, [ rootA ]);
        }));


        it('should hide inactive root', inject(function(canvas) {

          // given
          var rootA = canvas.setRootElement({ id: 'A' });
          var rootB = canvas.addRootElement({ id: 'B' });

          // assume
          expectLayersOrder(canvas._viewport, [ rootA ]);

          // when
          canvas.setRootElement(rootB);

          // then
          expectLayersOrder(canvas._viewport, [ rootB ]);
        }));

      });

    });

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


      it('should provide plane viewbox', inject(function(canvas) {

        // given
        var shape1 = { id: 'a', x: 0, y: 0, width: 50, height: 50 };
        var shape2 = { id: 'b', x: 100, y: 100, width: 100, height: 100 };

        var root1 = { id: 'root1' };
        var root2 = { id: 'root2' };

        canvas.addRootElement(root1);
        canvas.addRootElement(root2);

        canvas.addShape(shape1, root1);
        canvas.addShape(shape2, root2);

        canvas.setRootElement(root1);

        // assume
        expect(canvas.viewbox()).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { x: 0, y: 0, width: 50, height: 50 },
          outer: { width: 300, height: 300 }
        });

        // when
        canvas.setRootElement(root2);

        // then
        expect(canvas.viewbox()).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { x: 100, y: 100, width: 100, height: 100 },
          outer: { width: 300, height: 300 }
        });

      }));


      it('should provide viewbox without elements or plane', inject(function(canvas) {

        // assume
        expect(canvas._rootElement).to.not.exist;

        // when
        var viewbox = canvas.viewbox();

        // then
        expect(canvas._rootElement).to.not.exist;
        expect(viewbox).to.eql({
          x: 0, y: 0,
          width: 300, height: 300,
          scale: 1.0,
          inner: { x: 0, y: 0, width: 0, height: 0 },
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

    beforeEach(createDiagram({
      canvas: {
        width: 300,
        height: 300
      }
    }));


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

  describe('#scrollToElement', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });
    beforeEach(createDiagram({ canvas: { width: 500, height: 500 } }));


    it('scrolls element into view', inject(function(canvas) {

      // given
      var shape = canvas.addShape({
        id: 's0',
        x: 650, y: 650,
        width: 50, height: 50
      });

      // when
      canvas.scrollToElement(shape);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(300);
      expect(newViewbox.y).to.equal(300);

    }));


    it('accepts element IDs', inject(function(canvas) {

      // given
      canvas.addShape({
        id: 's0',
        x: 650, y: 650,
        width: 50, height: 50
      });

      // when
      canvas.scrollToElement('s0');

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(300);
      expect(newViewbox.y).to.equal(300);

    }));


    it('takes zoom into account', inject(function(canvas) {

      // given
      var shape = canvas.addShape({
        id: 's0',
        x: 650, y: 650,
        width: 50, height: 50
      });

      canvas.zoom(2);

      // when
      canvas.scrollToElement(shape);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(500);
      expect(newViewbox.y).to.equal(500);

    }));


    it('does not scroll when inside bounds', inject(function(canvas) {

      // given
      var shape = canvas.addShape({
        id: 's0',
        x: 100, y: 100,
        width: 10, height: 10
      });

      // when
      canvas.scrollToElement(shape);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(0);
      expect(newViewbox.y).to.equal(0);

    }));


    it('focuses top-left of big elements', inject(function(canvas) {

      // given
      var shape = canvas.addShape({
        id: 's0',
        x: 200, y: 200,
        width: 500, height: 600
      });

      // when
      canvas.scrollToElement(shape);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(100);
      expect(newViewbox.y).to.equal(100);

    }));


    it('adds default padding', inject(function(canvas) {

      // given
      var shape = canvas.addShape({
        id: 's0',
        x: 0, y: 0,
        width: 10, height: 10
      });

      // when
      canvas.scrollToElement(shape);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(-100);
      expect(newViewbox.y).to.equal(-100);

    }));


    it('can specify padding', inject(function(canvas) {

      // given
      var shape = canvas.addShape({
        id: 's0',
        x: 0, y: 0,
        width: 10, height: 10
      });

      // when
      canvas.scrollToElement(shape, 200);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(-200);
      expect(newViewbox.y).to.equal(-200);

    }));


    it('can have specific directional padding', inject(function(canvas) {

      // given
      var shape = canvas.addShape({
        id: 's0',
        x: 0, y: 0,
        width: 10, height: 10
      });

      // when
      canvas.scrollToElement(shape, { left: 300 });

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.equal(-300);
      expect(newViewbox.y).to.equal(-100);

    }));


    it('switches to correct root', inject(function(canvas) {

      // given
      var shapeRoot = canvas.addRootElement({ id: 'root' });

      var shape = canvas.addShape({
        id: 's0',
        x: 0, y: 0,
        width: 10, height: 10
      }, shapeRoot);

      canvas.setRootElement(canvas.addRootElement(null));

      // when
      canvas.scrollToElement(shape);

      // then
      expect(canvas.getRootElement()).to.equal(shapeRoot);
    }));

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


    it('should require layer name', inject(function(canvas) {

      // then
      expect(function() {
        canvas.getLayer();
      }).to.throw(/must specify a name/);

    }));


    it('get default layer', inject(function(canvas) {

      // when
      canvas.getDefaultLayer();

      // then
      expectLayersOrder(canvas._viewport, [
        'base'
      ]);
    }));


    describe('#getActiveLayer', function() {

      it('gets default layer', inject(function(canvas) {

        // when
        var defaultLayer = canvas.getDefaultLayer();
        var activeLayer = canvas.getActiveLayer();

        // then
        expectLayersOrder(canvas._viewport, [
          'base',
          canvas.getRootElement()
        ]);

        expect(activeLayer).to.exist;
        expect(activeLayer).not.to.eql(defaultLayer);
      }));


      it('gets active layer', inject(function(canvas) {

        // given
        var rootA = canvas.addRootElement({ id: 'a' });

        canvas.setRootElement(rootA);

        // when
        var activeLayer = canvas.getActiveLayer();
        var aLayer = canvas.getLayer(rootA.layer);

        // then
        expectLayersOrder(canvas._viewport, [
          rootA
        ]);

        expect(activeLayer).to.exist;
        expect(activeLayer).to.eql(aLayer);
      }));


      it('should not get layer when none is active',
        inject(function(canvas) {

          // given
          var rootA = canvas.addRootElement({ id: 'a' });

          // when
          var activeLayer = canvas.getActiveLayer();

          // then
          expectLayersOrder(canvas._viewport, [
            rootA
          ]);

          expect(activeLayer).not.to.exist;
        })
      );

    });


    describe('visibility', function() {

      it('should show layer by default', inject(function(canvas) {

        // when
        canvas.getLayer('foo');

        // then
        expectLayersOrder(canvas._viewport, [
          'foo'
        ]);
      }));


      describe('#hideLayer', function() {

        it('should require a name', inject(function(canvas) {

          // then
          expect(function() {
            canvas.hideLayer();
          }).to.throw('must specify a name');

        }));


        it('should require the layer to exist', inject(function(canvas) {

          // then
          expect(function() {
            canvas.hideLayer('FOO');
          }).to.throw('layer <FOO> does not exist');

        }));


        it('should hide layer', inject(function(canvas) {

          // given
          canvas.getLayer('1');
          canvas.getLayer('2');

          // when
          canvas.hideLayer('2');

          // then
          expectLayersOrder(canvas._viewport, [
            '1'
          ]);

        }));

      });


      describe('#showLayer', function() {

        it('should require a name', inject(function(canvas) {

          // then
          expect(function() {
            canvas.showLayer();
          }).to.throw('must specify a name');

        }));


        it('should require the layer to exist', inject(function(canvas) {

          // then
          expect(function() {
            canvas.showLayer('FOO');
          }).to.throw('layer <FOO> does not exist');

        }));


        it('should show layer', inject(function(canvas) {

          // given
          canvas.getLayer('1');
          canvas.getLayer('2');

          // when
          canvas.hideLayer('2');
          canvas.showLayer('2');

          // then
          expectLayersOrder(canvas._viewport, [
            '1',
            '2'
          ]);

        }));


        it('should consider the index', inject(function(canvas) {

          // given
          canvas.getLayer('1', 1);
          canvas.getLayer('2', 2);
          canvas.getLayer('3', 3);

          // when
          canvas.hideLayer('2');
          canvas.showLayer('2');

          // then
          expectLayersOrder(canvas._viewport, [
            '1',
            '2',
            '3'
          ]);

        }));

      });

    });


    it('layer with negative index is below default layer', inject(function(canvas) {

      // when
      canvas.getDefaultLayer();
      canvas.getLayer('foo', -1);

      // then
      expectLayersOrder(canvas._viewport, [
        'foo',
        'base'
      ]);
    }));


    it('layer with positive index is above default layer', inject(function(canvas) {

      // when
      canvas.getDefaultLayer();
      canvas.getLayer('foo', 1);

      // then
      expectLayersOrder(canvas._viewport, [
        'base',
        'foo'
      ]);
    }));


    it('layer without specified index is above default layer', inject(function(canvas) {

      // when
      canvas.getLayer('foo');
      canvas.getDefaultLayer();
      canvas.getLayer('bar');

      // then
      expectLayersOrder(canvas._viewport, [
        'base',
        'foo',
        'bar'
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

    var expectedLayer = expected[i].layer || expected[i];

    var hasClass = svgClasses(layers[i]).has('layer-' + expectedLayer);

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
      !parent.parent
        ? parentGfx
        : getChildrenGfx(parentGfx);

    var existingChildrenGfx = Array.prototype.map.call(childrenContainerGfx.childNodes, function(c) {
      return c.querySelector('.djs-element');
    });

    expect(existingChildrenGfx).to.eql(expectedChildrenGfx);
  });

}