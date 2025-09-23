import PopupMenuHeader from 'lib/features/popup-menu/PopupMenuHeader';

import {
  html,
  render
} from 'lib/ui';

import {
  fireEvent
} from '@testing-library/preact';

import {
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


describe('features/popup-menu - <PopupMenuHeader>', function() {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  it('should render', function() {

    // when
    createPopupMenuHeader({ container });

    // then
    expect(domQuery('.djs-popup-header', container)).to.exist;
  });


  it('should render entries', function() {

    // when
    createPopupMenuHeader({
      container,
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {}
        },
        {
          id: 'bar',
          title: 'Bar',
          imageUrl: TEST_IMAGE_URL,
          action: () => {}
        }
      ]
    });

    // then
    expect(domQuery('.djs-popup-header', container)).to.exist;
    expect(domQueryAll('.djs-popup-header .entry', container)).to.have.length(2);
    expect(domQueryAll('.djs-popup-header .divider', container)).to.have.length(0);

    const fooEntry = domQuery('.djs-popup-header .entry[data-id="foo"]', container);

    expect(fooEntry.textContent).to.eql('Foo');

    const barEntry = domQuery('.djs-popup-header .entry[data-id="bar"]', container);

    expect(barEntry.title).to.eql('Bar');
    expect(barEntry.innerHTML).to.eql(`<img class="djs-popup-entry-icon" src="${ TEST_IMAGE_URL }" alt="">`);
  });


  it('should group entries', function() {

    // when
    createPopupMenuHeader({
      container,
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {}
        },
        {
          id: 'bar',
          label: 'Bar',
          action: () => {},
          group: 'bar'
        },
        {
          id: 'baz',
          label: 'Baz',
          action: () => {},
          group: 'bar'
        }
      ]
    });

    // then
    expect(domQuery('.djs-popup-header', container)).to.exist;
    expect(domQueryAll('.djs-popup-header .entry', container)).to.have.length(3);
    expect(domQueryAll('.djs-popup-header .djs-popup-header-group', container)).to.have.length(2);
  });


  it('should render disabled entry', function() {

    // when
    createPopupMenuHeader({
      container,
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {},
          disabled: true
        }
      ]
    });

    const fooEntry = domQuery('.entry[data-id="foo"]', container);

    // then
    expect(fooEntry.classList.contains('disabled')).to.be.true;
    expect(fooEntry.tagName).to.eql('SPAN');
  });


  it('should select header entry on mouseenter if has action', async function() {

    // given
    const spy = sinon.spy();

    createPopupMenuHeader({
      container,
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {}
        },
        {
          id: 'bar',
          label: 'Bar'
        }
      ],
      setSelectedEntry: spy
    });

    const fooEntry = domQuery('.entry[data-id="foo"]', container);

    // when
    fireEvent.mouseEnter(fooEntry);

    // then
    expect(spy).to.have.been.calledWithMatch({ id: 'foo' });
  });


  it('should deselect header entry on mouseleave if has action', async function() {

    // given
    const spy = sinon.spy();

    createPopupMenuHeader({
      container,
      selectedEntry: { id: 'foo' },
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {}
        },
        {
          id: 'bar',
          label: 'Bar'
        }
      ],
      setSelectedEntry: spy
    });

    const fooEntry = domQuery('.entry[data-id="foo"]', container);

    // when
    fireEvent.mouseLeave(fooEntry);

    // then
    expect(spy).to.have.been.calledWithMatch(null);
  });


  it('should not select header entry on mouseenter if not has action', async function() {

    // given
    const spy = sinon.spy();

    createPopupMenuHeader({
      container,
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {}
        },
        {
          id: 'bar',
          label: 'Bar'
        }
      ],
      setSelectedEntry: spy
    });

    const barEntry = domQuery('.entry[data-id="bar"]', container);

    // when
    fireEvent.mouseEnter(barEntry);

    // then
    expect(spy).not.to.have.been.called;
  });


  it('should note select disabled header entry on mouseenter', async function() {

    // given
    const spy = sinon.spy();

    createPopupMenuHeader({
      container,
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {},
          disabled: true
        }
      ],
      setSelectedEntry: spy
    });

    const fooEntry = domQuery('.entry[data-id="foo"]', container);

    // when
    fireEvent.mouseEnter(fooEntry);

    // then
    expect(spy).not.to.have.been.called;
  });


  it('should not trigger action on disabled entry click', async function() {

    // given
    const spy = sinon.spy();

    createPopupMenuHeader({
      container,
      headerEntries: [
        {
          id: 'foo',
          label: 'Foo',
          action: () => {},
          disabled: true
        }
      ],
      onSelect: spy
    });

    const fooEntry = domQuery('.entry[data-id="foo"]', container);

    // when
    fireEvent.click(fooEntry);

    // then
    expect(spy).not.to.have.been.called;
  });

});


// helpers
function createPopupMenuHeader(options) {
  const {
    container,
    ...rest
  } = options;

  const props = {
    headerEntries: [],
    onSelect: () => {},
    selectedEntry: null,
    setSelectedEntry: () => {},
    ...rest
  };

  return render(
    html`<${ PopupMenuHeader } ...${props} />`,
    container
  );
}