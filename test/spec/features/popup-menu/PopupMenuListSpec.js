import PopupMenuList from 'lib/features/popup-menu/PopupMenuList';
import diagramJSui from '@bpmn-io/diagram-js-ui';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


describe('<PopupMenuList>', function() {
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


  it('should group entries', inject(function(diagramJSui) {

    // given
    const entries = [
      { id: 'save', label: 'SAVE', group: 'file' },
      { id: 'load', label: 'LOAD', group: 'file' },
      { id: 'undo', label: 'UNDO', group: 'command' },
      { id: 'redo', label: 'REDO', group: 'command' },
      { id: 'clear', label: 'CLEAR' }
    ];

    // when
    createPopupMenuList({ container, entries, diagramJSui });

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


  it('should use group <default> if not provided', inject(function(diagramJSui) {

    // given
    const entries = [
      { id: 'save', label: 'SAVE' },
      { id: 'load', label: 'LOAD' },
      { id: 'undo', label: 'UNDO' },
      { id: 'redo', label: 'REDO' },
      { id: 'clear', label: 'CLEAR' }
    ];

    // when
    createPopupMenuList({ container, entries, diagramJSui });

    // then
    var parent = domQuery('.results', container),
        group1 = parent.children[0];

    expect(parent.children).to.have.lengthOf(1);
    expect(group1.dataset).to.have.property('group', 'default');
    expect(group1.children).to.have.lengthOf(5);
  }));


  it('should NOT allow XSS via group', inject(function(diagramJSui) {

    // given
    const entries = [
      { id: 'save', group: '"><marquee />' }
    ];

    // when
    createPopupMenuList({ container, entries, diagramJSui });

    // then
    var injected = domQuery('marquee', container);

    expect(injected).not.to.exist;
  }));


  it('should display group name if provided', inject(function(diagramJSui) {

    // given
    const entries = [
      { id: 'save', group: { name: 'file' , id: 'file' } },
      { id: 'load', group: { name: 'file' , id: 'file' } },
      { id: 'undo', group: { name: 'command' , id: 'command' } },
      { id: 'redo', group: { name: 'command' , id: 'command' } }
    ];

    // when
    createPopupMenuList({ container, entries, diagramJSui });

    const entryHeaders = domQueryAll('.entry-header', container);

    // then
    expect(entryHeaders).to.have.lengthOf(2);
    expect(entryHeaders[0].textContent).to.eql('file');
    expect(entryHeaders[1].textContent).to.eql('command');
  }));


  it('should support legacy groups (type = string)', inject(function(diagramJSui) {

    // given
    const entries = [
      { id: 'save', group: 'file' },
      { id: 'load', group: 'file' }
    ];

    // when
    createPopupMenuList({ container, entries, diagramJSui });

    const entryHeaders = domQuery('[data-group="file"]', container);

    // then
    expect(entryHeaders).to.exist;
    expect(entryHeaders.children).to.have.lengthOf(2);
  }));

});



// helpers
function createPopupMenuList(options) {
  const { container, diagramJSui } = options;

  return diagramJSui.render(
    diagramJSui.html`
      <${PopupMenuList}
        entries=${ [ ] }
        selectedEntry=${ null }
        setSelectedEntry=${ ()=>{} }
        onSelect=${ ()=>{} }
        resultsRef=${ null }
        html=${ diagramJSui.html }
        ...${ options }
      />`,
    container
  );
}