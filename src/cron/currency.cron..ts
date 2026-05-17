import {CronJob} from 'cron';
import {carService} from '../services/car.service';


const handler = async () => {

    console.log('[CRON] Updating ad prices...');
    try {
        await carService.updatePrices();
        console.log('[CRON] Prices updated successfully');
    } catch (err) {
        console.error('[CRON] Failed to update prices:', err);
    }
}  ;


export const currencyCron = new CronJob('0 1/3 0 * * *', handler);


