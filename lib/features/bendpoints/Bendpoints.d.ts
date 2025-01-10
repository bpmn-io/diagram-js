/**
 * A service that adds editable bendpoints to connections.
 *
 */
export default class Bendpoints {
    static $inject: string[];
    /**
     * @param eventBus
     * @param canvas
     * @param interactionEvents
     * @param bendpointMove
     * @param connectionSegmentMove
     */
    constructor(eventBus: EventBus, canvas: Canvas, interactionEvents: InteractionEvents, bendpointMove: BendpointMove, connectionSegmentMove: ConnectionSegmentMove);
    addHandles: (connection: any) => HTMLElement | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | HTMLAnchorElement | HTMLScriptElement | HTMLEmbedElement | HTMLFormElement | HTMLHeadElement | HTMLAreaElement | HTMLObjectElement | HTMLLinkElement | HTMLMapElement | HTMLInputElement | HTMLBaseElement | HTMLTimeElement | HTMLDataElement | HTMLProgressElement | HTMLTrackElement | HTMLSourceElement | HTMLButtonElement | HTMLAudioElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataListElement | HTMLModElement | HTMLDetailsElement | HTMLDialogElement | HTMLDivElement | HTMLDListElement | HTMLFieldSetElement | HTMLHeadingElement | HTMLHRElement | HTMLHtmlElement | HTMLIFrameElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLSelectElement | HTMLSlotElement | HTMLSpanElement | HTMLStyleElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTitleElement | HTMLTableRowElement | HTMLUListElement;
    updateHandles: (connection: any) => void;
    getBendpointsContainer: (element: any, create: any) => HTMLElement | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | HTMLAnchorElement | HTMLScriptElement | HTMLEmbedElement | HTMLFormElement | HTMLHeadElement | HTMLAreaElement | HTMLObjectElement | HTMLLinkElement | HTMLMapElement | HTMLInputElement | HTMLBaseElement | HTMLTimeElement | HTMLDataElement | HTMLProgressElement | HTMLTrackElement | HTMLSourceElement | HTMLButtonElement | HTMLAudioElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataListElement | HTMLModElement | HTMLDetailsElement | HTMLDialogElement | HTMLDivElement | HTMLDListElement | HTMLFieldSetElement | HTMLHeadingElement | HTMLHRElement | HTMLHtmlElement | HTMLIFrameElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLSelectElement | HTMLSlotElement | HTMLSpanElement | HTMLStyleElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTitleElement | HTMLTableRowElement | HTMLUListElement;
    getSegmentDragger: (idx: any, parentGfx: any) => Element;
}

type BendpointMove = import('../bendpoints/BendpointMove').default;
type Canvas = import('../../core/Canvas').default;
type ConnectionSegmentMove = import('../bendpoints/ConnectionSegmentMove').default;
type EventBus = import('../../core/EventBus').default;
type InteractionEvents = import('../interaction-events/InteractionEvents').default;
