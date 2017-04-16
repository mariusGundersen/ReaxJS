import reaxConnectorFactory, {ActionMappings, ObservablesFactory, Dict, Component} from './reaxConnectorFactory';

export default function connect<P>()
  : <E, I, R>(
    actionMappings : ActionMappings<E, I>,
    observablesFactory : ObservablesFactory<P, R, I>,
    Component : Component<E, P, R>)
    => React.ComponentClass<P>;

export default function connect<E extends Dict, I extends Dict, R extends Dict, P>(
  actionMappings : ActionMappings<E, I>,
  observablesFactory : ObservablesFactory<P, R, I>,
  Component : Component<E, P, R>)
: React.ComponentClass<P>;

export default function connect<E extends Dict, I extends Dict, R extends Dict, P>(
  actionMappings : ActionMappings<E, I>,
  observablesFactory : ObservablesFactory<P, R, I>)
: (Component : Component<E, P, R>) => React.ComponentClass<P>;

export default function connect<E extends Dict, I extends Dict, R extends Dict, P>(
  actionMappings? : ActionMappings<E, I>,
  observablesFactory? : ObservablesFactory<P, R, I>,
  Component? : Component<E, P, R>){
  if(actionMappings === undefined || observablesFactory === undefined){
    return <E, I, R>(
      actionMappings : ActionMappings<E, I>,
      observablesFactory : ObservablesFactory<P, R, I>,
      Component : Component<E, P, R>) => connect(actionMappings, observablesFactory, Component);
  }
  if(Component === undefined){
    return (Component : Component<E, P, R>) => connect(actionMappings, observablesFactory, Component);
  }

  if(!actionMappings || typeof actionMappings !== 'object') throw new Error('`actions` must be an object');
  if(!observablesFactory || typeof observablesFactory !== 'function') throw new Error('`observablesFactory` must be a function');

  return reaxConnectorFactory(actionMappings, observablesFactory, Component);
}