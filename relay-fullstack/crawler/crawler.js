import Crawler from 'crawler';
import _ from 'lodash';

export default class {
  constructor(options) {
    this.crawler = new Crawler(options);
  }

  queue(options) {
    let optionsLocal = options;
    if (_.isString(optionsLocal)) {
      optionsLocal = { uri: optionsLocal };
    } else if (!_.isObject(optionsLocal)) {
      throw new Error('crawler options should be object');
    }
    return new Promise((resolve, reject) => {
      optionsLocal.callback = (err, response, $) => {
        if (err) {
          reject(err);
        } else if ($) {
          resolve({ response, $ });
        } else {
          resolve({ response });
        }
      }
      this.crawler.queue(optionsLocal);
    });
  }
}
