import _ from 'lodash';
import deb from 'debug';
import cheerio from 'cheerio';
import urlencode from 'urlencode';
import fs from 'fs';
import Crawler from './crawler';

const FILE_RESOURCES = 'zolo_urls';
const DIR_PREFIX = 'resource/';
const HOST = 'www.zolo.ca';

const crawler = new Crawler({
  rateLimits: 200,
  timeout: 10000,
  retries: 1,
  retryTimeout: 10000
});
const debug = deb('zolo');

async function crawlData(resource) {
  debug('request:', resource);
  const res = await crawler.queue({
    uri: resource,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: HOST,
      'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)',
    },
    jQuery: false
  });

  let response;
  try {
    response = res.response.body;
  } catch (e) {
    console.error('proxy request error', e);
  }
  return response;

  // return await getData(resource);
}

function parseData(rawData) {
  const $ = cheerio.load(rawData);
  const address = $('h1').text();
  const area = $('div .area').text();

  const $keyFacts = $(':contains(\'Key Facts\')');
  const $keyFactsContainer = $('.column-container', $keyFacts);
  const $mortgage = $('dl:nth-of-type(1)', $keyFactsContainer);
  const mortgage = $('.column-value .priv', $mortgage).text();

  const $fullDetails = $(':contains(\'Full Details\')');
  const $accContent = $('.acc-content', $fullDetails);
  const $property = $('div:nth-of-type(1)', $accContent);
  const $type = $('div:nth-of-type(1)', $property);
  const type = $('.column-value .priv', $type).text();
  return { address, area, mortgage, type };
}

async function getData(resource, update) {
  let rawData;
  const fileName = DIR_PREFIX + urlencode(resource);
  if (update) {
    rawData = await crawlData(resource);
    try {
      fs.writeFileSync(fileName, rawData);
    } catch (err) {
      console.error(`Error! Cannot write data into file ${fileName}`);
    }
  } else {
    try {
      rawData = fs.readFileSync(fileName);
    } catch (err) {
      console.error(`Error! Cannot read data from file ${fileName}`);
    }
  }
  if (!rawData) {
    console.warn(`Error! No data can be fetched for url ${resource}`);
    return null;
  }
  const parsedData = parseData(rawData);
  debug(parsedData)
  return _.assign(parsedData, { resource });
}

async function data(update) {
  const fileName = DIR_PREFIX + FILE_RESOURCES;
  let resources = [];
  try {
    const urls = fs.readFileSync(fileName);
    resources = _.split(urls, '\n');
    resources = _.compact(resources);
  } catch (err) {
    console.error(`Error! Cannot read data from file ${fileName}`);
    return null;
  }
  debug('urls: ', resources);
  const responses = await Promise.all(resources.map(async resource => await getData(resource, update)));
  return _.compact(responses);
}

export default { data };
