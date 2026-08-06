import { expect } from 'chai';

import {
  match,
  spy
} from 'sinon';

import { expectToBeAccessible } from '@bpmn-io/a11y';

import {
  act,
  fireEvent
} from '@testing-library/preact';

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
        container,
        entries: [
          { id: '1', label: 'Entry 1' },
          { id: '2', label: 'Entry 2' }
        ]
      });

      const listboxEl = domQuery(
        '.djs-popup-results', container
      );

      // then
      expect(document.activeElement).to.equal(listboxEl);
    });


    it('without search or entries', async function() {

      // when
      await createPopupMenu({
        container,
        emptyPlaceholder: 'No entries'
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


  it('should apply custom width via css variable', async function() {

    // when
    await createPopupMenu({
      container,
      width: 'var(--foo, 360px)'
    });

    const popup = domQuery(
      '.djs-popup', container
    );

    // then
    expect(popup.style.width).to.eql('var(--foo, 360px)');
    expect(getComputedStyle(popup).width).to.eql('360px');
  });


  it('should NOT apply custom width if not provided', async function() {

    // when
    await createPopupMenu({
      container
    });

    const popup = domQuery(
      '.djs-popup', container
    );

    // then
    expect(popup.style.width).to.eql('');
  });


  it('should apply custom width (over limit)', async function() {

    // when
    await createPopupMenu({
      container,
      width: 400
    });

    const popup = domQuery(
      '.djs-popup', container
    );

    // then
    expect(getComputedStyle(popup).width).to.eql('400px');
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
      expect(firstEntry.title).to.be.empty;
      expect(firstEntry.textContent).to.eql('1');

      expect(secondEntry.title).to.eql('Toggle foo');
      expect(secondEntry.textContent).to.eql('');
      expect(secondEntry.innerHTML).to.include(`<img class="djs-popup-entry-icon" src="${ imageUrl }" alt="">`);

      expect(describedEntry.title).to.be.empty;
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
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyUp(searchInput, { key: 'ArrowUp' });
      });

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
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyUp(searchInput, { key: 'ArrowUp' });
      });

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
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyUp(searchInput, { key: 'ArrowUp' });
      });

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
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyUp(searchInput, { key: 'ArrowUp' });
      });

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
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyUp(searchInput, { key: 'ArrowUp' });
      });

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
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyUp(searchInput, { key: 'ArrowUp' });
      });

      // then
      expect(domQueryAll('.entry', container)).to.have.length(0);
    });


    it('should not search non-searchable entries', async function() {

      // given
      await createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'entry';

      // when
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyUp(searchInput, { key: 'ArrowUp' });
      });

      // then
      expect(domQuery('.entry[data-id="7"]', container)).to.not.exist;
    });


    describe('grouping', function() {

      const groupedEntries = [
        { id: '1', label: 'Entry 1', group: { id: 'a', name: 'Group A' } },
        { id: '2', label: 'Entry 2', group: { id: 'a', name: 'Group A' } },
        { id: '3', label: 'Entry 3', group: { id: 'b', name: 'Group B' } },
        { id: '4', label: 'Entry 4', group: { id: 'b', name: 'Group B' } },
        { id: '5', label: 'Entry 5', group: { id: 'b', name: 'Group B' } },
        { id: '6', label: 'Entry 6', group: { id: 'b', name: 'Group B' } }
      ];


      it('should keep groups when not searching', async function() {

        // given
        await createPopupMenu({ container, entries: groupedEntries, search: true });

        // then
        expect(domQueryAll('.entry-header', container)).to.have.length(2);
      });


      it('should remove groups during search', async function() {

        // given
        await createPopupMenu({ container, entries: groupedEntries, search: true });

        var searchInput = domQuery('.djs-popup-search input', container);
        searchInput.value = 'Entry';

        // when
        await act(async () => {
          fireEvent.keyDown(searchInput, { key: 'e' });
          fireEvent.keyUp(searchInput, { key: 'e' });
        });

        // then
        expect(domQueryAll('.entry-header', container)).to.have.length(0);
        expect(domQueryAll('.entry', container)).to.have.length(6);
      });


      it('should restore groups when search is cleared', async function() {

        // given
        await createPopupMenu({ container, entries: groupedEntries, search: true });

        var searchInput = domQuery('.djs-popup-search input', container);
        searchInput.value = 'Entry';
        await act(async () => {
          fireEvent.keyDown(searchInput, { key: 'e' });
          fireEvent.keyUp(searchInput, { key: 'e' });
        });

        // when
        searchInput.value = '';
        await act(async () => {
          fireEvent.keyDown(searchInput, { key: 'Backspace' });
          fireEvent.keyUp(searchInput, { key: 'Backspace' });
        });

        // then
        expect(domQueryAll('.entry-header', container)).to.have.length(2);
      });

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


    it('should pop one level with <Backspace>', async function() {

      // given
      const nestedEntries = [
        {
          id: '1',
          label: 'A',
          entries: [
            { id: '1-1', label: 'A-A', action: () => {} },
            { id: '1-2', label: 'A-B', action: () => {} }
          ]
        },
        {
          id: '2',
          label: 'B',
          action: () => {}
        }
      ];

      await createPopupMenu({ container, entries: nestedEntries });

      fireEvent.click(domQuery('.entry[data-id="1"]', container));

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'Backspace' });

      // then
      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([ 'A', 'B' ]);
    });


    it('should restore selection to popped entry after <Backspace>', async function() {

      // given
      const nestedEntries = [
        {
          id: '1',
          label: 'A',
          action: () => {}
        },
        {
          id: '2',
          label: 'B',
          entries: [
            { id: '2-1', label: 'B-A', action: () => {} }
          ]
        }
      ];

      await createPopupMenu({ container, entries: nestedEntries });

      const entryEl = domQuery('.entry[data-id="2"]', container);

      fireEvent.mouseEnter(entryEl);
      fireEvent.click(entryEl);

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'Backspace' });

      // then
      expect(domQuery('.selected .djs-popup-label', container).textContent).to.eql('B');
    });


    it('should push level with <ArrowRight> over navigate entry', async function() {

      // given
      const nestedEntries = [
        {
          id: '1',
          label: 'A',
          entries: [
            { id: '1-1', label: 'A-A', action: () => {} },
            { id: '1-2', label: 'A-B', action: () => {} }
          ]
        },
        {
          id: '2',
          label: 'B',
          action: () => {}
        }
      ];

      await createPopupMenu({ container, entries: nestedEntries });

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'ArrowRight' });

      // then
      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([ 'A-A', 'A-B' ]);
    });


    it('should not push level with <ArrowRight> over leaf entry', async function() {

      // given
      const nestedEntries = [
        {
          id: '1',
          label: 'A',
          action: () => {}
        },
        {
          id: '2',
          label: 'B',
          entries: [
            { id: '2-1', label: 'B-A', action: () => {} }
          ]
        }
      ];

      await createPopupMenu({ container, entries: nestedEntries });

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'ArrowRight' });

      // then
      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([ 'A', 'B' ]);
    });


    it('should pop one level with <ArrowLeft>', async function() {

      // given
      const nestedEntries = [
        {
          id: '1',
          label: 'A',
          entries: [
            { id: '1-1', label: 'A-A', action: () => {} },
            { id: '1-2', label: 'A-B', action: () => {} }
          ]
        },
        {
          id: '2',
          label: 'B',
          action: () => {}
        }
      ];

      await createPopupMenu({ container, entries: nestedEntries });

      fireEvent.click(domQuery('.entry[data-id="1"]', container));

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'ArrowLeft' });

      // then
      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([ 'A', 'B' ]);
    });


    it('should restore selection to popped entry after <ArrowLeft>', async function() {

      // given
      const nestedEntries = [
        {
          id: '1',
          label: 'A',
          action: () => {}
        },
        {
          id: '2',
          label: 'B',
          entries: [
            { id: '2-1', label: 'B-A', action: () => {} }
          ]
        }
      ];

      await createPopupMenu({ container, entries: nestedEntries });

      const entryEl = domQuery('.entry[data-id="2"]', container);

      fireEvent.mouseEnter(entryEl);
      fireEvent.click(entryEl);

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'ArrowLeft' });

      // then
      expect(domQuery('.selected .djs-popup-label', container).textContent).to.eql('B');
    });

  });


  describe('navigation', function() {

    const navigateEntries = [
      {
        id: 'issues',
        label: 'Issues',
        entries: [
          { id: 'create-issue', label: 'Create Issue', action: () => {} },
          { id: 'list-issues', label: 'List Issues', action: () => {} }
        ]
      },
      {
        id: 'leaf',
        label: 'Leaf',
        action: () => {}
      }
    ];


    it('should push level on click of navigate entry', async function() {

      // given
      const onSelect = spy();

      await createPopupMenu({ container, entries: navigateEntries, onSelect });

      const navigateEntry = domQuery('.entry[data-id="issues"]', container);

      // when
      fireEvent.click(navigateEntry);

      // then
      expect(onSelect).not.to.be.called;

      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([
        'Create Issue',
        'List Issues'
      ]);
    });


    it('should not close popup on click of navigate entry', async function() {

      // given
      const onClose = spy();

      await createPopupMenu({ container, entries: navigateEntries, onClose });

      // when
      fireEvent.click(domQuery('.entry[data-id="issues"]', container));

      // then
      expect(onClose).not.to.have.been.called;
      expect(domQuery('.entry[data-id="create-issue"]', container)).to.exist;
    });


    it('should push level on <Enter> over navigate entry', async function() {

      // given
      const onSelect = spy();

      await createPopupMenu({ container, entries: navigateEntries, onSelect });

      const popupEl = domQuery('.djs-popup', container);

      // when
      fireEvent.keyDown(popupEl, { key: 'Enter' });

      // then
      expect(onSelect).not.to.be.called;

      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([
        'Create Issue',
        'List Issues'
      ]);
    });


    it('should trigger onSelect on click of leaf entry', async function() {

      // given
      const onSelect = spy();

      await createPopupMenu({ container, entries: navigateEntries, onSelect });

      const leafEntry = domQuery('.entry[data-id="leaf"]', container);

      // when
      fireEvent.click(leafEntry);

      // then
      expect(onSelect).to.have.been.calledOnce;
    });


    it('should render chevron on navigate entry', async function() {

      // when
      await createPopupMenu({ container, entries: navigateEntries });

      // then
      expect(domQuery('.entry[data-id="issues"] .djs-popup-entry-chevron', container)).to.exist;
      expect(domQuery('.entry[data-id="leaf"] .djs-popup-entry-chevron', container)).not.to.exist;
    });


    it('should not allow to drag navigate entries', async function() {

      // given
      const onSelect = spy();

      await createPopupMenu({ container, entries: navigateEntries, onSelect });

      const navigateEntry = domQuery('.entry[data-id="issues"]', container);

      // when
      fireEvent.dragStart(navigateEntry);

      // then
      expect(onSelect).not.to.have.been.called;
      expect(navigateEntry.getAttribute('draggable')).to.eql('false');
    });


    it('should select first entry of new level after push', async function() {

      // given
      await createPopupMenu({ container, entries: navigateEntries });

      const navigateEntry = domQuery('.entry[data-id="issues"]', container);

      // when
      fireEvent.click(navigateEntry);

      // then
      expect(domQuery('.selected .djs-popup-label', container).textContent).to.eql('Create Issue');
    });


    it('should pop level on back button click', async function() {

      // given
      await createPopupMenu({ container, entries: navigateEntries });

      fireEvent.click(domQuery('.entry[data-id="issues"]', container));

      // when
      fireEvent.click(domQuery('.djs-popup-breadcrumbs-item--back', container));

      // then
      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([ 'Issues', 'Leaf' ]);
    });


    it('should pop all the way to root on back button click', async function() {

      // given
      const threeLevelEntries = [
        {
          id: 'connector',
          label: 'GitHub Connector',
          entries: [
            {
              id: 'issues',
              label: 'Issues',
              entries: [
                { id: 'create-issue', label: 'Create Issue', action: () => {} }
              ]
            }
          ]
        }
      ];

      await createPopupMenu({ container, entries: threeLevelEntries });

      fireEvent.click(domQuery('.entry[data-id="connector"]', container));
      fireEvent.click(domQuery('.entry[data-id="issues"]', container));

      // when
      fireEvent.click(domQuery('.djs-popup-breadcrumbs-item--back', container));

      // then
      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([ 'GitHub Connector' ]);
    });


    it('should display breadcrumbs when nested even without title or header entries', async function() {

      // given
      const noTitleEntries = [
        {
          id: 'group',
          label: 'Group',
          entries: [
            { id: 'leaf', label: 'Leaf', action: () => {} }
          ]
        }
      ];

      await createPopupMenu({ container, entries: noTitleEntries });

      // when
      fireEvent.click(domQuery('.entry[data-id="group"]', container));

      // then
      expect(domQuery('.djs-popup-breadcrumbs', container)).to.exist;
      expect(domQuery('.djs-popup-breadcrumbs-item--back', container)).to.exist;
    });


    it('should hide header when nested', async function() {

      // given
      const noTitleEntries = [
        {
          id: 'group',
          label: 'Group',
          entries: [
            { id: 'leaf', label: 'Leaf', action: () => {} }
          ]
        }
      ];

      await createPopupMenu({ container, entries: noTitleEntries, title: 'Root' });

      // when
      fireEvent.click(domQuery('.entry[data-id="group"]', container));

      // then
      expect(domQuery('.djs-popup-header', container)).not.to.exist;
    });


    it('should reset to root when entries prop identity changes (refresh)', async function() {

      // given
      const nestedEntries = [
        {
          id: 'group',
          label: 'Group',
          entries: [
            { id: 'leaf', label: 'Leaf', action: () => {} }
          ]
        }
      ];

      await createPopupMenu({ container, entries: nestedEntries });

      fireEvent.click(domQuery('.entry[data-id="group"]', container));

      // assume
      expect(domQuery('.djs-popup-breadcrumbs', container)).to.exist;

      // when
      const refreshedEntries = [
        {
          id: 'group',
          label: 'Group',
          entries: [
            { id: 'leaf', label: 'Leaf', action: () => {} }
          ]
        }
      ];

      await createPopupMenu({ container, entries: refreshedEntries });

      // then
      expect(domQuery('.djs-popup-breadcrumbs', container)).not.to.exist;
      const entryLabels = domQueryAll('.djs-popup-label', container);
      expect([ ...entryLabels ].map(e => e.textContent)).to.eql([ 'Group' ]);
    });


    describe('cross-level search', function() {

      const searchableEntries = [
        {
          id: 'github',
          label: 'GitHub Connector',
          entries: [
            { id: 'list-issues', label: 'List Issues', search: [ 'list issues' ], action: () => {} },
            { id: 'list-branches', label: 'List Branches', search: [ 'list branches' ], action: () => {} },
            { id: 'create-issue', label: 'Create Issue', action: () => {} }
          ]
        },
        {
          id: 'email',
          label: 'Email Connector',
          entries: [
            { id: 'list-emails', label: 'List Emails', search: [ 'list emails' ], action: () => {} },
            { id: 'send-email', label: 'Send Email', action: () => {} }
          ]
        },
        {
          id: 'rest',
          label: 'REST',
          action: () => {}
        }
      ];


      it('should return leaves from any level when searching', async function() {

        // given
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        const input = domQuery('.djs-popup-search input', container);
        input.value = 'list';

        // when
        fireEvent.keyUp(input, { key: 'l' });

        // then
        const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent);
        expect(labels).to.include.members([ 'List Issues', 'List Branches', 'List Emails' ]);
      });


      it('should exclude navigate (group) entries from search results', async function() {

        // given
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        const input = domQuery('.djs-popup-search input', container);
        input.value = 'connector';

        // when
        fireEvent.keyUp(input, { key: 'r' });

        // then
        const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent);
        expect(labels).not.to.include('GitHub Connector');
        expect(labels).not.to.include('Email Connector');
      });


      it('should hide back button while searching', async function() {

        // given
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        fireEvent.click(domQuery('.entry[data-id="github"]', container));

        const input = domQuery('.djs-popup-search input', container);
        input.value = 'list';

        // when
        fireEvent.keyUp(input, { key: 'l' });

        // then
        expect(domQuery('.djs-popup-breadcrumbs-item--back', container)).not.to.exist;
      });


      it('should render result count caption while searching', async function() {

        // given
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        const input = domQuery('.djs-popup-search input', container);
        input.value = 'list';

        // when
        fireEvent.keyUp(input, { key: 'l' });

        // then
        const caption = domQuery('.djs-popup-search-count', container);
        expect(caption).to.exist;
        expect(caption.textContent.trim()).to.eql('3 results found');
      });


      it('should not render result count when search is empty', async function() {

        // when
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        // then
        expect(domQuery('.djs-popup-search-count', container)).not.to.exist;
      });


      it('should use singular form for one result', async function() {

        // given
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        const input = domQuery('.djs-popup-search input', container);
        input.value = 'send';

        // when
        fireEvent.keyUp(input, { key: 'd' });

        // then
        expect(domQuery('.djs-popup-search-count', container).textContent.trim()).to.eql('1 result found');
      });


      it('should render plain leaf labels while searching', async function() {

        // given
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        const input = domQuery('.djs-popup-search input', container);
        input.value = 'list issues';

        // when
        fireEvent.keyUp(input, { key: 's' });

        // then
        const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent);
        expect(labels).to.include('List Issues');
      });

      it('should restore level view after clearing search', async function() {

        // given
        await createPopupMenu({ container, entries: searchableEntries, search: true });

        fireEvent.click(domQuery('.entry[data-id="github"]', container));

        const input = domQuery('.djs-popup-search input', container);
        input.value = 'list';
        fireEvent.keyUp(input, { key: 'l' });

        // when
        input.value = '';
        fireEvent.keyUp(input, { key: 'Backspace' });

        // then
        expect(domQuery('.djs-popup-breadcrumbs-item--back', container)).to.exist;
        const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent);
        expect(labels).to.have.members([ 'List Issues', 'List Branches', 'Create Issue' ]);
      });

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


    it('should render entries as options', async function() {

      // given
      await createPopupMenu({ container, entries });

      // when
      const options = domQueryAll('.entry', container);

      // then
      expect(options).to.have.length(entries.length);

      options.forEach(option => {
        expect(option.getAttribute('role')).to.eql('option');
      });
    });


    it('should derive accessible name from content (no title needed)', async function() {

      // given
      await createPopupMenu({ container, entries });

      // when
      const [ firstEntry ] = domQueryAll('.entry', container);

      // then
      // `role="option"` supports name from contents, so the visible
      // label is the accessible name without an extra title/aria-label
      expect(firstEntry.getAttribute('role')).to.eql('option');
      expect(firstEntry.title).to.be.empty;
      expect(firstEntry.getAttribute('aria-label')).not.to.exist;
      expect(firstEntry.textContent).to.contain('Entry 1');
    });


    it('should mark selected entry with aria-selected', async function() {

      // given
      await createPopupMenu({ container, entries });

      // when
      const selected = domQuery('.entry.selected', container);
      const notSelected = domQuery('.entry:not(.selected)', container);

      // then
      expect(selected.getAttribute('aria-selected')).to.eql('true');
      expect(notSelected.getAttribute('aria-selected')).not.to.exist;
    });


    it('should mark entries with sub menu via aria-haspopup', async function() {

      // given
      const entries = [
        {
          id: 'nav',
          label: 'Navigate',
          entries: [ { id: 'child', label: 'Child' } ]
        }
      ];

      await createPopupMenu({ container, entries });

      // when
      const entry = domQuery('.entry', container);

      // then
      expect(entry.getAttribute('aria-haspopup')).to.eql('true');
    });


    it('should wire search field (combobox) to results (listbox)', async function() {

      // given
      await createPopupMenu({ container, entries, title: 'Search', search: true });

      // when
      const input = domQuery('.djs-popup-search input', container);
      const results = domQuery('.djs-popup-results', container);
      const selected = domQuery('.entry.selected', container);

      // then
      expect(input.getAttribute('role')).to.eql('combobox');
      expect(input.getAttribute('aria-expanded')).to.eql('true');
      expect(input.getAttribute('aria-autocomplete')).to.eql('list');

      expect(results.getAttribute('role')).to.eql('listbox');
      expect(results.id).to.exist.and.to.eql(input.getAttribute('aria-controls'));

      expect(input.getAttribute('aria-activedescendant')).to.eql(selected.id);
    });


    it('should keep listbox out of tab order when searchable (combobox owns focus)', async function() {

      // given
      await createPopupMenu({ container, entries, title: 'Search', search: true });

      // when
      const results = domQuery('.djs-popup-results', container);

      // then
      expect(results.getAttribute('tabindex')).to.eql('-1');
      expect(results.getAttribute('aria-activedescendant')).not.to.exist;
    });


    it('should make listbox the focus holder when not searchable', async function() {

      // given
      const entries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' }
      ];

      await createPopupMenu({ container, entries });

      // when
      const results = domQuery('.djs-popup-results', container);
      const selected = domQuery('.entry.selected', container);

      // then
      expect(results.getAttribute('tabindex')).to.eql('0');
      expect(results.getAttribute('aria-activedescendant')).to.eql(selected.id);
    });


    it('should not show an outline on the focused listbox', async function() {

      // given
      const entries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' }
      ];

      await createPopupMenu({ container, entries });

      // when
      const results = domQuery('.djs-popup-results', container);

      results.focus();

      // then
      expect(document.activeElement).to.equal(results);
      expect(getComputedStyle(results).outlineStyle).to.eql('none');
    });


    describe('entry documentation', function() {

      const docEntries = [
        { id: '1', label: 'Entry 1', documentationRef: 'https://example.com/1' },
        { id: '2', label: 'Entry 2' }
      ];


      it('should render a per-row documentation icon hidden from assistive technology', async function() {

        // given
        await createPopupMenu({ container, entries: docEntries });

        // when
        // the per-row icon lives inside the option, as a mouse affordance
        const rowLink = domQuery('.entry .djs-popup-entry-docs', container);

        // then
        expect(rowLink).to.exist;
        expect(rowLink.getAttribute('aria-hidden')).to.eql('true');
        expect(rowLink.getAttribute('tabindex')).to.eql('-1');
        expect(rowLink.getAttribute('href')).to.eql('https://example.com/1');
      });


      it('should render the actionable documentation link in the footer', async function() {

        // given
        await createPopupMenu({ container, entries: docEntries });

        // when
        const link = domQuery('.djs-popup-footer-docs', container);

        // then
        // the actionable, AT-reachable link is hoisted out of the listbox
        expect(link).to.exist;
        expect(link.closest('.entry')).not.to.exist;
        expect(link.closest('[role="listbox"]')).not.to.exist;
        expect(link.closest('.djs-popup-footer')).to.exist;
      });


      it('should reflect the active entry in the footer documentation link', async function() {

        // given
        await createPopupMenu({ container, entries: docEntries });

        // when
        // the first entry (with docs) is active by default
        const link = domQuery('.djs-popup-footer-docs', container);

        // then
        expect(link.getAttribute('href')).to.eql('https://example.com/1');
        expect(link.getAttribute('aria-label')).to.eql('Open entry documentation for Entry 1');
      });


      it('should hide the footer documentation link for entries without docs', async function() {

        // given
        await createPopupMenu({ container, entries: [
          { id: '1', label: 'Entry 1' },
          { id: '2', label: 'Entry 2', documentationRef: 'https://example.com/2' }
        ] });

        // when
        // first (docs-less) entry is active by default
        const link = domQuery('.djs-popup-footer-docs', container);

        // then
        expect(link).not.to.exist;
      });


      it('should keep the footer documentation link keyboard reachable', async function() {

        // given
        await createPopupMenu({ container, entries: docEntries });

        // when
        const link = domQuery('.djs-popup-footer-docs', container);

        link.focus();

        // then
        // a plain link outside the listbox is naturally focusable
        expect(document.activeElement).to.equal(link);
      });


      it('should not trigger selected entry when pressing <Enter> on footer documentation link', async function() {

        // given
        const onSelect = spy();

        await createPopupMenu({ container, entries: docEntries, onSelect });

        const link = domQuery('.djs-popup-footer-docs', container);

        // when
        link.focus();
        fireEvent.keyDown(link, { key: 'Enter' });

        // then
        expect(onSelect).not.to.have.been.called;
      });

    });


    it('should generate unique ids per popup instance', async function() {

      // given
      await createPopupMenu({ container, entries });
      const firstId = domQuery('.djs-popup-results', container).id;

      const otherContainer = domify('<div class="djs-parent"></div>');
      document.body.appendChild(otherContainer);

      // when
      await act(() => render(
        html`<${PopupMenuComponent} ...${ {
          entries,
          headerEntries: [],
          searchFn,
          position() { return { x: 0, y: 0 }; },
          onClose() {},
          onOpened() {},
          onClosed() {}
        } } />`,
        otherContainer
      ));

      const secondId = domQuery('.djs-popup-results', otherContainer).id;

      // then
      expect(firstId).to.exist;
      expect(secondId).to.exist;
      expect(secondId).not.to.eql(firstId);

      // cleanup
      render(null, otherContainer);
      document.body.removeChild(otherContainer);
    });

  });


  describe('tabs', function() {

    const CUSTOM_TAB = { id: 'custom', label: 'Custom' };
    const DEFAULT_TAB = { id: 'default', label: 'Default' };

    const tabEntries = [
      { id: 'entry-1', label: 'Entry 1', action: () => {} },
      { id: 'entry-2', label: 'Entry 2', action: () => {} },
      { id: 'custom-entry-1', label: 'Custom Entry 1', tab: CUSTOM_TAB, action: () => {} },
      { id: 'custom-entry-2', label: 'Custom Entry 2', tab: CUSTOM_TAB, action: () => {} },
      { id: 'entry-3', label: 'Entry 3', action: () => {} },
      { id: 'entry-4', label: 'Entry 4', action: () => {} }
    ];

    const manyTabEntries = [
      { id: 'first-entry', label: 'First entry', tab: { id: 'first', label: 'First tab' }, action: () => {} },
      { id: 'second-entry', label: 'Second entry', tab: { id: 'second', label: 'Second tab' }, action: () => {} },
      { id: 'third-entry', label: 'Third entry', tab: { id: 'third', label: 'Third tab' }, action: () => {} },
      { id: 'fourth-entry', label: 'Fourth entry', tab: { id: 'fourth', label: 'Fourth tab' }, action: () => {} },
      { id: 'fifth-entry', label: 'Fifth entry', tab: { id: 'fifth', label: 'Fifth tab' }, action: () => {} }
    ];

    it('should render tab strip when entries carry distinct tabs', async function() {

      // when
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      // then
      const tabs = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.textContent.trim());
      expect(tabs).to.eql([ 'Default', 'Custom' ]);
    });


    it('should not render tab strip without tabbed entries', async function() {

      // given
      const entries = tabEntries.filter(entry => !entry.tab);

      // when
      await createPopupMenu({ container, entries, defaultTab: DEFAULT_TAB });

      // then
      expect(domQuery('.djs-popup-tabs', container)).not.to.exist;
    });


    it('should not render a default tab when every entry is tabbed', async function() {

      // given
      const entries = tabEntries.filter(entry => entry.tab);

      // when
      await createPopupMenu({ container, entries, defaultTab: DEFAULT_TAB });

      // then
      expect(domQuery('.djs-popup-tabs', container)).not.to.exist;
    });


    it('should stay untabbed when untagged entries have no default tab', async function() {

      // when
      await createPopupMenu({ container, entries: tabEntries });

      // then
      expect(domQuery('.djs-popup-tabs', container)).not.to.exist;
    });


    it('should keep the default tab when entries tag it explicitly', async function() {

      // given
      const entries = tabEntries.map(entry => ({ ...entry, tab: entry.tab || DEFAULT_TAB }));

      // when
      await createPopupMenu({ container, entries, defaultTab: DEFAULT_TAB });

      // then
      const tabs = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.textContent.trim());
      expect(tabs).to.eql([ 'Default', 'Custom' ]);
    });


    it('should show default tab entries initially', async function() {

      // when
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      // then
      const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent.trim());
      expect(labels).to.eql([ 'Entry 1', 'Entry 2', 'Entry 3', 'Entry 4' ]);
    });


    it('should switch entries on tab select', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      // when
      await act(() => {
        fireEvent.click(domQueryAll('.djs-popup-tab', container)[1]);
      });

      // then
      const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent.trim());
      expect(labels).to.eql([ 'Custom Entry 1', 'Custom Entry 2' ]);

      const selected = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-selected'));
      expect(selected).to.eql([ 'false', 'true' ]);
    });


    it('should search globally across tabs', async function() {

      // given
      const entries = [
        { id: 'search-default', label: 'Search Default', group: { id: 'default', name: 'Default' }, action: () => {} },
        {
          id: 'search-custom',
          label: 'Search Custom',
          tab: CUSTOM_TAB,
          group: { id: 'custom', name: 'Custom' },
          action: () => {}
        },
        ...tabEntries
      ];

      await createPopupMenu({ container, entries, defaultTab: DEFAULT_TAB, search: true });

      const input = domQuery('.djs-popup-search input', container);
      input.value = 'search';

      // when
      fireEvent.keyUp(input, { key: 'd' });

      // then
      const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent.trim());
      expect(labels).to.have.members([ 'Search Default', 'Search Custom' ]);
    });


    it('should hide tab strip while searching', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB, search: true });

      const input = domQuery('.djs-popup-search input', container);
      input.value = 'custom';

      // when
      fireEvent.keyUp(input, { key: 'r' });

      // then
      expect(domQuery('.djs-popup-tabs', container)).not.to.exist;
    });


    it('should restore active tab after clearing search', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB, search: true });

      await act(() => {
        fireEvent.click(domQueryAll('.djs-popup-tab', container)[1]);
      });

      const input = domQuery('.djs-popup-search input', container);
      input.value = 'custom';
      fireEvent.keyUp(input, { key: 'k' });

      // when
      input.value = '';
      fireEvent.keyUp(input, { key: 'Backspace' });

      // then
      const selected = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-selected'));
      expect(selected).to.eql([ 'false', 'true' ]);

      const labels = [ ...domQueryAll('.djs-popup-label', container) ].map(e => e.textContent.trim());
      expect(labels).to.eql([ 'Custom Entry 1', 'Custom Entry 2' ]);
    });


    it('should hide tab strip while drilled into a step entry', async function() {

      // given

      // the step entry comes first so it is the initially selected
      // entry (drill-down acts on the selected entry)
      const entries = [
        {
          id: 'multi-step',
          label: 'Multi step',
          entries: [
            { id: 'step-1', label: 'Step 1', action: () => {} }
          ]
        },
        ...tabEntries
      ];

      await createPopupMenu({ container, entries, defaultTab: DEFAULT_TAB });

      // when
      await act(() => {
        fireEvent.click(domQuery('.entry[data-id="multi-step"]', container));
      });

      // then
      expect(domQuery('.djs-popup-tabs', container)).not.to.exist;
      expect(domQuery('.djs-popup-breadcrumbs', container)).to.exist;
    });


    it('should switch tabs with arrow keys within the strip', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      const strip = domQuery('.djs-popup-tabs', container);
      const firstTab = strip.children[0];

      firstTab.focus();

      // when
      await act(() => {
        fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
      });

      // then
      const selected = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-selected'));
      expect(selected).to.eql([ 'false', 'true' ]);
    });


    it('should keep focus in the strip when activating a tab by keyboard', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB, search: true });

      const strip = domQuery('.djs-popup-tabs', container);

      strip.children[1].focus();

      // when
      await act(() => {
        fireEvent.click(strip.children[1], { detail: 0 });
      });

      // then
      expect(document.activeElement).to.equal(strip.children[1]);
    });


    it('should focus the search input when activating a tab by pointer', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB, search: true });

      const strip = domQuery('.djs-popup-tabs', container);

      // when
      await act(() => {
        fireEvent.click(strip.children[1], { detail: 1 });
      });

      // then
      expect(document.activeElement).to.equal(domQuery('.djs-popup-search input', container));
    });


    it('should switch tabs backwards with <ArrowLeft>', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      const strip = domQuery('.djs-popup-tabs', container);

      strip.children[0].focus();

      // when
      await act(() => {
        fireEvent.keyDown(strip.children[0], { key: 'ArrowLeft' });
      });

      // then
      const selected = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-selected'));
      expect(selected).to.eql([ 'false', 'true' ]);
    });


    it('should ignore other keys within the strip', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      const strip = domQuery('.djs-popup-tabs', container);

      strip.children[0].focus();

      // when
      await act(() => {
        fireEvent.keyDown(strip.children[0], { key: 'a' });
      });

      // then
      const selected = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-selected'));
      expect(selected).to.eql([ 'true', 'false' ]);
    });


    it('should not trigger selected entry when pressing <Enter> on a tab', async function() {

      // given
      const onSelect = spy();

      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB, onSelect });

      const strip = domQuery('.djs-popup-tabs', container);

      // when
      strip.children[0].focus();
      fireEvent.keyDown(strip.children[0], { key: 'Enter' });

      // then
      expect(onSelect).not.to.have.been.called;
    });


    it('should switch to last tab with <End>', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      const strip = domQuery('.djs-popup-tabs', container);

      strip.children[0].focus();

      // when
      await act(() => {
        fireEvent.keyDown(strip.children[0], { key: 'End' });
      });

      // then
      const selected = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-selected'));
      expect(selected).to.eql([ 'false', 'true' ]);
    });


    it('should switch to first tab with <Home>', async function() {

      // given
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      const strip = domQuery('.djs-popup-tabs', container);

      await act(() => {
        fireEvent.click(strip.children[1]);
      });

      // when
      await act(() => {
        fireEvent.keyDown(strip.children[1], { key: 'Home' });
      });

      // then
      const selected = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-selected'));
      expect(selected).to.eql([ 'true', 'false' ]);
    });


    it('should scroll active tab into view', async function() {

      // given
      await createPopupMenu({ container, entries: manyTabEntries });

      const strip = domQuery('.djs-popup-tabs', container);
      const lastTab = strip.children[4];
      const method = typeof lastTab.scrollIntoViewIfNeeded === 'function'
        ? 'scrollIntoViewIfNeeded'
        : 'scrollIntoView';
      const scrollIntoView = spy();

      lastTab[method] = scrollIntoView;
      strip.children[0].focus();

      // when
      await act(() => {
        fireEvent.keyDown(strip.children[0], { key: 'End' });
      });

      // then
      expect(scrollIntoView).to.have.been.called;
    });


    it('should render tab title as hover text', async function() {

      // given
      const entries = [
        { id: 'entry-1', label: 'Entry 1', action: () => {} },
        {
          id: 'custom-entry',
          label: 'Custom Entry',
          tab: { ...CUSTOM_TAB, title: 'Building blocks you can reuse' },
          action: () => {}
        }
      ];

      // when
      await createPopupMenu({ container, entries, defaultTab: DEFAULT_TAB });

      // then
      const titles = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('title'));
      expect(titles).to.eql([ null, 'Building blocks you can reuse' ]);
    });


    it('should point each tab at the results list', async function() {

      // when
      await createPopupMenu({ container, entries: tabEntries, defaultTab: DEFAULT_TAB });

      // then
      const resultsId = domQuery('[role="listbox"]', container).id;
      const controls = [ ...domQueryAll('.djs-popup-tab', container) ].map(e => e.getAttribute('aria-controls'));
      expect(controls).to.eql([ resultsId, resultsId ]);
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
