import debug from 'debug';
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

export default { prop, underscoreToCamel };
