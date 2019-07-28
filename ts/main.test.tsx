import * as React from 'react';
import { merge } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';
import test from 'ava';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import reax, { constant } from './main';

interface Props {
  readonly initalValue: number
}

const Counter = reax({
  increment: (e: React.SyntheticEvent<HTMLButtonElement>) => +1,
  decrement: constant(-1),
  reset: constant()
}, (events, _props, initalProps: Props) => ({
  sum: merge(
    events.increment,
    events.decrement
  ).pipe(
    startWith(0),
    scan((sum, delta) => sum + delta, initalProps.initalValue)
  )
}), (values, events, _props) => (
  <div>
    <button onClick={events.decrement}>-</button>
    <span>{values.sum}</span>
    <button onClick={events.increment}>+</button>
  </div>
));

test('test compile counter', t => {
  const counter = shallow(<Counter initalValue={0} />);

  t.is(counter.find('span').text(), "0");
  counter.find('button').first().simulate('click');
  t.is(counter.find('span').text(), "-1");

  t.pass();
})