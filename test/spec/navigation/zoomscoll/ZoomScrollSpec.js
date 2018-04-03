/* global sinon */

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  assign
} from 'min-dash';

import {
  domify
} from 'min-dom';

import zoomScrollModule from 'lib/navigation/zoomscroll';


describe('navigation/zoomscroll', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false }
    }));


    it('should bootstrap', inject(function(zoomScroll, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      expect(zoomScroll).to.exist;
      expect(zoomScroll._enabled).to.be.true;
    }));

  });


  describe('zoom', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false }
    }));


    it('should zoom back to 1', inject(function(zoomScroll, canvas) {

      // when

      // should only zoom in 19 times
      for (var i = 0; i < 20; i++) {
        zoomScroll.zoom(0.1);
      }

      for (var j = 0; j < 19; j++) {
        zoomScroll.zoom(-0.1);
      }

      // then
      expect(canvas.zoom()).to.equal(1);
    }));


    it('should only zoom in once threshold is reached', inject(function(zoomScroll, canvas) {

      var zoomSpy = sinon.spy(canvas, 'zoom');

      // when
      zoomScroll.zoom(0.06);
      zoomScroll.zoom(0.06);

      // then
      // called as getter and setter
      expect(zoomSpy).to.have.been.calledTwice;
    }));

  });


  describe('step zoom', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false }
    }));


    it('should zoom in along fixed zoom steps', inject(function(zoomScroll, canvas) {

      // when
      zoomScroll.stepZoom(1);

      // then
      expect(canvas.zoom()).to.equal(1.349);
    }));


    it('should zoom out along fixed zoom steps', inject(function(zoomScroll, canvas) {

      // when
      zoomScroll.stepZoom(-1);

      // then
      expect(canvas.zoom()).to.equal(0.741);
    }));


    it('should snap to a proximate zoom step', inject(function(zoomScroll, canvas) {

      // given
      // a zoom level in between two fixed zoom steps
      canvas.zoom(1.1);

      // when
      zoomScroll.stepZoom(1);

      // then
      expect(canvas.zoom()).to.equal(1.349);
    }));


    it('should snap to default zoom level (1.00) when zooming in from the minimum zoom level',
      inject(function(zoomScroll, canvas) {

        // given
        // zoom to the minimun level
        canvas.zoom(0.2);

        // when
        // zoom in along fixed steps 5 times
        for (var i = 0; i < 5; i++) {
          zoomScroll.stepZoom(1);
        }

        // then
        expect(canvas.zoom()).to.equal(1);
      })
    );


    it('should snap to default zoom level (1.00) when zooming out from the maximum zoom level',
      inject(function(zoomScroll, canvas) {

        // given
        // zoom to the maximum level
        canvas.zoom(4);

        // when
        // zoom out along fixed steps 5 times
        for (var i = 0; i < 5; i++) {
          zoomScroll.stepZoom(-1);
        }

        // then
        expect(canvas.zoom()).to.equal(1);
      })
    );

  });


  describe('toggle', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false },
      zoomScroll: {
        enabled: false
      }
    }));


    it('should force enable', inject(function(zoomScroll) {
      // when
      var newEnabled = zoomScroll.toggle(true);

      // then
      expect(newEnabled).to.be.true;
    }));


    it('should force disable', inject(function(zoomScroll) {
      // when
      var newEnabled = zoomScroll.toggle(false);

      // then
      expect(newEnabled).to.be.false;
    }));


    it('should toggle on', inject(function(zoomScroll) {
      // assume
      expect(zoomScroll._enabled).to.be.false;

      // when
      var newEnabled = zoomScroll.toggle();

      // then
      expect(newEnabled).to.be.true;
    }));


    it('should toggle enabled state on diagram click',
      inject(function(canvas, elementRegistry, zoomScroll) {

        // given
        canvas.addShape({
          id: 'test',
          width: 100,
          height: 100,
          x: 100,
          y: 100
        });

        var rootNode = canvas.getContainer();

        // when
        rootNode.addEventListener('click', function() {
          var newState = zoomScroll.toggle();

          rootNode.style.background = newState ? 'lightgreen' : 'none';
        });

        // then
        // test manually if zoom scroll is actually toggled...
      })
    );

  });


  describe('handle wheel events', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false }
    }));


    describe('should mute', function() {

      it('on .djs-scrollable target', inject(function(zoomScroll) {

        // given
        var zoomSpy = sinon.spy(zoomScroll, 'zoom');
        var scrollSpy = sinon.spy(zoomScroll, 'scroll');

        var event = wheelEvent({
          target: domify('<div class="djs-scrollable" />')
        });

        // when
        zoomScroll._handleWheel(event);

        // then
        expect(zoomSpy).not.to.have.been.called;
        expect(scrollSpy).not.to.have.been.called;
      }));

    });


    describe('should scroll', function() {

      it('two-dimensional', expectScroll({
        expectedDelta: {
          dx: -25.5,
          dy: -10.5
        },
        onWheel: {
          deltaMode: 0,
          deltaX: 34,
          deltaY: 14
        }
      }));


      it('in line mode (Firefox)', expectScroll({
        expectedDelta: {
          dx: -12,
          dy: 36
        },
        onWheel: {
          deltaMode: 1,
          deltaX: 1,
          deltaY: -3
        }
      }));


      it('axis inverted via shiftKey', expectScroll({
        expectedDelta: {
          dx: -10.5,
          dy: 0
        },
        onWheel: {
          deltaMode: 0,
          deltaX: 34,
          deltaY: 14,
          shiftKey: true
        }
      }));

    });


    describe('should zoom', function() {

      it('with scroll + ctrlKey', expectZoom({
        expectedDelta: 0.7949999999999999,
        expectedPosition: { x: 100, y: 70 },
        onWheel: {
          x: 100,
          y: 70,
          deltaMode: 0,
          deltaX: -0,
          deltaY: -53,
          ctrlKey: true
        }
      }));


      it('in line mode (Firefox)', expectZoom({
        expectedDelta: -0.7589466384404111,
        expectedPosition: { x: -100, y: -70 },
        onWheel: {
          x: -100,
          y: -70,
          deltaMode: 1,
          deltaX: -3,
          deltaY: 1,
          ctrlKey: true
        }
      }));

    });

  });



  describe('handle wheel events / scale', function() {

    beforeEach(bootstrapDiagram({
      modules: [ zoomScrollModule ],
      canvas: { deferUpdate: false },
      zoomScroll: {
        scale: 0.5
      }
    }));


    it('should adapt scroll', expectScroll({
      expectedDelta: {
        dx: -17,
        dy: -7
      },
      onWheel: {
        deltaMode: 0,
        deltaX: 34,
        deltaY: 14
      }
    }));


    it('should adapt zoom', expectZoom({
      expectedDelta: 0.53,
      expectedPosition: { x: 100, y: 70 },
      onWheel: {
        x: 100,
        y: 70,
        deltaMode: 0,
        deltaX: -0,
        deltaY: -53,
        ctrlKey: true
      }
    }));

  });

});


/**
 * Mock wheel event factory.
 */
function wheelEvent(opts) {

  var x = opts.x || 50;
  var y = opts.y || 50;

  var target = opts.target || document.body;

  var offset = getDiagramJS().invoke(function(canvas) {

    var clientRect = canvas._container.getBoundingClientRect();

    return {
      left: clientRect.left,
      top: clientRect.top
    };
  });

  return assign({
    deltaMode: 0,
    shiftKey: false,
    ctrlKey: false,
    preventDefault: function() { },
    stopPropagataion: function() { }
  }, opts, {
    clientX: offset.left + x,
    clientY: offset.top + y,
    target: target
  });

}


function expectZoom(opts) {

  return function() {
    var expectedDelta = opts.expectedDelta,
        expectedPosition = opts.expectedPosition,
        event = opts.onWheel;

    getDiagramJS().invoke(function(zoomScroll) {

      // given
      var zoomSpy = sinon.spy(zoomScroll, 'zoom');
      var scrollSpy = sinon.spy(zoomScroll, 'scroll');

      // when
      zoomScroll._handleWheel(wheelEvent(event));

      // then
      expect(zoomSpy).to.have.been.calledWith(expectedDelta, expectedPosition);

      expect(scrollSpy).not.to.have.been.called;
    });
  };

}



function expectScroll(opts) {

  return function() {
    var expectedDelta = opts.expectedDelta,
        event = opts.onWheel;

    getDiagramJS().invoke(function(zoomScroll) {

      // given
      var zoomSpy = sinon.spy(zoomScroll, 'zoom');
      var scrollSpy = sinon.spy(zoomScroll, 'scroll');

      // when
      zoomScroll._handleWheel(wheelEvent(event));

      // then
      expect(scrollSpy).to.have.been.calledWith(expectedDelta);

      expect(zoomSpy).not.to.have.been.called;
    });
  };

}