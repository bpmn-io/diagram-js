/**
 * A component that renders the popup menus.
 *
 */
export default class PopupMenuComponent {
    /**
     * @param props
     */
    constructor(props: {
        onClose: () => void;
        onSelect: () => void;
        position: (element: HTMLElement) => Point;
        className: string;
        entries: PopupMenuEntry[];
        headerEntries: PopupMenuHeaderEntry[];
        scale: number;
        title?: string;
        search?: boolean;
        emptyPlaceholder?: PopupMenuEmptyPlaceholder;
        width?: number;
        searchFn: typeof import("../search/search").default;
    });
}

type PopupMenuEntry = import('./PopupMenuProvider').PopupMenuEntry;
type PopupMenuHeaderEntry = import('./PopupMenuProvider').PopupMenuHeaderEntry;
export type PopupMenuEmptyPlaceholder = import('./PopupMenuProvider').PopupMenuEmptyPlaceholderProvider | import('./PopupMenuProvider').PopupMenuEmptyPlaceholder;
export type search = typeof import("../search/search").default;
type Point = import('../../util/Types').Point;
