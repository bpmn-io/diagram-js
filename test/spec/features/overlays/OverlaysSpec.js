import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  forEach,
  assign
} from 'min-dash';

import {
  domify,
  assignStyle
} from 'min-dom';

import overlayModule from 'lib/features/overlays';


describe('features/overlays', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should expose api', inject(function(overlays) {
      expect(overlays).to.exist;
      expect(overlays.get).to.exist;
      expect(overlays.add).to.exist;
      expect(overlays.remove).to.exist;
    }));

  });


  describe('#add', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should add <div>', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      // then
      expect(id).to.exist;
      expect(overlays.get(id)).to.exist;
      expect(queryOverlay(id)).to.exist;
    }));


    it('should add element overlay', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="overlay" />'))
      });

      // then
      var overlay = overlays.get(id);

      expect(overlay).to.exist;
      expect(isVisible(overlays._overlayRoot)).to.be.true;
      expect(isVisible(overlay.html)).to.be.true;

      expect(queryOverlay(id)).to.exist;
    }));


    it('should add overlay on shape (by id)', inject(function(overlays, canvas) {

      // given
      canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add('test', {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="overlay" />'))
      });

      // then
      expect(overlays.get(id)).to.exist;
      expect(queryOverlay(id)).to.exist;
    }));

  });


  describe('#remove', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should remove overlay', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="overlay"></div>'))
      });

      // when
      overlays.remove(id);

      // then
      expect(overlays.get(id)).not.to.exist;
      expect(overlays.get({ element: shape })).to.be.empty;

      expect(queryOverlay(id)).not.to.exist;
    }));


    it('should remove multiple by filter', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      overlays.add(shape, 'badge', {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="badge">1</div>'))
      });

      overlays.add(shape, 'badge', {
        position: {
          right: 0,
          top: 0
        },
        html: highlight(domify('<div class="badge">2</div>'))
      });

      // when
      overlays.remove({ element: shape, type: 'badge' });

      // then
      expect(overlays.get({ element: shape, type: 'badge' })).to.be.empty;
      expect(overlays.get({ element: shape })).to.be.empty;

      expect(overlays._getOverlayContainer(shape, true).html.textContent).to.equal('');
    }));


    it('should remove automatically on <*.remove>', inject(function(eventBus, overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      // when
      eventBus.fire('shape.remove', { element: shape });

      // then
      expect(overlays.get(id)).not.to.exist;
      expect(queryOverlay(id)).not.to.exist;
      expect(overlays._overlayContainers).to.be.empty;
    }));


    it('should remove cached container on <*.remove>', inject(function(eventBus, overlays, canvas) {

      // given
      var shape1 = canvas.addShape({
        id: 'test1',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      overlays.add(shape1, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      var shape2 = canvas.addShape({
        id: 'test2',
        x: 150,
        y: 10,
        width: 100,
        height: 100
      });

      overlays.add(shape2, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });


      var shape3 = canvas.addShape({
        id: 'test3',
        x: 300,
        y: 10,
        width: 100,
        height: 100
      });

      overlays.add(shape3, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      // when
      eventBus.fire('shape.remove', { element: shape2 });

      // then
      expect(overlays._getOverlayContainer(shape1, true)).to.exist;
      expect(overlays._getOverlayContainer(shape2, true)).not.to.exist;
      expect(overlays._getOverlayContainer(shape3, true)).to.exist;
    }));


    it('should reattach overlays on element ID change', inject(function(overlays, canvas, elementRegistry) {

      // given
      var oldId = 'old',
          newId = 'new';

      var shape = canvas.addShape({
        id: oldId,
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      var overlay = overlays.get(id);

      // when
      elementRegistry.updateId(shape, newId);

      // then
      expect(overlays.get(id)).to.eql(overlay);
      expect(queryOverlay(id)).to.exist;

      expect(overlays.get({ element: shape })).to.eql([ overlay ]);
    }));

  });


  describe('#get', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    var shape1, shape2, overlay1, overlay2, overlay3;

    beforeEach(inject(function(canvas, overlays) {

      shape1 = canvas.addShape({
        id: 'shape1',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });

      shape2 = canvas.addShape({
        id: 'shape2',
        x: 300,
        y: 100,
        width: 50,
        height: 50
      });


      overlay1 = {
        position: {
          top: 10,
          left: 20
        },
        html: createOverlay()
      };

      overlay1.id = overlays.add(shape1, 'badge', overlay1);


      overlay2 = {
        position: {
          bottom: 50,
          right: 0
        },
        html: createOverlay()
      };

      overlay2.id = overlays.add(shape1, overlay2);

      overlay3 = {
        position: {
          top: 10,
          left: 20
        },
        html: createOverlay()
      };

      overlay3.id = overlays.add(shape2, 'badge', overlay3);
    }));


    it('should return overlays by element', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ element: shape1 });

      // then
      expect(filteredOverlays.length).to.equal(2);
    }));


    it('should return overlays by element + type', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ element: shape2, type: 'badge' });

      // then
      expect(filteredOverlays.length).to.equal(1);
    }));


    it('should return overlays by type', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ type: 'badge' });

      // then
      expect(filteredOverlays.length).to.equal(2);
    }));

  });


  describe('positioning', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    var shape;

    beforeEach(inject(function(canvas) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
    }));


    function position(overlayHtml) {
      var parent = overlayHtml.parentNode;

      var result = {};

      forEach([ 'left', 'right', 'top', 'bottom' ], function(pos) {
        var p = parseInt(parent.style[pos]);

        if (!isNaN(p)) {
          result[pos] = p;
        }
      });

      return result;
    }


    it('should position top left of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          left: 40,
          top: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 40,
        left: 40
      });

    }));


    it('should position bottom left of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          bottom: 40,
          left: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 60,
        left: 40
      });

    }));

    it('should position top left of shape', inject(function(overlays, canvas) {

      var html = createOverlay();

      var connection = canvas.addConnection({ id: 'select1', waypoints: [ { x: 10, y: 10 }, { x: 110, y: 10 } ] });

      // when
      overlays.add(connection, {
        position: {
          left: 100,
          top: 0
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 0,
        left: 100
      });

    }));


    it('should position bottom right of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          bottom: 40,
          right: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 60,
        left: 60
      });
    }));


    it('should position top right of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          top: 40,
          right: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 40,
        left: 60
      });
    }));

  });


  describe('show behavior', function() {

    describe('default', function() {

      beforeEach(bootstrapDiagram({
        modules: [ overlayModule ],
        canvas: { deferUpdate: false }
      }));


      var shape;

      beforeEach(inject(function(canvas) {

        shape = canvas.addShape({
          id: 'shape',
          x: 100,
          y: 100,
          width: 100,
          height: 100
        });
      }));


      function isVisible(element) {
        return element.parentNode.style.display !== 'none';
      }


      it('should always show overlays', inject(function(overlays, canvas) {

        // given
        var html = createOverlay();

        overlays.add(shape, {
          html: html,
          position: { left: 20, bottom: 0 }
        });

        // when zoom in visibility range
        canvas.zoom(0.7);

        // then
        expect(isVisible(html)).to.be.true;


        // when zoom below visibility range
        canvas.zoom(0.6);

        // then
        expect(isVisible(html)).to.be.true;


        // when zoom in visibility range
        canvas.zoom(3.0);

        // then
        expect(isVisible(html)).to.be.true;


        // when zoom above visibility range
        canvas.zoom(6.0);

        // then
        expect(isVisible(html)).to.be.true;
      }));


      it('should hide on hidden plane', inject(function(overlays, canvas) {

        // given
        var rootA = canvas.addRootElement({ id: 'a' });

        canvas.setRootElement(rootA);

        var html = createOverlay();

        // when
        overlays.add(shape, {
          html: html,
          position: { left: 20, bottom: 0 },
          show: {
            minZoom: 0.5
          }
        });

        // then
        expect(isVisible(html)).to.be.false;
      }));


      it('should hide when switching planes', inject(function(overlays, canvas) {

        // given
        var rootA = canvas.addRootElement({ id: 'a' });

        var html = createOverlay();

        overlays.add(shape, {
          html: html,
          position: { left: 20, bottom: 0 },
          show: {
            minZoom: 0.5
          }
        });

        // when
        canvas.setRootElement(rootA);

        // then
        expect(isVisible(html)).to.be.false;
      }));


      it('should show when switching plane', inject(function(overlays, canvas) {

        // given
        canvas.setRootElement({ id: 'a' });

        var html = createOverlay();

        // when
        overlays.add(shape, {
          html: html,
          position: { left: 20, bottom: 0 },
          show: {
            minZoom: 0.5
          }
        });

        // when
        canvas.setRootElement(shape.parent);

        // then
        expect(isVisible(html)).to.be.true;
      }));


      it('should override `show` when switching planes', inject(function(overlays, canvas) {

        // given
        var rootA = canvas.addRootElement({ id: 'a' });
        var html = createOverlay();

        overlays.add(shape, {
          html: html,
          position: { left: 20, bottom: 0 },
          show: {
            minZoom: 0.7,
            maxZoom: 1.3
          }
        });

        // assume
        expect(isVisible(html)).to.be.true;

        // when
        canvas.setRootElement(rootA);
        canvas.zoom(1);

        // then
        expect(isVisible(html)).to.be.false;
      }));

    });


    describe('overriding defaults', function() {

      beforeEach(bootstrapDiagram({
        modules: [ overlayModule ],
        canvas: { deferUpdate: false },
        overlays: {
          defaults: {
            show: {
              minZoom: 0.7,
              maxZoom: 5.0
            }
          }
        }
      }));


      var shape;

      beforeEach(inject(function(canvas) {

        shape = canvas.addShape({
          id: 'shape',
          x: 100,
          y: 100,
          width: 100,
          height: 100
        });
      }));


      function isVisible(element) {
        return element.parentNode.style.display !== 'none';
      }


      it('should conditionally hide overlays', inject(function(overlays, canvas) {

        // given
        var html = createOverlay();

        overlays.add(shape, {
          html: html,
          position: { left: 20, bottom: 0 }
        });

        // when zoom in visibility range
        canvas.zoom(0.7);

        // then
        expect(isVisible(html)).to.be.true;


        // when zoom below visibility range
        canvas.zoom(0.6);

        // then
        expect(isVisible(html)).to.be.false;


        // when zoom in visibility range
        canvas.zoom(3.0);

        // then
        expect(isVisible(html)).to.be.true;


        // when zoom above visibility range
        canvas.zoom(6.0);

        // then
        expect(isVisible(html)).to.be.false;
      }));

    });

  });


  describe('conditional hide behavior', function() {

    beforeEach(bootstrapDiagram({
      modules: [ overlayModule ],
      canvas: { deferUpdate: false },
      overlays: {
        defaults: {
          show: {
            minZoom: 0.7,
            maxZoom: 5.0
          }
        }
      }
    }));


    var shape;

    beforeEach(inject(function(canvas) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
    }));


    function zoom(level) {
      getDiagramJS().invoke(function(canvas) {
        canvas.zoom(level);
      });
    }

    function isVisible(element) {
      return element.parentNode.style.display !== 'none';
    }

    function expectVisible(el, visible) {
      expect(isVisible(el)).to.equal(visible);
    }



    it('should respect min show rules when overlay is added', inject(function(overlays) {

      // given
      var html = createOverlay();

      // when zoom below visibility range
      zoom(0.6);

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 }
      });

      // then
      expectVisible(html, false);

      // when zoom in visibility range
      zoom(0.7);

      // then
      expectVisible(html, true);
    }));


    it('should respect max show rules when overlay is added', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      // when zoom above visibility range
      zoom(6.0);

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 }
      });

      // then
      expectVisible(html, false);

      // when zoom in visibility range
      zoom(3.0);

      // then
      expectVisible(html, true);
    }));


    it('should respect overlay specific min/max rules', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 },
        show: {
          minZoom: 0.7,
          maxZoom: 1.3
        }
      });


      // when
      // zoom below configured minZoom
      zoom(0.5);

      // then
      expectVisible(html, false);


      // when
      // zoom on configured minZoom
      zoom(0.7);

      // then
      expectVisible(html, true);


      // when
      // zoom into visibility range
      zoom(0.9);

      // then
      expectVisible(html, true);


      // when
      // zoom on configured maxZoom
      zoom(1.3);

      // then
      expectVisible(html, true);


      // when
      // zoom above maxZoom
      zoom(1.4);

      // then
      expectVisible(html, false);
    }));


    it('should respect overlay specific min rule', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 },
        show: {
          minZoom: 0.7
        }
      });


      // when
      // zoom below configured minZoom
      zoom(0.5);

      // then
      expectVisible(html, false);


      // when zoom on configured minZoom
      zoom(0.7);

      // then
      expectVisible(html, true);
    }));


    it('should respect overlay specific max rule', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 },
        show: {
          maxZoom: 1.3
        }
      });

      // when
      // zoom on configured maxZoom
      zoom(1.3);

      // then
      expectVisible(html, true);


      // when
      // zoom above maxZoom
      zoom(1.4);

      // then
      expectVisible(html, false);
    }));

  });


  describe('scroll/zoom behavior', function() {

    beforeEach(bootstrapDiagram({
      modules: [ overlayModule ],
      canvas: { deferUpdate: false }
    }));


    var shape, overlay;

    beforeEach(inject(function(canvas, overlays) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });

      overlay = {
        html: createOverlay(),
        position: {
          left: 20,
          top: 20
        }
      };

      overlays.add(shape, overlay);
    }));


    it('should not be transformed initially', inject(function(overlays, canvas) {

      // given
      // diagram got newly created

      // then
      expect(transformMatrix(overlays._overlayRoot)).not.to.exist;
    }));


    it('should transform overlay container on scroll', inject(function(overlays, canvas) {

      // when
      canvas.scroll({
        dx: 100,
        dy: 50
      });

      var mtrx = transformMatrix(overlays._overlayRoot);

      // then
      expect(mtrx).to.eql({
        a : 1, b : 0,
        c : 0, d : 1,
        e : 100, f : 50
      });
    }));


    it('should transform overlay container on zoom', inject(function(overlays, canvas) {

      // when
      canvas.zoom(2);

      var mtrx = transformMatrix(overlays._overlayRoot);

      // then
      expect(mtrx.a).to.eql(2);
      expect(mtrx.d).to.eql(2);
    }));


    it('should add css prefixes to the overlay container on zoom', inject(function(overlays, canvas) {

      // given
      var containerStyle = overlays._overlayRoot.style;

      // when
      canvas.zoom(2);

      // then
      expect(containerStyle['-webkit-transform']).to.match(/matrix/);
      expect(containerStyle['-ms-transform']).to.match(/matrix/);
    }));


    it('should transform overlay container on zoom (with position)', inject(function(overlays, canvas) {

      // when
      canvas.zoom(2, { x: 300, y: 300 });

      // then
      expect(transformMatrix(overlays._overlayRoot)).to.eql({
        a : 2, b : 0,
        c : 0, d : 2,
        e : -300, f : -300
      });
    }));

  });


  describe('overlay scaling behavior', function() {

    beforeEach(bootstrapDiagram({
      modules: [ overlayModule ],
      canvas: { deferUpdate: false }
    }));


    function scaleVector(element) {
      return asVector(element.style.transform);
    }

    function verifyScale(overlayConfig, expectedScales) {

      var test = inject(function(canvas, overlays) {

        // given
        var shape = canvas.addShape({
          id: 'shape',
          x: 100,
          y: 100,
          width: 100,
          height: 100
        });

        var overlay = assign({
          html: createOverlay(),
          position: {
            left: 20,
            top: 20
          }
        }, overlayConfig);

        overlays.add(shape, overlay);

        var overlayParent = overlay.html.parentNode;


        // test multiple zoom steps
        [ 1.0, 1.5, 3.5, 10, 0.5 ].forEach(function(zoom, idx) {

          var expectedScale = expectedScales[idx];

          // when
          canvas.zoom(zoom);

          var actualScale = scaleVector(overlayParent) || { x: 1, y: 1 };

          var effectiveScale = zoom * actualScale.x;

          // then
          expect(actualScale.x).to.eql(actualScale.y);

          expect(effectiveScale).to.be.closeTo(expectedScale, 0.00001);
        });

      });

      test();
    }


    it('should scale per default', function() {

      // given
      var overlay = { };

      var expectedScales = [
        1.0, 1.5, 3.5, 10, 0.5
      ];

      // expect
      verifyScale(overlay, expectedScales);
    });


    it('should scale with explicit scale = true', function() {

      // given
      var overlay = {
        scale: true
      };

      var expectedScales = [
        1.0, 1.5, 3.5, 10, 0.5
      ];

      // expect
      verifyScale(overlay, expectedScales);
    });


    it('should not scale with scale = false', function() {

      // given
      var overlay = {
        scale: false
      };

      var expectedScales = [
        1.0, 1.0, 1.0, 1.0, 1.0
      ];

      // expect
      verifyScale(overlay, expectedScales);
    });


    it('should configure scale with min / max', function() {

      // given
      var overlay = {
        scale: {
          min: 0.9,
          max: 1.6
        }
      };

      var expectedScales = [
        1.0, 1.5, 1.6, 1.6, 0.9
      ];

      // expect
      verifyScale(overlay, expectedScales);
    });

  });


  describe('#clear', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should add <div>', inject(function(overlays, eventBus, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      // when
      eventBus.fire('diagram.clear');

      // then
      expect(overlays.get(id)).not.to.exist;
      expect(queryOverlay(id)).not.to.exist;
    }));

  });

});




// helpers //////////////////////

var NUM_REGEX = /([+-]?\d*[.]?\d+)(?=,|\))/g;

var overlaysCounter = 0;


function asMatrix(transformStr) {
  if (transformStr && transformStr !== 'none') {
    var m = transformStr.match(NUM_REGEX);

    return {
      a: parseFloat(m[0], 10),
      b: parseFloat(m[1], 10),
      c: parseFloat(m[2], 10),
      d: parseFloat(m[3], 10),
      e: parseFloat(m[4], 10),
      f: parseFloat(m[5], 10)
    };
  }
}

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

function isVisible(element) {
  return window.getComputedStyle(element).display !== 'none';
}

function highlight(element) {
  assignStyle(element, { background: 'fuchsia', minWidth: '10px', minHeight: '10px' });
  return element;
}

function queryOverlay(id) {
  return document.querySelector('[data-overlay-id=' + id + ']');
}

function createOverlay() {
  var element = highlight(domify('<div>OV<br/>#' + (overlaysCounter++) + '</div>'));
  assignStyle(element, { width: 40, height: 40 });
  return element;
}

function transformMatrix(element) {
  return asMatrix(element.style.transform);
}
