import {
  html,
  useMemo,
  useLayoutEffect,
  useRef
} from '../../ui';

import PopupMenuItem from './PopupMenuItem';

/**
 * @typedef {import('./PopupMenuProvider').PopupMenuEntry} PopupMenuEntry
 */

/**
 * Component that renders a popup menu entry list.
 *
 * @param {Object} props
 * @param {PopupMenuEntry[]} props.entries
 * @param {PopupMenuEntry} props.selectedEntry
 * @param {(entry: PopupMenuEntry | null) => void} props.setSelectedEntry
 */
export default function PopupMenuList(props) {
  const {
    selectedEntry,
    setSelectedEntry,
    entries,
    ...restProps
  } = props;

  const resultsRef = useRef();

  const groups = useMemo(() => groupEntries(entries), [ entries ]);

  // scroll to selected result
  useLayoutEffect(() => {
    const containerEl = resultsRef.current;

    if (!containerEl)
      return;

    const selectedEl = containerEl.querySelector('.selected');

    if (selectedEl) {
      scrollIntoView(selectedEl);
    }
  }, [ selectedEntry ]);

  return html`
    <div class="djs-popup-results" ref=${ resultsRef }>
      ${ groups.map(group => html`
        ${ group.name && html`
          <div key=${ group.id } class="entry-header" title=${ group.name }>
            ${ group.name }
          </div>
        ` }
        <ul class="djs-popup-group" data-group=${ group.id }>
          ${ group.entries.map(entry => html`
            <${PopupMenuItem}
              key=${ entry.id }
              entry=${ entry }
              selected=${ entry === selectedEntry }
              onMouseEnter=${ () => setSelectedEntry(entry) }
              onMouseLeave=${ () => setSelectedEntry(null) }
              ...${ restProps }
            />
          `) }
        </ul>
      `) }
    </div>
  `;
}


// helpers
function groupEntries(entries) {
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

// helpers ////////////////

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