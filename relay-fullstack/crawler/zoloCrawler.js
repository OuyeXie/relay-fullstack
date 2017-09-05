import _ from 'lodash';
import debug from 'debug';
import Crawler from './crawler';

const RESOURCE = ['https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408'];
const HOST = 'www.zolo.ca';
const crawler = new Crawler({
  rateLimits: 200,
  timeout: 10000,
  retries: 1,
  retryTimeout: 10000
});

async function getData(resource) {
  debug('zolo')('request:', resource)
  const res = await crawler.queue({
    uri: resource,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: HOST,
      'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)'
    },
    jQuery: false
  })

  let response;
  try {
    response = JSON.parse(res.response.body);
  } catch (e) {
    debug('zolo')('proxy request error', e);
  }
  return _.assign(response, { resource });

  // return await getData(resource);
}

async function data() {
  const response = await getData(RESOURCE)
  return {
    response
  };
}

export default { data };
