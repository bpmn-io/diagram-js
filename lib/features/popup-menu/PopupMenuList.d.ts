/**
 * Component that renders a popup menu entry list.
 *
 */
export default class PopupMenuList {
    /**
     * @param props
     */
    constructor(props: {
        entries: PopupMenuEntry[];
        selectedEntry: PopupMenuEntry;
        setSelectedEntry: (entry: PopupMenuEntry | null) => void;
    });
}

type PopupMenuEntry = import('./PopupMenuProvider').PopupMenuEntry;
