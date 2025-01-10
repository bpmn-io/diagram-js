/**
 * Component that renders a popup menu header.
 *
 */
export default class PopupMenuHeader {
    /**
     * @param props
     */
    constructor(props: {
        headerEntries: PopupMenuHeaderEntry[];
        selectedEntry: PopupMenuHeaderEntry;
        onSelect: (event: MouseEvent, entry: PopupMenuHeaderEntry) => void;
        setSelectedEntry: (entry: PopupMenuHeaderEntry | null) => void;
        title: string;
    });
}

type PopupMenuHeaderEntry = import('./PopupMenuProvider').PopupMenuHeaderEntry;
