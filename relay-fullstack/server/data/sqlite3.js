import sqlite3 from 'sqlite3';
import deb from 'debug';
import conf from '../../config';

const debug = deb('sqlite3');
const db = new sqlite3.Database(conf.sqlite3.filename);

export function testInsert() {
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO property (last_asked_price, last_sold_price) VALUES ($last_asked_price, $last_sold_price)');
    for (let i = 0; i < 10; i++) {
      stmt.run({
        $last_asked_price: 1,
        $last_sold_price: 2
      });
    }
    stmt.finalize();
  });
}

export function testSelect() {
  db.each('SELECT * FROM property', (err, row) => {
    console.log(err);
    console.log(row);
  });
}

export async function promisedAll(sql, param) {
  debug('[sql] ', sql, '[param] ', param);
  return await new Promise((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err !== null) return reject(err);
      return resolve(rows);
    });
  });
}

export default db;

