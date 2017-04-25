import createReaxComponent, {EventMappings, ObservablesFactory, Dict, Component} from './createReaxComponent';

export default function reax<P>()
  : <E, I, R>(
    eventMappings : EventMappings<E, I>,
    observablesFactory : ObservablesFactory<P, R, I>,
    Component : Component<E, P, R>)
    => React.ComponentClass<P>;

export default function reax<E extends Dict, I extends Dict, R extends Dict, P>(
  eventMappings : EventMappings<E, I>,
  observablesFactory : ObservablesFactory<P, R, I>)
: (Component : Component<E, P, R>) => React.ComponentClass<P>;

export default function reax<E extends Dict, I extends Dict, R extends Dict, P>(
  eventMappings : EventMappings<E, I>,
  observablesFactory : ObservablesFactory<P, R, I>,
  Component : Component<E, P, R>)
: React.ComponentClass<P>;

export default function reax<E extends Dict, I extends Dict, R extends Dict, P>(
  eventMappings? : EventMappings<E, I>,
  observablesFactory? : ObservablesFactory<P, R, I>,
  Component? : Component<E, P, R>){
  if(eventMappings === undefined || observablesFactory === undefined){
    return <E, I, R>(
      eventMappings : EventMappings<E, I>,
      observablesFactory : ObservablesFactory<P, R, I>,
      Component : Component<E, P, R>) => reax(eventMappings, observablesFactory, Component);
  }
  if(Component === undefined){
    return (Component : Component<E, P, R>) => reax(eventMappings, observablesFactory, Component);
  }

  if(!eventMappings || typeof eventMappings !== 'object') throw new Error('`eventMappings` must be an object');
  if(!observablesFactory || typeof observablesFactory !== 'function') throw new Error('`observablesFactory` must be a function');

  return createReaxComponent(eventMappings, observablesFactory, Component);
}