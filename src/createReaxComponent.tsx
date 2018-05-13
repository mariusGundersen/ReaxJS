import * as React from 'react';
import { BehaviorSubject, Observable } from 'rxjs';

import deconstructEventMappings, {
  EventMappings,
  Events,
  ObservableEvents,
  Dict
} from './deconstructEventMappings';

export type Observables<R extends Dict> = {
  [ O in keyof R ] : Observable<R[O]>
};

export type ObservablesFactory<P, T, I> = (
  sources : ObservableEvents<I>,
  props : Observable<P>,
  initalProps : P
) => Observables<T>;

export type Component<E, P, R> = React.StatelessComponent<{events : Events<E>, props : P, values : R}>;

export {EventMappings, Events, ObservableEvents, Dict};

export default function createReaxComponent<E extends Dict, I extends Dict, R extends Dict, P>(
  eventMappings : EventMappings<E, I>,
  observablesFactory : ObservablesFactory<P, R, I>,
  Component : Component<E, P, R>) {
  return class extends React.Component<P, R>{
    private readonly propsSubject : BehaviorSubject<P>;
    private readonly events : Events<E>;
    private readonly completes : (() => void)[];

    constructor(props : P){
      super(props);

      this.propsSubject = new BehaviorSubject<P>(props);

      const {events, observableEvents, completes} = deconstructEventMappings(eventMappings);
      const observables = observablesFactory(observableEvents, this.propsSubject, props);

      this.events = events;
      this.completes = completes;

      var state = {} as R;
      Object.keys(observables).forEach(key => {
        observables[key].forEach(value => {
          if(this.state){
            this.setState({[key]: value});
          }else{
            state[key] = value;
          }
        });
      })
      this.state = state;
    }

    componentWillReceiveProps(nextProps : P){
      this.propsSubject.next(nextProps);
    }

    componentWillUnmount(){
      this.propsSubject.complete();
      this.completes.forEach(c => c());
    }

    render(){
      return <Component events={this.events} props={this.props} values={this.state} />;
    }
  } as React.ComponentClass<P>
}
