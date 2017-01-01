import test from 'ava';
import Rx from 'rxjs/Rx';

import deconstructActions from './deconstructActions.js';

test('not a function should throw', t => {
  t.throws(() => deconstructActions({
    'test': null
  }));
});

test('returns an object with functions and observables', t => {
  const result = deconstructActions({
    'test': () => null
  });

  t.truthy(result.functions);
  t.truthy(result.observables);
});

test('returns observables', t => {
  const result = deconstructActions({
    'test': () => null
  });

  t.truthy(result.observables.test);
  t.true(result.observables.test instanceof Rx.Observable);
});

test('returns functions', t => {
  const result = deconstructActions({
    'test': () => null
  });

  //force subscriber to be called
  result.observables.test.forEach(() => null);

  t.truthy(result.functions.test);
  t.is(typeof result.functions.test, 'function');
});

test('triggering an action should trigger the observable value', t => {
  t.plan(2);
  const result = deconstructActions({
    'test': x => x
  });

  result.observables.test.forEach(x => {
    t.is(x, 'hello');
  });

  result.functions.test('hello');
  result.functions.test('hello');
});