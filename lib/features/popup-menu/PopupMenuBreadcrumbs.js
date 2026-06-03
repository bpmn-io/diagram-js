import {
  html,
  useMemo
} from '../../ui/index.js';

/**
 * @typedef {import('./PopupMenuProvider').PopupMenuStepEntry} PopupMenuStepEntry
 */

/**
 * Component that renders the popup menu navigation trail.
 *
 * @param {Object} props
 * @param {PopupMenuStepEntry[]} props.navigationStack
 * @param {(updater: (stack: PopupMenuStepEntry[]) => PopupMenuStepEntry[]) => void} props.setNavigationStack
 */
export default function PopupMenuBreadcrumbs(props) {
  const {
    navigationStack,
    setNavigationStack
  } = props;

  const breadcrumbs = useMemo(() => {
    if (navigationStack.length <= 1) {
      return [];
    }

    return navigationStack.slice(0, -1).map((entry, index) => ({
      label: entry.label,
      onClick: () => setNavigationStack(stack => stack.slice(0, index + 1))
    }));
  }, [ navigationStack, setNavigationStack ]);

  const handleBackClick = navigationStack.length > 0 ? () => setNavigationStack([]) : null;
  const currentLabel = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1].label : null;

  return html`
    <div class="djs-popup-breadcrumbs">
      ${ handleBackClick && html`
        <button
          type="button"
          class="djs-popup-breadcrumbs-item djs-popup-breadcrumbs-item--back"
          title="Back"
          aria-label="Back"
          onClick=${ handleBackClick }
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.03033 1.46967C8.32322 1.76256 8.32322 2.23744 8.03033 2.53033L4.56066 6L8.03033 9.46967C8.32322 9.76256 8.32322 10.2374 8.03033 10.5303C7.73744 10.8232 7.26256 10.8232 6.96967 10.5303L2.96967 6.53033C2.67678 6.23744 2.67678 5.76256 2.96967 5.46967L6.96967 1.46967C7.26256 1.17678 7.73744 1.17678 8.03033 1.46967Z" fill="currentColor"/>
          </svg>
        </button>
      ` }
      ${ breadcrumbs.map((crumb, i) => html`
        <button
          key=${ i }
          type="button"
          class="djs-popup-breadcrumbs-item"
          onClick=${ crumb.onClick }
          title=${ crumb.label }
        >
          ${ crumb.label }
        </button>
        <span class="djs-popup-breadcrumbs-item--separator" aria-hidden="true"></span>
      `) }
      ${ currentLabel && html`
        <span class="djs-popup-breadcrumbs-item djs-popup-breadcrumbs-item--current" title=${ currentLabel }>
          ${ currentLabel }
        </span>
      ` }
    </div>
  `;
}
