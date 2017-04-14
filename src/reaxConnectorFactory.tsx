import * as React from 'react';
import * as Rx from 'rxjs/Rx';

import deconstructActions, {
  Actions,
  Functions,
  Sources
} from './deconstructActions';

export type ObservablesFactory<P> = (
  sources : Sources,
  props : Rx.Observable<P>,
  initalProps : P
) => ({
  [ key : string ] : Rx.Observable<any>
});

export {Actions};

export default function connect<P>(actions : Actions, observablesFactory : ObservablesFactory<P>, Component : (props : any) => JSX.Element) {
  return class extends React.Component<P, any>{
    propsSubject : Rx.Subject<P>;
    functions : Functions;
    cleanup : () => void;

    constructor(props : P){
      super(props);

      this.propsSubject = new Rx.Subject<P>();
      const observableProps = new Rx.Observable<P>(s => this.propsSubject.subscribe(s))
        .startWith(props);

      const {functions, sources, completes} = deconstructActions(actions);
      const observables = observablesFactory(sources, observableProps, props);

      this.functions = functions;
      this.cleanup = () => {
        this.propsSubject.complete();
        completes.forEach(c => c());
      }

      var state = {} as { [key : string] : any };
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

    cmponentDidUnmount(){
      this.cleanup();
    }

    render(){
      return <Component actions={this.functions} {...this.props} {...this.state} />;
    }
  } as React.ComponentClass<P>
}
