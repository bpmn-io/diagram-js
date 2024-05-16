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
  closest as domClosest,
  matches as domMatches
} from 'min-dom';

import PopupMenuHeader from './PopupMenuHeader';
import PopupMenuList from './PopupMenuList';
import classNames from 'clsx';
import { isDefined, isFunction } from 'min-dash';

/**
 * @typedef {import('./PopupMenuProvider').PopupMenuEntry} PopupMenuEntry
 * @typedef {import('./PopupMenuProvider').PopupMenuHeaderEntry} PopupMenuHeaderEntry
 * @typedef {import('./PopupMenuProvider').PopupMenuEmptyPlaceholderProvider | import('./PopupMenuProvider').PopupMenuEmptyPlaceholder} PopupMenuEmptyPlaceholder
 *
 * @typedef {import('../../util/Types').Point} Point
 */

/**
 * A component that renders the popup menus.
 *
 * @param {Object} props
 * @param {() => void} props.onClose
 * @param {() => void} props.onSelect
 * @param {(element: HTMLElement) => Point} props.position
 * @param {string} props.className
 * @param {PopupMenuEntry[]} props.entries
 * @param {PopupMenuHeaderEntry[]} props.headerEntries
 * @param {number} props.scale
 * @param {string} [props.title]
 * @param {boolean} [props.search]
 * @param {PopupMenuEmptyPlaceholder} [props.emptyPlaceholder]
 * @param {number} [props.width]
 */
export default function PopupMenuComponent(props) {
  const {
    onClose,
    onSelect,
    className,
    headerEntries,
    position,
    title,
    width,
    scale,
    search,
    emptyPlaceholder,
    entries: originalEntries,
    onOpened,
    onClosed
  } = props;

  const searchable = useMemo(() => {
    if (!isDefined(search)) {
      return false;
    }

    return originalEntries.length > 5;
  }, [ search, originalEntries ]);

  const [ value, setValue ] = useState('');

  const filterEntries = useCallback((originalEntries, value) => {

    if (!searchable) {
      return originalEntries;
    }

    const filter = entry => {
      if (!value) {
        return (entry.rank || 0) >= 0;
      }

      if (entry.searchable === false) {
        return false;
      }

      const searchableFields = [
        entry.description || '',
        entry.label || '',
        entry.search || ''
      ].map(string => string.toLowerCase());

      // every word of `value` should be included in one of the searchable fields
      return value
        .toLowerCase()
        .split(/\s/g)
        .every(word => searchableFields.some(field => field.includes(word)));
    };

    return originalEntries.filter(filter);
  }, [ searchable ]);

  const [ entries, setEntries ] = useState(filterEntries(originalEntries, value));
  const [ selectedEntry, setSelectedEntry ] = useState(entries[0]);

  const updateEntries = useCallback((newEntries) => {

    // select first entry if non is selected
    if (!selectedEntry || !newEntries.includes(selectedEntry)) {
      setSelectedEntry(newEntries[0]);
    }

    setEntries(newEntries);
  }, [ selectedEntry, setEntries, setSelectedEntry ]);

  // filter entries on value change
  useEffect(() => {
    updateEntries(filterEntries(originalEntries, value));
  }, [ value, originalEntries ]);

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

    // ARROW_UP
    if (event.key === 'ArrowUp') {
      keyboardSelect(-1);

      return event.preventDefault();
    }

    // ARROW_DOWN
    if (event.key === 'ArrowDown') {
      keyboardSelect(1);

      return event.preventDefault();
    }
  }, [ onSelect, selectedEntry, keyboardSelect ]);

  const handleKey = useCallback(event => {
    if (domMatches(event.target, 'input')) {
      setValue(() => event.target.value);
    }
  }, [ setValue ]);

  useEffect(() => {
    onOpened();

    return () => {
      onClosed();
    };
  }, []);

  const displayHeader = useMemo(() => title || headerEntries.length > 0, [ title, headerEntries ]);

  return html`
    <${PopupMenuWrapper}
      onClose=${ onClose }
      onKeyup=${ handleKey }
      onKeydown=${ handleKeyDown }
      className=${ className }
      position=${ position }
      width=${ width }
      scale=${ scale }
    >
      ${ displayHeader && html`
        <${PopupMenuHeader}
          headerEntries=${ headerEntries }
          onSelect=${ onSelect }
          selectedEntry=${ selectedEntry }
          setSelectedEntry=${ setSelectedEntry }
          title=${ title }
        />
      ` }
      ${ originalEntries.length > 0 && html`
        <div class="djs-popup-body">

          ${ searchable && html`
          <div class="djs-popup-search">
            <svg class="djs-popup-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
            </svg>
            <input type="text" aria-label="${ title }" />
          </div>
          ` }

          <${PopupMenuList}
            entries=${ entries }
            selectedEntry=${ selectedEntry }
            setSelectedEntry=${ setSelectedEntry }
            onAction=${ onSelect }
          />
        </div>
      ` }
    ${ emptyPlaceholder && entries.length === 0 && html`
      <div class="djs-popup-no-results">${ isFunction(emptyPlaceholder) ? emptyPlaceholder(value) : emptyPlaceholder }</div>
    ` }
    </${PopupMenuWrapper}>
  `;
}

/**
 * A component that wraps the popup menu.
 *
 * @param {*} props
 */
function PopupMenuWrapper(props) {
  const {
    onClose,
    onKeydown,
    onKeyup,
    className,
    children,
    position: positionGetter
  } = props;

  const popupRef = useRef();

  // initial position
  useLayoutEffect(() => {
    if (typeof positionGetter !== 'function') {
      return;
    }

    const popupEl = popupRef.current;
    const position = positionGetter(popupEl);

    popupEl.style.left = `${position.x}px`;
    popupEl.style.top = `${position.y}px`;
  }, [ popupRef.current, positionGetter ]);

  // initial focus
  useLayoutEffect(() => {
    const popupEl = popupRef.current;

    if (!popupEl) {
      return;
    }

    const inputEl = popupEl.querySelector('input');

    (inputEl || popupEl).focus();
  }, []);

  // global <Escape> / blur handlers
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();

        return onClose();
      }
    };

    const handleClick = event => {
      const popup = domClosest(event.target, '.djs-popup', true);

      if (popup) {
        return;
      }

      return onClose();
    };

    document.documentElement.addEventListener('keydown', handleKeyDown);
    document.body.addEventListener('click', handleClick);

    return () => {
      document.documentElement.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('click', handleClick);
    };
  }, []);

  return html`
    <div
      class=${ classNames('djs-popup', className) }
      style=${ getPopupStyle(props) }
      onKeydown=${ onKeydown }
      onKeyup=${ onKeyup }
      ref=${ popupRef }
      tabIndex="-1"
    >
      ${ children }
    </div>
  `;
}

// helpers //////////////////////

function getPopupStyle(props) {
  return {
    transform: `scale(${props.scale})`,
    width: `${props.width}px`,
    'transform-origin': 'top left'
  };
}