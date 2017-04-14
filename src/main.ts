import reaxConnectorFactory, {Actions, ObservablesFactory} from './reaxConnectorFactory';

export default function connect<P>(
  actions : Actions,
  observablesFactory : ObservablesFactory<P>,
  Component : (props : any) => JSX.Element)
: React.ComponentClass<P>;
export default function connect<P>(
  actions : Actions,
  observablesFactory : ObservablesFactory<P>)
: (Component : (props : any) => JSX.Element) => React.ComponentClass<P>;
export default function connect<P>(
  actions : Actions,
  observablesFactory : ObservablesFactory<P>,
  Component? : (props : any) => JSX.Element){
  if(Component === undefined){
    return (Component : (props : any) => JSX.Element) => connect(actions, observablesFactory, Component);
  }

  if(!actions || typeof actions !== 'object') throw new Error('`actions` must be an object');
  if(!observablesFactory || typeof observablesFactory !== 'function') throw new Error('`observablesFactory` must be a function');

  return reaxConnectorFactory(actions, observablesFactory, Component);
}