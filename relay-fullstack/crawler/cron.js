import { CronJob } from 'cron';
import _ from 'lodash';

export default function (cron) {
  return _.mapValues(cron, setting => new CronJob(setting.cronTime, setting.onTick, null, true));
}
