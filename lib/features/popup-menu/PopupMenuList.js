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
 */
export default function PopupMenuList(props) {
  const {
    selectedEntry,
    setSelectedEntry,
    groupedEntries,
    keyboardSelection,
    ...restProps
  } = props;

  const resultsRef = useRef();

  // scroll selected entry into view, but only when it was selected through
  // keyboard navigation; scrolling on mouse hover would move entries away
  // from under the pointer
  useLayoutEffect(() => {
    if (!keyboardSelection || !keyboardSelection.current) {
      return;
    }

    keyboardSelection.current = false;

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
      ${ groupedEntries.map(group => html`
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
