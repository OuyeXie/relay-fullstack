import _ from 'lodash';
import debug from 'debug';
import cheerio from 'cheerio';
import Crawler from './crawler';

const RESOURCES = ['https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408'];
const HOST = 'www.zolo.ca';
const crawler = new Crawler({
  rateLimits: 200,
  timeout: 10000,
  retries: 1,
  retryTimeout: 10000
});

async function crawlData(resource) {
  debug('zolo')('request:', resource)
  const res = await crawler.queue({
    uri: resource,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: HOST,
      'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)',
    },
    jQuery: false
  })

  let response;
  try {
    response = res.response.body;
  } catch (e) {
    debug('zolo')('proxy request error', e);
  }
  return response;

  // return await getData(resource);
}

function parseData(rawData) {
  const $ = cheerio.load(rawData);
  const address = $('h1').text();
  const area = $('div .area').text();
  return { address, area };
}

async function getData(resource) {
  const rawData = await crawlData(resource);
  console.log('+++++++', typeof rawData.response);
  const parsedData = parseData(rawData);
  console.log('+++++++', parsedData);
  return _.assign(parsedData, { resource });
}

async function data() {
  const responses = await Promise.all(RESOURCES.map(async resource => await getData(resource)))
  console.log('+++++++', responses);
  return responses;
}

export default { data };
