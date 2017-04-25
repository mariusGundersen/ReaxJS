import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import reax from './main';
import test from 'ava';

interface Props {
  readonly initalValue : number
}

const Increment = reax({
  increment: (e : React.SyntheticEvent<HTMLButtonElement>) => +1,
  decrement: (e : React.SyntheticEvent<HTMLButtonElement>) => -1,
}, (events, props, initalProps : Props) => ({
  sum: Rx.Observable.merge(
    events.increment,
    events.decrement
  ).scan((sum, delta) => sum+delta, initalProps.initalValue)
}), ({events, values, props}) => (
  <div>
    <button onClick={events.decrement}>-</button>
    <span>{values.sum}</span>
    <button onClick={events.increment}>+</button>
  </div>
));

test(t => {
  const increment = new Increment({
    initalValue: 0
  });
})