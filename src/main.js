import reaxConnectorFactory from './reaxConnectorFactory.js';

export default function connect(actions, observablesFactory, Component){
  if(Component === undefined){
    return Component => connect(actions, observablesFactory, Component);
  }

  if(!actions || typeof actions !== 'object') throw new Error('`actions` must be an object');
  if(!observablesFactory || typeof observablesFactory !== 'function') throw new Error('`observablesFactory` must be a function');

  return reaxConnectorFactory(observablesFactory, actions, Component);
}