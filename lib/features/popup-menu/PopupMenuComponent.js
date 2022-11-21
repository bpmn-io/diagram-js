import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  html,
  useMemo,
  useCallback
} from '../../ui';

import {
  closest as domClosest
} from 'min-dom';

import PopupMenuList from './PopupMenuList';
import classNames from 'clsx';
import { isDefined } from 'min-dash';


/**
 * A component that renders the popup menus.
 *
 * @param {function} onClose
 * @param {function} position
 * @param {string} className
 * @param {Array} entries
 * @param {Object} headerEntries
 * @param {number} scale
 * @param {string} [title]
 * @param {boolean} [search]
 * @param {number} [width]
 */
export default function PopupMenuComponent(props) {
  const {
    onClose,
    onSelect,
    className,
    headerEntries,
    position,
    width,
    scale,
    search,
    entries: originalEntries
  } = props;

  const searchable = useMemo(() => {
    if (!isDefined(search)) {
      return false;
    }

    return originalEntries.length > 5;
  }, [ search, originalEntries ]);

  const inputRef = useRef();

  const [ value, setValue ] = useState('');

  const [ entries, setEntries ] = useState(originalEntries);
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

    if (!searchable) {
      return;
    }

    const entries = originalEntries.filter(filter);

    if (!entries.includes(selectedEntry) || !selectedEntry) {
      setSelectedEntry(entries[0]);
    }

    setEntries(entries);

  }, [ value, selectedEntry, setSelectedEntry, originalEntries, searchable ]);

  // register global <Escape> handler
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        return onClose();
      }
    };

    document.documentElement.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // focus input on initial mount
  useLayoutEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  // handle keyboard seleciton
  const keyboardSelect = useCallback(direction => {
    const idx = entries.indexOf(selectedEntry);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = entries.length - 1;
    }

    if (nextIdx >= entries.length) {
      nextIdx = 0;
    }

    setSelectedEntry(entries[nextIdx]);
  }, [ entries, selectedEntry, setSelectedEntry ]);

  const handleKeyDown = useCallback(event => {
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
  }, [ onSelect, onClose, selectedEntry, keyboardSelect ]);

  const handleKey = useCallback(event => {
    setValue(() => event.target.value);
  }, [ setValue ]);

  const displayHeader = props.title || Object.keys(headerEntries).length > 0;

  return html`
    <${PopupMenuWrapper}
      onClose=${ onClose }
      className=${ className }
      position=${position}
      width=${ width }
      scale=${ scale }
    >
      ${ displayHeader && html`
        <div class="djs-popup-header">
          <h3 class="djs-popup-title">${ props.title }</h3>
          ${ Object.entries(headerEntries).map(([ id, entry ]) => html`
            <span
              class=${ getHeaderClasses(entry, entry === selectedEntry) }
              onClick=${ event => onSelect(event, entry) }
              title=${ `Toggle ${entry.title}` }
              data-id=${ id }
              onMouseEnter=${ () => setSelectedEntry(entry) }
            >
              ${entry.imageUrl ? html`<img src=${ entry.imageUrl } />` : null}
              ${entry.label ? entry.label : null}
            </span>
          `) }
        </div>
      ` }
      ${ originalEntries.length && html`
        <div class="djs-popup-body">

          ${ searchable && html`
          <div class="djs-popup-search">
            <svg class="djs-popup-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
            </svg>
            <input
                ref=${ inputRef }
                type="text"
                onKeyup=${ handleKey }
                onKeydown=${ handleKeyDown }
              />
          </div>
          ` }

          <${PopupMenuList}
            entries=${ entries }
            selectedEntry=${ selectedEntry }
            setSelectedEntry=${ setSelectedEntry }
            onClick=${ onSelect }
          />
        </div>
      ` }
      ${ entries.length === 0 && html`
        <div class="djs-popup-no-results">No matching entries found.</div>
      ` }
    </${PopupMenuWrapper}>
  `;
}

/**
 * A component that wraps the popup menu.
 *
 * @param {any} props
 */
function PopupMenuWrapper(props) {
  const {
    onClose,
    className,
    children,
    position: positionGetter
  } = props;

  const checkClose = useCallback((event) => {

    const overlay = domClosest(event.target, '.djs-popup .djs-popup-overlay', true);

    if (overlay) {
      return;
    }

    onClose();
  }, [ onClose ]);

  const overlayRef = useRef();

  useLayoutEffect(() => {
    if (typeof positionGetter !== 'function') {
      return;
    }

    const overlayEl = overlayRef.current;
    const position = positionGetter(overlayEl);

    overlayEl.style.left = `${position.x}px`;
    overlayEl.style.top = `${position.y}px`;
  }, [ overlayRef.current, positionGetter ]);

  return html`
    <div
      class=${ classNames('djs-popup', className) }
      onClick=${ checkClose }
    >
      <div
        class="djs-popup-overlay"
        ref=${ overlayRef }
        style=${ getOverlayStyle(props) }
      >
        ${children}
      </div>
    </div>
  `;
}

// helpers //////////////////////

function getOverlayStyle(props) {
  return {
    transform: `scale(${props.scale})`,
    width: `${props.width}px`
  };
}

function getHeaderClasses(entry, selected) {
  return classNames(
    'entry',
    entry.className,
    entry.active ? 'active' : '',
    entry.disabled ? 'disabled' : '',
    selected ? 'selected' : ''
  );
}