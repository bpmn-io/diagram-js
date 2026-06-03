import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  html,
  useMemo,
  useCallback
} from 'diagram-js/lib/ui';

import {
  closest as domClosest,
  matches as domMatches
} from 'min-dom';

import PopupMenuBreadcrumbs from './PopupMenuBreadcrumbs.js';
import PopupMenuHeader from './PopupMenuHeader.js';
import PopupMenuList from './PopupMenuList.js';
import classNames from 'clsx';
import { isDefined, isFunction } from 'min-dash';

/**
 * @typedef {import('./PopupMenuProvider.js').PopupMenuEntry} PopupMenuEntry
 * @typedef {import('./PopupMenuProvider.js').PopupMenuActionEntry} PopupMenuActionEntry
 * @typedef {import('./PopupMenuProvider.js').PopupMenuStepEntry} PopupMenuStepEntry
 * @typedef {import('./PopupMenuProvider.js').PopupMenuHeaderEntry} PopupMenuHeaderEntry
 * @typedef {import('./PopupMenuProvider.js').PopupMenuEmptyPlaceholderProvider | import('./PopupMenuProvider.js').PopupMenuEmptyPlaceholder} PopupMenuEmptyPlaceholder
 * @typedef {import('./PopupMenuProvider.js').PopupMenuGroup} PopupMenuGroup
 *
 * @typedef {import('../search/search.js').default} searchFn
 *
 * @typedef {import('../../util/Types.js').Point} Point
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
 * @param {searchFn} props.searchFn
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
    searchFn,
    entries,
    onOpened,
    onClosed
  } = props;

  /**
   * If a step entry (i.e. an entry with nested `entries`) is clicked,
   * it is pushed onto the stack to keep track of the navigation path.
   *
   * When the user clicks "Back" or a breadcrumb, the stack is popped.
   *
   * @type {[ PopupMenuStepEntry[], (stack: PopupMenuStepEntry[] | ((stack: PopupMenuStepEntry[]) => PopupMenuStepEntry[])) => void ]}
   */
  const [ navigationStack, setNavigationStack ] = useState([]);

  /**
   * On `PopupMenu#refresh()` (i.e. when `entries` change)
   * the stack is reset to root.
   */
  useEffect(() => {
    setNavigationStack([]);
  }, [ entries ]);

  const [ searchValue, setSearchValue ] = useState('');
  const isSearching = searchValue.trim().length > 0;

  const actionableEntries = useMemo(() => getActionableEntries(entries), [ entries ]);

  const searchable = useMemo(() => {
    if (!isDefined(search)) {
      return false;
    }

    return actionableEntries.length > 5;
  }, [ search, actionableEntries ]);

  const entriesToShow = useMemo(() => {

    const availableEntries = navigationStack.length
      ? navigationStack[navigationStack.length - 1].entries
      : entries;

    if (!searchable) return availableEntries;

    if (isSearching) {
      return searchFn(
        actionableEntries.filter(({ searchable }) => searchable !== false),
        searchValue,
        { keys: [ 'label', 'search', 'description' ] }
      ).map(({ item }) => item);
    }

    return availableEntries.filter(({ rank = 0 }) => rank >= 0);
  }, [ searchable, isSearching, actionableEntries, searchValue, searchFn, navigationStack, entries ]);

  const groupedEntries = useMemo(() => {
    if (isSearching) {
      return entriesToShow.length ? [ { id: 'default', entries: entriesToShow } ] : [];
    }

    return groupEntries(entriesToShow);
  }, [ entriesToShow, isSearching ]);

  const [ selectedEntry, setSelectedEntry ] = useState(entriesToShow[0]);
  const restoreSelection = useRef(null);

  useEffect(() => {
    const restore = restoreSelection.current;

    if (restore && entriesToShow.includes(restore)) {
      setSelectedEntry(restore);
    } else {
      setSelectedEntry(entriesToShow[0]);
    }

    restoreSelection.current = null;
  }, [ entriesToShow ]);

  // handle keyboard selection
  const keyboardSelect = useCallback(direction => {
    const entries = getOrderedEntries(groupedEntries);
    const idx = entries.indexOf(selectedEntry);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = entries.length - 1;
    }

    if (nextIdx >= entries.length) {
      nextIdx = 0;
    }

    setSelectedEntry(entries[nextIdx]);
  }, [ groupedEntries, selectedEntry ]);

  const keyboardDrilldown = useCallback((direction) => {
    if (direction > 0 && selectedEntry && selectedEntry.entries) {
      setNavigationStack(stack => [ ...stack, selectedEntry ]);
    }

    if (direction < 0 && navigationStack.length > 0) {
      restoreSelection.current = navigationStack[navigationStack.length + direction];
      setNavigationStack(stack => stack.slice(0, direction));
    }
  }, [ selectedEntry, navigationStack ]);

  const handleEntryAction = useCallback((event, entry, action) => {
    if (!entry || entry.disabled) {
      return;
    }

    if (entry.entries) {
      event.preventDefault();
      return keyboardDrilldown(1);
    }

    return onSelect(event, entry, action);
  }, [ onSelect, keyboardDrilldown ]);

  const handleKeyDown = useCallback(event => {
    if (event.key === 'Enter' && selectedEntry) {
      if (selectedEntry.disabled) {
        return;
      }

      return handleEntryAction(event, selectedEntry);
    }

    // BACKSPACE
    if (event.key === 'Backspace') {
      const target = event.target;
      const isEditingSearch = domMatches(target, 'input') && target.value !== '';

      if (!isEditingSearch) {
        keyboardDrilldown(-1);
        return event.preventDefault();
      }
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

    // ARROW_RIGHT
    if (event.key === 'ArrowRight') {
      keyboardDrilldown(1);
      return event.preventDefault();
    }

    // ARROW_LEFT
    if (event.key === 'ArrowLeft') {
      keyboardDrilldown(-1);
      return event.preventDefault();
    }
  }, [ selectedEntry, keyboardSelect, keyboardDrilldown, handleEntryAction ]);

  const handleKey = useCallback(event => {
    if (domMatches(event.target, 'input')) {
      setSearchValue(() => event.target.value);
    }
  }, [ setSearchValue ]);

  useEffect(() => {
    onOpened();

    return () => {
      onClosed();
    };
  }, []);

  const displayBreadcrumbs = !isSearching && navigationStack.length > 0;
  const displayHeader = (title || headerEntries.length > 0) && !displayBreadcrumbs;

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
      ${ displayBreadcrumbs && html`
        <${PopupMenuBreadcrumbs}
          navigationStack=${navigationStack}
          setNavigationStack=${ setNavigationStack }
        />
      ` }
      ${ entries.length > 0 && html`
        <div class="djs-popup-body">

          ${ searchable && html`
          <div class="djs-popup-search">
            <svg class="djs-popup-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
            </svg>
            <input type="text" spellcheck=${ false } aria-label="${ title || 'Search' }" />
          </div>
          ` }

          ${ isSearching && html`
            <div class="djs-popup-search-count" aria-live="polite">
              ${ entriesToShow.length } ${ entriesToShow.length === 1 ? 'result' : 'results' } found
            </div>
          ` }

          <${PopupMenuList}
            groupedEntries=${ groupedEntries }
            selectedEntry=${ selectedEntry }
            setSelectedEntry=${ setSelectedEntry }
            onAction=${ handleEntryAction }
          />
        </div>
      ` }
    ${ emptyPlaceholder && entriesToShow.length === 0 && html`
      <div class="djs-popup-no-results">${ isFunction(emptyPlaceholder) ? emptyPlaceholder(searchValue) : emptyPlaceholder }</div>
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

function getOrderedEntries(groupedEntries) {
  const entries = [];

  groupedEntries.forEach(group => {
    group.entries.forEach(entry => {
      entries.push(entry);
    });
  });

  return entries;
}

/**
 * Get a flat list of entries that are actionable, i.e. that do not have nested `entries`.
 *
 * Walk the entry tree following `entries` and return a flat list of leaves.
 *
 * @param {PopupMenuEntry[]} entries
 *
 * @return {PopupMenuActionEntry[]}
 */
function getActionableEntries(entries) {
  const leaves = [];

  function walk(entries) {
    entries.forEach(entry => {
      if (entry.entries) {
        walk(entry.entries);
        return;
      }

      leaves.push(entry);
    });
  }

  walk(entries);

  return leaves;
}

/**
 * @param {PopupMenuEntry[]} entries
 *
 * @return {PopupMenuGroup[]}
 */
export function groupEntries(entries) {
  const groups = [];

  const getGroup = group => groups.find(elem => group.id === elem.id);

  const containsGroup = group => !!getGroup(group);

  // legacy support for provider built for the old popUp menu
  const formatGroup = group =>
    typeof group === 'string' ? { id: group } : group;

  entries.forEach(entry => {

    // assume a default group when none is provided
    const group = entry.group ? formatGroup(entry.group) : { id: 'default' };

    if (!containsGroup(group)) {
      groups.push({ ...group, entries: [ entry ] });
    } else {
      getGroup(group).entries.push(entry);
    }
  });

  return groups;
}