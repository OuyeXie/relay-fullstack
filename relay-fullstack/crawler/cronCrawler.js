import debug from 'debug';
import './logger';
import zoloCrawler from '../crawler/zoloCrawler';
import { updateData } from '../server/data/database';

debug.enable('*');

/**
 * @param update, true if want to crawl from real time website and update the resource files
 */
async function updateZolo(update = false) {
  console.info('zolo user crawler start')
  try {
    const data = await zoloCrawler.data(update);
    await updateData(data);
    console.info('zolo user crawler finish');
  } catch (err) {
    console.info('zolo user crawler error:', err);
  }
}

updateZolo(false);

// import cron from './cronCrawler';
// const setting = {
//   zolo: {
//     cronTime: '0 10 */3 * * *',
//     onTick: updateZolo
//   }
// }
//
// cron(setting);
