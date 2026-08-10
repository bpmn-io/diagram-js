import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  html,
  useMemo,
  useCallback
} from '../../ui/index.js';

import {
  closest as domClosest,
  matches as domMatches
} from 'min-dom';

import PopupMenuBreadcrumbs from './PopupMenuBreadcrumbs.js';
import PopupMenuHeader from './PopupMenuHeader.js';
import PopupMenuList from './PopupMenuList.js';
import { getPopupMenuItemId } from './PopupMenuItem.js';
import Ids from '../../util/IdGenerator.js';
import classNames from 'clsx';
import { isDefined, isFunction } from 'min-dash';

const ids = new Ids('djs-popup');

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
 * @param {number|string} [props.width]
 * @param {searchFn} props.searchFn
 * @param {import('./PopupMenuProvider.js').PopupMenuTab} [props.defaultTab]
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
    onClosed,
    defaultTab
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
   * the stack and active tab are reset to root.
   */
  useEffect(() => {
    setNavigationStack([]);
    setActiveTab(null);
  }, [ entries ]);

  /**
   * Tabs partition root-level entries. They are derived from the entries'
   * `tab` property; entries without a `tab` belong to the default tab. The
   * tab strip only renders when at least two distinct tabs exist.
   *
   * @type {import('./PopupMenuProvider.js').PopupMenuTab[]}
   */
  const tabs = useMemo(() => {
    const tabbed = [];
    const seen = new Set();

    let hasUntagged = false;

    entries.forEach(({ tab }) => {
      if (!tab) {
        hasUntagged = true;

        return;
      }

      if (!seen.has(tab.id)) {
        seen.add(tab.id);
        tabbed.push(tab);
      }
    });

    if (!tabbed.length) {
      return [];
    }

    // untagged entries need a tab to live in; without a configured
    // `defaultTab` there is no name to give it, so stay untabbed rather
    // than invent one
    if (hasUntagged && !defaultTab) {
      return [];
    }

    if (!hasUntagged) {
      return tabbed;
    }

    return [
      defaultTab,
      ...tabbed.filter(tab => tab.id !== defaultTab.id)
    ];
  }, [ entries, defaultTab ]);

  const [ activeTabOverride, setActiveTab ] = useState(null);

  // the override may name a tab that no longer exists, e.g. on the render
  // following a `PopupMenu#refresh()` that dropped it
  const activeTabId = tabs.some(tab => tab.id === activeTabOverride)
    ? activeTabOverride
    : (tabs.length ? tabs[0].id : null);

  const tabsRef = useRef();

  useLayoutEffect(() => {
    const tabsEl = tabsRef.current;

    if (!tabsEl) {
      return;
    }

    const activeTabEl = tabsEl.querySelector('[aria-selected="true"]');

    if (activeTabEl) {
      scrollIntoView(activeTabEl);
    }
  }, [ activeTabId ]);

  const getEntryTabId = useCallback(entry => {
    return (entry.tab && entry.tab.id) || (defaultTab && defaultTab.id);
  }, [ defaultTab ]);

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

    // the tab filter applies at the root level only; drill-down
    // (step entries) and search operate on the full entry set
    const availableEntries = navigationStack.length
      ? navigationStack[navigationStack.length - 1].entries
      : (
        tabs.length > 1
          ? entries.filter(entry => getEntryTabId(entry) === activeTabId)
          : entries
      );

    if (!searchable) return availableEntries;

    if (isSearching) {
      return searchFn(
        actionableEntries.filter(({ searchable }) => searchable !== false),
        searchValue,
        { keys: [ 'label', 'search', 'description' ] }
      ).map(({ item }) => item);
    }

    return availableEntries.filter(({ rank = 0 }) => rank >= 0);
  }, [ searchable, isSearching, actionableEntries, searchValue, searchFn, navigationStack, entries, tabs, activeTabId, getEntryTabId ]);

  const groupedEntries = useMemo(() => {
    if (isSearching) {
      return entriesToShow.length ? [ { id: 'default', entries: entriesToShow } ] : [];
    }

    return groupEntries(entriesToShow);
  }, [ entriesToShow, isSearching ]);

  const [ selectedEntry, setSelectedEntry ] = useState(entriesToShow[0]);
  const restoreSelection = useRef(null);

  /**
   * Whether the current selection was made through keyboard navigation.
   *
   * @type {import('@bpmn-io/diagram-js-ui').Ref<boolean>}
   */
  const keyboardSelection = useRef(false);

  // per instance basis to generate field IDs
  const idPrefix = useMemo(() => ids.next(), []);

  const resultsId = `${ idPrefix }-results`;
  const activeDescendantId = selectedEntry && getPopupMenuItemId(idPrefix, selectedEntry);

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

    keyboardSelection.current = true;

    setSelectedEntry(entries[nextIdx]);
  }, [ groupedEntries, selectedEntry ]);

  const keyboardDrilldown = useCallback((direction) => {
    if (direction > 0 && selectedEntry && selectedEntry.entries) {
      keyboardSelection.current = true;

      setNavigationStack(stack => [ ...stack, selectedEntry ]);
    }

    if (direction < 0 && navigationStack.length > 0) {
      keyboardSelection.current = true;

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
      const target = event.target;
      const isNativeActionTarget = !!domClosest(target, 'a, button', true);

      // let native controls handle <Enter> themselves
      if (isNativeActionTarget) {
        return;
      }

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

  const selectTab = useCallback((event, tabId) => {
    setActiveTab(tabId);

    // a keyboard activation reports no click detail; keep focus in the strip
    // so arrow navigation keeps working. A pointer click hands focus back to
    // the search input so typing continues to work
    if (!event.detail) {
      return;
    }

    const popupEl = domClosest(event.currentTarget, '.djs-popup', true);
    const inputEl = popupEl && popupEl.querySelector('input');

    inputEl && inputEl.focus();
  }, []);

  // arrow/Home/End navigate between tabs while the strip has focus; stop
  // propagation so the global drill-down and entry-action bindings do not fire
  const handleTabKeyDown = useCallback(event => {
    if (event.key === 'Enter' || event.key === ' ') {

      // let the button's native click happen, but keep the event
      // from reaching the global Enter handler (entry action)
      event.stopPropagation();

      return;
    }

    const idx = tabs.findIndex(tab => tab.id === activeTabId);

    let nextIdx;

    if (event.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'ArrowRight') {
      nextIdx = (idx + 1) % tabs.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setActiveTab(tabs[nextIdx].id);

    const strip = event.currentTarget.parentNode;
    const nextButton = strip && strip.children[nextIdx];

    nextButton && nextButton.focus();
  }, [ tabs, activeTabId ]);

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
  const displayTabs = tabs.length > 1 && !isSearching && navigationStack.length === 0;
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
      navigationStack=${ navigationStack }
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
            <input
              type="text"
              spellcheck=${ false }
              role="combobox"
              aria-label="${ title || 'Search' }"
              aria-expanded="true"
              aria-controls=${ resultsId }
              aria-activedescendant=${ activeDescendantId || undefined }
              aria-autocomplete="list"
            />
          </div>
          ` }

          ${ displayTabs && html`
            <div class="djs-popup-tabs-container">
              <div class="djs-popup-tabs" ref=${ tabsRef } role="tablist">
                ${ tabs.map(tab => html`
                  <button
                    type="button"
                    class="djs-popup-tab"
                    role="tab"
                    title=${ tab.title || undefined }
                    aria-controls=${ resultsId }
                    aria-selected=${ tab.id === activeTabId }
                    tabIndex=${ tab.id === activeTabId ? 0 : -1 }
                    onClick=${ (event) => selectTab(event, tab.id) }
                    onKeydown=${ handleTabKeyDown }
                  >${ tab.label }</button>
                `) }
              </div>
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
            keyboardSelection=${ keyboardSelection }
            onAction=${ handleEntryAction }
            idPrefix=${ idPrefix }
            id=${ resultsId }
            ariaLabel=${ title || 'Results' }
            tabIndex=${ searchable ? -1 : 0 }
            ariaActivedescendant=${ searchable ? undefined : (activeDescendantId || undefined) }
          />

          ${ selectedEntry && selectedEntry.documentationRef && html`
            <div class="djs-popup-footer">
              <a
                class="djs-popup-footer-docs"
                href=${ selectedEntry.documentationRef }
                onClick=${ (event) => event.stopPropagation() }
                aria-label=${ selectedEntry.label ? `Open entry documentation for ${ selectedEntry.label }` : 'Open entry documentation' }
                target="_blank"
                rel="noopener"
              >
                Open entry documentation

                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6368 10.6375V5.91761H11.9995V10.6382C11.9995 10.9973 11.8623 11.3141 11.5878 11.5885C11.3134 11.863 10.9966 12.0002 10.6375 12.0002H1.36266C0.982345 12.0002 0.660159 11.8681 0.396102 11.6041C0.132044 11.34 1.52588e-05 11.0178 1.52588e-05 10.6375V1.36267C1.52588e-05 0.98236 0.132044 0.660173 0.396102 0.396116C0.660159 0.132058 0.982345 2.95639e-05 1.36266 2.95639e-05H5.91624V1.36267H1.36266V10.6375H10.6368ZM12 0H7.2794L7.27873 1.36197H9.68701L3.06507 7.98391L4.01541 8.93425L10.6373 2.31231V4.72059H12V0Z" fill="#818798"/>
                </svg>
              </a>
            </div>
          ` }
        </div>
      ` }
    ${ emptyPlaceholder && entriesToShow.length === 0 && html`
      <div class="djs-popup-no-results">${ isFunction(emptyPlaceholder) ? emptyPlaceholder(searchValue) : emptyPlaceholder }</div>
    ` }
    </${PopupMenuWrapper}>
  `;
}

function scrollIntoView(el) {
  if (typeof el.scrollIntoViewIfNeeded === 'function') {
    el.scrollIntoViewIfNeeded();
  } else {
    el.scrollIntoView({
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest'
    });
  }
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
    navigationStack,
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

  useLayoutEffect(() => {
    const popupEl = popupRef.current;

    if (!popupEl) {
      return;
    }

    // focus the combobox (search) if present, otherwise the listbox
    // itself which then holds focus + `aria-activedescendant`;
    // fall back to the popup element (e.g. empty placeholder)
    const focusEl = popupEl.querySelector('input')
      || popupEl.querySelector('[role="listbox"]')
      || popupEl;

    focusEl.focus();
  }, [ navigationStack ]);

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

    // use capture phase so containment is evaluated before an entry
    // or the popup menu is potentially unmounted
    document.body.addEventListener('click', handleClick, true);

    return () => {
      document.documentElement.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('click', handleClick, true);
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
  const { width } = props;

  const normalizedWidth = typeof width === 'number' ? `${width}px` : width;

  return {
    transform: `scale(${props.scale})`,
    width: isDefined(width) ? normalizedWidth : undefined,
    maxWidth: isDefined(width) ? 'unset' : undefined,
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