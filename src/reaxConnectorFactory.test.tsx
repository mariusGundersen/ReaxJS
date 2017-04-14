import test from 'ava';
import * as React from 'react';

import reaxConnectorFactory from './reaxConnectorFactory';

const Test = reaxConnectorFactory({
  input: event => event.target.value
},({
  input
}) => ({
  output: input.map(x => x.toUpperCase())
}),
({actions, output}) => (
  <div>
    <input onChange={actions.input} />
    <span>{output}</span>
  </div>
));

test('reaxConnectorFactory should return a constructor function', t => {
  t.is(typeof Test, 'function');
});