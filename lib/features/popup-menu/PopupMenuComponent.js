import PopupMenuList from './PopupMenuList';
import classNames from 'clsx';
import { isDefined } from 'min-dash';

/**
 * A preact component that renders the popup menus.
 *
 * @param {function} onClose
 * @param {function} position
 * @param {string} className
 * @param {Array} entries
 * @param {Object} headerEntries
 * @param {Object} diagramJSui
 * @param {number} scale
 * @param {string} [title]
 * @param {boolean} [search]
 * @param {number} [minWidth]
 */
export default function PopupMenuComponent(props) {
  const { onClose, headerEntries } = props;
  const html = props.diagramJSui.html;

  const {
    useEffect,
    useRef,
    useState,
    useLayoutEffect
  } = props.diagramJSui.getHooks();

  const onSelect = (event, entry, shouldClose = true) => {
    entry.action(event, entry);

    shouldClose && onClose();
  };

  const isSearchable = () => {
    if (isDefined(props.search))
      return !!props.search;

    return props.entries.length > 5;
  };

  const inputRef = useRef();
  const resultsRef = useRef();

  const [ value, setValue ] = useState('');

  const [ entries, setEntries ] = useState(props.entries);
  const [ selectedEntry, setSelectedEntry ] = useState(entries[0]);

  // filter entries on value change
  useEffect(() => {
    const filter = entry => {
      if (!value) {
        return true;
      }

      const search = [
        entry.name,
        entry.description || '',
        entry.label || '',
        entry.id || ''
      ]
        .join('---')
        .toLowerCase();

      return value
        .toLowerCase()
        .split(/\s/g)
        .every(term => search.includes(term));
    };

    if (!isSearchable()) {
      return;
    }

    const entries = props.entries.filter(filter);

    if (!entries.includes(selectedEntry) && !selectedEntry) {
      setSelectedEntry(entries[0]);
    }

    setEntries(entries);

  }, [ value, selectedEntry, props.entries ]);

  // focus input on initial mount
  useLayoutEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  // scroll to keyboard selected result
  useLayoutEffect(() => {
    const containerEl = resultsRef.current;

    if (!containerEl)
      return;

    const selectedEl = containerEl.querySelector('.selected');

    if (selectedEl) {
      scrollIntoView(selectedEl);
    }
  }, [ selectedEntry ]);

  // handle keyboard seleciton
  const keyboardSelect = direction => {
    const idx = entries.indexOf(selectedEntry);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = entries.length - 1;
    }

    if (nextIdx >= entries.length) {
      nextIdx = 0;
    }

    setSelectedEntry(entries[nextIdx]);
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && selectedEntry) {
      return onSelect(event, selectedEntry);
    }

    if (event.key === 'Escape') {
      return onClose();
    }

    // ARROW_UP or SHIFT + TAB navigation
    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      keyboardSelect(-1);

      return event.preventDefault();
    }

    // ARROW_DOWN or TAB navigation
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      keyboardSelect(1);

      return event.preventDefault();
    }
  };

  const handleKey = event => {
    setValue(() => event.target.value);
  };

  const displayHeader = props.title || Object.keys(headerEntries).length > 0;

  return (
    html`
    <${PopupMenuWrapper} ...${props}>
      ${displayHeader && html`
        <div class="header">
          <h3 class="title">${props.title}</h3>
          ${Object.entries(headerEntries).map(([ key, value ]) => html`
            <span
              class=${classNames('header-entry', value.className, value.active ? 'active' : '', headerEntries[key] === selectedEntry ? 'selected' : '')}
              onClick=${ event => onSelect(event, value, false) }
              title=${ `Toggle ${value.title}` }
              data-id=${ key }
              onMouseEnter=${ () => setSelectedEntry(headerEntries[key]) }
            >
              ${value.imageUrl ? html`<img src=${ value.imageUrl } />` : null}
              ${value.label ? value.label : null}
            </span>`
    )}
        </div>`
    }
      ${props.entries.length && html`
      <div class="djs-popup-body">
      
        <div
          class=${ classNames('search', isSearchable() ? '' : 'hidden') }
        >
        <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
        </svg>
        <input
            ref=${ inputRef }
            type="text"
            onKeyup=${ handleKey }
            onKeydown=${ handleKeyDown }
          />
        </div>
      
        <${PopupMenuList}
          entries=${ entries }
          selectedEntry=${ selectedEntry }
          setSelectedEntry=${ setSelectedEntry }
          onSelect=${ onSelect }
          resultsRef=${ resultsRef }
          html=${ html }
        />
      </div>
      `}
      ${entries.length === 0 && html`
      <div class="no-results">No matching entries found.</div>
    `}
    </${PopupMenuWrapper}>`
  );
}

/**
 * A preact component that wraps the popup menu.
 *
 * @param {any} props
 */
function PopupMenuWrapper(props) {
  const { onClose, className, children } = props;
  const html = props.diagramJSui.html;
  const {
    useRef,
    useLayoutEffect
  } = props.diagramJSui.getHooks();

  const overlayRef = useRef();

  useLayoutEffect(() => {
    if (typeof props.position !== 'function') {
      return;
    }

    const overlayEl = overlayRef.current;
    const position = props.position(overlayEl);

    overlayEl.style.left = `${position.x}px`;
    overlayEl.style.top = `${position.y}px`;
  }, [ overlayRef.current, props.position ]);

  return (html`
    <div
      class=${ classNames('djs-popup', className) }
      onClick=${ () => onClose() }
    >
      <div
        class="overlay"
        ref=${ overlayRef }
        onClick=${ e => e.stopPropagation() }
        style=${getOverlayStyle(props)}
      >
        ${children}
      </div>
    </div>
    `
  );
}

// helpers //////////////////////
function scrollIntoView(el) {
  if (typeof el.scrollIntoViewIfNeeded === 'function') {
    el.scrollIntoViewIfNeeded();
  } else {
    el.scrollIntoView({
      scrollMode: 'if-needed',
      block: 'nearest'
    });
  }
}

function getOverlayStyle(props) {
  return `
    transform: scale(${props.scale});
    width: ${props.width}px;
  `;
}