import test from 'ava';
import * as Rx from 'rxjs/Rx';

import deconstructActions, {ActionMappings} from './deconstructActions';

test('returns an object with functions and sources', t => {
  const result = deconstructActions({
    'test': () => null
  });

  t.truthy(result.actions);
  t.truthy(result.observableActions);
});

test('returns sources', t => {
  const result = deconstructActions({
    test: (x : string) => x
  });

  t.truthy(result.observableActions.test);
  t.true(result.observableActions.test instanceof Rx.Observable);
});

test('returns functions', t => {
  const result = deconstructActions({
    test: (x : string) => x
  });

  //force subscriber to be called
  result.observableActions.test.subscribe(() => null);

  t.truthy(result.actions.test);
  t.is(typeof result.actions.test, 'function');
});

test('triggering an action should trigger the observable value', t => {
  t.plan(2);
  const result = deconstructActions({
    test: (x : string) => x
  });

  result.observableActions.test.forEach(() => null);

  result.observableActions.test.forEach(x => {
    t.is(x, 'hello');
  });

  result.actions.test('hello');
  result.actions.test('hello');
});

test('triggering an action once should affect both subscribers', t => {
  t.plan(2);
  const result = deconstructActions({
    test: (x : string) => x
  });

  result.observableActions.test.forEach(x => t.is(x, 'hello'));

  result.observableActions.test.forEach(x => t.is(x, 'hello'));

  result.actions.test('hello');
});