import test from 'ava';
import { Observable } from 'rxjs';

import deconstructEventMappings from './deconstructEventMappings';

test('returns an object with functions and sources', t => {
  const result = deconstructEventMappings({
    'test': () => null
  });

  t.truthy(result.events);
  t.truthy(result.observableEvents);
});

test('returns sources', t => {
  const result = deconstructEventMappings({
    test: (x: string) => x
  });

  t.truthy(result.observableEvents.test);
  t.true(result.observableEvents.test instanceof Observable);
});

test('returns functions', t => {
  const result = deconstructEventMappings({
    test: (x: string) => x
  });

  //force subscriber to be called
  result.observableEvents.test.subscribe(() => null);

  t.truthy(result.events.test);
  t.is(typeof result.events.test, 'function');
});

test('triggering an action should trigger the observable value', t => {
  t.plan(2);
  const result = deconstructEventMappings({
    test: (x: string) => x
  });

  result.observableEvents.test.forEach(() => null);

  result.observableEvents.test.forEach(x => {
    t.is(x, 'hello');
  });

  result.events.test('hello');
  result.events.test('hello');
});

test('triggering an action once should affect both subscribers', t => {
  t.plan(2);
  const result = deconstructEventMappings({
    test: (x: string) => x
  });

  result.observableEvents.test.forEach(x => t.is(x, 'hello'));

  result.observableEvents.test.forEach(x => t.is(x, 'hello'));

  result.events.test('hello');
});

test('not a function should throw', t => {
  t.throws(() => deconstructEventMappings({
    'test': null as any
  }));
});
