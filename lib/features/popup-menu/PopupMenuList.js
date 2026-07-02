import {
  html,
  useLayoutEffect,
  useRef
} from '../../ui/index.js';

import PopupMenuItem from './PopupMenuItem.js';

/**
 * @typedef {import('./PopupMenuProvider.js').PopupMenuEntry} PopupMenuEntry
 * @typedef {import('./PopupMenuProvider.js').PopupMenuGroup} PopupMenuGroup
 */

/**
 * Component that renders a popup menu entry list.
 *
 * @param {Object} props
 * @param {PopupMenuGroup[]} props.groupedEntries
 * @param {PopupMenuEntry} props.selectedEntry
 * @param {(entry: PopupMenuEntry | null) => void} props.setSelectedEntry
 * @param {import('@bpmn-io/diagram-js-ui').Ref<boolean>} props.keyboardSelection
 * @param {string} props.idPrefix
 * @param {string} props.id
 * @param {string} [props.ariaLabel]
 * @param {number} [props.tabIndex]
 * @param {string} [props.ariaActivedescendant]
 */
export default function PopupMenuList(props) {
  const {
    selectedEntry,
    setSelectedEntry,
    groupedEntries,
    keyboardSelection,
    idPrefix,
    id,
    ariaLabel,
    tabIndex,
    ariaActivedescendant,
    ...restProps
  } = props;

  const resultsRef = useRef();

  // scroll selected entry into view when navigating by keyboard
  useLayoutEffect(() => {
    if (!keyboardSelection || !keyboardSelection.current) {
      return;
    }

    const containerEl = resultsRef.current;

    if (!containerEl)
      return;

    const selectedEl = containerEl.querySelector('.selected');

    if (selectedEl) {
      scrollIntoView(selectedEl);
    }
  }, [ selectedEntry ]);

  const handleMouseMove = () => {
    keyboardSelection.current = false;
  };

  const handleEntryMouseEnter = (entry) => {

    // Prevents keyboard selection from being overridden
    // by mouse hover when `scrollIntoView` is called.
    if (keyboardSelection.current) {
      return;
    }

    setSelectedEntry(entry);
  };

  const handleEntryMouseLeave = () => {
    if (keyboardSelection.current) {
      return;
    }

    setSelectedEntry(null);
  };

  return html`
    <div
      class="djs-popup-results"
      ref=${ resultsRef }
      id=${ id }
      role="listbox"
      aria-label=${ ariaLabel }
      tabIndex=${ tabIndex }
      aria-activedescendant=${ ariaActivedescendant }
      onMouseMove=${ handleMouseMove }
    >
      ${ groupedEntries.map(group => html`
        ${ group.name && html`
          <div key=${ group.id } id=${ getGroupHeaderId(idPrefix, group) } class="entry-header" title=${ group.name }>
            ${ group.name }
          </div>
        ` }
        <ul
          class="djs-popup-group"
          data-group=${ group.id }
          role="group"
          aria-labelledby=${ group.name ? getGroupHeaderId(idPrefix, group) : undefined }
        >
          ${ group.entries.map(entry => html`
            <${PopupMenuItem}
              key=${ entry.id }
              idPrefix=${ idPrefix }
              entry=${ entry }
              selected=${ entry === selectedEntry }
              onMouseEnter=${ () => handleEntryMouseEnter(entry) }
              onMouseLeave=${ handleEntryMouseLeave }
              ...${ restProps }
            />
          `) }
        </ul>
      `) }
    </div>
  `;
}


// helpers ////////////////

function getGroupHeaderId(idPrefix, group) {
  return `${ idPrefix }-group-${ group.id }`;
}

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
