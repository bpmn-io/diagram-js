import {
  query as domQuery
} from 'min-dom';

import PopupMenuList from 'diagram-js/lib/features/popup-menu/PopupMenuList.js';

import {
  html,
  render
} from 'diagram-js/lib/ui/index.js';


describe('features/popup-menu - <PopupMenuList>', function() {

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
    createPopupMenuList({ container });

    // then
    expect(domQuery('.djs-popup-results', container)).to.exist;

  });
});



// helpers
function createPopupMenuList(options) {
  const {
    container,
    ...restProps
  } = options;

  const props = {
    entries: [ ],
    selectedEntry: null,
    setSelectedEntry: () => {},
    onSelect: () => {},
    ...restProps
  };

  return render(
    html`<${PopupMenuList} ...${props} />`,
    container
  );
}