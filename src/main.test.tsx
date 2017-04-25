import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import reax from './main';

export interface Props {
  readonly initalValue : number
}

export default reax({
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