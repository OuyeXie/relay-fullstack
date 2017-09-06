import './logger';
import zoloCrawler from '../crawler/zoloCrawler';
import { updateData } from '../server/data/database';

async function updateZolo() {
  console.info('zolo user crawler start')
  try {
    const data = await zoloCrawler.data();
    await updateData(data);
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
