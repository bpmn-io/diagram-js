/**
 * Component that renders a popup menu entry.
 *
 */
export default class PopupMenuItem {
    /**
     * @param props
     */
    constructor(props: {
        key: string;
        entry: PopupMenuEntry;
        selected: boolean;
        onMouseEnter: (event: MouseEvent) => void;
        onMouseLeave: (event: MouseEvent) => void;
        onAction: (event: MouseEvent, entry?: PopupMenuEntry, action?: string) => void;
    });
}

type PopupMenuEntry = import('./PopupMenuProvider').PopupMenuEntry;
