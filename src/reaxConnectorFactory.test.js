import test from 'ava';
import React from 'react';

import reaxConnectorFactory from './reaxConnectorFactory.js';

const Test = reaxConnectorFactory({
  input: event => event.target.value
},({
  input
}) => ({
  output: input.map(x => x.toUpperCase())
}),
({observables, actions}) => (
  <div>
    <input onChange={actions.input} />
    <span>{observables.output}</span>
  </div>
));

test('reaxConnectorFactory should return a constructor function', t => {
  t.is(typeof Test, 'function');
});