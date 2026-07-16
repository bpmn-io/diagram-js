import { expect } from 'chai';

import sinon from 'sinon';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import paletteModule from 'lib/features/palette';


describe('features/palette - tooltip', function() {

  var provider = {
    getPaletteEntries: function() {
      return {
        'with-shortcut': {
          group: 'tools',
          className: 'with-shortcut',
          title: 'Activate space tool',
          shortcut: 'S',
          action: {
            click: function() {}
          }
        },
        'without-shortcut': {
          group: 'tools',
          className: 'without-shortcut',
          title: 'Create task',
          action: {
            click: function() {}
          }
        },
        'no-title': {
          group: 'tools',
          className: 'no-title',
          action: {
            click: function() {}
          }
        }
      };
    }
  };

  beforeEach(bootstrapDiagram({ modules: [ paletteModule ] }));

  beforeEach(inject(function(palette) {
    palette.registerProvider(provider);
  }));


  var clock;

  afterEach(function() {
    if (clock) {
      clock.restore();
      clock = null;
    }
  });


  function getEntry(canvas, action) {
    return domQuery(
      '.djs-palette [data-action="' + action + '"]',
      canvas.getContainer()
    );
  }

  function hover(element) {
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }


  it('should show a tooltip on hover', inject(function(canvas) {

    // given
    clock = sinon.useFakeTimers();

    // when
    hover(getEntry(canvas, 'with-shortcut'));

    clock.tick(300);

    // then
    var tooltip = domQuery('.djs-hover-tooltip', canvas.getContainer());

    expect(tooltip).to.exist;
    expect(tooltip.textContent).to.contain('Activate space tool');
  }));


  it('should render the entry shortcut in the tooltip', inject(function(canvas) {

    // given
    clock = sinon.useFakeTimers();

    // when
    hover(getEntry(canvas, 'with-shortcut'));

    clock.tick(300);

    // then
    var shortcut = domQuery(
      '.djs-palette-tooltip-shortcut',
      canvas.getContainer()
    );

    expect(shortcut).to.exist;
    expect(shortcut.textContent).to.eql('S');
  }));


  it('should not render a shortcut when the entry has none', inject(function(canvas) {

    // given
    clock = sinon.useFakeTimers();

    // when
    hover(getEntry(canvas, 'without-shortcut'));

    clock.tick(300);

    // then
    expect(domQuery('.djs-hover-tooltip', canvas.getContainer())).to.exist;
    expect(
      domQuery('.djs-palette-tooltip-shortcut', canvas.getContainer())
    ).not.to.exist;
  }));


  it('should not render a tooltip when the entry has no title', inject(function(canvas) {

    // given
    clock = sinon.useFakeTimers();

    // when
    hover(getEntry(canvas, 'no-title'));

    clock.tick(300);

    // then
    expect(domQuery('.djs-hover-tooltip', canvas.getContainer())).not.to.exist;
  }));


  it('should hide the tooltip on mouseout', inject(function(canvas) {

    // given
    clock = sinon.useFakeTimers();

    var entry = getEntry(canvas, 'with-shortcut');

    hover(entry);

    clock.tick(300);

    // when
    entry.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

    // then
    expect(domQuery('.djs-hover-tooltip', canvas.getContainer())).not.to.exist;
  }));

});
