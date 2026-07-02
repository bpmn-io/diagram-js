import { expect } from 'chai';

import PopupMenuItem from 'lib/features/popup-menu/PopupMenuItem';

import {
  html,
  render
} from 'lib/ui';

import {
  query as domQuery
} from 'min-dom';


describe('features/popup-menu - <PopupMenuItem>', function() {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  it('should render', function() {

    // when
    createPopupMenu({ container });

    // expect
    expect(domQuery('.entry', container)).to.exist;
  });


  it('should be labelled by <label>', function() {

    // when
    createPopupMenu({
      container,
      entry: { id: 'foo', label: 'User task' }
    });

    // then
    const entry = domQuery('.entry', container);

    expect(entry.getAttribute('aria-label')).to.eql('User task');
  });


  it('should be labelled by <title>', function() {

    // when
    createPopupMenu({
      container,
      entry: { id: 'foo', label: 'User task', title: 'User task (long)' }
    });

    // then
    const entry = domQuery('.entry', container);

    expect(entry.getAttribute('aria-label')).to.eql('User task (long)');
  });

});


// helpers
function createPopupMenu(options) {
  const {
    container,
    ...restProps
  } = options;

  const props = {
    entry: { id: 'foo', label: 'bar' },
    ...restProps
  };

  return render(
    html`<${PopupMenuItem} ...${ props } />`,
    container
  );
}
