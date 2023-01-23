export class InternalEvent {
  constructor();
  stopPropagation(): void;
  preventDefault(): void;
  init(data: Object): void;

  data: Object;
  cancelBubble: boolean;
  defaultPrevented: boolean;
}

export type EventBusListener = {
  priority: number;
  next: EventBusListener | null;
  callback: Function;
};

export default class EventBus {
  constructor();
  on(events: string | string[], callback: Function, that?: any): void;
  on(events: string | string[], priority: number, callback: Function, that?: any): void;
  once(events: string | string[], callback: Function, that?: any): void;
  once(events: string | string[], priority: number, callback: Function, that?: any): void;
  off(events: string | string[], callback: Function): void;
  createEvent(data: Object): InternalEvent;
  fire(type: Object): any;
  fire(type: string, data: Object, ...additional: any[]): any;
  handleError(error: Error): boolean;
  private _destroy(): void;
  private _invokeListeners(event: string, args: any[], listener: Function): any;
  private _invokeListener(event: string, args: any[], listener: Function): any;
  private _addListener(event: string, newListener: Function): void;
  private _getListeners(name: string): Function;
  private _setListeners(name: string, listener: EventBusListener): void;
  private _removeListener(event: string, callback: Function): void;

  private _listeners: Map<string, EventBusListener>;
}