import { expect } from 'chai';
import { spy } from 'sinon';

import { bootstrapDiagram, inject } from 'test/TestHelper';
import { domify } from 'min-dom';

import zoomScrollModule from 'lib/navigation/zoomscroll';
import overlaysModule from 'lib/features/overlays';


describe('navigation/zoomscroll - overlays', function() {

  beforeEach(bootstrapDiagram({
    modules: [ zoomScrollModule, overlaysModule ],
    canvas: { deferUpdate: false }
  }));

  beforeEach(inject(function(canvas) {
    canvas.addShape({ id: 'test', x: 100, y: 100, width: 100, height: 100 });
  }));


  it('should pan after moving from the SVG onto an overlay', inject(function(canvas, overlays) {

    // given
    var overlay = addOverlay(overlays);
    var scrollSpy = spy(canvas, 'scroll');
    enter(canvas._svg);
    leave(canvas._svg, overlay);
    enter(overlay, canvas._svg);

    // when
    var event = wheel(overlay, { deltaY: 20 });

    // then
    expect(scrollSpy).to.have.been.calledWith({ dx: -0, dy: -15 });
    expect(event.defaultPrevented).to.be.true;
  }));


  it('should zoom when entering an overlay directly', inject(function(canvas, overlays, zoomScroll) {

    // given
    var overlay = addOverlay(overlays);
    var zoomSpy = spy(zoomScroll, 'zoom');
    enter(overlay);

    // when
    var event = wheel(overlay, { deltaY: -20, ctrlKey: true });

    // then
    expect(zoomSpy).to.have.been.calledOnce;
    expect(event.defaultPrevented).to.be.true;
  }));


  it('should pan over a context pad button', inject(function(canvas) {

    // given
    var pad = domify('<div class="djs-context-pad"><button>Action</button></div>');
    canvas.getContainer().appendChild(pad);
    var button = pad.firstChild;
    var scrollSpy = spy(canvas, 'scroll');
    enter(button);

    // when
    wheel(button, { deltaY: 20 });

    // then
    expect(scrollSpy).to.have.been.calledOnce;
  }));


  it('should initialize navigation when a child stops mouseover propagation', inject(function(canvas, overlays) {

    // given
    var overlay = addOverlay(overlays);
    overlay.addEventListener('mouseover', function(event) { event.stopPropagation(); });
    var scrollSpy = spy(canvas, 'scroll');

    // when
    enter(overlay);
    leave(overlay, canvas._svg);
    enter(canvas._svg, overlay);
    var event = wheel(canvas._svg, { deltaY: 20 });

    // then
    expect(scrollSpy).to.have.been.calledOnce;
    expect(event.defaultPrevented).to.be.true;
  }));


  it('should disable navigation when a child stops mouseout propagation', inject(function(overlays, zoomScroll) {

    // given
    var overlay = addOverlay(overlays);
    overlay.addEventListener('mouseout', function(event) { event.stopPropagation(); });
    enter(overlay);

    // when
    leave(overlay, document.body);

    // then
    expect(zoomScroll._enabled).to.be.false;
    expect(wheel(overlay, { deltaY: 20 }).defaultPrevented).to.be.false;
  }));


  it('should leave native scrolling to a nested overlay', inject(function(canvas, overlays) {

    // given
    var overlay = addScrollableOverlay(overlays);
    var scrollSpy = spy(canvas, 'scroll');
    enter(overlay.firstChild);

    // when
    var event = wheel(overlay.firstChild, { deltaY: 20 });

    // then
    expect(overlay.scrollHeight).to.be.greaterThan(overlay.clientHeight);
    expect(scrollSpy).not.to.have.been.called;
    expect(event.defaultPrevented).to.be.false;
  }));


  [ { top: 0, deltaY: -20 }, { top: 200, deltaY: 20 } ].forEach(function(testCase) {
    it('should pan beyond the native scroll boundary (' + testCase.deltaY + ')',
      inject(function(canvas, overlays) {

        // given
        var overlay = addScrollableOverlay(overlays);
        overlay.scrollTop = testCase.top;
        var scrollSpy = spy(canvas, 'scroll');
        enter(overlay);

        // when
        var event = wheel(overlay, { deltaY: testCase.deltaY });

        // then
        expect(scrollSpy).to.have.been.calledOnce;
        expect(event.defaultPrevented).to.be.true;
      })
    );
  });


  [ 'contain', 'none' ].forEach(function(behavior) {
    it('should respect overscroll-behavior: ' + behavior, inject(function(canvas, overlays) {

      // given
      var overlay = addScrollableOverlay(overlays);
      overlay.style.overscrollBehaviorY = behavior;
      var scrollSpy = spy(canvas, 'scroll');
      enter(overlay);

      // when
      var event = wheel(overlay, { deltaY: -20 });

      // then
      expect(scrollSpy).not.to.have.been.called;
      expect(event.defaultPrevented).to.be.false;
    }));
  });


  [
    { overflow: 'auto', behavior: 'contain', deltaY: 20 },
    { overflow: 'scroll', behavior: 'none', deltaY: -20 },
    { overflow: 'auto', behavior: 'none', deltaX: 20 },
    { overflow: 'scroll', behavior: 'contain', deltaX: -20 }
  ].forEach(function(testCase) {
    it('should contain non-overflowing content (' + JSON.stringify(testCase) + ')',
      inject(function(canvas, overlays) {

        // given
        var overlay = addOverlay(overlays,
          '<div style="width: 100px; height: 100px"><span>Short</span></div>');
        overlay.style.overflow = testCase.overflow;
        overlay.style.overscrollBehavior = testCase.behavior;
        var scrollSpy = spy(canvas, 'scroll');
        enter(overlay.firstChild);

        // when
        var event = wheel(overlay.firstChild, { deltaX: testCase.deltaX || 0, deltaY: testCase.deltaY || 0 });

        // then
        expect(overlay.scrollWidth).to.equal(overlay.clientWidth);
        expect(overlay.scrollHeight).to.equal(overlay.clientHeight);
        expect(scrollSpy).not.to.have.been.called;
        expect(event.defaultPrevented).to.be.false;
      })
    );
  });


  it('should pan over non-overflowing content without scroll containment', inject(function(canvas, overlays) {

    // given
    var overlay = addOverlay(overlays,
      '<div style="width: 100px; height: 100px; overflow: auto"><span>Short</span></div>');
    var scrollSpy = spy(canvas, 'scroll');
    enter(overlay.firstChild);

    // when
    var event = wheel(overlay.firstChild, { deltaY: 20 });

    // then
    expect(overlay.scrollHeight).to.equal(overlay.clientHeight);
    expect(scrollSpy).to.have.been.calledOnce;
    expect(event.defaultPrevented).to.be.true;
  }));


  [ false, true ].forEach(function(shiftKey) {
    it('should preserve native horizontal scrolling (shift: ' + shiftKey + ')',
      inject(function(canvas, overlays) {

        // given
        var overlay = addScrollableOverlay(overlays);
        var scrollSpy = spy(canvas, 'scroll');
        enter(overlay.firstChild);

        // when
        var event = wheel(overlay.firstChild, {
          deltaX: shiftKey ? 0 : 20,
          deltaY: shiftKey ? 20 : 0,
          shiftKey: shiftKey
        });

        // then
        expect(scrollSpy).not.to.have.been.called;
        expect(event.defaultPrevented).to.be.false;
      })
    );
  });


  it('should preserve native right-to-left scrolling', inject(function(canvas, overlays) {

    // given
    var overlay = addScrollableOverlay(overlays);
    overlay.style.direction = 'rtl';
    var scrollSpy = spy(canvas, 'scroll');
    enter(overlay);

    // when
    var event = wheel(overlay, { deltaX: -20 });

    // then
    expect(scrollSpy).not.to.have.been.called;
    expect(event.defaultPrevented).to.be.false;
  }));


  it('should pan over clipped, non-scrollable content', inject(function(canvas, overlays) {

    // given
    var overlay = addScrollableOverlay(overlays);
    overlay.style.overflow = 'hidden';
    var scrollSpy = spy(canvas, 'scroll');
    enter(overlay);

    // when
    wheel(overlay, { deltaY: 20 });

    // then
    expect(scrollSpy).to.have.been.calledOnce;
  }));


  it('should zoom over a scrollable overlay', inject(function(overlays, zoomScroll) {

    // given
    var overlay = addScrollableOverlay(overlays);
    var zoomSpy = spy(zoomScroll, 'zoom');
    enter(overlay);

    // when
    var event = wheel(overlay, { deltaY: -20, ctrlKey: true });

    // then
    expect(zoomSpy).to.have.been.calledOnce;
    expect(event.defaultPrevented).to.be.true;
  }));


  it('should respect wheel events handled by the overlay', inject(function(canvas, overlays) {

    // given
    var overlay = addOverlay(overlays);
    overlay.addEventListener('wheel', function(event) { event.preventDefault(); });
    var scrollSpy = spy(canvas, 'scroll');
    enter(overlay);

    // when
    wheel(overlay, { deltaY: 20 });

    // then
    expect(scrollSpy).not.to.have.been.called;
  }));


  it('should stay disabled after leaving the diagram', inject(function(overlays, zoomScroll) {

    // given
    var overlay = addOverlay(overlays);
    enter(overlay);

    // when
    leave(overlay, document.body);

    // then
    expect(zoomScroll._enabled).to.be.false;
    expect(wheel(overlay, { deltaY: 20 }).defaultPrevented).to.be.false;
  }));


  it('should let an outer overlay scroll when its inner container reaches an edge',
    inject(function(canvas, overlays) {

      // given
      var overlay = addScrollableOverlay(overlays);
      var inner = domify('<div style="height: 50px; overflow: auto"><div style="height: 100px">Inner</div></div>');
      overlay.firstChild.appendChild(inner);
      inner.scrollTop = inner.scrollHeight;
      var scrollSpy = spy(canvas, 'scroll');
      enter(inner.firstChild);

      // when
      var event = wheel(inner.firstChild, { deltaY: 20 });

      // then
      expect(scrollSpy).not.to.have.been.called;
      expect(event.defaultPrevented).to.be.false;
    })
  );


  it('should remove wheel and hover listeners on destruction', inject(function(canvas, eventBus, zoomScroll) {

    // given
    var container = canvas.getContainer();
    enter(container);

    // when
    eventBus.fire('canvas.destroy');
    enter(container);

    // then
    expect(zoomScroll._enabled).to.be.false;
    expect(wheel(container, { deltaY: 20 }).defaultPrevented).to.be.false;
  }));


  [ 'djs-popup-parent djs-scrollable', 'djs-search-container djs-scrollable', 'djs-palette' ].forEach(function(className) {
    it('should leave separate UI controls alone (' + className + ')',
      inject(function(canvas, zoomScroll) {

        // given
        var panel = domify('<div class="' + className + '"><button>Control</button></div>');
        canvas.getContainer().appendChild(panel);
        var scrollSpy = spy(canvas, 'scroll');
        var zoomSpy = spy(zoomScroll, 'zoom');
        enter(panel.firstChild);

        // when
        var scrollEvent = wheel(panel.firstChild, { deltaY: 20 });
        var zoomEvent = wheel(panel.firstChild, { deltaY: -20, ctrlKey: true });

        // then
        expect(scrollSpy).not.to.have.been.called;
        expect(zoomSpy).not.to.have.been.called;
        expect(scrollEvent.defaultPrevented).to.be.false;
        expect(zoomEvent.defaultPrevented).to.be.false;
      })
    );
  });


  it('should respect explicit disabling', inject(function(overlays, zoomScroll) {

    // given
    var overlay = addOverlay(overlays);
    enter(overlay);
    zoomScroll.toggle(false);

    // when
    enter(overlay.firstChild, overlay);
    var event = wheel(overlay, { deltaY: 20 });

    // then
    expect(event.defaultPrevented).to.be.false;
  }));
});


function addOverlay(overlays, html) {
  var overlay = domify(html || '<div><span>Overlay</span></div>');
  overlays.add('test', { position: { top: 0, left: 0 }, html: overlay });
  return overlay;
}

function addScrollableOverlay(overlays) {
  return addOverlay(overlays,
    '<div style="width: 100px; height: 100px; overflow: auto">' +
    '<div style="width: 300px; height: 300px">Scrollable overlay</div></div>');
}

function enter(target, relatedTarget) {
  target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: relatedTarget || null }));
}

function leave(target, relatedTarget) {
  target.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: relatedTarget || null }));
}

function wheel(target, options) {
  var event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
}
