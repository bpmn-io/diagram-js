import Diagram from '../Diagram';

import EventBus from './EventBus';

const diagram = new Diagram();

const eventBus = diagram.get<EventBus>('eventBus');

const event = eventBus.createEvent({ foo: 'bar' });

eventBus.fire('foo');

eventBus.fire(event);

eventBus.fire(event, 'foo', 'bar');

eventBus.fire({ foo: 'bar' });

eventBus.fire({ foo: 'bar' }, 'foo', 'bar');

eventBus.handleError(new Error());

const callback = () => {};

eventBus.off('foo', callback);

eventBus.off([ 'foo', 'bar' ], callback);

eventBus.on('foo', callback);

eventBus.on([ 'foo', 'bar' ], callback);

eventBus.on('foo', 2000, callback);

eventBus.on('foo', callback, this);

eventBus.on('foo', (event, additional1, additional2) => {
  console.log('foo', additional1, additional2);
});

type FooEvent = {
  foo: string;
};

eventBus.on<FooEvent>('foo', (event) => {
  const { foo } = event;

  console.log(foo);
});

eventBus.once('foo', callback);

eventBus.once('foo', callback);

eventBus.once('foo', 2000, callback);

eventBus.once('foo', callback, this);

eventBus.once('foo', (event, additional1, additional2) => {
  console.log('foo', event, additional1, additional2);
});


type EventMap = {
  foo: FooEvent
};

const typedEventBus = new EventBus<EventMap>();

typedEventBus.on('foo', (event: FooEvent) => {
  const { foo } = event;

  console.log(foo);
});

typedEventBus.on('foo', (event) => {
  const { foo } = event;

  console.log(foo);
});