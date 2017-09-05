import './logger';
import zoloCrawler from '../crawler/zoloCrawler';
import { getUser } from '../server/data/database';

async function updateZolo() {
  console.info('zolo user crawler start')
  try {
    const u = await zoloCrawler.data();
    await getUser(u);
    console.info('zolo user crawler finish');
  } catch (err) {
    console.info('zolo user crawler error:', err);
  }
}

updateZolo();

// import cron from './cronCrawler';
// const setting = {
//   zolo: {
//     cronTime: '0 10 */3 * * *',
//     onTick: updateZolo
//   }
// }
//
// cron(setting);
