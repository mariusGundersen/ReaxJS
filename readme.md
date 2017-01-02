# ReaxJS

> React + rxjs

## Basic example

Here is a small example using ReaxJS

```js
import React from 'react';

import {connect} from 'reaxjs';

const Test = connect({
  input: event => event.target.value
},
({input}) => ({
  output: input
    .map(x => x.toUpperCase()).
    .startWith('')
}),
({actions, output}) => (
  <div>
    <input onChange={actions.input} />
    <span>{output}</span>
  </div>
));

ReactDOM.render(<Test>, document.body);
```

Ok, lets break it down. The example above renders as an input and a span, where the span always shows the upper-case text from the input. This can be made into a pure component. This pure component takes a prop object with an `output` value and an `actions` object with one function property, `input`.

```js
//PureTest.js
export default function PureTest(props){
  return (
    <div>
      <input onChange={props.actions.input} />
      <span>{props.output}</span>
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

We can use `connect` to combine the pure component and the toUpperCase function.

```js
//connect definition
function connect(actions, observablesFactory, PureComponent);
```

The first parameter to `connect` is an object of functions, each function mapping from an event to a value. This is the `actions` prop from the PureTest component. It will be used to convert react events into observable values. For the PureTest component it should look like this:

```js
const actions = {
  'input': event => event.target.value,
  // add more actions here with the format name: event => value
};
```

The second parameter is a factory function that produces an object of observables. It takes two parameters: the actions and the props. The actions object passed to the factory has the same keys as the actions object we created earlier, but the values are observables, not functions. Since we have already made the `toUpperCase` function, we can define it like this:

```js
function observablesFactory(actions, props){
  return {
    output: toUpperCase(actions.input),
    // add more observables here with the format name: Rx.Observable
  }
}
```

Each returned observable can use one or more actions, and can use the props for initial values and parameters.

Now that we have `actions` and the `observablesFactory` we can combine them with `PureTest` using `connect`:

```js
connect(actions, observablesFactory, PureTest);

//which is the same as

connect({
  'input': event => event.target.value
},
(actions, props) => ({
  output: toUpperCase(actions.input),
  // add more observables here with the format name: Rx.Observable
}),
({actions, output}) => (
  <div>
    <input onChange={actions.input} />
    <span>{output}</span>
  </div>
));
```

`connect` can be partially applied by ommiting the last parameter (the component), so it can also be used as a decorator:

```js
@connect(actions, observablesFactory)
class PureTest extends React.Component{
  render(){
    return (
      <div>
        <input onChange={this.props.actions.input} />
        <span>{this.props.output}</span>
      </div>
    );
  }
}
```

## Props

Props passed to the `connect`ed component will be forwarded to the pure component, and will be passed into the `observablesFactory` method as an observable. This way you can react to prop changes using RxJS. As an example, consider a component that can be incremented/decremented, with a prop to control how much to increment/decrement by:

```js
function observablesFactory(actions, props){
  return Rx.Observable.merge(
    actions.increment.withLatestFrom(props.pluck('delta'), (_, delta) => +delta),
    actions.decrement.withLatestFrom(props.pluck('delta'), (_, delta) => -delta)
  ).scan((sum, delta) => sum+delta, 0);
}

//...

<Counter delta={1} />
```

 If you are only interested in the initial props values (ie, they should never change), then you can use the following pattern:

```js
function observablesFactory(actions, props){
  return props.first().switchMap(props => {
    return Rx.Observable.merge(
      actions.increment.map(x => +1),
      actions.decrement.map(x => -1)
    ).scan((sum, delta) => sum+delta, props.initial);
  })
}

//...

<Counter initial={0} />
```



## Inspiration

This is based on my experience working with [react](https://facebook.github.io/react), [redux](https://github.com/reactjs/redux) and [react-most](https://github.com/jcouyang/react-most). There are, in my opinion, a few problems with them:

* Redux is not async, so doing anything with network requires other libraries.
* Redux stores everything in a global shared store, so having multiple similar components requires more work.
* React-most doesn't use rxjs by default.
* React-most pushes every event through the same observable, and uses stringly typed keys and switch statements, instead of the power of observables.

ReaxJS is my attempt to solve all of these issues.