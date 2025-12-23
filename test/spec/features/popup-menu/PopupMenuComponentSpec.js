import { expect } from 'chai';

import {
  match,
  spy
} from 'sinon';

import { expectToBeAccessible } from '@bpmn-io/a11y';

import { act } from '@testing-library/preact';

import PopupMenuComponent from 'lib/features/popup-menu/PopupMenuComponent';

import {
  html,
  render
} from 'lib/ui';

import {
  fireEvent
} from '@testing-library/preact';

import {
  insertCSS
} from 'test/TestHelper';

import {
  domify,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import searchFn from 'lib/features/search/search';


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

  let container, cleanup;

  beforeEach(function() {
    container = domify('<div class="djs-parent"></div>');

    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);

    cleanup && cleanup();
  });


  it('should render', function() {
    return createPopupMenu({ container });
  });


  it('should emit "opened" after mounting', async function() {

    // given
    const onOpened = spy();

    // when
    await createPopupMenu({ container, onOpened });

    // then
    expect(onOpened).to.have.been.calledOnce;
  });


  it('should emit "closed" after unmounting', async function() {

    // given
    const onClosed = spy();

    await createPopupMenu({ container, onClosed });

    // when
    cleanup();

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

  it('should render disabled entry', async function() {

    // given
    const entries = [
      { id: '1', label: 'Entry 1', disabled: true }
    ];

    // when
    await createPopupMenu({ container, entries });

    const entry = domQuery('.entry', container);

    // then
    expect(entry.classList.contains('disabled')).to.be.true;
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
      const onClose = spy();

      await createPopupMenu({ container, onClose });

      document.body.click();

      expect(onClose).to.have.been.calledOnce;
    });


    it('should NOT close on selection', async function() {

      // given
      const onClose = spy();
      const onSelect = spy();

      const entries = [ { id: '1', label: 'Entry 1' } ];

      // when
      await createPopupMenu({ container, entries, onClose, onSelect });

      var entry = domQuery('.entry', container);

      // when
      fireEvent.click(entry);

      // then
      expect(onSelect).to.have.been.calledOnceWith(match.any);
      expect(onClose).not.to.have.been.called;
    });


    it('should NOT close on disabled entry click', async function() {

      // given
      const onClose = spy();
      const onSelect = spy();

      const entries = [ { id: '1', label: 'Entry 1', disabled: true } ];

      // when
      await createPopupMenu({ container, entries, onClose, onSelect });

      var entry = domQuery('.entry', container);

      // when
      fireEvent.click(entry);

      // then
      expect(onSelect).not.to.have.been.called;
      expect(onClose).not.to.have.been.called;
    });


    it('should NOT close on click inside', async function() {

      // given
      const onClose = spy();
      const onSelect = spy();

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


    it('should select first entry even if disabled', async function() {
      const entries = [
        { id: '1', label: 'Entry 1', disabled: true },
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

      const onSelectSpy = spy();

      await createPopupMenu({ container, entries, onSelect: onSelectSpy });

      // when
      fireEvent.dragStart(domQuery('.entry', container));

      // then
      expect(onSelectSpy).to.have.been.calledOnce;
    });


    it('should show placeholder if no entries', async function() {

      // given
      await createPopupMenu({
        container,
        emptyPlaceholder: 'No Entries'
      });

      // then
      expect(domQueryAll('.entry', container)).to.have.length(0);
      expect(domQuery('.djs-popup-no-results', container)).to.exist;
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
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyUp(searchInput, { key: 'ArrowUp' });

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
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyUp(searchInput, { key: 'ArrowUp' });

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
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyUp(searchInput, { key: 'ArrowUp' });

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
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyUp(searchInput, { key: 'ArrowUp' });

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
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyUp(searchInput, { key: 'ArrowUp' });

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
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyUp(searchInput, { key: 'ArrowUp' });

      // then
      expect(domQueryAll('.entry', container)).to.have.length(0);
    });


    it('should not search non-searchable entries', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'entry';

      // when
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      fireEvent.keyUp(searchInput, { key: 'ArrowUp' });

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


  describe('mouse', function() {

    const entries = [
      { id: '1', label: 'Entry 1' },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Entry 3' }
    ];

    it('should select entry on hover', async function() {

      // given
      await createPopupMenu({ container, entries });

      const secondEntry = domQueryAll('.entry', container)[1];

      // when
      fireEvent.mouseEnter(secondEntry);

      // then
      expect(secondEntry.classList.contains('selected')).to.be.true;
    });


    it('should select disabled entry on hover', async function() {

      // given
      const disabledEntries = [
        { id: '1', label: 'Entry 1', disabled: true },
        { id: '2', label: 'Entry 2' }
      ];

      await createPopupMenu({ container, entries: disabledEntries });

      const firstEntry = domQueryAll('.entry', container)[0];

      // when
      fireEvent.mouseEnter(firstEntry);

      // then
      expect(firstEntry.classList.contains('selected')).to.be.true;
    });


    it('should not trigger disabled entry on click', async function() {

      // given
      const onSelect = spy();

      const disabledEntries = [
        { id: '1', label: 'Entry 1', disabled: true },
        { id: '2', label: 'Entry 2' }
      ];

      await createPopupMenu({ container, entries: disabledEntries, onSelect });

      const firstEntry = domQueryAll('.entry', container)[0];

      // when
      firstEntry.click();

      // then
      expect(onSelect).not.to.be.called;
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
      const onClose = spy();
      const onSelect = spy();

      await createPopupMenu({ container, entries, search: true, onClose, onSelect });

      const searchInput = domQuery('.djs-popup-search input', container);

      // when
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      // then
      expect(onSelect).to.be.calledOnceWith(match({ key: 'Enter' }), entries[0]);
    });


    it('should not trigger disabled entry with <Enter>', async function() {

      // given
      const onClose = spy();
      const onSelect = spy();

      const disabledEntries = [
        { id: '1', label: 'Entry 1', disabled: true },
        { id: '2', label: 'Entry 2' }
      ];

      await createPopupMenu({ container, entries: disabledEntries, onClose, onSelect });

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'Enter' });

      // then
      expect(onSelect).not.to.be.called;
    });


    describe('should close with <Escape>', function() {

      it('on search', async function() {

        // given
        const onClose = spy();

        await createPopupMenu({ container, entries, onClose, search: true });

        const searchInput = domQuery('.djs-popup-search input', container);

        // assume
        expect(searchInput).to.exist;

        // when
        fireEvent.keyDown(searchInput, { key: 'Escape' });

        // then
        expect(onClose).to.be.calledOnce;
      });


      it('on popup', async function() {

        // given
        const onClose = spy();

        await createPopupMenu({ container, entries, onClose, search: true });

        const popupEl = domQuery('.djs-popup', container);

        // when
        fireEvent.keyDown(popupEl, { key: 'Escape' });

        // then
        expect(onClose).to.be.calledOnce;
      });


      it('global', async function() {

        // given
        const onClose = spy();

        await createPopupMenu({ container, entries, onClose });

        // when
        fireEvent.keyDown(document.documentElement, { key: 'Escape' });

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
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 2');
    });


    it('should navigate with <ArrowUp>', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup-search input', container);

      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 6');
    });


    it('should navigate through shuffled grouped entries in visual order', async function() {

      // given
      const shuffledGroupEntries = [
        { id: '1', label: 'Group A - Entry 1', group: 'Group A' },
        { id: '3', label: 'Group B - Entry 1', group: 'Group B' },
        { id: '5', label: 'Group C - Entry 1', group: 'Group C' },
        { id: '2', label: 'Group A - Entry 2', group: 'Group A' },
        { id: '6', label: 'Group C - Entry 2', group: 'Group C' },
        { id: '4', label: 'Group B - Entry 2', group: 'Group B' }
      ];

      await createPopupMenu({ container, entries: shuffledGroupEntries, search: true });

      const popupEl = domQuery('.djs-popup', container);

      // Visual order should be alphabetical by group: A1, A2, B1, B2, C1, C2
      expect(domQuery('.selected', container).textContent).to.include('Group A - Entry 1');

      fireEvent.keyDown(popupEl, { key: 'ArrowDown' });
      expect(domQuery('.selected', container).textContent).to.include('Group A - Entry 2');

      fireEvent.keyDown(popupEl, { key: 'ArrowDown' });
      expect(domQuery('.selected', container).textContent).to.include('Group B - Entry 1');

      fireEvent.keyDown(popupEl, { key: 'ArrowDown' });
      expect(domQuery('.selected', container).textContent).to.include('Group B - Entry 2');

      fireEvent.keyDown(popupEl, { key: 'ArrowDown' });
      expect(domQuery('.selected', container).textContent).to.include('Group C - Entry 1');

      fireEvent.keyDown(popupEl, { key: 'ArrowDown' });
      expect(domQuery('.selected', container).textContent).to.include('Group C - Entry 2');

      // Should wrap around to first entry
      fireEvent.keyDown(popupEl, { key: 'ArrowDown' });
      expect(domQuery('.selected', container).textContent).to.include('Group A - Entry 1');

      // Should jump back to the last entry
      fireEvent.keyDown(popupEl, { key: 'ArrowUp' });
      expect(domQuery('.selected', container).textContent).to.include('Group C - Entry 2');
    });

  });


  describe('a11y', function() {

    const entries = [
      { id: '1', label: 'Entry 1', description: 'Entry 1 description' },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Entry 3' },
      { id: '4', label: 'Entry 4' },
      { id: '5', label: 'Entry 5', search: 'foo' },
      { id: 'some_entry_id', label: 'Last' },
      { id: '7', label: 'Entry 7' , searchable: false }
    ];

    it('should have label for search input', async function() {

      // given
      await createPopupMenu({ container, entries, title: 'Search', search: true });

      const searchInput = domQuery('.djs-popup-search input', container);

      // then
      expect(searchInput.getAttribute('aria-label')).to.eql('Search');
    });


    it('should have role aria-disable for disabled entry', async function() {

      // given
      const entries = [
        { id: '1', label: 'Entry 1', disabled: true }
      ];

      await createPopupMenu({ container, entries });

      const entry = domQuery('.entry', container);

      // then
      expect(entry.getAttribute('aria-disabled')).to.eql('true');
    });


    it('should report no violations', async function() {

      // given
      await createPopupMenu({ container, entries, title: 'Search', search: true });

      // then
      await expectToBeAccessible(container);
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
      searchFn,
      position() {
        return { x: 0, y: 0 };
      },
      onClose() {},
      onOpened() {},
      onClosed() {},
      ...restOptions
    };

    cleanup = () => {
      render(null, container);

      cleanup = null;
    };

    return act(() => {
      return render(
        html`
          <${PopupMenuComponent} ...${ props } />
        `,
        container
      );
    });
  }

});
