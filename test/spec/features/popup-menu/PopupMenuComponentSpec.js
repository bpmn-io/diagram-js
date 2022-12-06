import PopupMenuComponent from 'lib/features/popup-menu/PopupMenuComponent';

import {
  html,
  render
} from 'lib/ui';

import {
  bootstrapDiagram,
  insertCSS,
  inject
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

  beforeEach(bootstrapDiagram());

  afterEach(function() {
    container.parentNode.removeChild(container);

    teardown && teardown();
  });


  it('should render', inject(function() {
    createPopupMenu({ container });
  }));


  it('should open in correct position', inject(function() {

    // given
    var position = () => {
      return { x: 100, y: 100 };
    };

    // when
    createPopupMenu({
      container,
      position
    });

    const popup = domQuery(
      '.djs-popup', container
    );

    const popupBounds = popup.getBoundingClientRect();

    // then
    expect(popupBounds.x).to.eql(100);
    expect(popupBounds.y).to.eql(100);
  }));


  describe('should focus', function() {

    it('with search', inject(function() {

      // when
      createPopupMenu({
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
    }));


    it('without search', inject(function() {

      // when
      createPopupMenu({
        container
      });

      const popupEl = domQuery(
        '.djs-popup', container
      );

      // then
      expect(document.activeElement).to.equal(popupEl);
    }));

  });


  it('should apply custom width', inject(function() {

    // when
    createPopupMenu({
      container,
      width: 200
    });

    const popup = domQuery(
      '.djs-popup', container
    );

    // then
    expect(popup.style.width).to.eql('200px');
  }));


  it('should render complex', inject(function() {

    const imageUrl = TEST_IMAGE_URL;

    // given
    const headerEntries = [
      { id: '1', label: '|A|' },
      { id: '1.1', label: '|A|', imageUrl },
      { id: '2', imageUrl, title: 'Toggle foo' },
      { id: '3', className: 'bpmn-icon-sun' }
    ];

    const iconGroup = {
      id: 'icons',
      name: 'Icon Group'
    };

    const entries = [
      { id: '4', label: 'Just label' },
      { id: '5', imageUrl, title: 'Toggle foo' },
      { id: '6', imageUrl, label: 'Toggle foo' },
      { id: '7', label: 'with description', description: 'I DESCRIBE IT' },
      { id: '7.1', label: 'with long title and description, you cannot believe what happened next', description: 'A very long description, you cannot believe what happened next' },
      { id: '7.2', label: 'with long title and description, you cannot believe what happened next', description: 'A very long description, you cannot believe what happened next', documentationRef: 'http://localhost' },
      { id: '8', imageUrl, label: 'with image + description', description: 'I DESCRIBE more stuff' },
      { id: '9', imageUrl, label: 'WITH DOC REF', documentationRef: 'http://localhost' },
      { id: '10', imageUrl, label: 'FOO', description: 'WITH DOC REF', documentationRef: 'http://localhost' },
      { id: '11', className: 'bpmn-icon-sun', label: 'FONT ICON + description', description: 'WITH DOC REF', group: iconGroup },
      { id: '11.1', className: 'bpmn-icon-sun', label: 'FONT ICON', group: iconGroup },
      { id: '11.2', className: 'bpmn-icon-sun', title: 'icon only', group: iconGroup },
      { id: '12', className: 'bpmn-icon-sun', title: 'icon only', group: {
        id: 'super long',
        name: 'Extremely super long group incredible!'
      } }
    ];

    createPopupMenu({
      container,
      title: 'Popup menu with super long title',
      headerEntries,
      entries,
      position: () => {
        return { x: 100, y: 200 };
      },
      width: 250
    });

  }));


  describe('close', function() {

    it('should close on background click', inject(function() {
      const onClose = sinon.spy();

      createPopupMenu({ container, onClose });

      container.children[0].click();

      expect(onClose).to.have.been.calledOnce;
    }));


    it('should NOT close on selection', inject(function() {

      // given
      const onClose = sinon.spy();
      const onSelect = sinon.spy();

      const entries = [ { id: '1', label: 'Entry 1' } ];

      // when
      createPopupMenu({ container, entries, onClose, onSelect });

      var entry = domQuery('.entry', container);

      // when
      entry.click();

      // then
      expect(onSelect).to.have.been.calledOnceWith(sinon.match.any);
      expect(onClose).not.to.have.been.called;
    }));


    it('should NOT close on click inside', inject(function() {

      // given
      const onClose = sinon.spy();
      const onSelect = sinon.spy();

      const entries = [ { id: '1', label: 'Entry 1' } ];

      // when
      createPopupMenu({ container, entries, onClose, onSelect });

      const popup = domQuery(
        '.djs-popup', container
      );

      popup.click();

      expect(onClose).not.to.have.been.called;
    }));

  });


  describe('body', function() {

    it('should select first entry', inject(function() {
      const entries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' }
      ];

      createPopupMenu({ container, entries });

      const firstEntry = domQuery('.entry', container);

      // then
      expect(firstEntry.classList.contains('selected')).to.be.true;
    }));


    it('should hide if empty', inject(function() {
      const headerEntries = [
        { id: '1', label: '1' },
        { id: '2', label: '2' }
      ];

      createPopupMenu({ container, headerEntries });

      const popupEl = domQuery('.djs-popup', container);
      const popupBodyEl = domQuery('.djs-popup-body', container);

      // then
      expect(popupEl.textContent).to.eql('12');
      expect(popupBodyEl).not.to.exist;
    }));

  });


  describe('header', function() {

    it('should render header entry', inject(function() {

      // given
      const headerEntries = [
        { id: '1', label: '1' },
        { id: '2', imageUrl: 'http://localhost/404.png', title: 'Toggle foo' }
      ];

      createPopupMenu({ container, headerEntries });

      // when
      const [
        firstEntry,
        secondEntry
      ] = domQueryAll('.entry', container);

      // then
      expect(firstEntry.title).to.be.empty;
      expect(firstEntry.textContent).to.eql('1');

      expect(secondEntry.title).to.eql('Toggle foo');
      expect(secondEntry.textContent).to.eql('');
      expect(secondEntry.innerHTML).to.eql('<img src="http://localhost/404.png">');
    }));


    it('should select header entry on hover', inject(async function() {

      // given
      const headerEntries = [
        { id: '1', label: '1' },
        { id: '2', label: '2' }
      ];

      createPopupMenu({ container, headerEntries });

      const entryEl = domQuery('.entry', container);

      // when
      entryEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      await whenStable();

      // then
      expect(entryEl.classList.contains('selected')).to.be.true;

      // but when
      entryEl.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      await whenStable();

      // then
      expect(entryEl.classList.contains('selected')).to.be.false;
    }));

  });


  it('should render title, if set', inject(function() {

    // given
    const title = 'Title';

    // when
    createPopupMenu({ container, title });

    // then
    var titleElement = domQuery('.djs-popup-title', container);
    expect(titleElement).to.exist;
    expect(titleElement.innerHTML).to.eql(title);

  }));


  describe('search', function() {

    const entries = [
      { id: '1', label: 'Entry 1' },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Entry 3' },
      { id: '4', label: 'Entry 4' },
      { id: '5', label: 'Entry 5' },
      { id: '6', label: 'Last' }
    ];


    it('should filter entries + select first', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'Entry 3';

      // when
      searchInput.dispatchEvent(keyDown('ArrowUp'));
      searchInput.dispatchEvent(keyUp('ArrowUp'));

      await whenStable();

      // then
      expect(domQueryAll('.entry', container)).to.have.length(1);
      expect(domQuery('.entry', container).textContent).to.eql('Entry 3');
      expect(domQuery('.selected', container).textContent).to.eql('Entry 3');
    }));


    it('should allow partial search', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'Entry';

      // when
      searchInput.dispatchEvent(keyDown('ArrowDown'));
      searchInput.dispatchEvent(keyUp('ArrowDown'));

      await whenStable();

      // then
      expect(domQueryAll('.entry', container)).to.have.length(5);
      expect(domQuery('.djs-popup-no-results', container)).not.to.exist;
    }));


    it('should show <not found>', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup-search input', container);
      searchInput.value = 'Foo bar';

      // when
      searchInput.dispatchEvent(keyDown('ArrowDown'));
      searchInput.dispatchEvent(keyUp('ArrowDown'));

      await whenStable();

      // then
      expect(domQueryAll('.entry', container)).to.have.length(0);
      expect(domQuery('.djs-popup-no-results', container)).to.exist;
    }));


    describe('render', function() {

      const otherEntries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' },
        { id: '3', label: 'Entry 3' }
      ];


      it('should be hidden by default', inject(async function() {

        // given
        createPopupMenu({ container, entries: otherEntries });

        // then
        expect(domQuery('.djs-popup-search', container)).not.to.exist;
      }));


      it('should render (more than 5 entries)', inject(async function() {

        // given
        createPopupMenu({ container, entries, search: true });

        // then
        expect(domQuery('.djs-popup-search', container)).to.exist;
      }));


      it('should be hidden (less than 5 entries)', inject(async function() {

        // given
        createPopupMenu({ container, entries: otherEntries, search: true });

        // then
        expect(domQuery('.djs-popup-search', container)).not.to.exist;
      }));

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


    it('should trigger entry with <Enter>', inject(async function() {

      // given
      const onClose = sinon.spy();
      const onSelect = sinon.spy();

      createPopupMenu({ container, entries, search: true, onClose, onSelect });

      const searchInput = domQuery('.djs-popup-search input', container);

      const enterEvent = keyDown('Enter');

      // when
      searchInput.dispatchEvent(enterEvent);

      // then
      expect(onSelect).to.be.calledOnceWith(enterEvent, entries[0]);
    }));


    describe('should close with <Escape>', function() {

      it('on search', inject(function() {

        // given
        const onClose = sinon.spy();
        createPopupMenu({ container, entries, onClose, search: true });

        const searchInput = domQuery('.djs-popup-search input', container);

        // when
        searchInput.dispatchEvent(keyDown('Escape'));

        // then
        expect(onClose).to.be.calledOnce;
      }));


      it('on popup', inject(function() {

        // given
        const onClose = sinon.spy();
        createPopupMenu({ container, entries, onClose, search: true });

        const popupEl = domQuery('.djs-popup', container);

        // when
        popupEl.dispatchEvent(keyDown('Escape'));

        // then
        expect(onClose).to.be.calledOnce;
      }));


      it('global', inject(async function() {

        // given
        const onClose = sinon.spy();
        createPopupMenu({ container, entries, onClose });

        await whenStable();

        // when
        document.documentElement.dispatchEvent(keyDown('Escape'));

        // then
        expect(onClose).to.be.calledOnce;
      }));

    });


    it('should navigate with <ArrowDown>', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup-search input', container);

      // assume
      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      searchInput.dispatchEvent(keyDown('ArrowDown'));

      await whenStable();

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 2');
    }));


    it('should navigate with <ArrowUp>', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup-search input', container);

      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      searchInput.dispatchEvent(keyDown('ArrowUp'));

      await whenStable();

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 6');
    }));

  });


  // helpers
  function createPopupMenu(options) {

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
      ...restOptions
    };

    teardown = () => {
      render(null, container);

      teardown = null;
    };

    return render(
      html`
        <${PopupMenuComponent} ...${ props } />
      `,
      container
    );
  }

  function whenStable() {
    return new Promise(resolve => setTimeout(resolve, 200));
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