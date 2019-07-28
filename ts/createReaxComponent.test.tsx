import test from 'ava';
import * as React from 'react';

import { map } from 'rxjs/operators';

import createReaxComponent from './createReaxComponent';

const Test = createReaxComponent({
  input: (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
}, ({
  input
}) => ({
  output: input.pipe(
    map(x => x.toUpperCase())
  )
}),
  ({ events, values }) => (
    <div>
      <input onChange={events.input} />
      <span>{values.output}</span>
    </div>
  ));

test('createReaxComponent should return a constructor function', t => {
  t.is(typeof Test, 'function');
});