type Event = {
  stopPropagation(): void;
  preventDefault(): void;

  cancelBubble: boolean;
  defaultPrevented: boolean;
}

export type EventCallback<T extends Event> = (T) => any | void;

export type EventBusListener = {
  priority: number;
  next: EventBusListener | null;
  callback: EventCallback<any>;
};

export default class EventBus {
  constructor();
  on<T extends Event>(events: string | string[], callback: EventCallback<T>, that?: any): void;
  on<T extends Event>(events: string | string[], priority: number, callback: EventCallback<T>, that?: any): void;
  once<T extends Event>(events: string | string[], callback: EventCallback<T>, that?: any): void;
  once<T extends Event>(events: string | string[], priority: number, callback: EventCallback<T>, that?: any): void;
  off(events: string | string[], callback: EventCallback<any>): void;
  createEvent(data: Object): Event;
  fire(type: Object): any;
  fire(type: string, data: Object, ...additional: any[]): any;
  handleError(error: Error): boolean;
}