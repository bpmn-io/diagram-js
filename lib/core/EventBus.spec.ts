import Diagram from '../Diagram';

import CoreModule from '.';
import EventBus, { Event } from './EventBus';

const diagram = new Diagram({
  modules: [
    CoreModule
  ]
});

const eventBus = diagram.get<EventBus>('eventBus');

const event = eventBus.createEvent({ foo: 'bar' });

eventBus.fire('foo');

eventBus.fire(event);

eventBus.fire(event, 'foo', 'bar');

eventBus.fire({ foo: 'bar'});

eventBus.fire({ foo: 'bar'}, 'foo', 'bar');

eventBus.handleError(new Error());

const callback = () => {};

eventBus.off('foo', callback);

eventBus.off([ 'foo', 'bar' ], callback);

eventBus.on('foo', callback);

eventBus.on([ 'foo', 'bar' ], callback);

eventBus.on('foo', 2000, callback);

eventBus.on('foo', callback, this);

type FooEvent = {
  foo: string;
} & Event;

eventBus.on<FooEvent>('foo', (event) => {
  const { foo } = event;

  console.log(foo);
});

eventBus.once('foo', callback);

eventBus.once('foo', callback);

eventBus.once('foo', 2000, callback);

eventBus.once('foo', callback, this);