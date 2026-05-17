import {currencyCron} from './currency.cron.';


export const cronRunner = () => {
   currencyCron.start();

};