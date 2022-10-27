import PopupMenuComponent from 'lib/features/popup-menu/PopupMenuComponent';
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


describe('<PopupMenu>', function() {
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


  it('should render', inject(function(diagramJSui) {
    createPopupMenu({ container, diagramJSui });
  }));


  it('should be visible even if no `position.cursor` was passed', inject(function(diagramJSui) {

    // when
    createPopupMenu({ container, diagramJSui });

    // then
    expect(getComputedStyle(container).visibility).not.to.eql('hidden');
  }));


  it('should open in correct position', inject(function(diagramJSui) {

    // given
    var position = () => {
      return { x: 100, y: 100 };
    };

    // when
    createPopupMenu({
      container,
      position,
      diagramJSui
    });

    const popup = domQuery(
      '.overlay', container
    ).getBoundingClientRect();

    // then
    expect(popup.x).to.eql(100);
    expect(popup.y).to.eql(100);
  }));


  it('should apply custom width', inject(function(diagramJSui) {

    // when
    createPopupMenu({
      container,
      width: 200,
      diagramJSui
    });

    const popup = domQuery(
      '.overlay', container
    );

    // then
    expect(popup.style.width).to.eql('200px');
  }));


  describe('close', function() {

    it('should close on background click', inject(function(diagramJSui) {
      const onClose = sinon.spy();

      createPopupMenu({ container, onClose, diagramJSui });

      container.children[0].click();

      expect(onClose).to.have.been.called;
    }));


    it('should close on entry click', inject(function(diagramJSui) {
      const onClose = sinon.spy();

      const entries = [ { id: '1', label: 'Entry 1', action: ()=>{} } ];

      // when
      createPopupMenu({ container, entries, onClose, diagramJSui });

      var entry = domQuery('.entry', container);

      // when
      entry.click();

      // then
      expect(onClose).to.have.been.called;
    }));

  });


  describe('body', function() {

    it('should only render body if entries exist', inject(function(diagramJSui) {

      // when
      createPopupMenu({ container, diagramJSui });

      // then
      expect(domQuery('.djs-popup-body', container)).not.to.exist;
    }));


    it('should trigger action on click', inject(function(diagramJSui) {

      // given
      var actionListener = sinon.spy();

      const entries = [ { id: '1', label: 'Entry 1', action: actionListener } ];

      // when
      createPopupMenu({ container, entries, diagramJSui });

      var entry = domQuery('.entry', container);

      // when
      entry.click();

      // then
      expect(actionListener).to.have.been.called;
    }));


    it('should focus first entry', inject(function(diagramJSui) {
      const entries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' }
      ];

      createPopupMenu({ container, entries, diagramJSui });

      const firstEntry = domQuery('.entry', container);

      // then
      expect(firstEntry.classList.contains('selected')).to.be.true;
    }));

  });


  describe('header', function() {

    it('should be attached to the top of the popup menu, if set', inject(function(diagramJSui) {

      // given
      const headerEntries = {
        '1': { label: 'Entry 1' }
      };

      // when
      createPopupMenu({ container, headerEntries, diagramJSui });

      // then
      var popupHeader = domQuery('.djs-popup .header', container);
      expect(domQuery('.djs-popup .header-entry', popupHeader)).to.exist;
    }));


    it('should render title, if set', inject(function(diagramJSui) {

      // given
      const title = 'Title';

      // when
      createPopupMenu({ container, title, diagramJSui });

      // then
      var titleElement = domQuery('.djs-popup .title', container);
      expect(titleElement).to.exist;
      expect(titleElement.innerHTML).to.eql(title);

    }));


    describe('entries', function() {

      it('should add standard class to entry', inject(function(diagramJSui) {

        // given
        const headerEntries = { '1': { title: 'Header Entry A' } };

        // when
        createPopupMenu({ container, headerEntries, diagramJSui });

        var popupHeader = domQuery('.djs-popup .header', container);

        // then
        expect(
          domQueryAll('.djs-popup .header-entry', popupHeader).length
        ).to.eql(1);
      }));


      it('should add custom class to entry if specified', inject(function(diagramJSui) {
        const headerEntries = { '2': { className: 'header-entry-1 cls2 cls3' } };

        // when
        createPopupMenu({ container, headerEntries, diagramJSui });

        // then
        var element = domQuery('.header-entry-1', container);
        expect(element.className).to.eql(
          'header-entry header-entry-1 cls2 cls3'
        );

      }));


      it('should have label if specified', inject(function(diagramJSui) {

        // given
        const headerEntries = {
          '2': { className: 'header-entry-1', label: 'Header 1' }
        };

        // when
        createPopupMenu({ container, headerEntries, diagramJSui });

        // then
        var element = domQuery('.header-entry-1', container);
        expect(element.textContent).to.eql('Header 1');

      }));


      it('should add action-id to entry', inject(function(diagramJSui) {

        // given
        const headerEntries = {
          save: { label: 'SAVE' },
          load: { label: 'LOAD' },
          undo: { label: 'UNDO' }
        };

        // when
        createPopupMenu({ container, headerEntries, diagramJSui });

        // then
        var group = domQueryAll('.djs-popup .header-entry', container);

        var entry1 = group[0];
        var entry2 = group[1];
        var entry3 = group[2];

        expect(entry1.getAttribute('data-id')).to.eql('save');
        expect(entry2.getAttribute('data-id')).to.eql('load');
        expect(entry3.getAttribute('data-id')).to.eql('undo');
      }));


      it('should add an image to the header section, if specified', inject(function(diagramJSui) {

        // given
        const headerEntries = {
          '1': { imageUrl: testEntryIcon, className: 'image-1' }
        };

        // when
        createPopupMenu({ container, headerEntries, diagramJSui });

        // then
        var img = domQuery('.image-1 img', container);

        expect(img).to.exist;
        expect(img.getAttribute('src')).to.eql(testEntryIcon);
      }));


      it('should NOT allow XSS via imageUrl', inject(function(diagramJSui) {

        // given
        const headerEntries = { '1': { imageUrl: '"><marquee />' } };

        // when
        createPopupMenu({ container, headerEntries, diagramJSui });

        // then
        var injected = domQuery('marquee', container);
        expect(injected).not.to.exist;
      }));


      it('should trigger action on click', inject(function(diagramJSui) {

        // given
        var actionListener = sinon.spy();

        const headerEntries = {
          '1': {
            label: 'foo',
            className: 'label-1',
            action: actionListener
          }
        };

        // when
        createPopupMenu({ container, headerEntries, diagramJSui });

        var entry = domQuery('.header-entry', container);

        // when
        entry.click();

        // then
        expect(actionListener).to.have.been.called;
      }));

    });

  });


  describe('search', function() {

    const entries = [
      { id: '1', label: 'Entry 1' },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Last' }
    ];

    it('should filter entries', inject(async function(diagramJSui) {

      // given
      createPopupMenu({ container, entries, diagramJSui, search: true });

      var searchInput = domQuery('.djs-popup .search input', container);
      searchInput.value = 'Entry 1';

      // when
      searchInput.dispatchEvent(new Event('keydown'));
      searchInput.dispatchEvent(new Event('keyup'));

      await whenStable();

      // then
      expect(domQueryAll('.entry', container).length).to.eql(1);
      expect(domQuery('.entry', container).textContent).to.eql('Entry 1');
    }));


    it('should allow partial search', inject(async function(diagramJSui) {

      // given
      createPopupMenu({ container, entries, diagramJSui, search: true });

      var searchInput = domQuery('.djs-popup .search input', container);
      searchInput.value = 'Entry';

      // when
      searchInput.dispatchEvent(new Event('keydown'));
      searchInput.dispatchEvent(new Event('keyup'));

      await whenStable();

      // then
      expect(domQueryAll('.entry', container).length).to.eql(2);
    }));


    describe('render', function() {

      const otherEntries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' },
        { id: '3', label: 'Entry 3' },
        { id: '4', label: 'Entry 4' },
        { id: '5', label: 'Entry 5' },
        { id: '6', label: 'Entry 6' }
      ];


      it('should be visible (search=true specified)', inject(async function(diagramJSui) {

        // given
        createPopupMenu({ container, entries, search: true, diagramJSui });

        // then
        const search = domQuery('.djs-popup .search', container);
        expect(search).to.exist;
        expect(search.classList.contains('hidden')).to.be.false;
      }));


      it('should be hidden (search=false specified)', inject(async function(diagramJSui) {

        // given
        createPopupMenu({ container, entries: otherEntries, search: false, diagramJSui });

        // then
        const search = domQuery('.djs-popup .search', container);

        expect(search).to.exist;
        expect(search.classList.contains('hidden')).to.be.true;
      }));


      it('should render (more than 5 entries)', inject(async function(diagramJSui) {

        // given
        createPopupMenu({ container, entries: otherEntries, diagramJSui });

        // then
        const search = domQuery('.djs-popup .search', container);
        expect(search).to.exist;
        expect(search.classList.contains('hidden')).to.be.false;
      }));


      it('should be hidden (less than 5 entries)', inject(async function(diagramJSui) {

        // given
        createPopupMenu({ container, entries, diagramJSui });

        // then
        const search = domQuery('.djs-popup .search', container);
        expect(search).to.exist;
        expect(search.classList.contains('hidden')).to.be.true;

      }));

    });

  });


  describe('keyboard', function() {
    const action = sinon.spy();

    const entries = [
      { id: '1', label: 'Entry 1', action },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Entry 3' }
    ];

    it('should trigger entry with <Enter>', inject(async function(diagramJSui) {

      // given
      createPopupMenu({ container, entries, diagramJSui });

      const searchInput = domQuery('.djs-popup .search input', container);

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter' }));

      // then
      expect(action).to.be.called;
    }));


    it('should close with <Escape>', inject(function(diagramJSui) {

      // given
      const onClose = sinon.spy();
      createPopupMenu({ container, entries, onClose, diagramJSui });

      const searchInput = domQuery('.djs-popup .search input', container);

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));

      // then
      expect(onClose).to.be.called;
    }));


    it('should navigate with <ArrowUp>', inject(async function(diagramJSui) {

      // given
      createPopupMenu({ container, entries, diagramJSui });

      const searchInput = domQuery('.djs-popup .search input', container);

      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'ArrowDown' }));
      await whenStable();

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 2');
    }));


    it('should navigate with <ArrowUp>', inject(async function(diagramJSui) {

      // given
      createPopupMenu({ container, entries, diagramJSui });

      const searchInput = domQuery('.djs-popup .search input', container);

      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'ArrowUp' }));
      await whenStable();

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 3');
    }));

  });

});


// helpers
function createPopupMenu(options) {
  const { container, diagramJSui } = options;

  const position = () => {
    return { x: 0, y: 0 };
  };

  return diagramJSui.render(
    diagramJSui.html`
      <${PopupMenuComponent}
        entries=${ [] }
        headerEntries=${ [] }
        onClose=${ () => {} }
        position=${ position }
        ...${ options }
      />`,
    container
  );
}

function whenStable() {
  return new Promise(resolve => setTimeout(resolve, 200));
}