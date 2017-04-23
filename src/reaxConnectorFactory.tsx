import * as React from 'react';
import * as Rx from 'rxjs/Rx';

import deconstructActions, {
  ActionMappings,
  Actions,
  ObservableActions,
  Dict
} from './deconstructActions';

export type Observables<R extends Dict> = {
  [ O in keyof R ] : Rx.Observable<R[O]>
};

export type ObservablesFactory<P, T, I> = (
  sources : ObservableActions<I>,
  props : Rx.Observable<P>,
  initalProps : P
) => Observables<T>;

export type Component<E, P, R> = React.StatelessComponent<{actions : Actions<E>, props : P, results : R}>;

export {ActionMappings, Actions, ObservableActions, Dict};

export default function connect<E extends Dict, I extends Dict, R extends Dict, P>(
  actionMappings : ActionMappings<E, I>,
  observablesFactory : ObservablesFactory<P, R, I>,
  Component : Component<E, P, R>) {
  return class extends React.Component<P, R>{
    propsSubject : Rx.Subject<P>;
    actions : Actions<E>;
    cleanup : () => void;

    constructor(props : P){
      super(props);

      this.propsSubject = new Rx.Subject<P>();
      const observableProps = new Rx.Observable<P>(s => this.propsSubject.subscribe(s))
        .startWith(props);

      const {actions, observableActions, completes} = deconstructActions(actionMappings);
      const observables = observablesFactory(observableActions, observableProps, props);

      this.actions = actions;
      this.cleanup = () => {
        this.propsSubject.complete();
        completes.forEach(c => c());
      }

      var state = {} as R;
      for(let key of Object.keys(observables)){
        observables[key].forEach(value => {
          if(this.state){
            this.setState({[key]: value});
          }else{
            state[key] = value;
          }
        });
      }
      this.state = state;
    }

    componentWillReceiveProps(nextProps : P){
      this.propsSubject.next(nextProps);
    }

    componentWillUnmount(){
      this.cleanup();
    }

    render(){
      return <Component actions={this.actions} props={this.props} results={this.state} />;
    }
  } as React.ComponentClass<P>
}
