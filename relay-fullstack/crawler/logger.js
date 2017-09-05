import winston from 'winston';
import moment from 'moment';

const level = ['production', 'prerelease'].indexOf(process.env.NODE_ENV) >= 0 ? 'info' : 'debug';
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level,
      timestamp: () => moment().format('YYYY-MM-DD hh:mm:ss.SSS')
    })
  ]
})

const methods = ['log', 'profile', 'startTimer'].concat(Object.keys(logger.levels))

for (let method of methods) {
  console[method] = function () {
    if (method === 'log') {
      method = 'info';
    }
    return logger[method].apply(logger, arguments);
  };
}

export default logger;
