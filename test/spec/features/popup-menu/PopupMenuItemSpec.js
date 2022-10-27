import PopupMenuItem from 'lib/features/popup-menu/PopupMenuItem';
import diagramJSui from '@bpmn-io/diagram-js-ui';
import testEntryIcon from './resources/a.png';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


describe('<PopupMenuItem>', function() {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  beforeEach(bootstrapDiagram({
    modules: [ diagramJSui ]
  }));

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  it('should add standard class to entry', inject(function(diagramJSui) {

    // given
    const entry = { id: '1' };

    // when
    createPopupMenu({ container, entry, diagramJSui });

    // then
    expect(domQueryAll('.entry', container).length).to.eql(1);
  }));


  it('should add custom class to entry if specified', inject(function(diagramJSui) {


    // given
    const entry = { id: '1', className: 'entry-1 cls2 cls3' };

    // when
    createPopupMenu({ container, entry, diagramJSui });

    // then
    var element = domQuery('.entry-1', container);
    expect(element.className).to.eql('name entry-1 cls2 cls3');
  }));


  it('should have label if specified', inject(function(diagramJSui) {

    // given
    const entry = { id: '1', label: 'Entry 1', className: 'entry-1 cls2 cls3' };

    // when
    createPopupMenu({ container, entry, diagramJSui });

    // then
    var element = domQuery('.entry-1', container);
    expect(element.textContent).to.eql('Entry 1');
  }));


  it('should add action-id to entry', inject(function(diagramJSui) {

    // given
    const entry = { id: 'undo', label: 'UNDO' };

    // when
    createPopupMenu({ container, entry, diagramJSui });

    // then
    var entry1 = domQuery('.entry', container);

    expect(entry1.getAttribute('data-id')).to.eql('undo');
  }));


  it('should add an image if specified', inject(function(diagramJSui) {

    // given
    const entry = { id: '1', imageUrl: testEntryIcon };

    // when
    createPopupMenu({ container, entry, diagramJSui });

    // then
    var img = domQuery('[data-id="1"] img', container);

    expect(img).to.exist;
    expect(img.getAttribute('src')).to.eql(testEntryIcon);
  }));


  it('should add description if specified', inject(function(diagramJSui) {

    // given
    const entry = { id: '1', description: 'entry 1 description' };

    // when
    createPopupMenu({ container, entry, diagramJSui });

    // then
    var description = domQuery('.description', container);

    expect(description).to.exist;
    expect(description.textContent).to.eql('entry 1 description');
  }));


  it('should NOT allow XSS via imageUrl', inject(function(diagramJSui) {

    // given
    const entry = { id: '1', imageUrl: '"><marquee />' };

    // when
    createPopupMenu({ container, entry, diagramJSui });

    // then
    var injected = domQuery('marquee', container);
    expect(injected).not.to.exist;
  }));

});


// helpers
function createPopupMenu(options) {
  const { container, diagramJSui } = options;

  return diagramJSui.render(
    diagramJSui.html`
    <${PopupMenuItem}
      entry=${ { id: 'foo', label: 'bar' } }
      selected=${ false }
      html=${ diagramJSui.html }
      ...${ options }
    />`,
    container
  );
}
