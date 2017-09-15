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

function parseRemovedData(rawData) {
  const $ = cheerio.load(rawData);

  return { removed: true, last_updated: '2017-01-01' };
}

function parseData(rawData) {
  const $ = cheerio.load(rawData);

  // address
  const address = $('h1').text();
  const area = $('div .area').text();

  // key_facts: mortgage, walkscore, days_on_market, last_updated, info
  const $keyFacts = $(':contains(\'Key Facts\')');
  const $keyFactsSectionContainer = $('.section-listing-content', $keyFacts);
  const $basicsContainer = $('.column-container:nth-of-type(1)', $keyFactsSectionContainer);
  const $mortgage = $(':contains(\'Mortgage (est)\')', $basicsContainer);
  const mortgage = $('.column-value .priv', $mortgage).text();

  const $walkscore = $(':contains(\'Walkscore\')', $basicsContainer);
  const walkscore = $('.column-value', $walkscore).text();

  const $daysOnMarket = $(':contains(\'Days on Market\')', $basicsContainer);
  const daysOnMarket = $('.column-value .priv', $daysOnMarket).text();

  const $updatesContainer = $('.column-container:nth-of-type(2)', $keyFactsSectionContainer);
  const $lastUpdated = $(':contains(\'Last Updated\')', $updatesContainer);
  const lastUpdated = $('.column-value', $lastUpdated).text();

  // details
  const $details = $(':contains(\'Details\')');
  const $accContent = $('.acc-content', $details);
  const $sectionContent = $('.section-listing-content-pad', $accContent);

  // property: type, building_type, ownership, size, year_built
  const $property = $('div:nth-of-type(1)', $sectionContent);
  const $type = $('div:nth-of-type(1)', $property);
  const type = $('.column-value .priv', $type).text();
  return {
    address,
    area,
    mortgage,
    walkscore,
    days_on_market: daysOnMarket,
    last_updated: lastUpdated,
    type
  };

  // inside: levels, bedrooms
  // fees: taxes, strata_fees
  // land: lot_size_sq_ft
  // price_history: last_listed_price, last_listed_time
  // market_status: approximate_area_price
}

function isRemoved(rawData) {
  return _.includes(rawData, 'Removed');
}

async function getData(resource, update) {
  let parsedData = {};
  let rawData;
  const fileName = DIR_PREFIX + urlencode(resource);
  if (update) {
    rawData = await crawlData(resource);
    if (isRemoved(rawData)) {
      try {
        const oldRawData = fs.readFileSync(fileName);
        const oldParsedData = parseData(oldRawData);
        const newparsedData = parseRemovedData(rawData);
        parsedData = _.assign(oldParsedData, newparsedData);
      } catch (err) {
        console.error(`Error! Cannot read data from file ${fileName}`);
      }
      console.warn(`Attention! Resource is removed for url ${resource}`);
    } else {
      try {
        fs.writeFileSync(fileName, rawData);
        parsedData = parseData(rawData);
      } catch (err) {
        console.error(`Error! Cannot write data into file ${fileName}`);
      }
    }
  } else {
    try {
      rawData = fs.readFileSync(fileName);
      parsedData = parseData(rawData);
    } catch (err) {
      console.error(`Error! Cannot read data from file ${fileName}`);
    }
  }
  if (!rawData) {
    console.warn(`Error! No data can be fetched for url ${resource}`);
    return null;
  }

  debug(parsedData);
  return _.assign(parsedData, { url: resource, source: HOST });
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
