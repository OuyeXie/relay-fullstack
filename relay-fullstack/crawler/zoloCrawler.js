import _ from 'lodash';
import deb from 'debug';
import cheerio from 'cheerio';
import urlencode from 'urlencode';
import fs from 'fs';
import moment from 'moment';
import Crawler from './crawler';

const FILE_RESOURCES = 'zolo_urls';
const DIR_PREFIX = 'resource/';
const HOST = 'www.zolo.ca';
const CURRENCY = 'cad';
const COUNTRY = 'ca';

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

  // key_facts: mortgage, walkscore, days_on_market, last_updated
  const $keyFacts = $('.section-listing:nth-of-type(1)');
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

  // info
  const $infoContainer = $('.section-listing:nth-of-type(2)');
  const info = $('.priv p', $infoContainer).text();


  // details
  const $details = $('.section-listing:nth-of-type(3)');
  const $accContent = $('.acc-content', $details);
  const $sectionContent = $('.section-listing-content-pad', $accContent);

  // property: type, building_type, ownership, size, year_built
  const $property = $(':contains(\'Type\')', $sectionContent);
  const $type = $('div:nth-of-type(1)', $property);
  const type = $('.column-value .priv', $type).text();

  const $buildingType = $(':contains(\'Building Type\')', $property);
  const buildingType = $('.column-value .priv', $buildingType).text();

  const $ownership = $(':contains(\'Ownership\')', $property);
  const ownership = $('.column-value .priv', $ownership).text();

  const $size = $(':contains(\'Size\')', $property);
  const size = $('.column-value .priv', $size).text();

  const $yearBuilt = $(':contains(\'Year Built\')', $property);
  const yearBuilt = $('.column-value .priv', $yearBuilt).text();

  // inside: levels, bedrooms
  const $inside = $(':contains(\'Inside\')', $sectionContent);
  const $levels = $(':contains(\'Levels\')', $inside);
  const levels = $('.column-value .priv', $levels).text();

  const $bedrooms = $(':contains(\'Bedrooms\')', $inside);
  const bedrooms = $('.column-value .priv', $bedrooms).text();

  // building: view
  const $building = $(':contains(\'Building\')', $sectionContent);
  const $view = $(':contains(\'View\')', $building);
  const view = $('.column-value .priv', $view).text();

  // fees: taxes, strata_fees
  const $fees = $(':contains(\'Fees\')', $sectionContent);
  const $taxes = $(':contains(\'Taxes\')', $fees);
  const taxes = $('.column-value .priv', $taxes).text();

  const $strataFees = $(':contains(\'Strata Fees\')', $fees);
  const strataFees = $('.column-value .priv', $strataFees).text();

  // land: lot_size_sq_ft
  const $land = $(':contains(\'Land\')', $sectionContent);
  const $lotSizeSqFt = $(':contains(\'Lot Size (sq ft)\')', $land);
  const lotSizeSqFt = $('.column-value .priv', $lotSizeSqFt).text();

  // price_history: last_listed_price, last_listed_time
  const $history = $('.section-listing:nth-of-type(4)');
  const $table = $('table:nth-of-type(1)', $history);
  const $tbody = $('tbody', $table);
  const $tr = $('tr:nth-of-type(1)', $tbody);
  const lastListedTime = $('td:nth-of-type(1)', $tr).text();
  const lastListedPrice = $('td:nth-of-type(3)', $tr).text();

  // market_status: approximate_area_price
  const $market = $('.section-listing:nth-of-type(5)');
  const approximateAreaPrice = $('.listing-market-view--value', $market).text();

  return {
    address,
    area,
    mortgage,
    walkscore,
    days_on_market: daysOnMarket,
    last_updated: lastUpdated,
    info,
    type,
    building_type: buildingType,
    ownership,
    size,
    year_built: yearBuilt,
    levels,
    bedrooms,
    view,
    taxes,
    strata_fees: strataFees,
    lot_size_sq_ft: lotSizeSqFt,
    last_listed_time: lastListedTime,
    last_listed_price: lastListedPrice,
    approximate_area_price: approximateAreaPrice
  };
}

function isRemoved(rawData) {
  return _.includes(rawData, 'Removed');
}

function formatData(parsedData) {
  try {
    const formattedData = {
      last_listed_time: moment.utc(parsedData.last_listed_time.trim(), 'MM-DD-YYYY'),
      mortgage: parseFloat(parsedData.mortgage.replace(/[^0-9.]/gi, '')),
      last_listed_price: parseFloat(parsedData.last_listed_price.replace(/[^0-9.]/gi, '')),
      approximate_area_price: parseFloat(parsedData.approximate_area_price.replace(/[^0-9.]/gi, '')),
      walkscore: parseFloat(parsedData.walkscore.trim()),
      size: parseFloat(parsedData.size.trim(), 10),
      taxes: parseFloat(parsedData.taxes.trim(), 10),
      strata_fees: parseFloat(parsedData.strata_fees.trim(), 10),
      lot_size_sq_ft: parseFloat(parsedData.lot_size_sq_ft.trim(), 10),
      days_on_market: parseInt(parsedData.days_on_market.trim(), 10),
      year_built: parseInt(parsedData.year_built.trim(), 10),
      levels: parseInt(parsedData.levels.trim(), 10),
      bedrooms: parseInt(parsedData.bedrooms.trim(), 10),
    };
    return _.assign(parsedData, formattedData);
  } catch (err) {
    console.error(`Error! Cannot format data [${parsedData}] ${err}`);
    throw err;
  }
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

  // debug(parsedData);
  const formattedData = formatData(parsedData);
  debug(formattedData);
  return _.assign(formattedData, { url: resource, source: HOST, currency: CURRENCY, country: COUNTRY });
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
