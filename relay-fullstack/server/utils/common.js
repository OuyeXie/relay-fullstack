import debug from 'debug';
import { fromGlobalId} from 'graphql-relay';
import _ from 'lodash';

export function prop(key, log = false) {
  return (object) => {
    if (log) {
      debug('graphql')(`Get key [${key}] from `, object);
    }
    return object[key];
  };
}

export function underscoreToCamel(res) {
  const camelRes = _.mapKeys(res, (v, k) => _.camelCase(k))
  _.assign(res, camelRes);
  return res;
}

export function wrappedFromGlobalId(globalId) {
  if (globalId === undefined) {
    return globalId
  }
  // Only reserved for testing
  let id;
  if (process.env.NODE_ENV === 'development') {
    if (typeof globalId === 'number') {
      id = globalId;
    } else if (!isNaN(parseInt(globalId, 10))) {
      id = parseInt(globalId, 10);
    } else {
      id = fromGlobalId(globalId).id;
    }
  } else {
    id = fromGlobalId(globalId).id;
  }
  return id;
}

export default { prop, underscoreToCamel };
