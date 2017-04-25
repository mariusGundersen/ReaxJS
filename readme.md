# ReaxJS

[![npm version](https://img.shields.io/npm/v/reaxjs.svg?style=flat-square)](https://www.npmjs.com/package/reaxjs)

> React + rxjs

## Installation

Install using npm/yarn

   npm install --save reaxjs

## Basic example

Here is a small example using ReaxJS

```js
import React from 'react';

import reax from 'reaxjs';

const Demo = reax({
  input: event => event.target.value
},
({input}) => ({
  output: input
    .map(x => x.toUpperCase()).
    .startWith('')
}),
({events, values}) => (
  <div>
    <input onChange={events.input} />
    <span>{values.output}</span>
  </div>
));

ReactDOM.render(<Demo>, document.body);
```

Ok, lets break it down. The example above renders as an input and a span, where the span always shows the upper-case text from the input. This can be made into a pure component. This pure component takes a prop object with a `values` object and an `events` object. The `values` object has one property, `output`, while the `events` object has one function property, `input`.

```js
//PureDemo.js
export default function PureDemo(props){
  return (
    <div>
      <input onChange={props.events.input} />
      <span>{props.values.output}</span>
    </div>
  );
}
```

This pure component can be wrapped with a stateful react component or Redux. Writing pure state-less components is a good habit. But we need to store the state someplace, and we can use rxjs to implicitly store the state:

```js
function toUpperCase(inputObservable){
  return inputObservable
    .map(x => x.toUpperCase()).
    .startWith('');
}
```

This function takes an observable as parameter and returns an observable. It will upper-case the values it receives from the inputObservable, and it will ensure it always has a vaule by returning the empty string.

We can use `reax` to combine the pure component and the toUpperCase function.

```js
const Component = reax(eventsToValues, observablesFactory, PureComponent);
```

The first parameter to `reax` is an object of functions, each function mapping from an event to a value. The `events` object used in the `PureDemo` component has the same keys as this object. When you call one of the functions on the `events`, then the corresponding function on `eventsToValues` will be called. These functions are used to convert react events to values. For the `PureDemo` component it should look like this:

```js
const events = {
  'input': event => event.target.value,
  // add more events here with the format name: event => value
};
```

The second parameter is a factory function that produces an object of observables. It should have a parameter called for example `events`. The `events` parameter to the factory has the same keys as the `events` object we created earlier, but the values are observables, not functions. The stream of values the observable produces is whatever the function with the same name in the `events` object returns. The observablesFactory should return an object, where each property is an observable. Since we have already made the `toUpperCase` function (which, remember, returns an observable), we can define it like this:

```js
function observablesFactory(events){
  return {
    output: toUpperCase(events.input),
    // add more observables here
  };
}
```

Each returned observable can use one or more events, and can use the props for initial values and parameters.

Now that we have `events` and the `observablesFactory` we can combine them with `PureDemo` using `reax`:

```js
reax(events, observablesFactory, PureDemo);

//which is the same as

reax({
  'input': event => event.target.value
},
(events, props) => ({
  output: toUpperCase(events.input)
}),
({events, values}) => (
  <div>
    <input onChange={events.input} />
    <span>{values.output}</span>
  </div>
));
```

`reax` can be partially applied by ommiting the last parameter (the component), so it can also be used as a decorator:

```js
@reax(events, observablesFactory)
class PureDemo extends React.Component{
  render(){
    return (
      <div>
        <input onChange={this.props.events.input} />
        <span>{this.props.values.output}</span>
      </div>
    );
  }
}
```

## Props

Props passed to the `reax`ed component will be forwarded to the pure component, and will be passed into the `observablesFactory` method as an observable. This way you can react to prop changes using RxJS. As an example, consider a component that can be incremented/decremented, with a prop to control how much to increment/decrement by:

```js
function observablesFactory(events, props){
  return {
    sum: Rx.Observable.merge(
      events.increment.withLatestFrom(props.pluck('delta'), (_, delta) => +delta),
      events.decrement.withLatestFrom(props.pluck('delta'), (_, delta) => -delta)
    ).scan((sum, delta) => sum+delta, 0)
  };
}

//...

<Counter delta={1} />
```

 If you are only interested in the initial props values (ie, they should never change), then you can use the third parameter:

```js
function observablesFactory(events, props, initalProps){
  return {
    sum: Rx.Observable.merge(
      events.increment.map(x => +1),
      events.decrement.map(x => -1)
    ).scan((sum, delta) => sum+delta, initialProps.initial)
  }
}

//...

<Counter initial={0} />
```

## TypeScript

ReaxJS is written in TypeScript, and works very well with type inference. Specify the input type of each `eventMappings` parameter (and optionally the `Props`, if you need them), and TypeScript will figure out the rest:

```typescript
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
```

## Inspiration

This is based on my experience working with [react](https://facebook.github.io/react), [redux](https://github.com/reactjs/redux) and [react-most](https://github.com/jcouyang/react-most). There are, in my opinion, a few problems with them:

* Redux is not async, so doing anything with network requires other libraries.
* Redux stores everything in a global shared store, so having multiple similar components requires more work.
* React-most doesn't use rxjs by default.
* React-most pushes every event through the same observable, and uses stringly typed keys and switch statements, instead of the power of observables.

ReaxJS is my attempt to solve all of these issues.