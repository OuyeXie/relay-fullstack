import sqlite3 from 'sqlite3';
import conf from '../../config';


const db = new sqlite3.Database(conf.sqlite3.filename);

export function test() {
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO property (last_asked_price, last_sold_price) VALUES ($last_asked_price, $last_sold_price)');
    for (let i = 0; i < 10; i++) {
      stmt.run({
        $last_asked_price: 1,
        $last_sold_price: 2
      });
    }
    stmt.finalize();

    db.each('SELECT * FROM property', (err, row) => {
      console.log(err)
      console.log(row);
    });
  });
}

export default db;

