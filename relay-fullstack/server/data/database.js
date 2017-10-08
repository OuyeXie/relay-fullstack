import moment from 'moment';

import { promisedDb, promisedAll, db } from './sqlite3';

class User {
  constructor(id, name, username, website) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.website = website;
  }
}

class Feature {
  constructor(id, name, description, url) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.url = url;
  }
}

class Property {
  constructor(id, cashFlow, discountRate, growthRate, numberOfYears, nonOperationAssets) {
    this.id = id;
    this.cashFlow = cashFlow;
    this.discountRate = discountRate;
    this.growthRate = growthRate;
    this.numberOfYears = numberOfYears;
    this.nonOperationAssets = nonOperationAssets;
  }
}

const OuyeXie = new User('1', 'Ouye Xie', 'OuyeXie', 'https://github.com/OuyeXie/relay-fullstack');
const features = [
  new Feature('1', 'React', 'A JavaScript library for building user interfaces.', 'https://facebook.github.io/react'),
  new Feature('2', 'Relay', 'A JavaScript framework for building data-driven react applications.', 'https://facebook.github.io/relay'),
  new Feature('3', 'GraphQL', 'A reference implementation of GraphQL for JavaScript.', 'http://graphql.org'),
  new Feature('4', 'Express', 'Fast, unopinionated, minimalist web framework for Node.js.', 'http://expressjs.com'),
  new Feature('5', 'Webpack', 'Webpack is a module bundler that packs modules for the browser.', 'https://webpack.github.io'),
  new Feature('6', 'Babel', 'Babel is a JavaScript compiler. Use next generation JavaScript, today.', 'https://babeljs.io'),
  new Feature('7', 'PostCSS', 'PostCSS. A tool for transforming CSS with JavaScript.', 'http://postcss.org'),
  new Feature('8', 'MDL', 'Material Design Lite lets you add a Material Design to your websites.', 'http://www.getmdl.io')
];

const properties = [
  new Property('1', 3000.0 * 12, 0.05, 0.03, 30, 0.0),
];

/*
* Add feature in memory
*/

let curFeatures = 9;

function addFeature(name, description, url) {
  const newFeature = new Feature(curFeatures, name, description, url);
  features.push(newFeature);
  newFeature.id = curFeatures;
  curFeatures += 1;
  return newFeature;
}


async function getUser(id) {
  // const data = await promisedAll('SELECT * FROM property LIMIT 1');
  // console.log('++++++++++', data);
  const data1 = await promisedDb.allAsync('SELECT * FROM property LIMIT 1');
  console.log('++++++++++', data1);
  return id === OuyeXie.id ? OuyeXie : null;
}

function getFeature(id) {
  return features.find(w => w.id === id);
}

function getFeatures() {
  return features;
}

function getProperty(id) {
  return properties.find(w => w.id === id);
}

/*
  last_listed_price DOUBLE,
  appoximate_area_price DOUBLE,
  residual_value DOUBLE DEFAULT 0,
  last_listed_time TIMESTAMP,
  last_updated_time TEXT,
  mortgage DOUBLE,
  taxes DOUBLE,
  strata_fees DOUBLE,
  year_built INTEGER,
  levels INTEGER,
  bedrooms INTEGER,
  size DOUBLE,
  lot_size_sq_ft DOUBLE,
  walkscore DOUBLE,
  days_on_market INTEGER,
  type TEXT,
  building_type TEXT,
  ownership TEXT,
  mls TEXT,
  address TEXT,
  info TEXT,
  view TEXT,
  url TEXT,
  source TEXT,
  currency TEXT,
  country TEXT,
  liked BOOLEAN DEFAULT FALSE,
  removed BOOLEAN DEFAULT FALSE);
 */
async function updateData(data) {
  // TODO: implement transaction
  const now = moment.utc().format();
  await Promise.all(data.map(async (record) => {
    await promisedDb.runAsync('UPDATE property SET updated_at=$now, ' +
      'last_listed_price=$last_listed_price, ' +
      'appoximate_area_price=$appoximate_area_price, ' +
      'residual_value=$residual_value, ' +
      'last_listed_time=$last_listed_time, ' +
      'mortgage=$mortgage, ' +
      'strata_fees=$strata_fees, ' +
      'year_built=$year_built, ' +
      'levels=$levels, ' +
      'bedrooms=$bedrooms, ' +
      'size=$size, ' +
      'lot_size_sq_ft=$lot_size_sq_ft, ' +
      'walkscore=$walkscore, ' +
      'days_on_market=$days_on_market, ' +
      'type=$type, ' +
      'building_type=$building_type, ' +
      'ownership=$ownership, ' +
      'mls=$mls, ' +
      'address=$address, ' +
      'info=$info, ' +
      'view=$view, ' +
      'url=$url, ' +
      'source=$source, ' +
      'currency=$currency, ' +
      'country=$country ' +
      'WHERE url=$url',
      {
        $now: now,
        $last_listed_price: record.last_listed_price,
        $appoximate_area_price: record.appoximate_area_price,
        $residual_value: record.residual_value,
        $last_listed_time: record.last_listed_time,
        $mortgage: record.mortgage,
        $strata_fees: record.strata_fees,
        $year_built: record.year_built,
        $levels: record.levels,
        $bedrooms: record.bedrooms,
        $size: record.size,
        $lot_size_sq_ft: record.lot_size_sq_ft,
        $walkscore: record.walkscore,
        $days_on_market: record.days_on_market,
        $type: record.type,
        $building_type: record.building_type,
        $ownership: record.ownership,
        $mls: record.mls,
        $address: record.address,
        $info: record.info,
        $view: record.view,
        $url: record.url,
        $source: record.source,
        $currency: record.currency,
        $country: record.country
      });
    await promisedDb.runAsync('INSERT INTO property (last_listed_price, ' +
      'appoximate_area_price, ' +
      'residual_value, ' +
      'last_listed_time, ' +
      'mortgage, ' +
      'strata_fees, ' +
      'year_built, ' +
      'levels, ' +
      'bedrooms, ' +
      'size, ' +
      'lot_size_sq_ft, ' +
      'walkscore, ' +
      'days_on_market, ' +
      'type, ' +
      'building_type, ' +
      'ownership, ' +
      'mls, ' +
      'address, ' +
      'info, ' +
      'view, ' +
      'url, ' +
      'source, ' +
      'currency, ' +
      'country ' +
      ') SELECT $last_listed_price, ' +
      '$appoximate_area_price, ' +
      '$residual_value, ' +
      '$last_listed_time, ' +
      '$mortgage, ' +
      '$strata_fees, ' +
      '$year_built, ' +
      '$levels, ' +
      '$bedrooms, ' +
      '$size, ' +
      '$lot_size_sq_ft, ' +
      '$walkscore, ' +
      '$days_on_market, ' +
      '$type, ' +
      '$building_type, ' +
      '$ownership, ' +
      '$mls, ' +
      '$address, ' +
      '$info, ' +
      '$view, ' +
      '$url, ' +
      '$source, ' +
      '$currency, ' +
      '$country ' +
      'WHERE NOT EXISTS (SELECT 1 FROM property WHERE url=$url)',
      {
        $last_listed_price: record.last_listed_price,
        $appoximate_area_price: record.appoximate_area_price,
        $residual_value: record.residual_value,
        $last_listed_time: record.last_listed_time,
        $mortgage: record.mortgage,
        $strata_fees: record.strata_fees,
        $year_built: record.year_built,
        $levels: record.levels,
        $bedrooms: record.bedrooms,
        $size: record.size,
        $lot_size_sq_ft: record.lot_size_sq_ft,
        $walkscore: record.walkscore,
        $days_on_market: record.days_on_market,
        $type: record.type,
        $building_type: record.building_type,
        $ownership: record.ownership,
        $mls: record.mls,
        $address: record.address,
        $info: record.info,
        $view: record.view,
        $url: record.url,
        $source: record.source,
        $currency: record.currency,
        $country: record.country
      });
  }));
}

export {
  User,
  Feature,
  Property,
  getUser,
  getFeature,
  getFeatures,
  addFeature,
  updateData,
  getProperty
};
