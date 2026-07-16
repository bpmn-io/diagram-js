import { expect } from 'chai';

import sinon from 'sinon';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  attr as domAttr,
  classes as domClasses,
  domify,
  query as domQuery
} from 'min-dom';

import { html } from 'lib/ui/index.js';

import hoverTooltipModule from 'lib/ui/hover-tooltip';


describe('ui/hover-tooltip', function() {

  beforeEach(bootstrapDiagram({ modules: [ hoverTooltipModule ] }));


  var clock;

  afterEach(function() {
    if (clock) {
      clock.restore();
      clock = null;
    }
  });


  function addEntries(canvas) {
    var container = domify(
      '<div class="test-entries">' +
        '<div class="entry" data-action="with-content"></div>' +
        '<div class="entry" data-action="no-content"></div>' +
      '</div>'
    );

    canvas.getContainer().appendChild(container);

    return container;
  }

  function register(hoverTooltip, container, options) {
    options = options || {};

    hoverTooltip.add({
      container: container,
      selector: '.entry',
      getContent: function(target) {
        if (domAttr(target, 'data-action') === 'no-content') {
          return null;
        }

        return html`<span class="test-content">Hello</span>`;
      },
      getPosition: function() {
        return { x: 10, y: 20, placement: options.placement || 'right' };
      }
    });
  }

  function getEntry(container, action) {
    return domQuery('[data-action="' + action + '"]', container);
  }

  function hover(element) {
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }


  it('should show the provided content on hover', inject(
    function(canvas, hoverTooltip) {

      // given
      clock = sinon.useFakeTimers();

      var container = addEntries(canvas);

      register(hoverTooltip, container);

      // when
      hover(getEntry(container, 'with-content'));

      clock.tick(300);

      // then
      var tooltip = domQuery('.djs-hover-tooltip', canvas.getContainer());

      expect(tooltip).to.exist;
      expect(domQuery('.test-content', tooltip)).to.exist;
      expect(tooltip.textContent).to.contain('Hello');
    }
  ));


  it('should apply the placement modifier', inject(
    function(canvas, hoverTooltip) {

      // given
      clock = sinon.useFakeTimers();

      var container = addEntries(canvas);

      register(hoverTooltip, container, { placement: 'bottom' });

      // when
      hover(getEntry(container, 'with-content'));

      clock.tick(300);

      // then
      var tooltip = domQuery('.djs-hover-tooltip', canvas.getContainer());

      expect(domClasses(tooltip).has('djs-hover-tooltip--bottom')).to.be.true;
    }
  ));


  it('should not show a tooltip without content', inject(
    function(canvas, hoverTooltip) {

      // given
      clock = sinon.useFakeTimers();

      var container = addEntries(canvas);

      register(hoverTooltip, container);

      // when
      hover(getEntry(container, 'no-content'));

      clock.tick(300);

      // then
      expect(domQuery('.djs-hover-tooltip', canvas.getContainer())).not.to.exist;
    }
  ));


  it('should hide the tooltip on mouseout', inject(function(canvas, hoverTooltip) {

    // given
    clock = sinon.useFakeTimers();

    var container = addEntries(canvas);

    register(hoverTooltip, container);

    var entry = getEntry(container, 'with-content');

    hover(entry);

    clock.tick(300);

    // when
    entry.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

    // then
    expect(domQuery('.djs-hover-tooltip', canvas.getContainer())).not.to.exist;
  }));

});
