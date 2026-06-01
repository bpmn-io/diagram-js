import classNames from 'clsx';

import {
  html
} from '../../ui/index.js';

/**
 * @typedef {import('./PopupMenuProvider.js').PopupMenuEntry} PopupMenuEntry
 */

/**
 * Component that renders a popup menu entry.
 *
 * @param {Object} props
 * @param {string} props.key
 * @param {PopupMenuEntry} props.entry
 * @param {boolean} props.selected
 * @param {(event: MouseEvent) => void} props.onMouseEnter
 * @param {(event: MouseEvent) => void} props.onMouseLeave
 * @param {(event: MouseEvent, entry?: PopupMenuEntry, action?: string) => void} props.onAction
 */
export default function PopupMenuItem(props) {
  const {
    entry,
    selected,
    onMouseEnter,
    onMouseLeave,
    onAction
  } = props;

  const handleClick = (event, action) => {
    if (entry.disabled) {
      return;
    }

    return onAction(event, entry, action);
  };

  const draggable = !entry.entries;

  return html`
    <li
      class=${ classNames('entry', { selected, disabled: entry.disabled }) }
      data-id=${ entry.id }
      title=${ entry.title }
      aria-disabled=${ entry.disabled || undefined }
      tabIndex="0"
      onClick=${ handleClick }
      onFocus=${ onMouseEnter }
      onBlur=${ onMouseLeave }
      onMouseEnter=${ onMouseEnter }
      onMouseLeave=${ onMouseLeave }
      onDragStart=${ (event) => draggable && handleClick(event, 'dragstart') }
      draggable=${ draggable }
    >
      <div class="djs-popup-entry-content">
        <span
          class=${ classNames('djs-popup-entry-name', entry.className) }
        >
          ${(entry.imageUrl && html`<img class="djs-popup-entry-icon" src=${ entry.imageUrl } alt="" />`) ||
            (entry.imageHtml && html`<div class="djs-popup-entry-icon" dangerouslySetInnerHTML=${ { __html: entry.imageHtml } } />`)}

          ${ entry.label ? html`
            <span class="djs-popup-label">
              ${ entry.label }
            </span>
          ` : null }

          ${ entry.documentationRef && html`
            <a class="djs-popup-entry-docs"
              href="${ entry.documentationRef }"
              onClick=${ (event) => event.stopPropagation() }
              title="Open element documentation"
              aria-label="Open element documentation"
              target="_blank"
              rel="noopener"
            >
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16" viewBox="0 0 15 15" fill="currentColor"><path  d="M7.5.877a6.623 6.623 0 1 1 0 13.246A6.623 6.623 0 0 1 7.5.877m0 .95a5.674 5.674 0 1 0 0 11.343a5.674 5.674 0 0 0-.002-11.345m0 7.923a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m0-5.925c1.435 0 2.55 1.103 2.55 2.425c0 1.104-.73 1.64-1.265 1.965c-.3.182-.48.271-.634.391a.5.5 0 0 0-.1.097l-.002.001A.55.55 0 0 1 6.95 8.7c0-.468.282-.773.525-.962c.22-.172.54-.34.74-.463c.465-.282.735-.534.735-1.025c0-.678-.585-1.325-1.45-1.325s-1.45.647-1.45 1.325a.55.55 0 1 1-1.1 0c0-1.322 1.115-2.425 2.55-2.425"/></svg>
            </a>
          ` }
        </span>
        ${ entry.description && html`
          <span
            class="djs-popup-entry-description"
          >
            ${ entry.description }
          </span>
        ` }
      </div>
      ${ entry.entries && html`
        <div class="djs-popup-entry-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.96967 1.46967C4.26256 1.17678 4.73744 1.17678 5.03033 1.46967L9.03033 5.46967C9.32322 5.76256 9.32322 6.23744 9.03033 6.53033L5.03033 10.5303C4.73744 10.8232 4.26256 10.8232 3.96967 10.5303C3.67678 10.2374 3.67678 9.76256 3.96967 9.46967L7.43934 6L3.96967 2.53033C3.67678 2.23744 3.67678 1.76256 3.96967 1.46967Z" fill="currentColor"/>
          </svg>
        </div>
      ` }
    </li>
  `;
}
