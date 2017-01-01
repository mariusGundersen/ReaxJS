import React from 'react';
import Rx from 'rxjs/Rx';

import deconstructActions from './deconstructActions.js';

export default function(actions, observablesFactory, Component){
  return class ReaxConnector extends React.Component{
    constructor(props){
      super(props);

      const {functions: actionFunctions, observables: actionObservables} = deconstructActions(actions);
      const observables = observablesFactory(actionObservables, props);

      if(!observables || typeof observables !== 'object') throw new Error('`definition.observables` must return an object');

      this.state = {};
      this.actions = actionFunctions;
      this.unsubscriber = Rx.Observable.merge(
        ...Object.keys(observables).map(key => observables[key]),
        ...Object.keys(actionObservables).map(key => actionObservables[key]));

      for(let key of Object.keys(observables)){
        observables[key].forEach(value => this.setState({[key]: value}));
      }
    }

    cmponentWillUnmount(){
      this.unsubscriber.unsubscribe();
    }

    render(){
      return <Component actions={this.actions} {...this.props} {...this.state} />;
    }
  }
};