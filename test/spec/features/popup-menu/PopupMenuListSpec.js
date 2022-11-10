import PopupMenuList from 'lib/features/popup-menu/PopupMenuList';

import {
  html,
  render
} from 'lib/ui';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


describe('features/popup-menu - <PopupMenuList>', function() {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  beforeEach(bootstrapDiagram());

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  it('should group entries', inject(function() {

    // given
    const entries = [
      { id: 'save', label: 'SAVE', group: 'file' },
      { id: 'load', label: 'LOAD', group: 'file' },
      { id: 'undo', label: 'UNDO', group: 'command' },
      { id: 'redo', label: 'REDO', group: 'command' },
      { id: 'clear', label: 'CLEAR' }
    ];

    // when
    createPopupMenuList({ container, entries });

    // then
    var parent = domQuery('.results', container),
        group1 = parent.children[0],
        group2 = parent.children[1],
        group3 = parent.children[2];

    expect(group1.dataset).to.have.property('group', 'file');
    expect(group2.dataset).to.have.property('group', 'command');
    expect(group3.dataset).to.have.property('group', 'default');

    expect(group1.childNodes).to.have.lengthOf(2);
    expect(group2.childNodes).to.have.lengthOf(2);
    expect(group3.childNodes).to.have.lengthOf(1);
  }));


  it('should use group <default> if not provided', inject(function() {

    // given
    const entries = [
      { id: 'save', label: 'SAVE' },
      { id: 'load', label: 'LOAD' },
      { id: 'undo', label: 'UNDO' },
      { id: 'redo', label: 'REDO' },
      { id: 'clear', label: 'CLEAR' }
    ];

    // when
    createPopupMenuList({ container, entries });

    // then
    var parent = domQuery('.results', container),
        group1 = parent.children[0];

    expect(parent.children).to.have.lengthOf(1);
    expect(group1.dataset).to.have.property('group', 'default');
    expect(group1.children).to.have.lengthOf(5);
  }));


  it('should NOT allow XSS via group', inject(function() {

    // given
    const entries = [
      { id: 'save', group: '"><marquee />' }
    ];

    // when
    createPopupMenuList({ container, entries });

    // then
    var injected = domQuery('marquee', container);

    expect(injected).not.to.exist;
  }));


  it('should display group name if provided', inject(function() {

    // given
    const entries = [
      { id: 'save', group: { name: 'file' , id: 'file' } },
      { id: 'load', group: { name: 'file' , id: 'file' } },
      { id: 'undo', group: { name: 'command' , id: 'command' } },
      { id: 'redo', group: { name: 'command' , id: 'command' } }
    ];

    // when
    createPopupMenuList({ container, entries });

    const entryHeaders = domQueryAll('.entry-header', container);

    // then
    expect(entryHeaders).to.have.lengthOf(2);
    expect(entryHeaders[0].textContent).to.eql('file');
    expect(entryHeaders[1].textContent).to.eql('command');
  }));


  it('should support legacy groups (type = string)', inject(function() {

    // given
    const entries = [
      { id: 'save', group: 'file' },
      { id: 'load', group: 'file' }
    ];

    // when
    createPopupMenuList({ container, entries });

    const entryHeaders = domQuery('[data-group="file"]', container);

    // then
    expect(entryHeaders).to.exist;
    expect(entryHeaders.children).to.have.lengthOf(2);
  }));

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