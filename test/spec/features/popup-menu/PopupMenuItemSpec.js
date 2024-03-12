import {
  query as domQuery
} from 'min-dom';

import PopupMenuItem from 'diagram-js/lib/features/popup-menu/PopupMenuItem.js';

import {
  html,
  render
} from 'diagram-js/lib/ui/index.js';


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
