import PopupMenuComponent from 'lib/features/popup-menu/PopupMenuComponent';

import {
  html,
  render
} from 'lib/ui';

import {
  insertCSS
} from 'test/TestHelper';

import {
  domify,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


const TEST_IMAGE_URL = `data:image/svg+xml;utf8,${
  encodeURIComponent(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" style="fill: green" />
    </svg>
  `)
}`;

insertCSS('fake-font.css', `
  .bpmn-icon-sun:before {
    content: '☼';
    font-style: normal;
    font-weight: normal;
    display: inline-block;
    text-decoration: inherit;
    width: 1em;
    height: 1em;
    text-align: center;
    font-variant: normal;
    text-transform: none;
    line-height: 1em;
  }
`);


describe('features/popup-menu - <PopupMenu>', function() {

  let container, teardown;

  beforeEach(function() {
    container = domify('<div class="djs-parent"></div>');

    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);

    teardown && teardown();
  });


  it('should render', function() {
    return createPopupMenu({ container });
  });


  it('should emit "opened" after mounting', async function() {

    // given
    const onOpened = sinon.spy();

    // when
    await createPopupMenu({ container, onOpened });

    // then
    expect(onOpened).to.have.been.calledOnce;
  });


  it('should emit "closed" after unmounting', async function() {

    // given
    const onClosed = sinon.spy();

    await createPopupMenu({ container, onClosed });

    // when
    teardown();

    // then
    expect(onClosed).to.have.been.calledOnce;
  });


  it('should open in correct position', async function() {

    // given
    var position = () => {
      return { x: 100, y: 100 };
    };

    // when
    await createPopupMenu({
      container,
      position
    });

    const popup = domQuery(
      '.djs-popup', container
    );

    const popupBounds = popup.getBoundingClientRect();

    // then
    expect(popupBounds.x).to.be.closeTo(100, 1);
    expect(popupBounds.y).to.be.closeTo(100, 1);
  });


  describe('should focus', function() {

    it('with search', async function() {

      // when
      await createPopupMenu({
        container,
        search: true,
        entries: [
          { id: '1', label: 'Entry 1' },
          { id: '2', label: 'Entry 2' },
          { id: '3', label: 'Entry 3' },
          { id: '4', label: 'Entry 4' },
          { id: '5', label: 'Entry 5' },
          { id: '6', label: 'Last' }
        ]
      });

      const searchInputEl = domQuery(
        '.djs-popup-search input', container
      );

      // then
      expect(document.activeElement).to.equal(searchInputEl);
    });


    it('without search', async function() {

      // when
      await createPopupMenu({
        container
      });

      const popupEl = domQuery(
        '.djs-popup', container
      );

      // then
      expect(document.activeElement).to.equal(popupEl);
    });

  });


  it('should apply custom width', async function() {

    // when
    await createPopupMenu({
      container,
      width: 200
    });

    const popup = domQuery(
      '.djs-popup', container
    );

    // then
    expect(popup.style.width).to.eql('200px');
  });


  describe('close', function() {

    it('should close on background click', async function() {
      const onClose = sinon.spy();

      await createPopupMenu({ container, onClose });

      container.children[0].click();

      expect(onClose).to.have.been.calledOnce;
    });


    it('should NOT close on selection', async function() {

      // given
      const onClose = sinon.spy();
      const onSelect = sinon.spy();

      const entries = [ { id: '1', label: 'Entry 1' } ];

      // when
      await createPopupMenu({ container, entries, onClose, onSelect });

      var entry = domQuery('.entry', container);

      // when
      entry.click();

      // then
      expect(onSelect).to.have.been.calledOnceWith(sinon.match.any);
      expect(onClose).not.to.have.been.called;
    });


    it('should NOT close on click inside', async function() {

      // given
      const onClose = sinon.spy();
      const onSelect = sinon.spy();

      const entries = [ { id: '1', label: 'Entry 1' } ];

      // when
      await createPopupMenu({ container, entries, onClose, onSelect });

      const popup = domQuery(
        '.djs-popup', container
      );

      popup.click();

      expect(onClose).not.to.have.been.called;
    });

  });


  describe('body', function() {

    it('should select first entry', async function() {
      const entries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' }
      ];

      await createPopupMenu({ container, entries });

      const firstEntry = domQuery('.entry', container);

      // then
      expect(firstEntry.classList.contains('selected')).to.be.true;
    });


    it('should hide if empty', async function() {
      const headerEntries = [
        { id: '1', label: '1' },
        { id: '2', label: '2' }
      ];

      await createPopupMenu({ container, headerEntries });

      const popupEl = domQuery('.djs-popup', container);
      const popupBodyEl = domQuery('.djs-popup-body', container);

      // then
      expect(popupEl.textContent).to.eql('12');
      expect(popupBodyEl).not.to.exist;
    });


    it('should render body entry', async function() {

      // given
      const imageUrl = TEST_IMAGE_URL;

      const entries = [
        { id: '1', label: '1' },
        { id: '2', imageUrl, title: 'Toggle foo' },
        { id: '3', label: 'FOO', description: 'I DESCRIBE IT' }
      ];

      await createPopupMenu({ container, entries });

      // when
      const [
        firstEntry,
        secondEntry,
        describedEntry
      ] = domQueryAll('.entry', container);

      // then
      expect(firstEntry.title).to.eql('1');
      expect(firstEntry.textContent).to.eql('1');

      expect(secondEntry.title).to.eql('Toggle foo');
      expect(secondEntry.textContent).to.eql('');
      expect(secondEntry.innerHTML).to.include(`<img class="djs-popup-entry-icon" src="${ imageUrl }" alt="">`);

      expect(describedEntry.title).to.eql('FOO');
      expect(describedEntry.textContent).to.eql('FOOI DESCRIBE IT');
    });


    it('should render entry header', async function() {

      // given
      const entries = [
        {
          id: '1',
          label: '1',
          group: {
            id: 'SAD',
            name: 'SOME GROUP'
          }
        }
      ];

      await createPopupMenu({ container, entries });

      // when
      const [
        groupHeader
      ] = domQueryAll('.entry-header', container);

      // then
      expect(groupHeader).to.exist;
      expect(groupHeader.title).to.eql('SOME GROUP');
      expect(groupHeader.textContent).to.eql('SOME GROUP');
    });


    it('should allow to drag entries', async function() {

      // given
      const entries = [ { id: '1', label: '1', action: { dragstart: ()=> {} } } ];

      const onSelectSpy = sinon.spy();

      await createPopupMenu({ container, entries, onSelect: onSelectSpy });

      // when
      domQuery('.entry', container).dispatchEvent(dragStart());

      // then
      expect(onSelectSpy).to.have.been.calledOnce;
    });

  });


  describe('header', function() {

    it('should render header entry', async function() {

      // given
      const imageUrl = TEST_IMAGE_URL;

      const headerEntries = [
        { id: '1', label: '1' },
        { id: '2', imageUrl, title: 'Toggle foo' }
      ];

      await createPopupMenu({ container, headerEntries });

      // when
      const [
        firstEntry,
        secondEntry
      ] = domQueryAll('.entry', container);

      // then
      expect(firstEntry.title).to.eql('1');
      expect(firstEntry.textContent).to.eql('1');

      expect(secondEntry.title).to.eql('Toggle foo');
      expect(secondEntry.textContent).to.eql('');
      expect(secondEntry.innerHTML).to.eql(`<img class="djs-popup-entry-icon" src="${ imageUrl }" alt="">`);
    });


    it('should select header entry on hover', async function() {

      // given
      const headerEntries = [
        { id: '1', label: '1' },
        { id: '2', label: '2' }
      ];

      await createPopupMenu({ container, headerEntries });

      const entryEl = domQuery('.entry', container);

      // when
      await trigger(entryEl, mouseEnter());

      // then
      expect(entryEl.classList.contains('selected'), 'entry is selected').to.be.true;

      // but when
      await trigger(entryEl, mouseLeave());

      // then
      expect(entryEl.classList.contains('selected')).to.be.false;
    });

  });


  it('should render title, if set', async function() {

    // given
    const title = 'Title';

    // when
    await createPopupMenu({ container, title });

    // then
    var titleElement = domQuery('.djs-popup-title', container);
    expect(titleElement).to.exist;
    expect(titleElement.title).to.eql(title);
    expect(titleElement.innerHTML).to.eql(title);
  });


  describe('search', function() {

    const entries = [
      { id: '1', label: 'Entry 1', description: 'Entry 1 description' },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Entry 3' },
      { id: '4', label: 'Entry 4' },
      { id: '5', label: 'Entry 5', search: 'foo' },
      { id: 'some_entry_id', label: 'Last' },
      { id: '7', label: 'Entry 7' , searchable: false }
    ];


    it('should filter entries + select first', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'Entry 3';

      // when
      await trigger(searchInput, keyDown('ArrowUp'));
      await trigger(searchInput, keyUp('ArrowUp'));

      // then
      expect(domQueryAll('.entry', container)).to.have.length(1);
      expect(domQuery('.entry', container).textContent).to.eql('Entry 3');
      expect(domQuery('.selected', container).textContent).to.eql('Entry 3');
    });


    it('should allow partial search', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'Entry';

      // when
      await trigger(searchInput, keyDown('ArrowDown'));
      await trigger(searchInput, keyUp('ArrowDown'));

      // then
      expect(domQueryAll('.entry', container)).to.have.length(5);
      expect(domQuery('.djs-popup-no-results', container)).not.to.exist;
    });


    it('should show <not found>', async function() {

      // given
      await createPopupMenu({
        container,
        entries,
        search: true,
        emptyPlaceholder: 'No results'
      });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'Foo bar';

      // when
      await trigger(searchInput, keyDown('ArrowDown'));
      await trigger(searchInput, keyUp('ArrowDown'));

      // then
      expect(domQueryAll('.entry', container)).to.have.length(0);
      expect(domQuery('.djs-popup-no-results', container)).to.exist;
    });


    it('should search description', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = entries[0].description;

      // when
      await trigger(searchInput, keyDown('ArrowUp'));
      await trigger(searchInput, keyUp('ArrowUp'));

      // then
      expect(domQueryAll('.entry', container)).to.have.length(1);
      expect(domQuery('.entry .djs-popup-label', container).textContent).to.eql('Entry 1');
    });


    it('should search additional "search" terms', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = entries[4].search;

      // when
      await trigger(searchInput, keyDown('ArrowUp'));
      await trigger(searchInput, keyUp('ArrowUp'));

      // then
      expect(domQueryAll('.entry', container)).to.have.length(1);
      expect(domQuery('.entry .djs-popup-label', container).textContent).to.eql('Entry 5');
    });


    it('should not search id', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = entries[5].id;

      // when
      await trigger(searchInput, keyDown('ArrowUp'));
      await trigger(searchInput, keyUp('ArrowUp'));

      // then
      expect(domQueryAll('.entry', container)).to.have.length(0);
    });


    it('should not search non-searchable entries', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'entry';

      // when
      await trigger(searchInput, keyDown('ArrowUp'));
      await trigger(searchInput, keyUp('ArrowUp'));

      // then
      expect(domQuery('.entry[data-id="7"]', container)).to.not.exist;
    });


    describe('render', function() {

      const otherEntries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' },
        { id: '3', label: 'Entry 3' }
      ];


      it('should be hidden by default', async function() {

        // when
        await createPopupMenu({ container, entries: otherEntries });

        // then
        expect(domQuery('.djs-popup-search', container)).not.to.exist;
      });


      it('should render (more than 5 entries)', async function() {

        // when
        await createPopupMenu({ container, entries, search: true });

        // then
        expect(domQuery('.djs-popup-search', container)).to.exist;
      });


      it('should be hidden (less than 5 entries)', async function() {

        // given
        await createPopupMenu({ container, entries: otherEntries, search: true });

        // then
        expect(domQuery('.djs-popup-search', container)).not.to.exist;
      });

    });

  });


  describe('keyboard', function() {

    const entries = [
      { id: '1', label: 'Entry 1' },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Entry 3' },
      { id: '4', label: 'Entry 4' },
      { id: '5', label: 'Entry 5' },
      { id: '6', label: 'Entry 6' }
    ];


    it('should trigger entry with <Enter>', async function() {

      // given
      const onClose = sinon.spy();
      const onSelect = sinon.spy();

      await createPopupMenu({ container, entries, search: true, onClose, onSelect });

      const searchInput = domQuery('.djs-popup-search input', container);

      const enterEvent = keyDown('Enter');

      // when
      await trigger(searchInput, enterEvent);

      // then
      expect(onSelect).to.be.calledOnceWith(enterEvent, entries[0]);
    });


    describe('should close with <Escape>', function() {

      it('on search', async function() {

        // given
        const onClose = sinon.spy();

        await createPopupMenu({ container, entries, onClose, search: true });

        const searchInput = domQuery('.djs-popup-search input', container);

        // assume
        expect(searchInput).to.exist;

        // when
        await trigger(searchInput, keyDown('Escape'));

        // then
        expect(onClose).to.be.calledOnce;
      });


      it('on popup', async function() {

        // given
        const onClose = sinon.spy();

        await createPopupMenu({ container, entries, onClose, search: true });

        const popupEl = domQuery('.djs-popup', container);

        // when
        popupEl.dispatchEvent(keyDown('Escape'));

        // then
        expect(onClose).to.be.calledOnce;
      });


      it('global', async function() {

        // given
        const onClose = sinon.spy();

        await createPopupMenu({ container, entries, onClose });

        // when
        document.documentElement.dispatchEvent(keyDown('Escape'));

        // then
        expect(onClose).to.be.calledOnce;
      });

    });


    it('should navigate with <ArrowDown>', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup-search input', container);

      // assume
      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      await trigger(searchInput, keyDown('ArrowDown'));

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 2');
    });


    it('should navigate with <ArrowUp>', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup-search input', container);

      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      await trigger(searchInput, keyDown('ArrowUp'));

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 6');
    });

  });


  // helpers
  async function createPopupMenu(options) {

    const {
      container,
      ...restOptions
    } = options;

    const props = {
      entries: [],
      headerEntries: [],
      position() {
        return { x: 0, y: 0 };
      },
      onClose() {},
      onOpened() {},
      onClosed() {},
      ...restOptions
    };

    teardown = () => {
      render(null, container);

      teardown = null;
    };

    const result = render(
      html`
        <${PopupMenuComponent} ...${ props } />
      `,
      container
    );

    await whenStable(500);

    return result;
  }

});


// helpers /////////////

/**
 * @param { string } key
 *
 * @return { KeyboardEvent }
 */
function keyDown(key) {
  return new KeyboardEvent('keydown', { key, bubbles: true });
}

/**
 * @param { string } key
 *
 * @return { KeyboardEvent }
 */
function keyUp(key) {
  return new KeyboardEvent('keyup', { key, bubbles: true });
}

/**
 *
 * @return { DragEvent }
 */
function dragStart() {
  return new DragEvent('dragstart');
}

function mouseEnter() {
  return new MouseEvent('mouseenter', { bubbles: true });
}

function mouseLeave() {
  return new MouseEvent('mouseleave', { bubbles: true });
}

async function trigger(element, event) {
  element.dispatchEvent(event);

  return whenStable(500);
}

function whenStable(timeout = 50) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}
