import { expect } from 'chai';
import { spy } from 'sinon';

import PopupMenuBreadcrumbs from 'lib/features/popup-menu/PopupMenuBreadcrumbs';

import {
  html,
  render
} from 'lib/ui';

import {
  fireEvent
} from '@testing-library/preact';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


describe('features/popup-menu - <PopupMenuBreadcrumbs>', function() {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  it('should render container', function() {

    // when
    createPopupMenuBreadcrumbs({ container });

    // then
    expect(domQuery('.djs-popup-breadcrumbs', container)).to.exist;
  });


  describe('empty stack', function() {

    it('should not render back button', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack: [] });

      // then
      expect(domQuery('.djs-popup-breadcrumbs-item--back', container)).not.to.exist;
    });


    it('should not render current label', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack: [] });

      // then
      expect(domQuery('.djs-popup-breadcrumbs-item--current', container)).not.to.exist;
    });


    it('should not render any items', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack: [] });

      // then
      expect(domQueryAll('.djs-popup-breadcrumbs-item', container)).to.have.length(0);
    });

  });


  describe('depth 1', function() {

    const navigationStack = [
      stepEntry('A')
    ];


    it('should render back button', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack });

      // then
      expect(domQuery('.djs-popup-breadcrumbs-item--back', container)).to.exist;
    });


    it('should render current label', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack });

      // then
      const current = domQuery('.djs-popup-breadcrumbs-item--current', container);
      expect(current).to.exist;
      expect(current.textContent.trim()).to.eql('A');
    });


    it('should not render parent crumbs', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack });

      // then
      const crumbs = domQueryAll(
        '.djs-popup-breadcrumbs-item:not(.djs-popup-breadcrumbs-item--back):not(.djs-popup-breadcrumbs-item--current)',
        container
      );
      expect(crumbs).to.have.length(0);
    });

  });


  describe('depth 2+', function() {

    const navigationStack = [
      stepEntry('A'),
      stepEntry('B')
    ];


    it('should render parent crumb', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack });

      // then
      const crumbs = domQueryAll(
        '.djs-popup-breadcrumbs-item:not(.djs-popup-breadcrumbs-item--back):not(.djs-popup-breadcrumbs-item--current)',
        container
      );

      expect([ ...crumbs ].map(c => c.textContent.trim())).to.eql([ 'A' ]);
    });


    it('should render current label as last item', function() {

      // when
      createPopupMenuBreadcrumbs({ container, navigationStack });

      // then
      const current = domQuery('.djs-popup-breadcrumbs-item--current', container);
      expect(current.textContent.trim()).to.eql('B');
    });


    it('should render multiple parent crumbs in order', function() {

      // when
      createPopupMenuBreadcrumbs({
        container,
        navigationStack: [
          stepEntry('A'),
          stepEntry('B'),
          stepEntry('C')
        ]
      });

      // then
      const crumbs = domQueryAll(
        '.djs-popup-breadcrumbs-item:not(.djs-popup-breadcrumbs-item--back):not(.djs-popup-breadcrumbs-item--current)',
        container
      );

      expect([ ...crumbs ].map(c => c.textContent.trim())).to.eql([ 'A', 'B' ]);

      expect(domQuery('.djs-popup-breadcrumbs-item--current', container).textContent.trim())
        .to.eql('C');
    });


    it('should render separators between items', function() {

      // when
      createPopupMenuBreadcrumbs({
        container,
        navigationStack: [
          stepEntry('A'),
          stepEntry('B'),
          stepEntry('C')
        ]
      });

      // then
      const separators = domQueryAll('.djs-popup-breadcrumbs-item--separator', container);
      expect(separators).to.have.length(2);
    });

  });


  describe('interactions', function() {

    it('should reset stack on back click', function() {

      // given
      const setNavigationStack = spy();

      createPopupMenuBreadcrumbs({
        container,
        navigationStack: [
          stepEntry('A'),
          stepEntry('B')
        ],
        setNavigationStack
      });

      // when
      fireEvent.click(domQuery('.djs-popup-breadcrumbs-item--back', container));

      // then
      expect(setNavigationStack).to.have.been.calledOnceWith([]);
    });


    it('should pop to clicked level on crumb click', function() {

      // given
      const setNavigationStack = spy();

      const stack = [
        stepEntry('A'),
        stepEntry('B'),
        stepEntry('C')
      ];

      createPopupMenuBreadcrumbs({
        container,
        navigationStack: stack,
        setNavigationStack
      });

      const crumbs = domQueryAll(
        '.djs-popup-breadcrumbs-item:not(.djs-popup-breadcrumbs-item--back):not(.djs-popup-breadcrumbs-item--current)',
        container
      );

      // when
      fireEvent.click(crumbs[0]);

      // then
      expect(setNavigationStack).to.have.been.calledOnce;

      const updater = setNavigationStack.firstCall.args[0];
      expect(updater(stack)).to.eql([ stack[0] ]);
    });


    it('should pop to deeper level on later crumb click', function() {

      // given
      const setNavigationStack = spy();

      const stack = [
        stepEntry('A'),
        stepEntry('B'),
        stepEntry('C')
      ];

      createPopupMenuBreadcrumbs({
        container,
        navigationStack: stack,
        setNavigationStack
      });

      const crumbs = domQueryAll(
        '.djs-popup-breadcrumbs-item:not(.djs-popup-breadcrumbs-item--back):not(.djs-popup-breadcrumbs-item--current)',
        container
      );

      // when
      fireEvent.click(crumbs[1]);

      // then
      const updater = setNavigationStack.firstCall.args[0];
      expect(updater(stack)).to.eql([ stack[0], stack[1] ]);
    });

  });

});


// helpers
function createPopupMenuBreadcrumbs(options) {
  const {
    container,
    ...rest
  } = options;

  const props = {
    navigationStack: [],
    setNavigationStack: () => {},
    ...rest
  };

  return render(
    html`<${ PopupMenuBreadcrumbs } ...${ props } />`,
    container
  );
}

function stepEntry(label) {
  return {
    id: label,
    label,
    entries: []
  };
}
