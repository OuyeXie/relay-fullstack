import debug from 'debug';

export function prop(key, log = false) {
  return (object) => {
    if (log) {
      debug('graphql')(`Get key [${key}] from `, object);
    }
    return object[key];
  };
}

export default { prop };
