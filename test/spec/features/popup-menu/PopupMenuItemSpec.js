import PopupMenuItem from 'lib/features/popup-menu/PopupMenuItem';

import testEntryIcon from './resources/a.png';

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


describe('features/popup-menu - <PopupMenuItem>', function() {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  beforeEach(bootstrapDiagram());

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  it('should add standard class to entry', inject(function() {

    // given
    const entry = { id: '1' };

    // when
    createPopupMenu({ container, entry });

    // then
    expect(domQueryAll('.entry', container)).to.have.length(1);
  }));


  it('should add custom class to entry if specified', inject(function() {

    // given
    const entry = { id: '1', className: 'entry-1 cls2 cls3' };

    // when
    createPopupMenu({ container, entry });

    // then
    var element = domQuery('.entry-1', container);
    expect(element.className).to.eql('name entry-1 cls2 cls3');
  }));


  it('should have label if specified', inject(function() {

    // given
    const entry = { id: '1', label: 'Entry 1', className: 'entry-1 cls2 cls3' };

    // when
    createPopupMenu({ container, entry });

    // then
    var element = domQuery('.entry-1', container);
    expect(element.textContent).to.eql('Entry 1');
  }));


  it('should add action-id to entry', inject(function() {

    // given
    const entry = { id: 'undo', label: 'UNDO' };

    // when
    createPopupMenu({ container, entry });

    // then
    var entry1 = domQuery('.entry', container);

    expect(entry1.getAttribute('data-id')).to.eql('undo');
  }));


  it('should add an image if specified', inject(function() {

    // given
    const entry = { id: '1', imageUrl: testEntryIcon };

    // when
    createPopupMenu({ container, entry });

    // then
    var img = domQuery('[data-id="1"] img', container);

    expect(img).to.exist;
    expect(img.getAttribute('src')).to.eql(testEntryIcon);
  }));


  it('should add description if specified', inject(function() {

    // given
    const entry = { id: '1', description: 'entry 1 description' };

    // when
    createPopupMenu({ container, entry });

    // then
    var description = domQuery('.description', container);

    expect(description).to.exist;
    expect(description.textContent).to.eql('entry 1 description');
  }));


  it('should NOT allow XSS via imageUrl', inject(function() {

    // given
    const entry = { id: '1', imageUrl: '"><marquee />' };

    // when
    createPopupMenu({ container, entry });

    // then
    var injected = domQuery('marquee', container);
    expect(injected).not.to.exist;
  }));

});


// helpers
function createPopupMenu(options) {
  const {
    container,
    ...restProps
  } = options;

  const props = {
    entry: { id: 'foo', label: 'bar' },
    selected: false,
    ...restProps
  };

  return render(
    html`<${PopupMenuItem} ...${ props } />`,
    container
  );
}
