import { difference } from 'lodash';
import nconf from 'nconf';

nconf.file('./config.json');

const requiredKeys = ('sqlite3').split(' ');

const conf = nconf.get();

const lost = difference(requiredKeys, Object.keys(conf));
if (lost.length) {
  throw new Error(`Require field ${lost.join(', ')} in config.json!`);
}

export default conf;
