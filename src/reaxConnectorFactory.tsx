import * as React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import deconstructActions, {
  ActionMappings,
  Actions,
  ObservableActions,
  Dict
} from './deconstructActions';

export type Observables<R extends Dict> = {
  [ O in keyof R ] : Observable<R[O]>
};

export type ObservablesFactory<P, T, I> = (
  sources : ObservableActions<I>,
  props : Observable<P>,
  initalProps : P
) => Observables<T>;

export type Component<E, P, R> = React.StatelessComponent<{actions : Actions<E>, props : P, results : R}>;

export {ActionMappings, Actions, ObservableActions, Dict};

export default function connect<E extends Dict, I extends Dict, R extends Dict, P>(
  actionMappings : ActionMappings<E, I>,
  observablesFactory : ObservablesFactory<P, R, I>,
  Component : Component<E, P, R>) {
  return class extends React.Component<P, R>{
    private readonly propsSubject : BehaviorSubject<P>;
    private readonly actions : Actions<E>;
    private readonly completes : (() => void)[];

    constructor(props : P){
      super(props);

      this.propsSubject = new BehaviorSubject<P>(props);

      const {actions, observableActions, completes} = deconstructActions(actionMappings);
      const observables = observablesFactory(observableActions, this.propsSubject, props);

      this.actions = actions;
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
      return <Component actions={this.actions} props={this.props} results={this.state} />;
    }
  } as React.ComponentClass<P>
}
