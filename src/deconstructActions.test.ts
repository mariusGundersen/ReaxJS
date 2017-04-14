import test from 'ava';
import * as Rx from 'rxjs/Rx';

import deconstructActions, {Actions} from './deconstructActions';

test('returns an object with functions and sources', t => {
  const result = deconstructActions({
    'test': () => null
  });

  t.truthy(result.functions);
  t.truthy(result.sources);
});

test('returns sources', t => {
  const result = deconstructActions({
    'test': () => null
  });

  t.truthy(result.sources.test);
  t.true(result.sources.test instanceof Rx.Observable);
});

test('returns functions', t => {
  const result = deconstructActions({
    'test': () => null
  });

  //force subscriber to be called
  result.sources.test.subscribe(() => null);

  t.truthy(result.functions.test);
  t.is(typeof result.functions.test, 'function');
});

test('triggering an action should trigger the observable value', t => {
  t.plan(2);
  const result = deconstructActions({
    'test': x => x
  });

  result.sources.test.forEach(() => null);

  result.sources.test.forEach(x => {
    t.is(x, 'hello');
  });

  result.functions.test('hello');
  result.functions.test('hello');
});