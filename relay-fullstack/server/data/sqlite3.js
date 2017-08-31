import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('resource/analyzer.sqlite3');
// db.run('CREATE TABLE lorem (info TEXT)');

export function test() {
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
    for (let i = 0; i < 10; i++) {
      stmt.run(`Ipsum ${i}`);
    }
    stmt.finalize();

    db.each('SELECT rowid AS id, info FROM lorem', (err, row) => {
      console.log(err)
      console.log(`${row.id}: ${row.info}`);
    });
  });

  // Only close connection before termination
  // db.close();
}

export default db;

