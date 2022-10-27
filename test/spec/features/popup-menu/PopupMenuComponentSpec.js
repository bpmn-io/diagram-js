import PopupMenuComponent from 'lib/features/popup-menu/PopupMenuComponent';

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


describe('features/popup-menu - <PopupMenu>', function() {

  let container, teardown;

  beforeEach(function() {
    container = document.createElement('div');
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
      '.overlay', container
    ).getBoundingClientRect();

    // then
    expect(popup.x).to.eql(100);
    expect(popup.y).to.eql(100);
  }));


  it('should apply custom width', inject(function() {

    // when
    createPopupMenu({
      container,
      width: 200
    });

    const popup = domQuery(
      '.overlay', container
    );

    // then
    expect(popup.style.width).to.eql('200px');
  }));


  describe('close', function() {

    it('should close on background click', inject(function() {
      const onClose = sinon.spy();

      createPopupMenu({ container, onClose });

      container.children[0].click();

      expect(onClose).to.have.been.calledOnce;
    }));


    it('should close on entry click', inject(function() {
      const onClose = sinon.spy();

      const entries = [ { id: '1', label: 'Entry 1', action: ()=>{} } ];

      // when
      createPopupMenu({ container, entries, onClose });

      var entry = domQuery('.entry', container);

      // when
      entry.click();

      // then
      expect(onClose).to.have.been.calledOnce;
    }));

  });


  describe('body', function() {

    it('should focus first entry', inject(function() {
      const entries = [
        { id: '1', label: 'Entry 1' },
        { id: '2', label: 'Entry 2' }
      ];

      createPopupMenu({ container, entries });

      const firstEntry = domQuery('.entry', container);

      // then
      expect(firstEntry.classList.contains('selected')).to.be.true;
    }));

  });


  it('should render title, if set', inject(function() {

    // given
    const title = 'Title';

    // when
    createPopupMenu({ container, title });

    // then
    var titleElement = domQuery('.djs-popup .title', container);
    expect(titleElement).to.exist;
    expect(titleElement.innerHTML).to.eql(title);

  }));


  describe('search', function() {

    const entries = [
      { id: '1', label: 'Entry 1' },
      { id: '2', label: 'Entry 2' },
      { id: '3', label: 'Last' }
    ];

    it('should filter entries', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup .search input', container);
      searchInput.value = 'Entry 1';

      // when
      searchInput.dispatchEvent(new Event('keydown'));
      searchInput.dispatchEvent(new Event('keyup'));

      await whenStable();

      // then
      expect(domQueryAll('.entry', container)).to.have.length(1);
      expect(domQuery('.entry', container).textContent).to.eql('Entry 1');
    }));


    it('should allow partial search', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      var searchInput = domQuery('.djs-popup .search input', container);
      searchInput.value = 'Entry';

      // when
      searchInput.dispatchEvent(new Event('keydown'));
      searchInput.dispatchEvent(new Event('keyup'));

      await whenStable();

      // then
      expect(domQueryAll('.entry', container)).to.have.length(2);
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


      it('should be visible (search=true specified)', inject(async function() {

        // given
        createPopupMenu({ container, entries, search: true });

        // then
        expect(domQuery('.djs-popup .search', container)).to.exist;
      }));


      it('should be hidden (search=false specified)', inject(async function() {

        // given
        createPopupMenu({ container, entries: otherEntries, search: false });

        // then
        expect(domQuery('.djs-popup .search', container)).not.to.exist;
      }));


      it('should render (more than 5 entries)', inject(async function() {

        // given
        createPopupMenu({ container, entries: otherEntries });

        // then
        expect(domQuery('.djs-popup .search', container)).to.exist;
      }));


      it('should be hidden (less than 5 entries)', inject(async function() {

        // given
        createPopupMenu({ container, entries });

        // then
        expect(domQuery('.djs-popup .search', container)).not.to.exist;
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


    it('should trigger entry with <Enter>', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup .search input', container);

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter' }));

      // then
      expect(action).to.be.calledOnce;
    }));


    it('should close with <Escape>', inject(function() {

      // given
      const onClose = sinon.spy();
      createPopupMenu({ container, entries, onClose, search: true });

      const searchInput = domQuery('.djs-popup .search input', container);

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));

      // then
      expect(onClose).to.be.calledOnce;
    }));


    it('should close on global <Escape>', inject(async function() {

      // given
      const onClose = sinon.spy();
      createPopupMenu({ container, entries, onClose });

      await whenStable();

      // when
      document.documentElement.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));

      // then
      expect(onClose).to.be.calledOnce;
    }));


    it('should navigate with <ArrowUp>', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup .search input', container);

      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'ArrowDown' }));
      await whenStable();

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 2');
    }));


    it('should navigate with <ArrowUp>', inject(async function() {

      // given
      createPopupMenu({ container, entries, search: true });

      const searchInput = domQuery('.djs-popup .search input', container);

      expect(domQuery('.selected', container).textContent).to.eql('Entry 1');

      // when
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'ArrowUp' }));
      await whenStable();

      // then
      expect(domQuery('.selected', container).textContent).to.eql('Entry 3');
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