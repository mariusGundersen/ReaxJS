import React from 'react';
import Rx from 'rxjs/Rx';

import deconstructActions from './deconstructActions.js';

export default function connect(actions, observablesFactory, Component){
  return class extends React.Component{
    constructor(props){
      super(props);

      this.propsSubject = new Rx.Subject();
      const observableProps = new Rx.Observable(s => this.propsSubject.subscribe(s))
        .startWith(props);

      const {functions, sources, completes} = deconstructActions(actions);
      const observables = observablesFactory(sources, observableProps, props);

      this.functions = functions;
      this.cleanup = () => {
        this.propsSubject.complete();
        completes.forEach(c => c());
      }

      var state = {};
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

    componentWillReceiveProps(nextProps){
      this.propsSubject.next(nextProps);
    }

    cmponentDidUnmount(){
      this.cleanup();
    }

    render(){
      return <Component actions={this.functions} {...this.props} {...this.state} />;
    }
  }
}
